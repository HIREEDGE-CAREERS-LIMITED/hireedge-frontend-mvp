// ============================================================================
// pages/tools/career-gap-explainer.js
// HireEdge -- Career Gap Diagnostic Report (v3)
//
// Premium 10-section diagnostic. Same quality as Talent Profile.
// Scroll-based, no tabs, card layout.
//
// API: GET /api/tools/career-gap-explainer?action=explain&from=SLUG&to=SLUG
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

// ============================================================================
// Helpers
// ============================================================================

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _slugToTitle(s) {
  return (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function _friendlyError(json) {
  const r = json?.reason || "";
  if (r === "access_denied" || r === "tool_not_in_plan") return { type: "upgrade" };
  if (r === "daily_limit_reached") return { type: "limit", message: "Daily limit reached. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Mapping transition pathway...",
  "Identifying skill gaps...",
  "Analysing experience delta...",
  "Measuring market distance...",
  "Building fix plan...",
];

// ============================================================================
// Design tokens / atoms
// ============================================================================

const SEV_CONFIG = {
  High:   { cls: "gd-badge--red",    label: "High" },
  Medium: { cls: "gd-badge--amber",  label: "Medium" },
  Low:    { cls: "gd-badge--green",  label: "Low" },
};

const DIFF_CONFIG = {
  Hard:   { cls: "gd-badge--red",    label: "Hard" },
  Medium: { cls: "gd-badge--amber",  label: "Medium" },
  Easy:   { cls: "gd-badge--green",  label: "Easy" },
};

const LEVEL_CONFIG = {
  High:   { cls: "gd-level--high",   label: "High" },
  Medium: { cls: "gd-level--medium", label: "Medium" },
  Low:    { cls: "gd-level--low",    label: "Low" },
  "Low exposure":      { cls: "gd-level--low",    label: "Low exposure" },
  "Indirect exposure": { cls: "gd-level--low",    label: "Indirect" },
  "Core skill":        { cls: "gd-level--high",   label: "Core skill" },
  "Advanced":          { cls: "gd-level--high",   label: "Advanced" },
};

function Badge({ text, type }) {
  const cfg = SEV_CONFIG[text] || DIFF_CONFIG[text] || { cls: "gd-badge--amber", label: text };
  return <span className={`gd-badge ${cfg.cls} ${type ? "gd-badge--" + type : ""}`}>{cfg.label}</span>;
}

function LevelChip({ text }) {
  const cfg = LEVEL_CONFIG[text] || { cls: "gd-level--medium", label: text };
  return <span className={`gd-level ${cfg.cls}`}>{cfg.label}</span>;
}

function Card({ children, variant, id }) {
  return (
    <div className={`gd-card ${variant ? "gd-card--" + variant : ""}`} id={id}>
      {children}
    </div>
  );
}

function CardHeader({ tag, title, subtitle }) {
  return (
    <div className="gd-card__header">
      {tag && <span className="gd-card__tag">{tag}</span>}
      <h2 className="gd-card__title">{title}</h2>
      {subtitle && <p className="gd-card__subtitle">{subtitle}</p>}
    </div>
  );
}

function Divider() {
  return <div className="gd-divider" />;
}

// ============================================================================
// Section 1 -- HERO
// ============================================================================

function HeroSection({ data, fromTitle, toTitle }) {
  if (!data) return null;
  const { title, gap_severity, skill_match_pct, transition_difficulty } = data;

  const sevColour = gap_severity === "High" ? "#ef4444" : gap_severity === "Low" ? "#10b981" : "#f59e0b";
  const diffColour = transition_difficulty === "Hard" ? "#ef4444" : transition_difficulty === "Easy" ? "#10b981" : "#f59e0b";

  return (
    <div className="gd-hero">
      <div className="gd-hero__eyebrow">
        <span className="gd-hero__eyebrow-label">Career Gap Diagnostic</span>
        <span className="gd-hero__eyebrow-dot" />
        <span className="gd-hero__eyebrow-label">Decision Report</span>
      </div>

      <h1 className="gd-hero__title">
        {title || ("Why moving from " + fromTitle + " to " + toTitle + " is challenging")}
      </h1>

      <div className="gd-hero__route">
        <span className="gd-hero__role">{fromTitle}</span>
        <svg className="gd-hero__arrow" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="gd-hero__role gd-hero__role--target">{toTitle}</span>
      </div>

      <div className="gd-hero__metrics">
        <div className="gd-hero__metric" style={{ "--m-colour": sevColour }}>
          <span className="gd-hero__metric-icon">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <span className="gd-hero__metric-label">Gap Severity</span>
            <span className="gd-hero__metric-val" style={{ color: sevColour }}>
              {gap_severity || "Medium"}
            </span>
          </div>
        </div>

        <div className="gd-hero__metric-sep" />

        <div className="gd-hero__metric" style={{ "--m-colour": "#6366f1" }}>
          <span className="gd-hero__metric-icon">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M3 10a7 7 0 1 0 14 0A7 7 0 0 0 3 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <span className="gd-hero__metric-label">Skill Match</span>
            <span className="gd-hero__metric-val" style={{ color: "#818cf8" }}>
              {skill_match_pct != null ? skill_match_pct + "%" : "--"}
            </span>
          </div>
        </div>

        <div className="gd-hero__metric-sep" />

        <div className="gd-hero__metric" style={{ "--m-colour": diffColour }}>
          <span className="gd-hero__metric-icon">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 3L3 17h14L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 10v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="14.5" r="0.5" fill="currentColor"/>
            </svg>
          </span>
          <div>
            <span className="gd-hero__metric-label">Difficulty</span>
            <span className="gd-hero__metric-val" style={{ color: diffColour }}>
              {transition_difficulty || "Medium"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section 2 -- TRANSITION VERDICT
// ============================================================================

function VerdictSection({ text }) {
  if (!text) return null;
  return (
    <Card id="gd-verdict">
      <CardHeader tag="02" title="Transition Verdict" />
      <div className="gd-verdict">
        <div className="gd-verdict__bar" />
        <p className="gd-verdict__text">{text}</p>
      </div>
    </Card>
  );
}

// ============================================================================
// Section 3 -- GAP BREAKDOWN
// ============================================================================

function GapBreakdown({ data }) {
  if (!data) return null;
  const cols = [
    { key: "skill_gaps",      label: "A. Skill Gaps",      colour: "#ef4444", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.18)"  },
    { key: "experience_gaps", label: "B. Experience Gaps", colour: "#f59e0b", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.18)" },
    { key: "market_gaps",     label: "C. Market Gaps",     colour: "#6366f1", bg: "rgba(99,102,241,0.06)",  border: "rgba(99,102,241,0.18)" },
  ];

  return (
    <Card id="gd-breakdown">
      <CardHeader tag="03" title="Gap Breakdown" subtitle="The three categories of gap driving this transition's difficulty." />
      <div className="gd-breakdown-grid">
        {cols.map(({ key, label, colour, bg, border }) => (
          <div key={key} className="gd-breakdown-col" style={{ "--col-colour": colour, "--col-bg": bg, "--col-border": border }}>
            <div className="gd-breakdown-col__head">
              <span className="gd-breakdown-col__dot" style={{ background: colour }} />
              <span className="gd-breakdown-col__label">{label}</span>
            </div>
            {(data[key] || []).map((g, i) => (
              <div key={i} className="gd-breakdown-item">
                <div className="gd-breakdown-item__top">
                  <span className="gd-breakdown-item__name">{g.title || g.gap}</span>
                  {g.severity && <Badge text={g.severity} />}
                </div>
                {(g.explanation || g.why_it_matters) && (
                  <p className="gd-breakdown-item__body">
                    {g.explanation}{g.explanation && g.why_it_matters ? " " : ""}{g.why_it_matters}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 4 -- SKILL GAP DEEP DIVE
// ============================================================================

function SkillDeepDive({ skills, toTitle }) {
  if (!skills?.length) return null;
  return (
    <Card id="gd-skills">
      <CardHeader
        tag="04"
        title="Skill Gap Deep Dive"
        subtitle={"Critical skills missing for " + toTitle + " -- current exposure vs what the role requires."}
      />
      <div className="gd-skill-grid">
        {skills.map((s, i) => (
          <div key={i} className="gd-skill-card">
            <div className="gd-skill-card__name">{s.skill}</div>
            <div className="gd-skill-card__levels">
              <div className="gd-skill-card__level-block">
                <span className="gd-skill-card__level-label">Now</span>
                <LevelChip text={s.current || "Low"} />
              </div>
              <svg className="gd-skill-card__arrow" viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="gd-skill-card__level-block">
                <span className="gd-skill-card__level-label">Needed</span>
                <LevelChip text={s.required || "High"} />
              </div>
            </div>
            {s.impact && (
              <div className="gd-skill-card__impact">
                <span className="gd-skill-card__impact-label">Impact</span>
                <p className="gd-skill-card__impact-text">{s.impact}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 5 -- EXPERIENCE GAP ANALYSIS
// ============================================================================

function ExperienceGaps({ gaps, toTitle }) {
  if (!gaps?.length) return null;
  return (
    <Card id="gd-experience">
      <CardHeader
        tag="05"
        title="Experience Gap Analysis"
        subtitle={"Real-world exposure that " + toTitle + " hiring managers expect -- currently missing from this profile."}
      />
      <div className="gd-exp-list">
        {gaps.map((e, i) => (
          <div key={i} className="gd-exp-item">
            <div className="gd-exp-item__left">
              <span className="gd-exp-item__num">{i + 1}</span>
            </div>
            <div className="gd-exp-item__body">
              <div className="gd-exp-item__top">
                <span className="gd-exp-item__name">{e.gap || e.title}</span>
                {e.severity && <Badge text={e.severity} />}
              </div>
              {e.explanation && <p className="gd-exp-item__text">{e.explanation}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 6 -- MARKET PERCEPTION GAP
// ============================================================================

function MarketPerceptionGap({ data }) {
  if (!data) return null;
  const rows = [
    { label: "Recruiter view",       text: data.recruiter_view,      accent: "#6366f1" },
    { label: "Hiring manager view",  text: data.hiring_manager_view, accent: "#f59e0b" },
    { label: "Positioning gap",      text: data.positioning_gap,     accent: "#ef4444" },
  ].filter(r => r.text);

  return (
    <Card id="gd-market">
      <CardHeader
        tag="06"
        title="Market Perception Gap"
        subtitle="How recruiters and hiring managers currently read this profile."
      />
      <div className="gd-market-rows">
        {rows.map((r, i) => (
          <div key={i} className="gd-market-row" style={{ "--row-accent": r.accent }}>
            <span className="gd-market-row__label">{r.label}</span>
            <p className="gd-market-row__text">{r.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 7 -- GAP SEVERITY VISUAL
// ============================================================================

function SeverityVisual({ data }) {
  if (!data) return null;
  const bars = [
    { label: "Skills Gap",     pct: data.skills_pct     || 0, colour: "#ef4444" },
    { label: "Experience Gap", pct: data.experience_pct || 0, colour: "#f59e0b" },
    { label: "Market Gap",     pct: data.market_pct     || 0, colour: "#6366f1" },
  ];

  return (
    <Card id="gd-severity-map" variant="dashboard">
      <CardHeader tag="07" title="Gap Severity Map" subtitle="Where the transition gap is concentrated." />
      <div className="gd-sev-bars">
        {bars.map((b, i) => (
          <div key={i} className="gd-sev-bar-row">
            <span className="gd-sev-bar-row__label">{b.label}</span>
            <div className="gd-sev-bar-row__track">
              <div
                className="gd-sev-bar-row__fill"
                style={{ width: b.pct + "%", background: b.colour }}
              />
            </div>
            <span className="gd-sev-bar-row__pct" style={{ color: b.colour }}>{b.pct}%</span>
          </div>
        ))}
      </div>
      {data.overall_note && (
        <p className="gd-sev-note">{data.overall_note}</p>
      )}
    </Card>
  );
}

// ============================================================================
// Section 8 -- REALITY CHECK
// ============================================================================

function RealityCheck({ data }) {
  if (!data) return null;
  return (
    <Card id="gd-reality">
      <CardHeader tag="08" title="Reality Check" subtitle="Where you actually stand -- and what you can realistically target right now." />
      <div className="gd-reality-blocks">
        {data.why_delayed && (
          <div className="gd-reality-block gd-reality-block--neutral">
            <span className="gd-reality-block__label">Why this transition takes time</span>
            <p className="gd-reality-block__text">{data.why_delayed}</p>
          </div>
        )}
        {data.where_youll_struggle && (
          <div className="gd-reality-block gd-reality-block--warning">
            <span className="gd-reality-block__label">Where you will struggle</span>
            <p className="gd-reality-block__text">{data.where_youll_struggle}</p>
          </div>
        )}
        {data.fits_now && (
          <div className="gd-reality-block gd-reality-block--fit">
            <span className="gd-reality-block__label">Roles you can realistically target today</span>
            <p className="gd-reality-block__text gd-reality-block__text--role">{data.fits_now}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 9 -- FIX PLAN
// ============================================================================

const FIX_URGENCY = [
  { tag: "#1 MUST DO",    colour: "#ef4444", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.2)"  },
  { tag: "#2 NEXT STEP",  colour: "#f59e0b", bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.2)" },
  { tag: "#3 SUPPORTING", colour: "#6366f1", bg: "rgba(99,102,241,0.07)",  border: "rgba(99,102,241,0.2)" },
  { tag: "#4 SUPPORTING", colour: "#64748b", bg: "rgba(100,116,139,0.07)", border: "rgba(100,116,139,0.2)" },
  { tag: "#5 SUPPORTING", colour: "#64748b", bg: "rgba(100,116,139,0.07)", border: "rgba(100,116,139,0.2)" },
];

function FixPlan({ actions }) {
  if (!actions?.length) return null;
  return (
    <Card id="gd-fix-plan">
      <CardHeader
        tag="09"
        title="Fix Plan"
        subtitle="Execute in this exact order. Do not move to #2 until #1 is done."
      />
      <div className="gd-fix-list">
        {actions.map((a, i) => {
          const u = FIX_URGENCY[i] || FIX_URGENCY[4];
          return (
            <div
              key={i}
              className="gd-fix-card"
              style={{ "--u-colour": u.colour, "--u-bg": u.bg, "--u-border": u.border }}
            >
              <div className="gd-fix-card__strip">
                <span className="gd-fix-card__tag">{u.tag}</span>
                {a.time_estimate && (
                  <span className="gd-fix-card__time">{a.time_estimate}</span>
                )}
              </div>
              <div className="gd-fix-card__body">
                <p className="gd-fix-card__action">{a.action || a.what_to_do}</p>
                {a.why_it_matters && (
                  <p className="gd-fix-card__why">{"-> " + a.why_it_matters}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Section 10 -- RISK IF IGNORED
// ============================================================================

function RiskIfIgnored({ items, toTitle }) {
  const list = (items && items.length > 0)
    ? items
    : [
        "Transition to " + (toTitle || "target role") + " becomes increasingly unlikely as competitors with direct experience enter the market.",
        "Skill gap widens relative to market benchmarks as the role evolves.",
        "Recruiters re-categorise your profile into a narrower, lower-demand niche.",
        "Transition difficulty increases significantly after 18 months of inaction.",
      ];

  return (
    <Card id="gd-risk" variant="warning">
      <CardHeader
        tag="10"
        title="Risk If Ignored"
        subtitle="What happens if you do not address these gaps."
      />
      <div className="gd-risk-body">
        <div className="gd-risk-icon-row">
          <span className="gd-risk-icon">!</span>
          <p className="gd-risk-intro">
            Gaps compound over time. Each month without action increases the cost of transition.
          </p>
        </div>
        <div className="gd-risk-items">
          {list.map((item, i) => (
            <div key={i} className="gd-risk-item">
              <span className="gd-risk-item__dot" />
              <p className="gd-risk-item__text">{item}</p>
            </div>
          ))}
        </div>
        <div className="gd-risk-footer">
          Start with <strong>Fix #1</strong> above. Even one focused week changes the trajectory.
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Full report composition
// ============================================================================

function GapReport({ data, fromTitle, toTitle }) {
  if (!data) return null;

  const {
    hero,
    transition_verdict,
    gap_breakdown,
    skill_gap_deep_dive  = [],
    experience_gap       = [],
    market_gap,
    gap_severity_map,
    reality_check,
    fix_priority_plan    = [],
    if_ignored           = [],
  } = data;

  return (
    <div className="gd-report">

      {/* 1. Hero */}
      <HeroSection data={hero} fromTitle={fromTitle} toTitle={toTitle} />

      <Divider />

      {/* 2. Verdict */}
      <VerdictSection text={transition_verdict} />

      <Divider />

      {/* 3. Gap Breakdown */}
      <GapBreakdown data={gap_breakdown} />

      <Divider />

      {/* 4. Skill Deep Dive */}
      <SkillDeepDive skills={skill_gap_deep_dive} toTitle={toTitle} />

      <Divider />

      {/* 5. Experience Gaps */}
      <ExperienceGaps gaps={experience_gap} toTitle={toTitle} />

      <Divider />

      {/* 6. Market Perception */}
      <MarketPerceptionGap data={market_gap} />

      <Divider />

      {/* 7. Severity Visual */}
      <SeverityVisual data={gap_severity_map} />

      <Divider />

      {/* 8. Reality Check */}
      <RealityCheck data={reality_check} />

      <Divider />

      {/* 9. Fix Plan */}
      <FixPlan actions={fix_priority_plan} />

      <Divider />

      {/* 10. Risk If Ignored */}
      <RiskIfIgnored items={if_ignored} toTitle={toTitle} />

    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function GapExplainerPage() {
  const router  = useRouter();
  const autoRan = useRef(false);
  useEDGEXContext();

  const [fromRole, setFromRole] = useState(null);
  const [toRole,   setToRole]   = useState(null);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorInfo,   setErrorInfo]   = useState(null);
  const stepTimer = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { from, to, current, target } = router.query;
    const f = from || current;
    const t = to   || target;
    if (f) setFromRole({ slug: f, title: _slugToTitle(f) });
    if (t) setToRole({   slug: t, title: _slugToTitle(t) });
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !fromRole || !toRole) return;
    autoRan.current = true;
    _submit();
  }, [fromRole, toRole, router.isReady]);

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
      const params = new URLSearchParams({ action: "explain", from: fromRole.slug, to: toRole.slug });
      const r = await fetch(`${API}/api/tools/career-gap-explainer?${params}`, {
        headers: { "X-HireEdge-Plan": getPlan() },
      });
      const json = await r.json();
      if (!json.ok && !json.data) { setErrorInfo(_friendlyError(json)); return; }
      setResult(json.data || json);
    } catch {
      setErrorInfo({ type: "error", message: "Network error -- please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Career Gap Diagnostic -- HireEdge</title></Head>
      <div className="tool-page">

        {/* Header */}
        <div className="gd-page-header">
          <div className="gd-page-header__badge">Gap Explainer</div>
          <h1 className="gd-page-header__title">Career Gap Diagnostic</h1>
          <p className="gd-page-header__sub">
            A precise breakdown of why your target transition is easy or difficult -- and exactly what to fix first.
          </p>
        </div>

        {/* Form */}
        <div className="tool-form gd-form">
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you are now..."
                onSelect={setFromRole}
                initialValue={fromRole?.title || ""}
              />
              {fromRole && <span className="tool-form__selected">+ {fromRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you want to go..."
                onSelect={setToRole}
                initialValue={toRole?.title || ""}
              />
              {toRole && <span className="tool-form__selected">+ {toRole.title}</span>}
            </div>
          </div>

          {errorInfo?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">+</span>
              <div>
                <p className="tool-upgrade-prompt__title">Upgrade required</p>
                <p className="tool-upgrade-prompt__sub">Gap Explainer requires a paid plan.</p>
              </div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade</Link>
            </div>
          )}
          {errorInfo?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">-</span>
              <div><p className="tool-upgrade-prompt__title">{errorInfo.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade</Link>
            </div>
          )}
          {errorInfo?.type === "error" && (
            <div className="tool-form__error">{errorInfo.message}</div>
          )}

          <button
            className="tool-form__submit gd-submit"
            onClick={_submit}
            disabled={loading || !fromRole || !toRole}
          >
            {loading ? LOADING_STEPS[loadingStep] : "Diagnose the Gap"}
          </button>
          {!loading && (
            <p className="li-form-timing">Takes ~15 seconds -- Full 10-section diagnostic report</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <div className="li-loading-steps">
              {LOADING_STEPS.map((step, i) => (
                <span
                  key={i}
                  className={
                    "li-loading-step" +
                    (i === loadingStep ? " li-loading-step--active" : "") +
                    (i < loadingStep  ? " li-loading-step--done"   : "")
                  }
                >
                  {i < loadingStep ? "v" : i === loadingStep ? ">" : "."} {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <GapReport data={result} fromTitle={fromRole?.title || ""} toTitle={toRole?.title || ""} />
        )}

      </div>
    </>
  );
}
