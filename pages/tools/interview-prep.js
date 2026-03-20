// ============================================================================
// pages/tools/interview-prep.js
// HireEdge Frontend — Interview Prep
// NO AppShell import — _app.js already wraps every page in AppShell once.
// Importing AppShell inside the page caused the double sidebar panel.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import RoleSearch from "../../components/intelligence/RoleSearch";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

export default function InterviewPrepPage() {
  const router   = useRouter();
  const edgexCtx = useEDGEXContext() || {};
  const autoRan  = useRef(false);

  const [targetRole,     setTargetRole]     = useState(null);
  const [currentRole,    setCurrentRole]    = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText,     setResumeText]     = useState("");

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── EDGEX / query prefill ─────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;

    if ((q.target || edgexCtx.target) && !targetRole) {
      const slug = q.target || edgexCtx.target;
      setTargetRole({ slug, title: _slugToTitle(slug) });
    }
    if ((q.current || edgexCtx.role) && !currentRole) {
      const slug = q.current || edgexCtx.role;
      setCurrentRole({ slug, title: _slugToTitle(slug) });
    }
    if (q.skills || edgexCtx.skills) {
      setSkills(q.skills || (Array.isArray(edgexCtx.skills) ? edgexCtx.skills.join(", ") : edgexCtx.skills || ""));
    }
    if (q.yearsExp || edgexCtx.yearsExp) setYearsExp(q.yearsExp || edgexCtx.yearsExp || "");
    if (q.jd)     setJobDescription(q.jd);
    if (q.resume) setResumeText(q.resume);
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !targetRole) return;
    autoRan.current = true;
    _submit();
  }, [targetRole, router.isReady]);

  async function _submit() {
    if (!targetRole) { setError("Please select a target role."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/interview-prep`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole:     targetRole.slug,
          currentRole:    currentRole?.slug || "",
          skills,
          yearsExp:       yearsExp ? parseInt(yearsExp) : null,
          jobDescription,
          resumeText,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error || "Something went wrong");
      setResult(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Interview Prep — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Interview Preparation</h1>
          <p className="tool-page__sub">
            Role-specific questions, answer frameworks, opening pitch, and salary intelligence — tailored to your background.
          </p>
        </div>

        <div className="tool-form">
          {/* Row 1 — Target + Current + Years */}
          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Role you're interviewing for..."
                onSelect={(r) => setTargetRole(r)}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">✓ {targetRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__optional">(optional)</span></label>
              <RoleSearch
                placeholder="Your current role..."
                onSelect={(r) => setCurrentRole(r)}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">✓ {currentRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                className="tool-form__input"
                type="number" min="0" max="40" placeholder="e.g. 5"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="tool-form__field">
            <label className="tool-form__label">Your Skills</label>
            <input
              className="tool-form__input"
              type="text" placeholder="e.g. SQL, Python, Stakeholder Management, Product Strategy"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span className="tool-form__hint">Comma-separated</span>
          </div>

          {/* Job Description */}
          <div className="tool-form__field">
            <label className="tool-form__label">
              Job Description <span className="tool-form__optional">(optional — greatly improves output)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={5}
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* CV */}
          <div className="tool-form__field">
            <label className="tool-form__label">
              CV / Profile Summary <span className="tool-form__optional">(optional)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={4}
              placeholder="Paste a summary of your experience or CV…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !targetRole}
          >
            {loading ? (
              <><span className="tool-form__spinner" /> Preparing your pack…</>
            ) : (
              "Generate Interview Pack"
            )}
          </button>
        </div>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is building your interview preparation pack…</p>
          </div>
        )}

        {result && <InterviewPrepCard data={result} />}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
