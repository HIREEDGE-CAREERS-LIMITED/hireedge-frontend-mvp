// ============================================================================
// pages/tools/linkedin-optimiser.js
// HireEdge — LinkedIn Profile Audit (v4)
//
// UX changes:
//   - Only 4 fields visible by default (role, target, years, skills)
//   - CV / JD / industry collapsed under "Advanced options" toggle
//   - Title reframed as "LinkedIn Profile Audit"
//   - Loading state shows animated step progression
//   - CTA: "Run Profile Audit"
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import LinkedinOptimisationCard from "../../components/tools/LinkedinOptimisationCard";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXBadge from "../../components/brand/EDGEXBadge";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _friendlyError(json) {
  const reason = json?.reason || "";
  const plan   = json?.upgrade_to || "pro";
  if (reason === "access_denied" || reason === "tool_not_in_plan")
    return { type: "upgrade", plan, message: `LinkedIn Audit requires the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.` };
  if (reason === "daily_limit_reached")
    return { type: "limit", message: "You've reached your daily limit. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Auditing your profile…",
  "Scoring headline & keywords…",
  "Writing About section…",
  "Generating rewrites…",
];

export default function LinkedinOptimiserPage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  // Core fields (always visible)
  const [currentRole,    setCurrentRole]    = useState(null);
  const [targetRole,     setTargetRole]     = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");

  // Advanced fields (collapsed by default)
  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const [industry,       setIndustry]       = useState("");
  const [resumeText,     setResumeText]     = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingStep,  setLoadingStep]  = useState(0);
  const [errorInfo,    setErrorInfo]    = useState(null);
  const loadingTimer = useRef(null);

  // URL param pre-fill (slugs only)
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.role || q.current) setCurrentRole({ slug: q.role || q.current, title: _slugToTitle(q.role || q.current) });
    if (q.target)            setTargetRole({ slug: q.target, title: _slugToTitle(q.target) });
    if (q.yearsExp && !isNaN(parseInt(q.yearsExp))) setYearsExp(q.yearsExp);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !currentRole) return;
    autoRan.current = true;
    _submit();
  }, [currentRole, router.isReady]);

  // Animate loading steps
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      loadingTimer.current = setInterval(() => {
        setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      clearInterval(loadingTimer.current);
    }
    return () => clearInterval(loadingTimer.current);
  }, [loading]);

  async function _submit() {
    if (!currentRole) { setErrorInfo({ type: "error", message: "Please select your current role." }); return; }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/linkedin-optimiser`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          currentRole:    currentRole.slug,
          targetRole:     targetRole?.slug  || undefined,
          skills,
          yearsExp:       yearsExp ? parseInt(yearsExp) : null,
          industry:       industry       || undefined,
          resumeText:     resumeText     || undefined,
          jobDescription: jobDescription || undefined,
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
      <Head><title>LinkedIn Profile Audit — HireEdge</title></Head>

      <div className="tool-page">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">LinkedIn Profile Audit</h1>
          <p className="tool-page__sub">
            Score your profile, fix the biggest issues, and get copy-ready rewrites — headline, About section, experience bullets, and keywords.
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <div className="tool-form">

          {/* Row 1: roles */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Your current role…"
                onSelect={setCurrentRole}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">✓ {currentRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__optional">(if transitioning)</span></label>
              <RoleSearch
                placeholder="Role you're moving toward…"
                onSelect={setTargetRole}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">✓ {targetRole.title}</span>}
            </div>
          </div>

          {/* Row 2: skills + years */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Your Key Skills</label>
              <input
                className="tool-form__input"
                type="text"
                placeholder="e.g. SQL, Product Strategy, Stakeholder Management"
                autoComplete="off"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="tool-form__hint">Comma-separated — the more you add, the more personalised the audit</span>
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                className="tool-form__input"
                type="number" min="0" max="40" placeholder="e.g. 7"
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
            {showAdvanced ? "Hide advanced options" : "Add CV / Job Description for deeper personalisation"}
            {!showAdvanced && !resumeText && !jobDescription && (
              <span className="li-advanced-toggle__tip">recommended</span>
            )}
            {(resumeText || jobDescription) && (
              <span className="li-advanced-toggle__added">✓ Added</span>
            )}
          </button>

          {showAdvanced && (
            <div className="li-advanced-fields">
              <div className="tool-form__field">
                <label className="tool-form__label">
                  Paste your CV or profile summary
                  <span className="tool-form__optional"> — enables written About section and personalised audit</span>
                </label>
                <textarea
                  className="tool-form__textarea" rows={5}
                  placeholder="Paste your CV text, LinkedIn summary, or any career background…"
                  autoComplete="off"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
              <div className="tool-form__row tool-form__row--2">
                <div className="tool-form__field">
                  <label className="tool-form__label">
                    Target Job Description <span className="tool-form__optional">(optional)</span>
                  </label>
                  <textarea
                    className="tool-form__textarea" rows={4}
                    placeholder="Paste a JD to tailor keywords and positioning…"
                    autoComplete="off"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div className="tool-form__field">
                  <label className="tool-form__label">Industry <span className="tool-form__optional">(optional)</span></label>
                  <input
                    className="tool-form__input"
                    type="text" placeholder="e.g. Technology, Financial Services"
                    autoComplete="off"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errorInfo?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">🔒</span>
              <div>
                <p className="tool-upgrade-prompt__title">{errorInfo.message}</p>
                <p className="tool-upgrade-prompt__sub">Upgrade to access the full LinkedIn Audit and all premium tools.</p>
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
            disabled={loading || !currentRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Run Profile Audit"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~20 seconds · Full audit + rewrites</p>
          )}
        </div>

        {/* Loading */}
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

        {result && (
        <>
          <LinkedinOptimisationCard data={result} />
          <div className="edgex-tool-footer"><EDGEXBadge /></div>
        </>
      )}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
