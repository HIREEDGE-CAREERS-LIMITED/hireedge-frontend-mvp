// ============================================================================
// components/tools/ResumeOptimiserResult.js
// HireEdge Frontend — Resume Optimiser Result (Production v2)
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ResumeOptimiserResult({ result, targetRole, onReset }) {
  const router = useRouter();
  const [copied,          setCopied]          = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf,  setDownloadingPdf]  = useState(false);

  if (!result) return null;

  const { mode, summary, resume, keywords, improvements } = result;
  const fullText = resume.fullText || _buildPlainText(resume);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const el = document.createElement("textarea");
      el.value = fullText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async (format) => {
    const setter = format === "docx" ? setDownloadingDocx : setDownloadingPdf;
    setter(true);
    try {
      const endpoint = format === "docx" ? "/api/tools/resume-docx" : "/api/tools/resume-pdf";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ resumeText: fullText }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      _downloadBlob(blob, `HireEdge-CV.${format}`);
    } catch {
      alert(`${format.toUpperCase()} download failed — please copy the text manually.`);
    } finally {
      setter(false);
    }
  };

  const handleCareerPack = () => {
    const q = new URLSearchParams();
    if (targetRole?.slug) q.set("role",   targetRole.slug);
    if (targetRole?.slug) q.set("target", targetRole.slug);
    router.push(`/career-pack?${q.toString()}`);
  };

  const atsImproved = summary.currentATS != null && summary.improvedATS != null
    ? summary.improvedATS - summary.currentATS
    : null;

  return (
    <div className="resume-result">

      {/* ── Quality badges ─────────────────────────────────────────────── */}
      <div className="resume-result__badges">
        <span className="resume-result__badge-item">✨ Optimised for ATS systems (UK standard)</span>
        <span className="resume-result__badge-item">📄 Ready for recruiters</span>
        <span className="resume-result__badge-item resume-result__badge-item--premium">
          🔥 Top-tier resume format
        </span>
      </div>

      {/* ── EDGEX summary bar ──────────────────────────────────────────── */}
      <div className="resume-result__summary-bar">
        <div className="resume-result__summary-top">
          <div className="resume-result__summary-brand">
            <span className="resume-result__pulse" />
            <span className="resume-result__brand">EDGEX</span>
            <span className="resume-result__mode-badge">
              {mode === "optimise" ? "CV Optimised" : "CV Generated"}
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
                <span className={`resume-result__score-value ${_atsClass(summary.improvedATS)}`}>
                  {summary.improvedATS}/100
                </span>
              </div>
            )}
            {atsImproved > 0 && (
              <div className="resume-result__score-item">
                <span className="resume-result__score-label">Uplift</span>
                <span className="resume-result__score-value resume-result__score-value--green">
                  +{atsImproved} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {summary.positioningStrategy && (
          <p className="resume-result__strategy">{summary.positioningStrategy}</p>
        )}

        {/* Score explanation */}
        {summary.scoreExplanation?.length > 0 && (
          <div className="resume-result__score-explanation">
            <span className="resume-result__score-exp-title">Score improved because:</span>
            <ul className="resume-result__score-exp-list">
              {summary.scoreExplanation.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Action bar ───────────────────────────────────────────────────── */}
      <div className="resume-result__actions">
        <button className="resume-result__action-btn resume-result__action-btn--primary" onClick={handleCopy}>
          {copied ? "✓ Copied!" : "Copy CV"}
        </button>
        <button className="resume-result__action-btn" onClick={() => handleDownload("docx")} disabled={downloadingDocx}>
          {downloadingDocx ? "Generating..." : "↓ Word (.docx)"}
        </button>
        <button className="resume-result__action-btn" onClick={() => handleDownload("pdf")} disabled={downloadingPdf}>
          {downloadingPdf ? "Generating..." : "↓ PDF"}
        </button>
        <button className="resume-result__action-btn resume-result__action-btn--pack" onClick={handleCareerPack}>
          ✦ Full Career Pack
        </button>
        <button className="resume-result__action-btn resume-result__action-btn--ghost" onClick={onReset}>
          ← New CV
        </button>
      </div>

      {/* ── Full CV (always visible, copy-ready) ─────────────────────────── */}
      <div className="resume-result__resume-section">
        <div className="resume-result__section-header">
          <h2 className="resume-result__section-title">
            {mode === "optimise" ? "Your Optimised CV" : "Your Generated CV"}
          </h2>
          <span className="resume-result__section-sub">
            Select all → copy, or use the buttons above to download
          </span>
        </div>
        <pre className="resume-result__full-text" tabIndex={0}>{fullText}</pre>
      </div>

      {/* ── Keyword analysis ─────────────────────────────────────────────── */}
      {_hasKeywords(keywords) && (
        <div className="resume-result__panel">
          <h3 className="resume-result__panel-title">Keyword Analysis</h3>
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
          </div>
        </div>
      )}

      {/* ── Keyword placement recommendations ────────────────────────────── */}
      {keywords.keywordPlacementRecommendations?.length > 0 && (
        <div className="resume-result__panel">
          <h3 className="resume-result__panel-title">Where to Place Keywords</h3>
          <p className="resume-result__panel-sub">
            Exact placement instructions to maximise your ATS score:
          </p>
          <div className="resume-result__placement-list">
            {keywords.keywordPlacementRecommendations.map((rec, i) => (
              <div key={i} className="resume-result__placement-item">
                <div className="resume-result__placement-top">
                  <span className="resume-result__placement-kw">{rec.keyword}</span>
                  <span className="resume-result__placement-section">→ {rec.section}</span>
                </div>
                {rec.rationale && (
                  <p className="resume-result__placement-rationale">{rec.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Improvements ─────────────────────────────────────────────────── */}
      {(improvements.changesMade?.length > 0 || improvements.stillMissing?.length > 0) && (
        <div className="resume-result__panel resume-result__panel--split">
          {improvements.changesMade?.length > 0 && (
            <div>
              <h3 className="resume-result__panel-title">What EDGEX Changed</h3>
              <ul className="resume-result__change-list">
                {improvements.changesMade.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {improvements.stillMissing?.length > 0 && (
            <div>
              <h3 className="resume-result__panel-title">Still Needs Real Experience</h3>
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

function _atsClass(score) {
  if (score >= 75) return "resume-result__score-value--green";
  if (score >= 50) return "resume-result__score-value--amber";
  return "resume-result__score-value--red";
}

function _hasKeywords(kw) {
  return kw?.matched?.length || kw?.missing?.length || kw?.priority?.length;
}

function _buildPlainText(resume) {
  const lines = [];
  if (resume.professionalSummary) {
    lines.push("PROFESSIONAL SUMMARY", resume.professionalSummary, "");
  }
  if (resume.coreSkills?.length) {
    lines.push("CORE SKILLS", resume.coreSkills.join("  |  "), "");
  }
  if (resume.experience?.length) {
    lines.push("EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push(`${exp.role}${exp.company ? " | " + exp.company : ""}${exp.dates ? " | " + exp.dates : ""}`);
      for (const b of exp.bullets || []) lines.push(`• ${b}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function _downloadBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
