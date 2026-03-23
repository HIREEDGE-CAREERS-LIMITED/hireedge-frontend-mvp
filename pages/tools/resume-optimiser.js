// ============================================================================
// pages/tools/resume-optimiser.js
// HireEdge Frontend — Resume Optimiser + Generator
//
// Upgraded from a keyword-score widget to a full AI-powered tool:
//   Step 1: Input  — paste or upload CV, set target role, job description
//   Step 2: Running — loading state while AI processes
//   Step 3: Results — full generated resume + ATS analysis + download
//
// Accepts EDGEX context via URL query params (role, target, skills, yearsExp)
// and auto-populates fields when arriving from the EDGEX chat.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import RoleSearch from "../../components/intelligence/RoleSearch";
import ResumeOptimiserResult from "../../components/tools/ResumeOptimiserResult";
import EDGEXBadge from "../../components/brand/EDGEXBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ResumeOptimiserPage() {
  const router = useRouter();

  // ── Form state ────────────────────────────────────────────────────────────
  const [cvText,          setCvText]          = useState("");
  const [targetRole,      setTargetRole]      = useState(null);   // { slug, title }
  const [currentRole,     setCurrentRole]     = useState(null);   // { slug, title }
  const [skills,          setSkills]          = useState("");
  const [yearsExp,        setYearsExp]        = useState("");
  const [jobDescription,  setJobDescription]  = useState("");
  const [inputMode,       setInputMode]       = useState("paste"); // "paste" | "upload"
  const fileRef = useRef(null);

  // ── Result state ──────────────────────────────────────────────────────────
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // ── Pre-populate from EDGEX query params ─────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const { target, current, role, skills: qs, yearsExp: qy } = router.query;

    // target/role from EDGEX
    if (target && !targetRole)  setTargetRole({ slug: target,  title: _slugToTitle(target)  });
    if ((current || role) && !currentRole) {
      const cr = current || role;
      setCurrentRole({ slug: cr, title: _slugToTitle(cr) });
    }
    if (qs && !skills)   setSkills(qs);
    if (qy && !yearsExp) setYearsExp(qy);
  }, [router.isReady, router.query]);

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now extract plain text — handle .txt and basic .docx as text
    // PDF/DOCX proper parsing requires a server-side step; we send the file
    // as text and the API handles it
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      // Strip binary noise for non-text files — server will clean further
      const cleaned = typeof text === "string"
        ? text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n")
        : "";
      setCvText(cleaned || `[File: ${file.name} — could not extract text automatically. Please paste your CV text instead.]`);
    };
    reader.readAsText(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!targetRole) { setError("Please select a target role."); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/tools/resume-optimiser`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText:          cvText.trim(),
          targetRole:      targetRole?.slug  || "",
          targetRoleTitle: targetRole?.title || "",
          currentRole:     currentRole?.slug || "",
          skills:          skills,
          yearsExp:        yearsExp ? parseInt(yearsExp, 10) : null,
          jobDescription:  jobDescription.trim(),
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.error || "Resume generation failed. Please try again.");
        return;
      }

      setResult(json);
    } catch (err) {
      setError("Network error — could not reach the resume engine.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = targetRole && !loading;
  const mode = cvText.trim().length > 50 ? "optimise" : "generate";

  return (
    <div className="resume-tool">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="resume-tool__header">
        <div className="resume-tool__header-left">
          <span className="resume-tool__icon">📄</span>
          <div>
            <div className="resume-tool__title-row">
              <h1 className="resume-tool__title">Resume Optimiser</h1>
              <span className="resume-tool__badge">PRO</span>
            </div>
            <p className="resume-tool__desc">
              {mode === "optimise"
                ? "EDGEX will analyse your current CV and rewrite it for maximum ATS compatibility."
                : "No CV yet? EDGEX will generate a complete professional resume from your profile."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Input form ───────────────────────────────────────────────────── */}
      {!result && (
        <form className="resume-tool__form" onSubmit={handleSubmit}>

          {/* Row 1: Roles + experience */}
          <div className="resume-tool__row">
            <div className="resume-tool__field">
              <label className="resume-tool__label">Target Role <span className="resume-tool__req">*</span></label>
              <RoleSearch
                placeholder="Role you're applying for..."
                onSelect={(r) => setTargetRole(r)}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="resume-tool__selected">✓ {targetRole.title}</span>}
            </div>

            <div className="resume-tool__field">
              <label className="resume-tool__label">Current Role</label>
              <RoleSearch
                placeholder="Your current role..."
                onSelect={(r) => setCurrentRole(r)}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="resume-tool__selected">✓ {currentRole.title}</span>}
            </div>

            <div className="resume-tool__field resume-tool__field--short">
              <label className="resume-tool__label">Years Experience</label>
              <input
                className="resume-tool__input"
                type="number"
                placeholder="e.g. 4"
                value={yearsExp}
                min={0}
                max={50}
                onChange={(e) => setYearsExp(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Skills */}
          <div className="resume-tool__field">
            <label className="resume-tool__label">Your Skills</label>
            <input
              className="resume-tool__input resume-tool__input--wide"
              type="text"
              placeholder="SQL, Python, Excel, Data Analysis, Stakeholder Management..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span className="resume-tool__hint">Comma-separated — auto-filled if you came from EDGEX chat</span>
          </div>

          {/* Row 3: CV input */}
          <div className="resume-tool__field">
            <div className="resume-tool__label-row">
              <label className="resume-tool__label">Your Current CV</label>
              <div className="resume-tool__mode-tabs">
                <button
                  type="button"
                  className={`resume-tool__tab ${inputMode === "paste" ? "resume-tool__tab--active" : ""}`}
                  onClick={() => setInputMode("paste")}
                >
                  Paste text
                </button>
                <button
                  type="button"
                  className={`resume-tool__tab ${inputMode === "upload" ? "resume-tool__tab--active" : ""}`}
                  onClick={() => setInputMode("upload")}
                >
                  Upload file
                </button>
              </div>
            </div>

            {inputMode === "paste" ? (
              <textarea
                className="resume-tool__textarea"
                placeholder="Paste your current CV / resume here...&#10;&#10;Leave blank to generate a resume from scratch using your role and skills."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={10}
              />
            ) : (
              <div
                className="resume-tool__upload-zone"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <span className="resume-tool__upload-icon">📂</span>
                <p className="resume-tool__upload-label">
                  {cvText.length > 50
                    ? "✓ File loaded — text extracted"
                    : "Click to upload your CV (.txt, .docx, .pdf)"}
                </p>
                <p className="resume-tool__upload-hint">
                  For best results paste text directly — file parsing extracts plain text only.
                </p>
              </div>
            )}
            <span className="resume-tool__hint">
              {mode === "optimise"
                ? "EDGEX will rewrite this CV for your target role."
                : "No CV provided — EDGEX will generate one from scratch."}
            </span>
          </div>

          {/* Row 4: Job description */}
          <div className="resume-tool__field">
            <label className="resume-tool__label">Job Description <span className="resume-tool__optional">(optional — greatly improves ATS score)</span></label>
            <textarea
              className="resume-tool__textarea resume-tool__textarea--short"
              placeholder="Paste the specific job description you're applying to..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
            />
          </div>

          {error && <div className="resume-tool__error">{error}</div>}

          <button
            className="resume-tool__submit"
            type="submit"
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <span className="resume-tool__spinner" />
                EDGEX is writing your resume...
              </>
            ) : (
              <>
                <span>✦</span>
                {mode === "optimise" ? "Optimise My Resume" : "Generate My Resume"}
              </>
            )}
          </button>
        </form>
      )}

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="resume-tool__loading">
          <div className="resume-tool__loading-pulse">✦</div>
          <p className="resume-tool__loading-label">EDGEX is analysing your profile...</p>
          <p className="resume-tool__loading-sub">Running ATS analysis and rewriting your resume</p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && !loading && (
        <>
          <ResumeOptimiserResult
            result={result}
            targetRole={targetRole}
            onReset={() => { setResult(null); setError(null); }}
          />
          <div className="edgex-tool-footer"><EDGEXBadge /></div>
        </>
      )}
    </div>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
