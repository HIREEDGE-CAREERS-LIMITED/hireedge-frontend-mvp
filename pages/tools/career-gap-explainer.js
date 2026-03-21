\// ============================================================================
// pages/tools/gap-explainer.js
// HireEdge — Career Gap Explainer (v2)
//
// A high-clarity diagnostic engine explaining exactly why a career transition
// is easy or difficult, and what must change.
//
// 10 sections (scroll-based, no tabs):
//   1.  Hero — route + 3 metrics (severity, skill match %, difficulty)
//   2.  Transition Verdict
//   3.  Gap Breakdown — skills / experience / market (3 columns)
//   4.  Skill Gap Deep Dive — 3–6 skills with current vs required vs impact
//   5.  Experience Gap Analysis
//   6.  Market Gap
//   7.  Gap Severity Map — visual bar dashboard
//   8.  Reality Check — what this means, where they fit now
//   9.  Fix Priority Plan — #1 MUST DO / #2 NEXT STEP / #3 SUPPORTING
//  10.  If Ignored — risk warning block
//
// API: GET /api/tools/career-gap-explainer?action=explain&from=X&to=Y
// Gating: free tier (from/to only) — all plans
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _slugToTitle(s) {
  return (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function _friendlyError(json) {
  const reason = json?.reason || "";
  if (reason === "access_denied" || reason === "tool_not_in_plan") return { type: "upgrade" };
  if (reason === "daily_limit_reached") return { type: "limit", message: "Daily limit reached. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Mapping transition pathway…",
  "Identifying skill gaps…",
  "Analysing experience delta…",
  "Measuring market distance…",
  "Building fix plan…",
];

// ── Atom components ──────────────────────────────────────────────────────────

function SevBadge({ level }) {
  const map = {
    High:   { cls: "ge-sev--high",   label: "High" },
    Medium: { cls: "ge-sev--medium", label: "Medium" },
    Low:    { cls: "ge-sev--low",    label: "Low" },
  };
  const cfg = map[level] || map.Medium;
  return <span className={`ge-sev ${cfg.cls}`}>{cfg.label}</span>;
}

function DiffBadge({ level }) {
  const map = {
    Hard:   "ge-diff--hard",
    Medium: "ge-diff--medium",
    Easy:   "ge-diff--easy",
  };
  return <span className={`ge-diff ${map[level] || "ge-diff--medium"}`}>{level}</span>;
}

function SectionTag({ n }) {
  return <span className="ge-section-tag">{String(n).padStart(2, "0")}</span>;
}

function Divider() {
  return <div className="ge-divider" />;
}

// ── Result card — all 10 sections ────────────────────────────────────────────

function GapReport({ data, fromTitle, toTitle }) {
  if (!data) return null;

  const {
    hero,
    transition_verdict,
    gap_breakdown,
    skill_gap_deep_dive   = [],
    experience_gap        = [],
    market_gap,
    gap_severity_map,
    reality_check,
    fix_priority_plan     = [],
    if_ignored            = [],
  } = data;

  return (
    <div className="ge-report">

      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <div className="ge-hero">
        <div className="ge-hero__eyebrow">
          <span className="ge-hero__eyebrow-text">Gap Explainer</span>
          <span className="ge-hero__dot" />
          <span className="ge-hero__eyebrow-text">Career Diagnostic</span>
        </div>

        <h1 className="ge-hero__title">
          {hero?.title || `Why moving from ${fromTitle} → ${toTitle}`}
        </h1>

        <div className="ge-hero__metrics">
          <div className="ge-hero__metric">
            <span className="ge-hero__metric-label">Gap Severity</span>
            <SevBadge level={hero?.gap_severity || "Medium"} />
          </div>
          <div className="ge-hero__metric-sep" />
          <div className="ge-hero__metric">
            <span className="ge-hero__metric-label">Skill Match</span>
            <span className="ge-hero__metric-val ge-hero__metric-val--mono">
              {hero?.skill_match_pct ?? "—"}%
            </span>
          </div>
          <div className="ge-hero__metric-sep" />
          <div className="ge-hero__metric">
            <span className="ge-hero__metric-label">Difficulty</span>
            <DiffBadge level={hero?.transition_difficulty || "Medium"} />
          </div>
        </div>
      </div>

      <Divider />

      {/* ── 2. Transition Verdict ────────────────────────────────────── */}
      {transition_verdict && (
        <section className="ge-section" id="ge-verdict">
          <SectionTag n={2} />
          <h2 className="ge-section__title">Transition Verdict</h2>
          <div className="ge-verdict-block">
            <p className="ge-verdict-block__text">{transition_verdict}</p>
          </div>
        </section>
      )}

      <Divider />

      {/* ── 3. Gap Breakdown ─────────────────────────────────────────── */}
      {gap_breakdown && (
        <section className="ge-section" id="ge-breakdown">
          <SectionTag n={3} />
          <h2 className="ge-section__title">Gap Breakdown</h2>
          <div className="ge-breakdown-grid">
            {[
              { key: "skill_gaps",      label: "A. Skill Gaps",      icon: "◈", cls: "ge-breakdown-col--skill" },
              { key: "experience_gaps", label: "B. Experience Gaps", icon: "◉", cls: "ge-breakdown-col--exp" },
              { key: "market_gaps",     label: "C. Market Gaps",     icon: "◆", cls: "ge-breakdown-col--market" },
            ].map(({ key, label, icon, cls }) => (
              <div key={key} className={`ge-breakdown-col ${cls}`}>
                <div className="ge-breakdown-col__header">
                  <span className="ge-breakdown-col__icon">{icon}</span>
                  <span className="ge-breakdown-col__label">{label}</span>
                </div>
                {(gap_breakdown[key] || []).map((g, i) => (
                  <div key={i} className="ge-breakdown-item">
                    <div className="ge-breakdown-item__header">
                      <span className="ge-breakdown-item__name">{g.title || g.gap}</span>
                      {g.severity && <SevBadge level={g.severity} />}
                    </div>
                    {g.explanation && <p className="ge-breakdown-item__why">{g.explanation}</p>}
                    {g.why_it_matters && <p className="ge-breakdown-item__why">{g.why_it_matters}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 4. Skill Gap Deep Dive ───────────────────────────────────── */}
      {skill_gap_deep_dive.length > 0 && (
        <section className="ge-section" id="ge-skills">
          <SectionTag n={4} />
          <h2 className="ge-section__title">Skill Gap Deep Dive</h2>
          <p className="ge-section__hint">
            Critical skills missing for {toTitle} — with current exposure vs what the role demands.
          </p>
          <div className="ge-skill-grid">
            {skill_gap_deep_dive.map((s, i) => (
              <div key={i} className="ge-skill-card">
                <div className="ge-skill-card__name">{s.skill}</div>
                <div className="ge-skill-card__row">
                  <div className="ge-skill-card__col">
                    <span className="ge-skill-card__col-label">Current</span>
                    <span className="ge-skill-card__col-val ge-skill-card__col-val--low">{s.current || "Low exposure"}</span>
                  </div>
                  <svg className="ge-skill-card__arrow" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="ge-skill-card__col">
                    <span className="ge-skill-card__col-label">Required</span>
                    <span className="ge-skill-card__col-val ge-skill-card__col-val--high">{s.required || "Core skill"}</span>
                  </div>
                </div>
                {s.impact && (
                  <div className="ge-skill-card__impact">
                    <span className="ge-skill-card__impact-label">Impact</span>
                    <p className="ge-skill-card__impact-text">{s.impact}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 5. Experience Gap Analysis ───────────────────────────────── */}
      {experience_gap.length > 0 && (
        <section className="ge-section" id="ge-experience">
          <SectionTag n={5} />
          <h2 className="ge-section__title">Experience Gap Analysis</h2>
          <p className="ge-section__hint">Real-world exposure that {toTitle} hiring managers expect — and that is currently missing.</p>
          <div className="ge-exp-list">
            {experience_gap.map((e, i) => (
              <div key={i} className="ge-exp-item">
                <div className="ge-exp-item__header">
                  <span className="ge-exp-item__name">{e.gap || e.title}</span>
                  {e.severity && <SevBadge level={e.severity} />}
                </div>
                {e.explanation && <p className="ge-exp-item__text">{e.explanation}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 6. Market Gap ────────────────────────────────────────────── */}
      {market_gap && (
        <section className="ge-section" id="ge-market">
          <SectionTag n={6} />
          <h2 className="ge-section__title">Market Gap</h2>
          <p className="ge-section__hint">How recruiters and hiring managers currently perceive this profile.</p>
          <div className="ge-market-block">
            {market_gap.recruiter_view && (
              <div className="ge-market-block__row ge-market-block__row--recruiter">
                <span className="ge-market-block__row-label">Recruiter view</span>
                <p className="ge-market-block__row-text">{market_gap.recruiter_view}</p>
              </div>
            )}
            {market_gap.hiring_manager_view && (
              <div className="ge-market-block__row ge-market-block__row--hm">
                <span className="ge-market-block__row-label">Hiring manager view</span>
                <p className="ge-market-block__row-text">{market_gap.hiring_manager_view}</p>
              </div>
            )}
            {market_gap.positioning_gap && (
              <div className="ge-market-block__row ge-market-block__row--pos">
                <span className="ge-market-block__row-label">Positioning gap</span>
                <p className="ge-market-block__row-text">{market_gap.positioning_gap}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 7. Gap Severity Map ──────────────────────────────────────── */}
      {gap_severity_map && (
        <section className="ge-section" id="ge-severity-map">
          <SectionTag n={7} />
          <h2 className="ge-section__title">Gap Severity Map</h2>
          <p className="ge-section__hint">Where the transition gap is concentrated — diagnostic dashboard.</p>
          <div className="ge-sev-map">
            {[
              { key: "skills_pct",     label: "Skills Gap",     colour: "#dc2626" },
              { key: "experience_pct", label: "Experience Gap", colour: "#d97706" },
              { key: "market_pct",     label: "Market Gap",     colour: "#2563eb" },
            ].map(({ key, label, colour }) => {
              const pct = gap_severity_map[key] ?? 0;
              return (
                <div key={key} className="ge-sev-map__row">
                  <span className="ge-sev-map__label">{label}</span>
                  <div className="ge-sev-map__track">
                    <div className="ge-sev-map__fill" style={{ width: `${pct}%`, background: colour }} />
                  </div>
                  <span className="ge-sev-map__pct" style={{ color: colour }}>{pct}%</span>
                </div>
              );
            })}
            {gap_severity_map.overall_note && (
              <p className="ge-sev-map__note">{gap_severity_map.overall_note}</p>
            )}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 8. Reality Check ─────────────────────────────────────────── */}
      {reality_check && (
        <section className="ge-section" id="ge-reality">
          <SectionTag n={8} />
          <h2 className="ge-section__title">What This Means</h2>
          <div className="ge-reality">
            {reality_check.why_delayed && (
              <div className="ge-reality__block ge-reality__block--delay">
                <span className="ge-reality__block-label">Why the transition is delayed</span>
                <p className="ge-reality__block-text">{reality_check.why_delayed}</p>
              </div>
            )}
            {reality_check.where_youll_struggle && (
              <div className="ge-reality__block ge-reality__block--struggle">
                <span className="ge-reality__block-label">Where you will struggle</span>
                <p className="ge-reality__block-text">{reality_check.where_youll_struggle}</p>
              </div>
            )}
            {reality_check.fits_now && (
              <div className="ge-reality__block ge-reality__block--fit">
                <span className="ge-reality__block-label">Where you actually fit right now</span>
                <p className="ge-reality__block-text ge-reality__block-text--role">{reality_check.fits_now}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 9. Fix Priority Plan ─────────────────────────────────────── */}
      {fix_priority_plan.length > 0 && (
        <section className="ge-section" id="ge-fix-plan">
          <SectionTag n={9} />
          <h2 className="ge-section__title">Fix Priority Plan</h2>
          <p className="ge-section__hint">Execute in this exact order. Don't move to #2 until #1 is done.</p>
          <div className="ge-fix-list">
            {fix_priority_plan.map((f, i) => {
              const tagMap = [
                { tag: "#1 MUST DO",    colour: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)"  },
                { tag: "#2 NEXT STEP",  colour: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)"  },
                { tag: "#3 SUPPORTING", colour: "#2563eb", bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.2)"  },
                { tag: "#4 SUPPORTING", colour: "#7c3aed", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)" },
                { tag: "#5 SUPPORTING", colour: "#475569", bg: "rgba(71,85,105,0.08)",   border: "rgba(71,85,105,0.2)"  },
              ];
              const t = tagMap[i] || tagMap[4];
              return (
                <div key={i} className="ge-fix-card" style={{ "--fc": t.colour, "--fb": t.bg, "--fbo": t.border }}>
                  <div className="ge-fix-card__strip">
                    <span className="ge-fix-card__tag">{t.tag}</span>
                    {f.time_estimate && (
                      <span className="ge-fix-card__time">⏱ {f.time_estimate}</span>
                    )}
                  </div>
                  <div className="ge-fix-card__body">
                    <div className="ge-fix-card__action">{f.action || f.what_to_do}</div>
                    {f.why_it_matters && (
                      <p className="ge-fix-card__why">→ {f.why_it_matters}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Divider />

      {/* ── 10. If Ignored ───────────────────────────────────────────── */}
      {if_ignored.length > 0 && (
        <section className="ge-section ge-section--warning" id="ge-if-ignored">
          <SectionTag n={10} />
          <h2 className="ge-section__title">What Happens If You Don't Fix These Gaps</h2>
          <div className="ge-ignored">
            <div className="ge-ignored__header">
              <span className="ge-ignored__icon">⚠</span>
              <p className="ge-ignored__intro">
                Gaps don't close themselves. Here is what inaction costs you in this transition.
              </p>
            </div>
            <div className="ge-ignored__items">
              {if_ignored.map((item, i) => (
                <div key={i} className="ge-ignored__item">
                  <span className="ge-ignored__item-dot" />
                  <p className="ge-ignored__item-text">{item}</p>
                </div>
              ))}
            </div>
            <div className="ge-ignored__footer">
              <span className="ge-ignored__footer-text">
                Start with <strong>Fix #1</strong> above. Even one week of focused effort changes the trajectory.
              </span>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GapExplainerPage() {
  const router  = useRouter();
  const autoRan = useRef(false);
  const { context: edgex } = useEDGEXContext() || {};

  const [fromRole, setFromRole] = useState(null);
  const [toRole,   setToRole]   = useState(null);

  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorInfo,   setErrorInfo]   = useState(null);
  const stepTimer = useRef(null);

  // Hydrate from query params
  useEffect(() => {
    if (!router.isReady) return;
    const { from, to, current, target } = router.query;
    const f = from || current;
    const t = to   || target;
    if (f) setFromRole({ slug: f, title: _slugToTitle(f) });
    if (t) setToRole({   slug: t, title: _slugToTitle(t) });
  }, [router.isReady]);

  // Autorun
  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !fromRole || !toRole) return;
    autoRan.current = true;
    _submit();
  }, [fromRole, toRole, router.isReady]);

  // Loading step ticker
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimer.current = setInterval(() => setLoadingStep(s => (s + 1) % LOADING_STEPS.length), 3200);
    } else {
      clearInterval(stepTimer.current);
    }
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  async function _submit() {
    if (!fromRole || !toRole) {
      setErrorInfo({ type: "error", message: "Please select both a current role and a target role." });
      return;
    }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const params = new URLSearchParams({
        action: "explain",
        from:   fromRole.slug,
        to:     toRole.slug,
      });
      const r = await fetch(`${API}/api/tools/career-gap-explainer?${params}`, {
        headers: { "X-HireEdge-Plan": getPlan() },
      });
      const json = await r.json();
      if (!json.ok && !json.data) {
        setErrorInfo(_friendlyError(json));
        return;
      }
      setResult(json.data || json);
    } catch {
      setErrorInfo({ type: "error", message: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Career Gap Explainer — HireEdge</title></Head>

      <div className="tool-page">

        {/* Page header */}
        <div className="ge-page-header">
          <div className="ge-page-header__badge">
            <span>GAP EXPLAINER</span>
          </div>
          <h1 className="ge-page-header__title">Career Gap Diagnostic</h1>
          <p className="ge-page-header__sub">
            Understand exactly why a career transition is hard or easy — and what you need to fix, in order.
          </p>
        </div>

        {/* Form */}
        <div className="tool-form ge-form">
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">
                Current Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you are now…"
                onSelect={setFromRole}
                initialValue={fromRole?.title || ""}
              />
              {fromRole && <span className="tool-form__selected">✓ {fromRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">
                Target Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you want to go…"
                onSelect={setToRole}
                initialValue={toRole?.title || ""}
              />
              {toRole && <span className="tool-form__selected">✓ {toRole.title}</span>}
            </div>
          </div>

          {errorInfo?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">🔒</span>
              <div>
                <p className="tool-upgrade-prompt__title">Upgrade required</p>
                <p className="tool-upgrade-prompt__sub">Gap Explainer requires a paid plan.</p>
              </div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade →</Link>
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
            className="tool-form__submit ge-submit"
            onClick={_submit}
            disabled={loading || !fromRole || !toRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Explain the Gap"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~15 seconds · Full 10-section diagnostic</p>
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

        {/* Result */}
        {result && (
          <GapReport
            data={result}
            fromTitle={fromRole?.title || ""}
            toTitle={toRole?.title || ""}
          />
        )}

      </div>
    </>
  );
}
