// ============================================================================
// pages/tools/interview-prep.js
// HireEdge — Interview Preparation (v4)
//
// Changes over v3:
//   - JD and CV moved to collapsible "Advanced" section
//   - Animated loading step progression
//   - CTA: "Build My Interview Pack"
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _friendlyError(json) {
  const reason = json?.reason || "";
  const plan   = json?.upgrade_to || "pro";
  if (reason === "access_denied" || reason === "tool_not_in_plan")
    return { type: "upgrade", plan, message: `Interview Prep requires the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.` };
  if (reason === "daily_limit_reached")
    return { type: "limit", message: "You've reached your daily limit. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Analysing your background…",
  "Building interview strategy…",
  "Writing opening pitch…",
  "Generating STAR answers…",
  "Preparing mock questions…",
];

export default function InterviewPrepPage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  const [targetRole,  setTargetRole]  = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");

  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText,     setResumeText]     = useState("");

  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorInfo,   setErrorInfo]   = useState(null);
  const stepTimer = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.target)  setTargetRole({ slug: q.target,  title: _slugToTitle(q.target) });
    if (q.current) setCurrentRole({ slug: q.current, title: _slugToTitle(q.current) });
    if (q.yearsExp && !isNaN(parseInt(q.yearsExp))) setYearsExp(q.yearsExp);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !targetRole) return;
    autoRan.current = true;
    _submit();
  }, [targetRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimer.current = setInterval(() => {
        setLoadingStep(s => (s + 1) % LOADING_STEPS.length);
      }, 4000);
    } else {
      clearInterval(stepTimer.current);
    }
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  async function _submit() {
    if (!targetRole) { setErrorInfo({ type: "error", message: "Please select a target role." }); return; }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/interview-prep`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-HireEdge-Plan": getPlan() },
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
      if (!json.ok) { setErrorInfo(_friendlyError(json)); return; }
      setResult(json.data);
    } catch {
      setErrorInfo({ type: "error", message: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Interview Preparation — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Interview Preparation</h1>
          <p className="tool-page__sub">
            Your personal interview coach — opening pitch, strategy, must-nail questions with full STAR answers, mock practice with scoring, red flags to avoid, and a final checklist.
          </p>
        </div>

        <div className="tool-form">
          {/* Row 1: roles */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Role you're interviewing for…"
                onSelect={setTargetRole}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">✓ {targetRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__optional">(optional)</span></label>
              <RoleSearch
                placeholder="Your current role…"
                onSelect={setCurrentRole}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">✓ {currentRole.title}</span>}
            </div>
          </div>

          {/* Row 2: skills + years */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Your Skills</label>
              <input
                className="tool-form__input"
                type="text"
                placeholder="e.g. SQL, Stakeholder Management, Product Strategy"
                autoComplete="off"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="tool-form__hint">Comma-separated — used to personalise answers</span>
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                className="tool-form__input"
                type="number" min="0" max="40" placeholder="e.g. 5"
                autoComplete="off"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            className="li-advanced-toggle"
            onClick={() => setShowAdvanced(v => !v)}
            type="button"
          >
            <span className="li-advanced-toggle__icon">{showAdvanced ? "▲" : "▼"}</span>
            {showAdvanced ? "Hide advanced options" : "Add Job Description / CV for deeper personalisation"}
            {!showAdvanced && !jobDescription && !resumeText && (
              <span className="li-advanced-toggle__tip">recommended</span>
            )}
            {(jobDescription || resumeText) && (
              <span className="li-advanced-toggle__added">✓ Added</span>
            )}
          </button>

          {showAdvanced && (
            <div className="li-advanced-fields">
              <div className="tool-form__field">
                <label className="tool-form__label">
                  Job Description <span className="tool-form__optional">— greatly improves question targeting</span>
                </label>
                <textarea
                  className="tool-form__textarea" rows={5}
                  placeholder="Paste the full job description here…"
                  autoComplete="off"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div className="tool-form__field">
                <label className="tool-form__label">
                  CV / Profile Summary <span className="tool-form__optional">— personalises STAR answers to your background</span>
                </label>
                <textarea
                  className="tool-form__textarea" rows={4}
                  placeholder="Paste a summary of your experience or CV…"
                  autoComplete="off"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Errors */}
          {errorInfo?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">🔒</span>
              <div>
                <p className="tool-upgrade-prompt__title">{errorInfo.message}</p>
                <p className="tool-upgrade-prompt__sub">Upgrade to access Interview Prep and all premium tools.</p>
              </div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">View Plans →</Link>
            </div>
          )}
          {errorInfo?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">⏱</span>
              <div><p className="tool-upgrade-prompt__title">{errorInfo.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade →</Link>
            </div>
          )}
          {errorInfo?.type === "error" && (
            <div className="tool-form__error">{errorInfo.message}</div>
          )}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !targetRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Build My Interview Pack"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~25 seconds · Full strategy + answers + mock questions</p>
          )}
        </div>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <div className="li-loading-steps">
              {LOADING_STEPS.map((step, i) => (
                <span key={i} className={`li-loading-step ${i === loadingStep ? "li-loading-step--active" : i < loadingStep ? "li-loading-step--done" : ""}`}>
                  {i < loadingStep ? "✓" : i === loadingStep ? "→" : "·"} {step}
                </span>
              ))}
            </div>
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
