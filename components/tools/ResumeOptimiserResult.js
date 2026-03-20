// ============================================================================
// components/tools/ResumeOptimiserResult.js
// HireEdge Frontend — Resume Optimiser result panel
//
// Replaces ResumeBlueprintCard for the new AI-powered flow.
// Shows:
//   1. EDGEX summary bar  (ATS score before/after + positioning strategy)
//   2. Full generated resume  (copy-ready, always visible)
//   3. Keyword analysis  (matched / missing / priority)
//   4. Improvement notes
//   5. Download (.docx, .pdf) + Copy + "Use in Career Pack"
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ResumeOptimiserResult({ result, targetRole, onReset }) {
  const router = useRouter();
  const [copied,           setCopied]           = useState(false);
  const [downloadingDocx,  setDownloadingDocx]  = useState(false);
  const [downloadingPdf,   setDownloadingPdf]   = useState(false);

  if (!result) return null;

  const { mode, summary, resume, keywords, improvements } = result;

  // ── Copy full resume text ─────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resume.fullText || _buildPlainText(resume));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = resume.fullText || _buildPlainText(resume);
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Download as DOCX ──────────────────────────────────────────────────────
  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      const res = await fetch(`${API_BASE}/api/tools/resume-docx`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ resumeText: resume.fullText || _buildPlainText(resume) }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      _downloadBlob(blob, "HireEdge-Resume.docx");
    } catch (err) {
      alert("DOCX download failed. Please copy the text manually.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  // ── Download as PDF ───────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch(`${API_BASE}/api/tools/resume-pdf`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ resumeText: resume.fullText || _buildPlainText(resume) }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      _downloadBlob(blob, "HireEdge-Resume.pdf");
    } catch {
      alert("PDF download failed. Please copy the text manually.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── Use in Career Pack ────────────────────────────────────────────────────
  const handleCareerPack = () => {
    const q = new URLSearchParams();
    if (targetRole?.slug)  q.set("role",   targetRole.slug);
    if (targetRole?.slug)  q.set("target", targetRole.slug);
    router.push(`/career-pack?${q.toString()}`);
  };

  return (
    <div className="resume-result">

      {/* ── EDGEX summary bar ────────────────────────────────────────────── */}
      <div className="resume-result__summary-bar">
        <div className="resume-result__summary-brand">
          <span className="resume-result__pulse" />
          <span className="resume-result__brand">EDGEX</span>
          <span className="resume-result__mode-badge">
            {mode === "optimise" ? "Resume Optimised" : "Resume Generated"}
          </span>
        </div>

        <div className="resume-result__scores">
          {summary.currentATS != null && (
            <div className="resume-result__score-item">
              <span className="resume-result__score-label">Before</span>
              <span className="resume-result__score-value resume-result__score-value--before">
                {summary.currentATS}/100
              </span>
            </div>
          )}
          {summary.improvedATS != null && (
            <div className="resume-result__score-item">
              <span className="resume-result__score-label">ATS Score</span>
              <span
                className={`resume-result__score-value ${
                  summary.improvedATS >= 75 ? "resume-result__score-value--green"
                : summary.improvedATS >= 50 ? "resume-result__score-value--amber"
                : "resume-result__score-value--red"
                }`}
              >
                {summary.improvedATS}/100
              </span>
            </div>
          )}
          {summary.currentATS != null && summary.improvedATS != null && summary.improvedATS > summary.currentATS && (
            <div className="resume-result__score-item">
              <span className="resume-result__score-label">Improvement</span>
              <span className="resume-result__score-value resume-result__score-value--green">
                +{summary.improvedATS - summary.currentATS} pts
              </span>
            </div>
          )}
        </div>

        {summary.positioningStrategy && (
          <p className="resume-result__strategy">{summary.positioningStrategy}</p>
        )}
      </div>

      {/* ── Action bar ───────────────────────────────────────────────────── */}
      <div className="resume-result__actions">
        <button className="resume-result__action-btn resume-result__action-btn--primary" onClick={handleCopy}>
          {copied ? "✓ Copied!" : "Copy Resume"}
        </button>
        <button
          className="resume-result__action-btn"
          onClick={handleDownloadDocx}
          disabled={downloadingDocx}
        >
          {downloadingDocx ? "Downloading..." : "↓ Download DOCX"}
        </button>
        <button
          className="resume-result__action-btn"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? "Downloading..." : "↓ Download PDF"}
        </button>
        <button className="resume-result__action-btn resume-result__action-btn--pack" onClick={handleCareerPack}>
          ✦ Use in Career Pack
        </button>
        <button className="resume-result__action-btn resume-result__action-btn--ghost" onClick={onReset}>
          ← Start over
        </button>
      </div>

      {/* ── FULL GENERATED RESUME (always visible, copy-ready) ───────────── */}
      <div className="resume-result__resume-section">
        <div className="resume-result__section-header">
          <h2 className="resume-result__section-title">
            {mode === "optimise" ? "Your Optimised Resume" : "Your Generated Resume"}
          </h2>
          <span className="resume-result__section-sub">Ready to use — copy or download above</span>
        </div>

        {/* Full text — primary display */}
        {resume.fullText && (
          <pre className="resume-result__full-text">{resume.fullText}</pre>
        )}

        {/* Structured fallback if fullText is empty */}
        {!resume.fullText && (
          <div className="resume-result__structured">
            {resume.professionalSummary && (
              <div className="resume-result__block">
                <h3 className="resume-result__block-heading">PROFESSIONAL SUMMARY</h3>
                <p className="resume-result__block-body">{resume.professionalSummary}</p>
              </div>
            )}

            {resume.coreSkills?.length > 0 && (
              <div className="resume-result__block">
                <h3 className="resume-result__block-heading">CORE SKILLS</h3>
                <div className="resume-result__skills-grid">
                  {resume.coreSkills.map((s, i) => (
                    <span key={i} className="resume-result__skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {resume.experience?.length > 0 && (
              <div className="resume-result__block">
                <h3 className="resume-result__block-heading">EXPERIENCE</h3>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="resume-result__exp-block">
                    <div className="resume-result__exp-role">{exp.role}</div>
                    <ul className="resume-result__bullets">
                      {exp.bullets?.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Keyword analysis ─────────────────────────────────────────────── */}
      {(keywords.matched?.length > 0 || keywords.missing?.length > 0) && (
        <div className="resume-result__keywords-section">
          <h3 className="resume-result__section-title">Keyword Analysis</h3>
          <div className="resume-result__kw-grid">
            {keywords.matched?.length > 0 && (
              <div className="resume-result__kw-col">
                <span className="resume-result__kw-label resume-result__kw-label--matched">
                  ✓ Matched ({keywords.matched.length})
                </span>
                <div className="resume-result__kw-tags">
                  {keywords.matched.map((k, i) => (
                    <span key={i} className="resume-result__kw-tag resume-result__kw-tag--matched">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {keywords.missing?.length > 0 && (
              <div className="resume-result__kw-col">
                <span className="resume-result__kw-label resume-result__kw-label--missing">
                  ✗ Missing ({keywords.missing.length})
                </span>
                <div className="resume-result__kw-tags">
                  {keywords.missing.map((k, i) => (
                    <span key={i} className="resume-result__kw-tag resume-result__kw-tag--missing">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {keywords.priority?.length > 0 && (
              <div className="resume-result__kw-col">
                <span className="resume-result__kw-label resume-result__kw-label--priority">
                  ↑ Add First ({keywords.priority.length})
                </span>
                <div className="resume-result__kw-tags">
                  {keywords.priority.map((k, i) => (
                    <span key={i} className="resume-result__kw-tag resume-result__kw-tag--priority">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Improvements / gaps ──────────────────────────────────────────── */}
      {(improvements.changesMade?.length > 0 || improvements.stillMissing?.length > 0) && (
        <div className="resume-result__improvements">
          {improvements.changesMade?.length > 0 && (
            <div className="resume-result__changes">
              <h3 className="resume-result__section-title">What EDGEX Changed</h3>
              <ul className="resume-result__change-list">
                {improvements.changesMade.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {improvements.stillMissing?.length > 0 && (
            <div className="resume-result__still-missing">
              <h3 className="resume-result__section-title">Still Needs Real Experience</h3>
              <p className="resume-result__missing-note">
                These gaps can't be fixed with words — they require real-world development:
              </p>
              <ul className="resume-result__change-list resume-result__change-list--warning">
                {improvements.stillMissing.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ===========================================================================
// Utilities
// ===========================================================================

function _buildPlainText(resume) {
  const lines = [];
  if (resume.professionalSummary) {
    lines.push("PROFESSIONAL SUMMARY", resume.professionalSummary, "");
  }
  if (resume.coreSkills?.length) {
    lines.push("CORE SKILLS", resume.coreSkills.join(" | "), "");
  }
  if (resume.experience?.length) {
    lines.push("EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push(exp.role);
      for (const b of exp.bullets || []) {
        lines.push(`- ${b}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function _downloadBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
