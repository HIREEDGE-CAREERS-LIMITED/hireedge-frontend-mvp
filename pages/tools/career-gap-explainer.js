// ============================================================================
// pages/tools/career-gap-explainer.js
// HireEdge -- Career Gap Diagnostic (v5)
//
// Conversion funnel: free role-based diagnostic -> Career Pack upsell
//
// FREE (all users):
//   Role-based hero metrics, verdict, why gap exists, scoreboard,
//   missing skills, experience gaps, market perception, where you fit,
//   fix plan, risk if ignored
//
// LOCKED (Career Pack / Pro / Elite):
//   CV rejection risks, interview weak points, personalised timeline,
//   salary upside, most strategic next tool
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
const PAID_PLANS = ["career_pack", "pro", "elite"];

// ============================================================================
// Utilities
// ============================================================================

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function isPaidPlan() {
  return PAID_PLANS.includes(getPlan());
}

function slugToTitle(s) {
  return (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function friendlyError(json) {
  const r = json?.reason || "";
  if (r === "access_denied" || r === "tool_not_in_plan") return { type: "upgrade" };
  if (r === "daily_limit_reached") return { type: "limit", message: "Daily limit reached. Upgrade for more." };
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

const STEPS = [
  "Mapping transition pathway...",
  "Identifying skill gaps...",
  "Analysing experience delta...",
  "Reading market signals...",
  "Building personalised intelligence...",
];

// ============================================================================
// Atoms
// ============================================================================

function Badge({ v }) {
  const map = {
    High: "cgd-b cgd-b--red", Medium: "cgd-b cgd-b--amber", Low: "cgd-b cgd-b--green",
    Hard: "cgd-b cgd-b--red", Easy: "cgd-b cgd-b--green",
    Critical: "cgd-b cgd-b--red", Significant: "cgd-b cgd-b--amber", Minor: "cgd-b cgd-b--green",
  };
  return <span className={map[v] || "cgd-b cgd-b--amber"}>{v}</span>;
}

function ScoreBar({ pct, colour }) {
  const c = colour || (pct >= 65 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444");
  return (
    <div className="cgd-bar">
      <div className="cgd-bar__fill" style={{ width: pct + "%", background: c }} />
    </div>
  );
}

function SectionLabel({ n, text }) {
  return (
    <div className="cgd-sec-label">
      <span className="cgd-sec-label__n">{String(n).padStart(2, "0")}</span>
      <span className="cgd-sec-label__text">{text}</span>
    </div>
  );
}

function Panel({ children, id, accent, warning }) {
  return (
    <div
      className={"cgd-panel" + (accent ? " cgd-panel--accent" : "") + (warning ? " cgd-panel--warning" : "")}
      id={id}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Trust note -- shown when only role inputs provided (no CV)
// ============================================================================

function RoleBasedNote({ fromTitle, toTitle }) {
  return (
    <div className="cgd-trust-note">
      <svg className="cgd-trust-note__icon" viewBox="0 0 20 20" fill="none" width="16" height="16">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p className="cgd-trust-note__text">
        This is a <strong>role-based benchmark analysis</strong> built from career transition patterns across 1,000+ roles.
        It shows what the {fromTitle} to {toTitle} transition typically looks like across the market.
        Add your CV to unlock profile-specific insights tailored to your background.
      </p>
    </div>
  );
}

// ============================================================================
// FREE: Results hero with 3 metric cards
// ============================================================================

function ResultsHero({ hero, fromTitle, toTitle }) {
  if (!hero) return null;
  const sevColour   = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" }[hero.gap_severity]          || "#f59e0b";
  const diffColour  = { Hard: "#ef4444", Medium: "#f59e0b", Easy: "#10b981" }[hero.transition_difficulty] || "#f59e0b";
  const matchPct    = hero.skill_match_pct ?? 0;
  const matchColour = matchPct >= 65 ? "#10b981" : matchPct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="cgd-results-hero">
      <div className="cgd-results-hero__route">
        <span className="cgd-results-hero__role">{fromTitle}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="cgd-results-hero__arrow">
          <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="cgd-results-hero__role cgd-results-hero__role--to">{toTitle}</span>
      </div>

      {hero.title && <h2 className="cgd-results-hero__title">{hero.title}</h2>}

      <div className="cgd-metrics-strip">
        <div className="cgd-metric-card">
          <span className="cgd-metric-card__label">Gap Severity</span>
          <span className="cgd-metric-card__val" style={{ color: sevColour }}>
            {hero.gap_severity || "Medium"}
          </span>
          <div className="cgd-metric-card__bar">
            <div className="cgd-metric-card__bar-fill" style={{
              width: hero.gap_severity === "High" ? "85%" : hero.gap_severity === "Low" ? "25%" : "55%",
              background: sevColour,
            }}/>
          </div>
        </div>
        <div className="cgd-metric-card">
          <span className="cgd-metric-card__label">Skill Match</span>
          <span className="cgd-metric-card__val" style={{ color: matchColour }}>{matchPct}%</span>
          <div className="cgd-metric-card__bar">
            <div className="cgd-metric-card__bar-fill" style={{ width: matchPct + "%", background: matchColour }}/>
          </div>
        </div>
        <div className="cgd-metric-card">
          <span className="cgd-metric-card__label">Difficulty</span>
          <span className="cgd-metric-card__val" style={{ color: diffColour }}>
            {hero.transition_difficulty || "Medium"}
          </span>
          <div className="cgd-metric-card__bar">
            <div className="cgd-metric-card__bar-fill" style={{
              width: hero.transition_difficulty === "Hard" ? "85%" : hero.transition_difficulty === "Easy" ? "20%" : "52%",
              background: diffColour,
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FREE 01: Transition Verdict
// ============================================================================

function VerdictCard({ data }) {
  if (!data) return null;
  return (
    <Panel id="cgd-verdict" accent>
      <SectionLabel n={1} text="Transition Verdict" />
      <div className="cgd-verdict">
        {data.headline && <p className="cgd-verdict__headline">{data.headline}</p>}
        <div className="cgd-verdict__grid">
          {data.is_realistic != null && (
            <div className="cgd-verdict__cell">
              <span className="cgd-verdict__cell-label">Realistic?</span>
              <span className={"cgd-verdict__cell-val " + (data.is_realistic ? "cgd-verdict__cell-val--yes" : "cgd-verdict__cell-val--no")}>
                {data.is_realistic ? "Yes, with work" : "Not yet"}
              </span>
            </div>
          )}
          {data.biggest_blocker && (
            <div className="cgd-verdict__cell cgd-verdict__cell--blocker">
              <span className="cgd-verdict__cell-label">Biggest blocker</span>
              <p className="cgd-verdict__cell-text">{data.biggest_blocker}</p>
            </div>
          )}
          {data.biggest_advantage && (
            <div className="cgd-verdict__cell cgd-verdict__cell--advantage">
              <span className="cgd-verdict__cell-label">Biggest advantage</span>
              <p className="cgd-verdict__cell-text">{data.biggest_advantage}</p>
            </div>
          )}
        </div>
        {data.summary && <p className="cgd-verdict__summary">{data.summary}</p>}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 02: Why This Gap Exists
// ============================================================================

function GapOrigins({ data }) {
  if (!data) return null;
  const cols = [
    { key: "skill",      label: "Skill Gap",     icon: "S", colour: "#ef4444", bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.2)",  item: data.skill_gap      },
    { key: "experience", label: "Experience Gap", icon: "E", colour: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", item: data.experience_gap },
    { key: "market",     label: "Market Gap",     icon: "M", colour: "#6366f1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.2)", item: data.market_gap     },
  ];
  return (
    <Panel id="cgd-origins">
      <SectionLabel n={2} text="Why This Gap Exists" />
      <div className="cgd-origins-grid">
        {cols.map(({ key, label, icon, colour, bg, border, item }) =>
          item ? (
            <div key={key} className="cgd-origin-card" style={{ "--oc": colour, "--ob": bg, "--obr": border }}>
              <div className="cgd-origin-card__head">
                <span className="cgd-origin-card__icon">{icon}</span>
                <span className="cgd-origin-card__label">{label}</span>
                {item.severity && <Badge v={item.severity} />}
              </div>
              {item.explanation && <p className="cgd-origin-card__body">{item.explanation}</p>}
              {item.why_it_matters && (
                <div className="cgd-origin-card__why">
                  <span className="cgd-origin-card__why-label">Why it matters</span>
                  <p className="cgd-origin-card__why-text">{item.why_it_matters}</p>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 03: Gap Scoreboard
// ============================================================================

function GapScoreboard({ data }) {
  if (!data) return null;
  const rows = [
    { label: "Skills Readiness",     pct: data.skills_readiness     ?? 0 },
    { label: "Experience Readiness", pct: data.experience_readiness ?? 0 },
    { label: "Market Readiness",     pct: data.market_readiness     ?? 0 },
    { label: "Transition Risk",      pct: data.transition_risk      ?? 0, invert: true },
  ];
  return (
    <Panel id="cgd-scoreboard">
      <SectionLabel n={3} text="Gap Scoreboard" />
      <div className="cgd-scoreboard">
        {rows.map((r, i) => {
          const colour = r.invert
            ? (r.pct >= 65 ? "#ef4444" : r.pct >= 40 ? "#f59e0b" : "#10b981")
            : (r.pct >= 65 ? "#10b981" : r.pct >= 40 ? "#f59e0b" : "#ef4444");
          return (
            <div key={i} className="cgd-scoreboard-row">
              <div className="cgd-scoreboard-row__meta">
                <span className="cgd-scoreboard-row__label">{r.label}</span>
                <span className="cgd-scoreboard-row__pct" style={{ color: colour }}>{r.pct}%</span>
              </div>
              <ScoreBar pct={r.pct} colour={colour} />
            </div>
          );
        })}
        {data.overall_note && <p className="cgd-scoreboard__note">{data.overall_note}</p>}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 04: Missing Skills
// ============================================================================

function MissingSkills({ skills, toTitle }) {
  if (!skills?.length) return null;
  const SEV = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981", Critical: "#ef4444", Significant: "#f59e0b", Minor: "#10b981" };
  return (
    <Panel id="cgd-skills">
      <SectionLabel n={4} text={"Missing Skills -- " + toTitle} />
      <div className="cgd-skills-list">
        {skills.map((s, i) => {
          const c = SEV[s.severity || s.impact] || "#f59e0b";
          return (
            <div key={i} className="cgd-skill-row">
              <div className="cgd-skill-row__rank" style={{ color: c, borderColor: c + "30", background: c + "10" }}>{i + 1}</div>
              <div className="cgd-skill-row__body">
                <div className="cgd-skill-row__top">
                  <span className="cgd-skill-row__name">{s.skill}</span>
                  <div className="cgd-skill-row__pills">
                    {(s.severity || s.impact) && <Badge v={s.severity || s.impact} />}
                    {s.time_estimate && <span className="cgd-skill-row__time">{s.time_estimate}</span>}
                  </div>
                </div>
                {s.why_it_matters && <p className="cgd-skill-row__why">{s.why_it_matters}</p>}
                {s.how_to_close && (
                  <p className="cgd-skill-row__how">
                    <span className="cgd-skill-row__how-label">How to close: </span>{s.how_to_close}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 05: Experience Gaps
// ============================================================================

function ExperienceGaps({ gaps, fromTitle, toTitle }) {
  if (!gaps?.length) return null;
  return (
    <Panel id="cgd-experience">
      <SectionLabel n={5} text="Experience Gaps" />
      <p className="cgd-sec-intro">
        {"Real-world experience that " + toTitle + " hiring managers typically expect from candidates -- and that " + fromTitle + " roles do not usually provide."}
      </p>
      <div className="cgd-exp-list">
        {gaps.map((g, i) => (
          <div key={i} className="cgd-exp-item">
            <div className="cgd-exp-item__header">
              <div className="cgd-exp-item__title-row">
                <span className="cgd-exp-item__bullet">--</span>
                <span className="cgd-exp-item__name">{g.gap || g.title}</span>
              </div>
              {g.severity && <Badge v={g.severity} />}
            </div>
            {g.explanation && <p className="cgd-exp-item__text">{g.explanation}</p>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 06: Market Perception
// ============================================================================

function MarketPerception({ data }) {
  if (!data) return null;
  const rows = [
    { label: "How recruiters typically read this transition", text: data.recruiter_view,      accent: "#6366f1" },
    { label: "What hiring managers often look for",          text: data.hiring_manager_view, accent: "#f59e0b" },
    { label: "The typical positioning gap",                  text: data.positioning_gap,     accent: "#ef4444" },
  ].filter(r => r.text);
  if (!rows.length) return null;
  return (
    <Panel id="cgd-market">
      <SectionLabel n={6} text="Market Perception" />
      <p className="cgd-sec-intro">Based on hiring patterns for this transition -- how the market typically reads this profile category.</p>
      <div className="cgd-market-rows">
        {rows.map((r, i) => (
          <div key={i} className="cgd-market-row" style={{ "--ra": r.accent }}>
            <span className="cgd-market-row__label">{r.label}</span>
            <p className="cgd-market-row__text">{r.text}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 07: Where You Fit Right Now
// ============================================================================

function FitsNow({ data, toTitle }) {
  if (!data) return null;
  return (
    <Panel id="cgd-fits-now">
      <SectionLabel n={7} text="Where You Fit Right Now" />
      <div className="cgd-fits">
        {data.current_fit && (
          <div className="cgd-fits__block cgd-fits__block--current">
            <span className="cgd-fits__block-label">Competitive today</span>
            <p className="cgd-fits__block-text">{data.current_fit}</p>
          </div>
        )}
        {data.stretch_fit && (
          <div className="cgd-fits__block cgd-fits__block--stretch">
            <span className="cgd-fits__block-label">Stretch -- possible with preparation</span>
            <p className="cgd-fits__block-text">{data.stretch_fit}</p>
          </div>
        )}
        {data.not_yet && (
          <div className="cgd-fits__block cgd-fits__block--not-yet">
            <span className="cgd-fits__block-label">Not yet -- requires gap closure first</span>
            <p className="cgd-fits__block-text">{data.not_yet}</p>
          </div>
        )}
        {data.bridge_roles?.length > 0 && (
          <div className="cgd-fits__bridges">
            <span className="cgd-fits__bridges-label">Bridge roles to build towards {toTitle}</span>
            <div className="cgd-fits__bridges-chips">
              {data.bridge_roles.map((r, i) => (
                <span key={i} className="cgd-fits__bridge-chip">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 08: Fix Plan
// ============================================================================

const FIX_CFG = [
  { tag: "1  MUST DO FIRST", colour: "#ef4444", bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.2)"  },
  { tag: "2  DO NEXT",       colour: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)" },
  { tag: "3  SUPPORTING",    colour: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.2)" },
];

function FixPlan({ actions }) {
  if (!actions?.length) return null;
  return (
    <Panel id="cgd-fix-plan" accent>
      <SectionLabel n={8} text="Fix Order -- Action Plan" />
      <p className="cgd-sec-intro">Actions ordered by market impact. Each step closes a specific gap that hiring managers screen for in this transition.</p>
      <div className="cgd-fix-list">
        {actions.slice(0, 3).map((a, i) => {
          const cfg = FIX_CFG[i] || FIX_CFG[2];
          return (
            <div key={i} className="cgd-fix-card" style={{ "--fc": cfg.colour, "--fb": cfg.bg, "--fbr": cfg.border }}>
              <div className="cgd-fix-card__strip">
                <span className="cgd-fix-card__tag">{cfg.tag}</span>
                {a.time_estimate && <span className="cgd-fix-card__time">{a.time_estimate}</span>}
              </div>
              <div className="cgd-fix-card__body">
                <p className="cgd-fix-card__action">{a.action || a.what_to_do}</p>
                {a.why_first && (
                  <p className="cgd-fix-card__why">
                    <span className="cgd-fix-card__why-label">Market impact: </span>{a.why_first}
                  </p>
                )}
                {a.expected_outcome && (
                  <p className="cgd-fix-card__outcome">
                    <span className="cgd-fix-card__outcome-label">What changes: </span>{a.expected_outcome}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================================
// FREE 09: Risk If Ignored
// ============================================================================

function RiskIgnored({ items, toTitle }) {
  const fallback = [
    "Transition to " + (toTitle || "the target role") + " becomes increasingly difficult as direct-experience candidates accumulate in the market.",
    "The skill gap widens as the target role evolves -- the jump becomes harder, not easier, with time.",
    "Recruiters categorise this profile permanently into the current category, making reframing costly.",
    "The salary gap between current and target compounds with every year of inaction.",
  ];
  const list = items?.length ? items : fallback;
  return (
    <Panel id="cgd-risk" warning>
      <SectionLabel n={9} text="Risk If Ignored" />
      <div className="cgd-risk">
        <div className="cgd-risk__header">
          <div className="cgd-risk__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M12 2L2 20h20L12 2Z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 9v5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="0.75" fill="#ef4444"/>
            </svg>
          </div>
          <p className="cgd-risk__intro">Career gaps compound. Every month without action increases the cost of this transition.</p>
        </div>
        <div className="cgd-risk__items">
          {list.map((item, i) => (
            <div key={i} className="cgd-risk__item">
              <span className="cgd-risk__item-dot" />
              <p className="cgd-risk__item-text">{item}</p>
            </div>
          ))}
        </div>
        <div className="cgd-risk__footer">
          Based on hiring patterns, the window for this transition is most efficient now -- before the gap widens further. Start with Fix #1 above.
        </div>
      </div>
    </Panel>
  );
}

// ============================================================================
// CONVERSION BLOCK -- upgrade CTA shown after all free content
// ============================================================================

function UpgradeCTA({ fromTitle, toTitle }) {
  return (
    <div className="cgd-upgrade-block" id="cgd-upgrade">
      <div className="cgd-upgrade-block__inner">
        <span className="cgd-upgrade-block__badge">Profile Intelligence</span>

        <h3 className="cgd-upgrade-block__title">
          See how recruiters will evaluate your specific profile
        </h3>
        <p className="cgd-upgrade-block__body">
          The analysis above shows how the {fromTitle} to {toTitle} transition looks across the market.
          Upgrade to unlock profile-specific intelligence -- including what in your background will
          raise recruiter hesitation, where you are likely to struggle in interviews, and a
          personalised transition plan built around your specific gaps.
        </p>

        <div className="cgd-upgrade-block__benefits">
          {[
            { icon: "R", label: "CV rejection risks",              desc: "The specific signals in your CV that typically cause screening hesitation for this transition" },
            { icon: "I", label: "Interview weak points",           desc: "The questions and scenarios candidates with this background most often struggle with" },
            { icon: "T", label: "Personalised transition timeline", desc: "Realistic milestones for this specific role change, based on where candidates typically start" },
            { icon: "S", label: "Salary upside after gap closure",  desc: "Expected salary movement in the UK market once the key gaps for this transition are addressed" },
            { icon: "N", label: "Most strategic next tool",         desc: "Which HireEdge tool will have the highest impact on this specific transition right now" },
          ].map((b, i) => (
            <div key={i} className="cgd-upgrade-block__benefit">
              <span className="cgd-upgrade-block__benefit-icon">{b.icon}</span>
              <div>
                <span className="cgd-upgrade-block__benefit-label">{b.label}</span>
                <p className="cgd-upgrade-block__benefit-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cgd-upgrade-block__ctas">
          <Link href="/billing?plan=career_pack" className="cgd-upgrade-block__cta-primary">
            Unlock Career Pack -- PS6.99 one-time
          </Link>
          <p className="cgd-upgrade-block__cta-note">
            Includes Resume Optimiser, LinkedIn Optimiser, Interview Prep, and Career Roadmap.
          </p>
          <Link href="/billing?plan=pro" className="cgd-upgrade-block__cta-secondary">
            Or go Pro for full platform access
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOCKED MODULE -- blurred preview card for free users
// ============================================================================

const LockIcon = () => (
  <svg className="cgd-lock-icon" viewBox="0 0 20 20" fill="none" width="14" height="14">
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

function LockedModule({ icon, title, headline, teaserPoints, accent }) {
  return (
    <div className="cgd-locked-module" style={{ "--lm-accent": accent || "#6366f1" }}>
      <div className="cgd-locked-module__header">
        <div className="cgd-locked-module__icon-wrap">
          <span className="cgd-locked-module__icon">{icon}</span>
        </div>
        <div className="cgd-locked-module__header-right">
          <span className="cgd-locked-module__title">{title}</span>
          <div className="cgd-locked-module__lock-badge">
            <LockIcon />
            <span>Career Pack</span>
          </div>
        </div>
      </div>

      {headline && (
        <div className="cgd-locked-module__headline-wrap">
          <p className="cgd-locked-module__headline">{headline}</p>
        </div>
      )}

      {teaserPoints?.filter(Boolean).length > 0 && (
        <div className="cgd-locked-module__teaser">
          {teaserPoints.filter(Boolean).map((p, i) => (
            <div key={i} className="cgd-locked-module__teaser-item">
              <span className="cgd-locked-module__teaser-dot" />
              <p className="cgd-locked-module__teaser-text">{p}</p>
            </div>
          ))}
        </div>
      )}

      <div className="cgd-locked-module__blur-overlay" />
    </div>
  );
}

// ============================================================================
// PREMIUM MODULES -- locked preview for free, full view for paid
// (Currently both show teasers as profile-specific content requires CV input)
// ============================================================================

function PremiumModules({ preview, fromTitle, toTitle, isPaid }) {
  if (!preview) return null;

  return (
    <div className="cgd-locked-section">
      <div className="cgd-locked-section__header">
        <span className="cgd-locked-section__eyebrow">Profile Intelligence</span>
        <h3 className="cgd-locked-section__title">Personal Career Analysis</h3>
        <p className="cgd-locked-section__sub">
          The following modules go beyond role benchmarks to analyse how your specific background,
          CV, and positioning will affect this transition. Available with Career Pack or Pro.
        </p>
      </div>

      <div className="cgd-locked-modules-grid">
        {preview.cv_rejection_risks && (
          <LockedModule
            icon="R"
            title="CV Rejection Risks"
            headline={preview.cv_rejection_risks.headline}
            teaserPoints={preview.cv_rejection_risks.teaser_points}
            accent="#ef4444"
          />
        )}
        {preview.interview_weak_points && (
          <LockedModule
            icon="I"
            title="Interview Weak Points"
            headline={preview.interview_weak_points.headline}
            teaserPoints={preview.interview_weak_points.teaser_points}
            accent="#f59e0b"
          />
        )}
        {preview.transition_timeline && (
          <LockedModule
            icon="T"
            title="Personalised Timeline"
            headline={preview.transition_timeline.headline}
            teaserPoints={[
              preview.transition_timeline.realistic_range ? "Realistic range: " + preview.transition_timeline.realistic_range : null,
              ...(preview.transition_timeline.key_milestones || []),
            ]}
            accent="#6366f1"
          />
        )}
        {preview.salary_upside && (
          <LockedModule
            icon="S"
            title="Salary Upside"
            headline={preview.salary_upside.headline}
            teaserPoints={[
              preview.salary_upside.from_band ? "Current band: " + preview.salary_upside.from_band : null,
              preview.salary_upside.to_band   ? "Target band: "  + preview.salary_upside.to_band   : null,
              preview.salary_upside.uplift_note || null,
            ]}
            accent="#10b981"
          />
        )}
        {preview.next_tool && (
          <LockedModule
            icon="N"
            title="Most Strategic Next Tool"
            headline={"Based on your gaps, " + preview.next_tool.tool + " is your highest-leverage next step."}
            teaserPoints={[preview.next_tool.why]}
            accent="#059669"
          />
        )}
      </div>

      {!isPaid && (
        <div className="cgd-locked-section__cta-strip">
          <Link href="/billing?plan=career_pack" className="cgd-locked-section__cta">
            Unlock All 5 Modules -- PS6.99 one-time
          </Link>
          <span className="cgd-locked-section__cta-sub">
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

function GapReport({ data, fromTitle, toTitle, isPaid }) {
  if (!data) return null;

  return (
    <div className="cgd-report">

      {/* Role-based trust note -- always shown when no CV provided */}
      <RoleBasedNote fromTitle={fromTitle} toTitle={toTitle} />

      {/* Free sections */}
      <ResultsHero    hero={data.hero}              fromTitle={fromTitle} toTitle={toTitle} />
      <VerdictCard    data={data.verdict} />
      <GapOrigins     data={data.gap_origins} />
      <GapScoreboard  data={data.gap_scoreboard} />
      <MissingSkills  skills={data.missing_skills}  toTitle={toTitle} />
      <ExperienceGaps gaps={data.experience_gaps}   fromTitle={fromTitle} toTitle={toTitle} />
      <MarketPerception data={data.market_perception} />
      <FitsNow        data={data.fits_now}          toTitle={toTitle} />
      <FixPlan        actions={data.fix_plan} />
      <RiskIgnored    items={data.risk_if_ignored}  toTitle={toTitle} />

      {/* Conversion CTA -- only for free users */}
      {!isPaid && <UpgradeCTA fromTitle={fromTitle} toTitle={toTitle} />}

      {/* Premium module teasers -- always shown, locked for free users */}
      {data.premium_preview && (
        <PremiumModules
          preview={data.premium_preview}
          fromTitle={fromTitle}
          toTitle={toTitle}
          isPaid={isPaid}
        />
      )}
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function CareerGapExplainerPage() {
  const router  = useRouter();
  const autoRan = useRef(false);
  useEDGEXContext();

  const [fromRole,   setFromRole]   = useState(null);
  const [toRole,     setToRole]     = useState(null);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [err,        setErr]        = useState(null);
  const [userIsPaid, setUserIsPaid] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setUserIsPaid(isPaidPlan()); }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const { from, to, current, target } = router.query;
    if (from || current) setFromRole({ slug: from || current, title: slugToTitle(from || current) });
    if (to   || target)  setToRole({   slug: to   || target,  title: slugToTitle(to   || target)  });
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !fromRole || !toRole) return;
    autoRan.current = true;
    run();
  }, [fromRole, toRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setStep(0);
      timer.current = setInterval(() => setStep(s => (s + 1) % STEPS.length), 3000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [loading]);

  async function run() {
    if (!fromRole || !toRole) {
      setErr({ type: "error", message: "Select both roles to continue." });
      return;
    }
    setLoading(true); setErr(null); setResult(null);
    try {
      const qs = new URLSearchParams({ action: "explain", from: fromRole.slug, to: toRole.slug });
      const res = await fetch(`${API}/api/tools/career-gap-explainer?${qs}`, {
        headers: { "X-HireEdge-Plan": getPlan() },
      });
      const json = await res.json();
      if (!json.ok && !json.data) { setErr(friendlyError(json)); return; }

      const raw = json.data || json;

      // Shape guard: old API returns {verdict:"easy", composite_score, factors[]}
      // New API returns {hero:{}, verdict:{}, gap_origins:{}, ...}
      const isNewShape = raw && (
        (raw.hero    && typeof raw.hero    === "object") ||
        (raw.verdict && typeof raw.verdict === "object") ||
        (raw.gap_origins && typeof raw.gap_origins === "object")
      );

      if (!isNewShape) {
        setErr({
          type: "error",
          message: "Backend API needs updating. Deploy gap-explainer-api.js to api/tools/career-gap-explainer.js on hireedge-backend-mvp.",
        });
        return;
      }

      setResult(raw);
    } catch {
      setErr({ type: "error", message: "Network error -- please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Career Gap Diagnostic -- HireEdge</title></Head>
      <div className="tool-page">

        {/* Page header */}
        <div className="cgd-header">
          <span className="cgd-header__badge">Gap Diagnostic</span>
          <h1 className="cgd-header__title">Career Gap Explainer</h1>
          <p className="cgd-header__sub">
            Understand exactly why a transition is easy, medium, or difficult --
            what is missing, what matters most, and what to fix first.
          </p>
        </div>

        {/* Form */}
        <div className="tool-form cgd-form">
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">
                Current Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you are now..."
                onSelect={setFromRole}
                initialValue={fromRole?.title || ""}
              />
              {fromRole && <span className="tool-form__selected">+ {fromRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">
                Target Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you want to go..."
                onSelect={setToRole}
                initialValue={toRole?.title || ""}
              />
              {toRole && <span className="tool-form__selected">+ {toRole.title}</span>}
            </div>
          </div>

          {err?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">+</span>
              <div>
                <p className="tool-upgrade-prompt__title">Upgrade required</p>
                <p className="tool-upgrade-prompt__sub">Gap Explainer requires a paid plan.</p>
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
            className="tool-form__submit cgd-submit"
            onClick={run}
            disabled={loading || !fromRole || !toRole}
          >
            {loading ? STEPS[step] : "Diagnose the Gap"}
          </button>
          <p className="cgd-benchmark-note">
            Role-based benchmark analysis built from career transition patterns across 1,000+ roles.
            Add your CV to unlock profile-specific insights.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <div className="li-loading-steps">
              {STEPS.map((s, i) => (
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
          <GapReport
            data={result}
            fromTitle={fromRole?.title || ""}
            toTitle={toRole?.title || ""}
            isPaid={userIsPaid}
          />
        )}

      </div>
    </>
  );
}
