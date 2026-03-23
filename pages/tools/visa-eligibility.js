// ============================================================================
// pages/tools/visa-intelligence.js
// HireEdge -- Visa Intelligence Engine (v1)
//
// A decision engine that tells users whether they can work in a target country,
// which visa route fits best, what is missing, and what to do first.
//
// Structure (scroll-based, no tabs):
//   Form  -- country, current role, experience, education, target role
//   01    -- Visa Verdict (hero metrics + verdict card)
//   02    -- Best Visa Pathways
//   03    -- Requirement Gaps
//   04    -- Readiness Scoreboard
//   05    -- Strategic Action Plan
//   06    -- Risk If Ignored
//   CTA   -- Upgrade block (free users)
//   LOCK  -- Premium preview teasers
//
// API: POST /api/tools/visa-intelligence
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXBadge from "../../components/brand/EDGEXBadge";

const API       = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";
const PAID_PLANS = ["career_pack", "pro", "elite"];

// ============================================================================
// Utilities
// ============================================================================

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}
function isPaidPlan() { return PAID_PLANS.includes(getPlan()); }

function slugToTitle(s) {
  return (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function friendlyError(json) {
  const r = json?.reason || "";
  if (r === "access_denied" || r === "tool_not_in_plan") return { type: "upgrade" };
  if (r === "daily_limit_reached") return { type: "limit", message: "Daily limit reached. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const LOADING_STEPS = [
  "Checking visa routes...",
  "Analysing eligibility criteria...",
  "Mapping requirement gaps...",
  "Building strategic plan...",
  "Generating visa intelligence...",
];

const COUNTRIES = [
  "UK", "Canada", "Australia", "USA", "Germany", "Netherlands",
  "Singapore", "UAE", "New Zealand", "Ireland", "Sweden", "Denmark",
];

const EDUCATION_OPTIONS = [
  { value: "phd",        label: "PhD / Doctorate" },
  { value: "masters",    label: "Master's Degree" },
  { value: "bachelors",  label: "Bachelor's Degree" },
  { value: "diploma",    label: "Diploma / HND" },
  { value: "none",       label: "No Formal Degree" },
];

// ============================================================================
// Design atoms (vi- prefix to avoid collision with cgd-)
// ============================================================================

function ViBadge({ v }) {
  const map = {
    High: "vi-b vi-b--green", Medium: "vi-b vi-b--amber", Low: "vi-b vi-b--red",
    "Not Possible": "vi-b vi-b--red",
    Easy: "vi-b vi-b--green", Moderate: "vi-b vi-b--amber", Hard: "vi-b vi-b--red",
    Critical: "vi-b vi-b--red", Significant: "vi-b vi-b--amber", Minor: "vi-b vi-b--green",
  };
  return <span className={map[v] || "vi-b vi-b--amber"}>{v}</span>;
}

function ViBar({ pct, colour }) {
  const c = colour || (pct >= 65 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444");
  return (
    <div className="vi-bar">
      <div className="vi-bar__fill" style={{ width: pct + "%", background: c }} />
    </div>
  );
}

function ViSection({ n, text, children, id, accent, warning }) {
  return (
    <div
      className={"vi-panel" + (accent ? " vi-panel--accent" : "") + (warning ? " vi-panel--warning" : "")}
      id={id}
    >
      <div className="vi-sec-label">
        <span className="vi-sec-label__n">{String(n).padStart(2, "0")}</span>
        <span className="vi-sec-label__text">{text}</span>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Results Hero
// ============================================================================

function VisaHero({ hero }) {
  if (!hero) return null;
  const eligColour = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444", "Not Possible": "#ef4444" }[hero.eligibility] || "#f59e0b";
  const diffColour = { Easy: "#10b981", Moderate: "#f59e0b", Hard: "#ef4444" }[hero.difficulty] || "#f59e0b";

  return (
    <div className="vi-hero">
      <div className="vi-hero__route">
        <span className="vi-hero__role">{hero.current_role}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="vi-hero__arrow">
          <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="vi-hero__role vi-hero__role--target">{hero.country}</span>
        {hero.target_role && hero.target_role !== hero.current_role && (
          <>
            <span className="vi-hero__role vi-hero__role--muted">as</span>
            <span className="vi-hero__role vi-hero__role--target">{hero.target_role}</span>
          </>
        )}
      </div>

      {hero.headline_metric && (
        <p className="vi-hero__headline">{hero.headline_metric}</p>
      )}

      <div className="vi-metrics-strip">
        <div className="vi-metric-card">
          <span className="vi-metric-card__label">Eligibility</span>
          <span className="vi-metric-card__val" style={{ color: eligColour }}>
            {hero.eligibility || "Medium"}
          </span>
          <div className="vi-metric-card__bar">
            <div className="vi-metric-card__bar-fill" style={{
              width: hero.eligibility === "High" ? "85%" : hero.eligibility === "Low" ? "25%" : hero.eligibility === "Not Possible" ? "5%" : "52%",
              background: eligColour,
            }}/>
          </div>
        </div>

        <div className="vi-metric-card">
          <span className="vi-metric-card__label">Difficulty</span>
          <span className="vi-metric-card__val" style={{ color: diffColour }}>
            {hero.difficulty || "Moderate"}
          </span>
          <div className="vi-metric-card__bar">
            <div className="vi-metric-card__bar-fill" style={{
              width: hero.difficulty === "Hard" ? "85%" : hero.difficulty === "Easy" ? "20%" : "52%",
              background: diffColour,
            }}/>
          </div>
        </div>

        <div className="vi-metric-card">
          <span className="vi-metric-card__label">Est. Timeline</span>
          <span className="vi-metric-card__val vi-metric-card__val--mono">
            {hero.estimated_timeline || "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 01 -- Verdict
// ============================================================================

function VisaVerdict({ data }) {
  if (!data) return null;
  return (
    <ViSection n={1} text="Visa Verdict" id="vi-verdict" accent>
      {data.headline && <p className="vi-verdict__headline">{data.headline}</p>}
      <div className="vi-verdict__grid">
        {data.is_achievable != null && (
          <div className="vi-verdict__cell">
            <span className="vi-verdict__cell-label">Achievable?</span>
            <span className={"vi-verdict__cell-val " + (data.is_achievable ? "vi-verdict__cell-val--yes" : "vi-verdict__cell-val--no")}>
              {data.is_achievable ? "Yes, with preparation" : "Significant barriers"}
            </span>
          </div>
        )}
        {data.biggest_barrier && (
          <div className="vi-verdict__cell vi-verdict__cell--barrier">
            <span className="vi-verdict__cell-label">Biggest barrier</span>
            <p className="vi-verdict__cell-text">{data.biggest_barrier}</p>
          </div>
        )}
        {data.biggest_asset && (
          <div className="vi-verdict__cell vi-verdict__cell--asset">
            <span className="vi-verdict__cell-label">Strongest asset</span>
            <p className="vi-verdict__cell-text">{data.biggest_asset}</p>
          </div>
        )}
      </div>
      {data.summary && <p className="vi-verdict__summary">{data.summary}</p>}
    </ViSection>
  );
}

// ============================================================================
// 02 -- Best Visa Pathways
// ============================================================================

function VisaPathways({ pathways, country }) {
  if (!pathways?.length) return null;
  const fitColour = (s) => s >= 70 ? "#10b981" : s >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <ViSection n={2} text={"Best Visa Pathways -- " + country} id="vi-pathways">
      <p className="vi-sec-intro">
        {"Visa routes in " + country + " that typically apply to this profile -- ordered by fit."}
      </p>
      <div className="vi-pathways-list">
        {pathways.map((p, i) => (
          <div key={i} className="vi-pathway-card">
            <div className="vi-pathway-card__header">
              <div className="vi-pathway-card__title-row">
                <span className="vi-pathway-card__rank">{i + 1}</span>
                <span className="vi-pathway-card__name">{p.visa_name}</span>
                {p.fit_score != null && (
                  <span className="vi-pathway-card__fit" style={{ color: fitColour(p.fit_score) }}>
                    {p.fit_score}% fit
                  </span>
                )}
              </div>
              {p.typical_timeline && (
                <span className="vi-pathway-card__timeline">{p.typical_timeline}</span>
              )}
            </div>

            {p.who_its_for && (
              <p className="vi-pathway-card__who">
                <span className="vi-pathway-card__who-label">Who it is for: </span>
                {p.who_its_for}
              </p>
            )}

            {p.why_it_fits && (
              <p className="vi-pathway-card__why">{p.why_it_fits}</p>
            )}

            {p.key_requirements?.length > 0 && (
              <div className="vi-pathway-card__reqs">
                <span className="vi-pathway-card__reqs-label">Key requirements</span>
                <div className="vi-pathway-card__reqs-list">
                  {p.key_requirements.map((r, j) => (
                    <div key={j} className="vi-pathway-card__req">
                      <span className="vi-pathway-card__req-dot" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ViSection>
  );
}

// ============================================================================
// 03 -- Requirement Gaps
// ============================================================================

function RequirementGaps({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <ViSection n={3} text="Requirement Gaps" id="vi-gaps">
      <p className="vi-sec-intro">What is typically missing for this profile to qualify -- and how to address each one.</p>
      <div className="vi-req-gaps">
        {gaps.map((g, i) => (
          <div key={i} className="vi-req-gap">
            <div className="vi-req-gap__header">
              <span className="vi-req-gap__name">{g.gap}</span>
              {g.severity && <ViBadge v={g.severity} />}
            </div>
            {g.explanation && <p className="vi-req-gap__text">{g.explanation}</p>}
            {g.how_to_address && (
              <div className="vi-req-gap__fix">
                <span className="vi-req-gap__fix-label">How to address: </span>
                <span className="vi-req-gap__fix-text">{g.how_to_address}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ViSection>
  );
}

// ============================================================================
// 04 -- Readiness Scoreboard
// ============================================================================

function VisaScoreboard({ data }) {
  if (!data) return null;
  const rows = [
    { label: "Skills Alignment",          pct: data.skills_alignment              ?? 0 },
    { label: "Salary Threshold Readiness", pct: data.salary_threshold_readiness    ?? 0 },
    { label: "Qualification Match",        pct: data.qualification_match           ?? 0 },
    { label: "Sponsorship Prospects",      pct: data.sponsorship_prospects         ?? 0 },
  ];
  return (
    <ViSection n={4} text="Readiness Scoreboard" id="vi-scoreboard">
      <div className="vi-scoreboard">
        {rows.map((r, i) => {
          const colour = r.pct >= 65 ? "#10b981" : r.pct >= 40 ? "#f59e0b" : "#ef4444";
          return (
            <div key={i} className="vi-scoreboard-row">
              <div className="vi-scoreboard-row__meta">
                <span className="vi-scoreboard-row__label">{r.label}</span>
                <span className="vi-scoreboard-row__pct" style={{ color: colour }}>{r.pct}%</span>
              </div>
              <ViBar pct={r.pct} colour={colour} />
            </div>
          );
        })}
        {data.overall_note && <p className="vi-scoreboard__note">{data.overall_note}</p>}
      </div>
    </ViSection>
  );
}

// ============================================================================
// 05 -- Strategic Action Plan
// ============================================================================

const STEP_CFG = [
  { colour: "#ef4444", bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.2)",  tag: "1  DO FIRST"  },
  { colour: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)", tag: "2  NEXT STEP" },
  { colour: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.2)", tag: "3  THEN"       },
];

function VisaStrategy({ steps }) {
  if (!steps?.length) return null;
  return (
    <ViSection n={5} text="Strategic Action Plan" id="vi-strategy" accent>
      <p className="vi-sec-intro">Steps ordered by impact. Each one directly addresses a gap that immigration systems and employers screen for.</p>
      <div className="vi-strategy-list">
        {steps.slice(0, 3).map((s, i) => {
          const cfg = STEP_CFG[i] || STEP_CFG[2];
          return (
            <div key={i} className="vi-strategy-card" style={{ "--sc": cfg.colour, "--sb": cfg.bg, "--sbr": cfg.border }}>
              <div className="vi-strategy-card__strip">
                <span className="vi-strategy-card__tag">{cfg.tag}</span>
                {s.time_estimate && <span className="vi-strategy-card__time">{s.time_estimate}</span>}
              </div>
              <div className="vi-strategy-card__body">
                <p className="vi-strategy-card__action">{s.action}</p>
                {s.why_first && (
                  <p className="vi-strategy-card__meta">
                    <span className="vi-strategy-card__meta-label">Market impact: </span>{s.why_first}
                  </p>
                )}
                {s.expected_outcome && (
                  <p className="vi-strategy-card__meta">
                    <span className="vi-strategy-card__meta-label">What changes: </span>{s.expected_outcome}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ViSection>
  );
}

// ============================================================================
// 06 -- Risk If Ignored
// ============================================================================

function VisaRisk({ items, country }) {
  const fallback = [
    "Immigration policy changes in " + (country || "the target country") + " typically tighten eligibility criteria over time, making later applications harder.",
    "Salary thresholds for work visas tend to rise annually, meaning delays can move candidates below the qualifying bar.",
    "Candidates who delay lose ground to others who have already built local networks and employer relationships.",
    "The longer a transition is delayed, the more the salary gap between current and target market compounds.",
  ];
  const list = items?.length ? items : fallback;
  return (
    <ViSection n={6} text="Risk If Ignored" id="vi-risk" warning>
      <div className="vi-risk">
        <div className="vi-risk__header">
          <div className="vi-risk__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M12 2L2 20h20L12 2Z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 9v5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="0.75" fill="#ef4444"/>
            </svg>
          </div>
          <p className="vi-risk__intro">
            Immigration windows open and close. Based on typical policy cycles, delays carry real cost.
          </p>
        </div>
        <div className="vi-risk__items">
          {list.map((item, i) => (
            <div key={i} className="vi-risk__item">
              <span className="vi-risk__item-dot" />
              <p className="vi-risk__item-text">{item}</p>
            </div>
          ))}
        </div>
        <div className="vi-risk__footer">
          Based on typical immigration cycles, the optimal time to start is now. Begin with Step 1 above.
        </div>
      </div>
    </ViSection>
  );
}

// ============================================================================
// Upgrade CTA
// ============================================================================

function VisaUpgradeCTA({ country, currentRole }) {
  return (
    <div className="vi-upgrade-block" id="vi-upgrade">
      <div className="vi-upgrade-block__inner">
        <span className="vi-upgrade-block__badge">Visa-Ready Career Strategy</span>
        <h3 className="vi-upgrade-block__title">
          Build a visa-ready profile for {country || "your target country"}
        </h3>
        <p className="vi-upgrade-block__body">
          The analysis above shows typical visa pathways for {currentRole || "this role"} candidates.
          Upgrade to unlock a personalised strategy -- including how to optimise your CV for {country || "target country"} employers,
          which specific companies are most likely to sponsor, and a step-by-step country-specific job strategy.
        </p>

        <div className="vi-upgrade-block__benefits">
          {[
            { icon: "R", label: "CV optimisation for visa markets",   desc: "Specific adjustments that improve success with sponsors and local employers in " + (country || "your target country") },
            { icon: "S", label: "Sponsorship targeting plan",         desc: "The industries and employer types in " + (country || "your target country") + " most likely to sponsor this role category" },
            { icon: "C", label: "Country-specific job strategy",      desc: "Tactical approach to the " + (country || "target") + " job market based on hiring patterns for this background" },
          ].map((b, i) => (
            <div key={i} className="vi-upgrade-block__benefit">
              <span className="vi-upgrade-block__benefit-icon">{b.icon}</span>
              <div>
                <span className="vi-upgrade-block__benefit-label">{b.label}</span>
                <p className="vi-upgrade-block__benefit-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="vi-upgrade-block__ctas">
          <Link href="/billing?plan=career_pack" className="vi-upgrade-block__cta-primary">
            Unlock Career Pack -- £6.99 one-time
          </Link>
          <p className="vi-upgrade-block__cta-note">
            Includes Resume Optimiser, LinkedIn Optimiser, Interview Prep, and Career Roadmap.
          </p>
          <Link href="/billing?plan=pro" className="vi-upgrade-block__cta-secondary">
            Or go Pro for full platform access
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Locked premium teasers
// ============================================================================

function VisaLockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function VisaLockedModule({ icon, title, headline, teaserPoints, accent }) {
  return (
    <div className="vi-locked-module" style={{ "--lm-accent": accent || "#6366f1" }}>
      <div className="vi-locked-module__header">
        <div className="vi-locked-module__icon-wrap">
          <span className="vi-locked-module__icon">{icon}</span>
        </div>
        <div className="vi-locked-module__header-right">
          <span className="vi-locked-module__title">{title}</span>
          <div className="vi-locked-module__lock-badge">
            <VisaLockIcon />
            <span>Career Pack</span>
          </div>
        </div>
      </div>
      {headline && (
        <div className="vi-locked-module__headline-wrap">
          <p className="vi-locked-module__headline">{headline}</p>
        </div>
      )}
      {(teaserPoints || []).filter(Boolean).length > 0 && (
        <div className="vi-locked-module__teaser">
          {(teaserPoints || []).filter(Boolean).map((p, i) => (
            <div key={i} className="vi-locked-module__teaser-item">
              <span className="vi-locked-module__teaser-dot" />
              <p className="vi-locked-module__teaser-text">{p}</p>
            </div>
          ))}
        </div>
      )}
      <div className="vi-locked-module__blur-overlay" />
    </div>
  );
}

function VisaPremiumModules({ preview, country, isPaid }) {
  if (!preview) return null;
  return (
    <div className="vi-locked-section">
      <div className="vi-locked-section__header">
        <span className="vi-locked-section__eyebrow">Profile Intelligence</span>
        <h3 className="vi-locked-section__title">Personalised Visa-Ready Strategy</h3>
        <p className="vi-locked-section__sub">
          The following modules go beyond role benchmarks to give you a targeted plan
          for {country || "your target country"}. Available with Career Pack or Pro.
        </p>
      </div>

      <div className="vi-locked-modules-grid">
        {preview.cv_optimisation && (
          <VisaLockedModule
            icon="R"
            title="CV Optimisation for Visa Markets"
            headline={preview.cv_optimisation.headline}
            teaserPoints={preview.cv_optimisation.teaser_points}
            accent="#ef4444"
          />
        )}
        {preview.sponsorship_targets && (
          <VisaLockedModule
            icon="S"
            title="Sponsorship Targeting Plan"
            headline={preview.sponsorship_targets.headline}
            teaserPoints={preview.sponsorship_targets.teaser_points}
            accent="#f59e0b"
          />
        )}
        {preview.country_strategy && (
          <VisaLockedModule
            icon="C"
            title={"Country Strategy -- " + (country || "Target Market")}
            headline={preview.country_strategy.headline}
            teaserPoints={preview.country_strategy.teaser_points}
            accent="#6366f1"
          />
        )}
      </div>

      {!isPaid && (
        <div className="vi-locked-section__cta-strip">
          <Link href="/billing?plan=career_pack" className="vi-locked-section__cta">
            Unlock All 3 Modules -- £6.99 one-time
          </Link>
          <span className="vi-locked-section__cta-sub">
            No subscription. Includes full Career Pack tool suite.
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Report composer
// ============================================================================

function VisaReport({ data, country, currentRole, isPaid }) {
  if (!data) return null;
  return (
    <div className="vi-report">
      <div className="vi-trust-note">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15" className="vi-trust-note__icon">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="vi-trust-note__text">
          This is a <strong>role-based visa intelligence report</strong> built from immigration
          patterns and typical {country} visa requirements. Individual circumstances vary --
          this is strategic guidance, not legal advice.
        </p>
      </div>

      <VisaHero         hero={data.hero} />
      <VisaVerdict      data={data.verdict} />
      <VisaPathways     pathways={data.best_pathways}    country={country} />
      <RequirementGaps  gaps={data.requirement_gaps} />
      <VisaScoreboard   data={data.scoreboard} />
      <VisaStrategy     steps={data.strategy} />
      <VisaRisk         items={data.risk_ignored}        country={country} />

      {!isPaid && <VisaUpgradeCTA country={country} currentRole={currentRole} />}

      {data.premium_preview && (
        <VisaPremiumModules
          preview={data.premium_preview}
          country={country}
          isPaid={isPaid}
        />
      )}
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function VisaIntelligencePage() {
  const router  = useRouter();
  const autoRan = useRef(false);
  useEDGEXContext();

  const [country,     setCountry]     = useState("UK");
  const [currentRole, setCurrentRole] = useState(null);
  const [yearsExp,    setYearsExp]    = useState("");
  const [education,   setEducation]   = useState("");
  const [targetRole,  setTargetRole]  = useState(null);

  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [err,        setErr]        = useState(null);
  const [userIsPaid, setUserIsPaid] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setUserIsPaid(isPaidPlan()); }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const { role, current, target, country: qc } = router.query;
    if (role || current) setCurrentRole({ slug: role || current, title: slugToTitle(role || current) });
    if (target)          setTargetRole({  slug: target,          title: slugToTitle(target) });
    if (qc)              setCountry(qc);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !currentRole) return;
    autoRan.current = true;
    run();
  }, [currentRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setStep(0);
      timer.current = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 3000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [loading]);

  async function run() {
    if (!country)     { setErr({ type: "error", message: "Please select a target country." }); return; }
    if (!currentRole) { setErr({ type: "error", message: "Please enter your current role." }); return; }
    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await fetch(`${API}/api/tools/visa-intelligence`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          country,
          currentRole: currentRole.slug || currentRole.title,
          yearsExp:    yearsExp ? parseInt(yearsExp) : null,
          education:   education || null,
          targetRole:  targetRole ? (targetRole.slug || targetRole.title) : null,
        }),
      });
      const json = await res.json();
      if (!json.ok) { setErr(friendlyError(json)); return; }
      setResult(json.data);
    } catch {
      setErr({ type: "error", message: "Network error -- please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Visa Intelligence -- HireEdge</title></Head>
      <div className="tool-page">

        {/* Header */}
        <div className="vi-header">
          <span className="vi-header__badge">Visa Intelligence</span>
          <h1 className="vi-header__title">Visa Eligibility Engine</h1>
          <p className="vi-header__sub">
            Understand which visa routes are available, what is missing,
            and exactly what to do first -- for your role, in your target country.
          </p>
        </div>

        {/* Form */}
        <div className="tool-form vi-form">

          {/* Row 1: country + current role */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">
                Target Country <span className="tool-form__req">*</span>
              </label>
              <select
                className="tool-form__input vi-country-select"
                value={country}
                onChange={e => setCountry(e.target.value)}
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">
                Current Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Your current job title..."
                onSelect={setCurrentRole}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">+ {currentRole.title}</span>}
            </div>
          </div>

          {/* Row 2: years exp + education */}
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                type="number"
                className="tool-form__input"
                placeholder="e.g. 5"
                min="0" max="40"
                value={yearsExp}
                onChange={e => setYearsExp(e.target.value)}
              />
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">Highest Education</label>
              <select
                className="tool-form__input"
                value={education}
                onChange={e => setEducation(e.target.value)}
              >
                <option value="">Select education level...</option>
                {EDUCATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: target role (optional) */}
          <div className="tool-form__field">
            <label className="tool-form__label">
              Target Role in {country} <span className="tool-form__optional">(optional -- refines pathway analysis)</span>
            </label>
            <RoleSearch
              placeholder={"Role you want in " + country + " (or leave blank to use current role)..."}
              onSelect={setTargetRole}
              initialValue={targetRole?.title || ""}
            />
            {targetRole && <span className="tool-form__selected">+ {targetRole.title}</span>}
          </div>

          {/* Errors */}
          {err?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">+</span>
              <div>
                <p className="tool-upgrade-prompt__title">Upgrade required</p>
                <p className="tool-upgrade-prompt__sub">Visa Intelligence requires a paid plan.</p>
              </div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade</Link>
            </div>
          )}
          {err?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">-</span>
              <div><p className="tool-upgrade-prompt__title">{err.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade</Link>
            </div>
          )}
          {err?.type === "error" && (
            <div className="tool-form__error">{err.message}</div>
          )}

          <button
            className="tool-form__submit vi-submit"
            onClick={run}
            disabled={loading || !country || !currentRole}
          >
            {loading ? LOADING_STEPS[step] : "Assess Visa Eligibility"}
          </button>
          <p className="cgd-benchmark-note">
            Role-based visa intelligence built from immigration patterns across 50+ countries and 1,000+ roles.
            This is strategic guidance, not legal advice.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <div className="li-loading-steps">
              {LOADING_STEPS.map((s, i) => (
                <span
                  key={i}
                  className={
                    "li-loading-step" +
                    (i === step ? " li-loading-step--active" : "") +
                    (i < step   ? " li-loading-step--done"   : "")
                  }
                >
                  {i < step ? "v" : i === step ? ">" : "."} {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <VisaReport
            data={result}
            country={country}
            currentRole={currentRole?.title || ""}
            isPaid={userIsPaid}
          />
        )}

      </div>
    </>
  );
}
