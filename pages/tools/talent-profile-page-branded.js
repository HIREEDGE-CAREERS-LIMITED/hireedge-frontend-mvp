// ============================================================================
// pages/tools/talent-profile.js
// HireEdge -- Talent Profile (v1)
//
// The central brain of HireEdge. Combines all career intelligence into a
// McKinsey-grade 10-section career health dashboard.
//
// Gating: Pro | Elite only
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import TalentProfileCard from "../../components/tools/TalentProfileCard";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXBadge from "../../components/brand/EDGEXBadge";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _friendlyError(json) {
  const reason = json?.reason || "";
  if (reason === "access_denied" || reason === "tool_not_in_plan") return { type: "upgrade" };
  if (reason === "daily_limit_reached") return { type: "limit", message: "You've reached your daily limit. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Analysing your career profile...",
  "Scoring market readiness...",
  "Identifying strengths & gaps...",
  "Building strategic recommendations...",
  "Calculating transition confidence...",
  "Compiling your Talent Report...",
];

// -- Pro paywall ---------------------------------------------------------------

function ProPaywall() {
  return (
    <div className="tp-paywall">
      <div className="tp-paywall__icon"></div>
      <h3 className="tp-paywall__title">Unlock Your Talent Profile</h3>
      <p className="tp-paywall__sub">Available on Pro and Elite plans</p>

      <div className="tp-paywall__features">
        {[
          { icon: "", text: "10-section McKinsey-style career report" },
          { icon: "", text: "Personalised Talent Score (0-100)" },
          { icon: "", text: "Executive career summary & market positioning" },
          { icon: "", text: "Transition confidence with % probability" },
          { icon: "", text: "Strategic recommendation with timeline" },
          { icon: "", text: "Prioritised action plan" },
        ].map((f, i) => (
          <div key={i} className="tp-paywall__feature">
            <span className="tp-paywall__feature-icon">{f.icon}</span>
            <span className="tp-paywall__feature-text">{f.text}</span>
          </div>
        ))}
      </div>

      <div className="tp-paywall__plans">
        <Link href="/billing?plan=pro" className="tp-paywall__cta tp-paywall__cta--primary">
          Upgrade to Pro -- 14.99/mo 
        </Link>
        <Link href="/billing?plan=elite" className="tp-paywall__cta tp-paywall__cta--secondary">
          Go Elite -- 29.99/mo
        </Link>
      </div>
      <p className="tp-paywall__note">Includes Resume Optimiser, LinkedIn Audit, Interview Prep & more.</p>
    </div>
  );
}

// -- Page ----------------------------------------------------------------------

export default function TalentProfilePage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  const [currentRole,    setCurrentRole]    = useState(null);
  const [targetRole,     setTargetRole]     = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");

  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const [resumeText,     setResumeText]     = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorInfo,   setErrorInfo]   = useState(null);
  const stepTimer = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.current || q.role) setCurrentRole({ slug: q.current || q.role, title: _slugToTitle(q.current || q.role) });
    if (q.target)            setTargetRole({ slug: q.target, title: _slugToTitle(q.target) });
    if (q.yearsExp && !isNaN(parseInt(q.yearsExp))) setYearsExp(q.yearsExp);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !currentRole) return;
    autoRan.current = true;
    _submit();
  }, [currentRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimer.current = setInterval(() => {
        setLoadingStep(s => (s + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      clearInterval(stepTimer.current);
    }
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  async function _submit() {
    if (!currentRole) { setErrorInfo({ type: "error", message: "Please select your current role." }); return; }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/talent-profile`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          currentRole:    currentRole.slug,
          targetRole:     targetRole?.slug || "",
          skills,
          yearsExp:       yearsExp ? parseInt(yearsExp) : null,
          resumeText:     resumeText     || undefined,
          jobDescription: jobDescription || undefined,
        }),
      });
      const json = await r.json();
      if (!json.ok) { setErrorInfo(_friendlyError(json)); return; }
      setResult(json.data);
    } catch {
      setErrorInfo({ type: "error", message: "Network error -- please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Talent Profile -- HireEdge</title></Head>

      <div className="tool-page">

        {/* -- Header ------------------------------------------------------- */}
        <div className="tp-page-header">
          <div className="tp-page-header__badge">
            <span className="tp-page-header__badge-icon"></span>
            <span>TALENT PROFILE</span>
          </div>
          <h1 className="tp-page-header__title">Your Career Intelligence Report</h1>
          <p className="tp-page-header__sub">
            A McKinsey-grade analysis of your career position, market readiness, transition probability, and the exact steps to reach your target role -- built from everything EDGEX knows about you.
          </p>
        </div>

        {/* -- Form --------------------------------------------------------- */}
        <div className="tool-form tp-form">

          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you are now..."
                onSelect={setCurrentRole}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected"> {currentRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__optional">(optional -- enables transition analysis)</span></label>
              <RoleSearch
                placeholder="Where you want to go..."
                onSelect={setTargetRole}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected"> {targetRole.title}</span>}
            </div>
          </div>

          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Key Skills</label>
              <input
                className="tool-form__input"
                type="text"
                placeholder="e.g. Stakeholder Management, SQL, Product Strategy, Python"
                autoComplete="off"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="tool-form__hint">Comma-separated -- the more you add, the sharper the profile</span>
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

          {/* Advanced */}
          <button
            className="li-advanced-toggle"
            onClick={() => setShowAdvanced(v => !v)}
            type="button"
          >
            <span className="li-advanced-toggle__icon">{showAdvanced ? "" : ""}</span>
            {showAdvanced ? "Hide advanced" : "Add CV for deeper personalisation"}
            {!showAdvanced && !resumeText && (
              <span className="li-advanced-toggle__tip">strongly recommended</span>
            )}
            {resumeText && <span className="li-advanced-toggle__added"> CV added</span>}
          </button>

          {showAdvanced && (
            <div className="li-advanced-fields">
              <div className="tool-form__field">
                <label className="tool-form__label">
                  CV / Profile Summary <span className="tool-form__optional">-- enables a fully personalised report</span>
                </label>
                <textarea
                  className="tool-form__textarea" rows={6}
                  placeholder="Paste your CV, LinkedIn summary, or career background. The more detail, the sharper the intelligence..."
                  autoComplete="off"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
              <div className="tool-form__field">
                <label className="tool-form__label">
                  Target Job Description <span className="tool-form__optional">(optional)</span>
                </label>
                <textarea
                  className="tool-form__textarea" rows={4}
                  placeholder="Paste a JD to align the profile to a specific role..."
                  autoComplete="off"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Paywall */}
          {errorInfo?.type === "upgrade" && <ProPaywall />}

          {/* Limit */}
          {errorInfo?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon"></span>
              <div><p className="tool-upgrade-prompt__title">{errorInfo.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade </Link>
            </div>
          )}

          {/* Error */}
          {errorInfo?.type === "error" && (
            <div className="tool-form__error">{errorInfo.message}</div>
          )}

          <button
            className="tool-form__submit tp-submit"
            onClick={_submit}
            disabled={loading || !currentRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Generate My Talent Profile"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~30 seconds  Full 10-section career intelligence report</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <div className="li-loading-steps">
              {LOADING_STEPS.map((step, i) => (
                <span key={i} className={`li-loading-step ${i === loadingStep ? "li-loading-step--active" : i < loadingStep ? "li-loading-step--done" : ""}`}>
                  {i < loadingStep ? "" : i === loadingStep ? "" : ""} {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {result && (
        <>
          <TalentProfileCard data={result} />
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
