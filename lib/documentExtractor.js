// ============================================================================
// lib/documentExtractor.js  —  Client-Side Document Text Extraction
//
// Extracts readable text from PDF, DOCX, and TXT files in the browser.
// Designed to work WITHOUT mammoth or pdfjs-dist in package.json.
//
// WHY NO STATIC IMPORTS:
//   Next.js webpack resolves all bare `import('mammoth')` strings at build
//   time — even inside dynamic import() calls — and fails the build if the
//   package isn't installed.
//
// SOLUTION:
//   We use /* webpackIgnore: true */ hints on dynamic imports so webpack
//   skips resolution entirely. The browser's native import() then resolves
//   the package at runtime only if it's available.
//
//   For TXT/MD: native FileReader only — zero dependencies.
//   For DOCX: attempts mammoth via webpackIgnore dynamic import.
//   For PDF: attempts pdfjs-dist via webpackIgnore dynamic import.
//
//   If the package is not installed, the extraction gracefully falls back
//   to an "unsupported" error message and the chat still works —
//   it just sends filename/fileType metadata without document text.
//
// TO ENABLE FULL EXTRACTION: npm install mammoth pdfjs-dist
// ============================================================================

const MAX_CHARS = 12_000; // ~4,000 tokens
const MIN_CHARS = 50;

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
 * Rough token estimate: ~4 chars per token. For display only.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.round(text.length / 4);
}

// ─── TXT / MD — native FileReader, no dependency ──────────────────────────

function extractTxt(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload  = e => resolve(finish(e.target.result || ""));
    reader.onerror = () => resolve(err("Could not read the text file."));
    reader.readAsText(file, "utf-8");
  });
}

// ─── DOCX — mammoth via webpackIgnore ─────────────────────────────────────

async function extractDocx(file) {
  let mammoth;
  try {
    // webpackIgnore tells the bundler to skip static analysis of this import.
    // At runtime in the browser, native ES import() resolves the package.
    mammoth = await import(/* webpackIgnore: true */ "mammoth");
    mammoth = mammoth.default || mammoth;
  } catch {
    return err(
      "DOCX reading requires the mammoth package. " +
      "Please run: npm install mammoth — or upload a PDF or TXT file instead."
    );
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

// ─── PDF — pdfjs-dist via webpackIgnore ───────────────────────────────────

async function extractPdf(file) {
  let pdfjsLib;
  try {
    // webpackIgnore: prevents webpack from attempting to bundle pdfjs-dist.
    pdfjsLib = await import(/* webpackIgnore: true */ "pdfjs-dist/legacy/build/pdf");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Load worker from CDN — avoids bundling the ~800KB worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  } catch {
    return err(
      "PDF reading requires the pdfjs-dist package. " +
      "Please run: npm install pdfjs-dist — or upload a DOCX or TXT file instead."
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages  = pdf.numPages;
    const pagesToRead = Math.min(totalPages, 15);

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
      return err(
        totalPages > 15
          ? `Only the first 15 of ${totalPages} pages were scanned, but no text was found. This PDF may be image-based. Please convert it to a text-based PDF or paste your content as text.`
          : "This PDF appears to be image-based or scanned. Please convert it to a text-based PDF, or paste your content into the chat."
      );
    }

    const result = finish(fullText);
    if (totalPages > 15) {
      result.pageWarning = `First 15 of ${totalPages} pages analysed.`;
    }
    return result;
  } catch {
    return err("This PDF could not be read. It may be password-protected or corrupted.");
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

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
