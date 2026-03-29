// ============================================================================
// lib/documentExtractor.js  —  Client-Side Document Text Extraction
//
// Supported formats:
//   .txt, .md     — native FileReader, no dependency
//   .docx         — mammoth.js (lazy-loaded, ~200KB gzip)
//   .pdf          — pdfjs-dist (lazy-loaded, ~800KB gzip; worker from CDN)
//
// Design:
//   • All heavy dependencies are lazily imported — zero impact on initial load
//   • PDF worker is loaded from Cloudflare CDN (avoids bundling the worker)
//   • Extracted text is capped at MAX_CHARS to stay within API payload limits
//   • Empty/scanned PDFs are detected and reported clearly
//   • All errors return { text: null, error: string } — never throws
//
// npm install mammoth pdfjs-dist
// ============================================================================

const MAX_CHARS = 12_000; // ~4,000 tokens — safe for LLM context + payload limit
const MIN_CHARS = 50;     // below this = extraction failure

/**
 * Extract readable text from a browser File object.
 * @param {File} file
 * @returns {Promise<{ text: string|null, error: string|null, truncated: boolean }>}
 */
export async function extractDocument(file) {
  if (!file) return err("No file provided.");

  const ext  = (file.name.split(".").pop() || "").toLowerCase();
  const size = file.size;

  if (size > 10 * 1024 * 1024) {
    return err("File is too large. Please use files under 10MB.");
  }

  try {
    if (ext === "txt" || ext === "md")  return extractTxt(file);
    if (ext === "docx")                 return extractDocx(file);
    if (ext === "pdf")                  return extractPdf(file);
    if (ext === "doc") {
      return err("Legacy .doc files are not supported. Please save as .docx or .pdf and re-upload.");
    }
    return err("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  } catch (e) {
    return err("Could not read this file. Please try a different format.");
  }
}

/**
 * Rough token estimate: ~4 chars per token.
 * Used for display only — not used in API calls.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.round(text.length / 4);
}

// ─── TXT / MD ──────────────────────────────────────────────────────────────────

function extractTxt(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload  = e => resolve(finish(e.target.result || ""));
    reader.onerror = () => resolve(err("Could not read the text file."));
    reader.readAsText(file, "utf-8");
  });
}

// ─── DOCX ──────────────────────────────────────────────────────────────────────

async function extractDocx(file) {
  let mammoth;
  try {
    mammoth = (await import("mammoth")).default || (await import("mammoth"));
  } catch {
    return err("Could not load the DOCX reader. Please upload a PDF or TXT file instead.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result      = await mammoth.extractRawText({ arrayBuffer });
    const text        = (result.value || "").trim();

    if (text.length < MIN_CHARS) {
      return err("Could not extract readable text from this DOCX. The file may be empty or image-only.");
    }

    return finish(text);
  } catch {
    return err("This DOCX file could not be read. Please try saving it again or use a PDF.");
  }
}

// ─── PDF ───────────────────────────────────────────────────────────────────────

async function extractPdf(file) {
  let pdfjsLib;
  try {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Load worker from CDN — avoids adding ~800KB to the Next.js bundle
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  } catch {
    return err("Could not load the PDF reader. Please upload a DOCX or TXT file instead.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages  = pdf.numPages;
    const pagesToRead = Math.min(totalPages, 15); // cap for performance

    let fullText = "";

    for (let i = 1; i <= pagesToRead; i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageStr = content.items
        .map(item => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageStr) fullText += pageStr + "\n";
    }

    fullText = fullText.trim();

    if (fullText.length < MIN_CHARS) {
      const msg = totalPages > 15
        ? `Only the first 15 of ${totalPages} pages were scanned, but no extractable text was found. This PDF appears to be image-based or scanned. Please convert it to a text-based PDF, or paste your content as text.`
        : "This PDF appears to be image-based or scanned and cannot be read. Please convert it to a text-based PDF, or paste your content into the chat.";
      return err(msg);
    }

    const result = finish(fullText);
    if (totalPages > 15) {
      result.pageWarning = `First 15 of ${totalPages} pages analysed.`;
    }
    return result;
  } catch {
    return err("This PDF could not be read. It may be password-protected or corrupted. Please try a different file.");
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function finish(text) {
  const cleaned   = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const truncated = cleaned.length > MAX_CHARS;
  return {
    text:      truncated ? cleaned.slice(0, MAX_CHARS) + "\n\n[Document truncated — first portion analysed]" : cleaned,
    error:     null,
    truncated,
  };
}

function err(message) {
  return { text: null, error: message, truncated: false };
}
