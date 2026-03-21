// ============================================================================
// pages/tools/career-roadmap.js
// HireEdge — Career Roadmap (v5)
//
// PART 2 FIX — Plan gating:
//   Career Roadmap is included in: career_pack | pro | elite
//   Paywall UI shows conversion-focused career_pack upgrade prompt
//   Message: "Included in Career Pack or higher"
//   CTA: "Unlock Career Pack (£19.99 one-time)"
//
// PART 1 UX:
//   - Animated loading steps
//   - Strategy-first framing in subtitle
//   - Skills + years collapsible under "Personalise"
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import RoadmapCard from "../../components/tools/RoadmapCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

// ── Plan helpers ──────────────────────────────────────────────────────────────

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

// career-roadmap is included in career_pack | pro | elite
const ALLOWED_PLANS = ["career_pack", "pro", "elite"];

function _friendlyError(json) {
  const reason = json?.reason || "";
  if (reason === "access_denied" || reason === "tool_not_in_plan") {
    return { type: "upgrade" };
  }
  if (reason === "daily_limit_reached") {
    return { type: "limit", message: "You've reached your daily limit. Upgrade for more." };
  }
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

// ── Paywall card ──────────────────────────────────────────────────────────────

function CareerPackPaywall() {
  return (
    <div className="cr-paywall">
      <div className="cr-paywall__header">
        <span className="cr-paywall__lock">🔒</span>
        <div>
          <h3 className="cr-paywall__title">Unlock Your Career Roadmap</h3>
          <p className="cr-paywall__sub">Included in Career Pack or higher</p>
        </div>
      </div>

      <div className="cr-paywall__features">
        {[
          "Full step-by-step career roadmap",
          "Transition strategy & skill gap analysis",
          "Probability scores & risk assessment",
          "Bridge paths when no direct route exists",
          "Phased action plan (0–3 / 3–6 / 6–12 months)",
          "Personalised strengths & gaps analysis",
        ].map((f, i) => (
          <div key={i} className="cr-paywall__feature">
            <span className="cr-paywall__check">✔</span>
            <span className="cr-paywall__feature-text">{f}</span>
          </div>
        ))}
      </div>

      <div className="cr-paywall__price-row">
        <span className="cr-paywall__price">£19.99</span>
        <span className="cr-paywall__price-note">one-time payment · no subscription</span>
      </div>

      <Link href="/billing?plan=career_pack" className="cr-paywall__cta">
        Unlock Career Pack →
      </Link>

      <p className="cr-paywall__reassurance">
        Also included in Pro and Elite plans. Already have access? Refresh the page.
      </p>
    </div>
  );
}

// ── Loading steps ─────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Mapping career graph…",
  "Calculating skill gaps…",
  "Building transition strategy…",
  "Generating phased roadmap…",
  "Scoring probability & risk…",
];

// ── Strategies ────────────────────────────────────────────────────────────────

const STRATEGIES = [
  { value: "safe",         label: "🛡 Safe"        },
  { value: "fastest",      label: "⚡ Fastest"      },
  { value: "highest_paid", label: "💰 Highest Paid" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CareerRoadmapPage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  const [fromRole, setFromRole] = useState(null);
  const [toRole,   setToRole]   = useState(null);
  const [strategy, setStrategy] = useState("safe");

  const [showPersonalise, setShowPersonalise] = useState(false);
  const [skills,          setSkills]          = useState("");
  const [yearsExp,        setYearsExp]        = useState("");

  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorInfo,   setErrorInfo]   = useState(null);
  const stepTimer = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.from || q.current) setFromRole({ slug: q.from || q.current, title: _slugToTitle(q.from || q.current) });
    if (q.to   || q.target)  setToRole({ slug: q.to || q.target, title: _slugToTitle(q.to || q.target) });
    if (q.strategy && STRATEGIES.map(s=>s.value).includes(q.strategy)) setStrategy(q.strategy);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !fromRole || !toRole) return;
    autoRan.current = true;
    _submit();
  }, [fromRole, toRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimer.current = setInterval(() => {
        setLoadingStep(s => (s + 1) % LOADING_STEPS.length);
      }, 3800);
    } else {
      clearInterval(stepTimer.current);
    }
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  async function _submit() {
    if (!fromRole) { setErrorInfo({ type: "error", message: "Please select your current role." }); return; }
    if (!toRole)   { setErrorInfo({ type: "error", message: "Please select your target role." }); return; }
    if (fromRole.slug === toRole.slug) { setErrorInfo({ type: "error", message: "Current and target role must be different." }); return; }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/career-roadmap`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          fromRole:  fromRole.slug,
          toRole:    toRole.slug,
          strategy,
          skills,
          yearsExp:  yearsExp ? parseInt(yearsExp) : null,
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
      <Head><title>Career Roadmap — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Career Roadmap</h1>
          <p className="tool-page__sub">
            Your personalised transition strategy — skill gaps, probability scores, phased action plan, and a clear recommended path from where you are to where you want to be.
          </p>
        </div>

        <div className="tool-form">
          {/* Roles + strategy */}
          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you are now…"
                onSelect={setFromRole}
                initialValue={fromRole?.title || ""}
              />
              {fromRole && <span className="tool-form__selected">✓ {fromRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you want to go…"
                onSelect={setToRole}
                initialValue={toRole?.title || ""}
              />
              {toRole && <span className="tool-form__selected">✓ {toRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Optimise For</label>
              <div className="tool-form__toggle-row">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`tool-form__toggle ${strategy === s.value ? "tool-form__toggle--active" : ""}`}
                    onClick={() => setStrategy(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personalise toggle */}
          <button
            className="li-advanced-toggle"
            onClick={() => setShowPersonalise(v => !v)}
            type="button"
          >
            <span className="li-advanced-toggle__icon">{showPersonalise ? "▲" : "▼"}</span>
            {showPersonalise ? "Hide personalisation" : "Add skills & experience for deeper analysis"}
            {!showPersonalise && !skills && (
              <span className="li-advanced-toggle__tip">optional</span>
            )}
            {skills && (
              <span className="li-advanced-toggle__added">✓ Added</span>
            )}
          </button>

          {showPersonalise && (
            <div className="li-advanced-fields">
              <div className="tool-form__row tool-form__row--2">
                <div className="tool-form__field">
                  <label className="tool-form__label">Your Current Skills</label>
                  <input
                    className="tool-form__input"
                    type="text"
                    placeholder="e.g. SQL, Stakeholder Management, Python"
                    autoComplete="off"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                  <span className="tool-form__hint">Comma-separated — improves skill gap analysis</span>
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
            </div>
          )}

          {/* Paywall */}
          {errorInfo?.type === "upgrade" && <CareerPackPaywall />}

          {/* Limit */}
          {errorInfo?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">⏱</span>
              <div><p className="tool-upgrade-prompt__title">{errorInfo.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade →</Link>
            </div>
          )}

          {/* Generic error */}
          {errorInfo?.type === "error" && (
            <div className="tool-form__error">{errorInfo.message}</div>
          )}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !fromRole || !toRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Build My Career Roadmap"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~25 seconds · Full strategy + roadmap + action plan</p>
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

        {result && <RoadmapCard data={result} />}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
