// ============================================================================
// pages/tools/career-pack.js
// HireEdge -- Career Pack Master Report (v1)
//
// The main paid product. A unified Career Transition Plan combining
// positioning, gap analysis, pathway, visa strategy, 30/60/90 execution,
// tool activation, and final outcome into one premium report.
//
// GATED: career_pack, pro, elite
// API:   POST /api/tools/career-pack
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../components/intelligence/RoleSearch";
import { useEDGEXContext } from "../context/CopilotContext";
import EDGEXBadge from "../components/brand/EDGEXBadge";

const API        = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";
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
  return (s || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const LOADING_STEPS = [
  "Analysing career transition...",
  "Mapping positioning gaps...",
  "Building pathway strategy...",
  "Assessing visa eligibility...",
  "Creating execution plan...",
  "Generating tool activation...",
  "Assembling your Career Pack...",
];

const COUNTRIES = [
  "UK", "Canada", "Australia", "USA", "Germany",
  "Netherlands", "Singapore", "UAE", "Ireland", "New Zealand",
];

const EDUCATION_OPTIONS = [
  { value: "phd",       label: "PhD / Doctorate" },
  { value: "masters",   label: "Master's Degree" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "diploma",   label: "Diploma / HND" },
  { value: "none",      label: "No Formal Degree" },
];

// ============================================================================
// Design atoms -- cp- prefix throughout
// ============================================================================

function CpBadge({ v }) {
  const map = {
    High:         "cp-badge cp-badge--red",
    "Very Hard":  "cp-badge cp-badge--red",
    Hard:         "cp-badge cp-badge--red",
    Medium:       "cp-badge cp-badge--amber",
    Moderate:     "cp-badge cp-badge--amber",
    Low:          "cp-badge cp-badge--green",
    Easy:         "cp-badge cp-badge--green",
    "Not Applicable": "cp-badge cp-badge--muted",
  };
  return <span className={map[v] || "cp-badge cp-badge--amber"}>{v}</span>;
}

function CpBar({ pct, colour }) {
  const c = colour || (pct >= 65 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444");
  return (
    <div className="cp-bar">
      <div className="cp-bar__fill" style={{ width: pct + "%", background: c }} />
    </div>
  );
}

function CpSection({ n, label, children, id, accent, warning, gold }) {
  let cls = "cp-section";
  if (accent)  cls += " cp-section--accent";
  if (warning) cls += " cp-section--warning";
  if (gold)    cls += " cp-section--gold";
  return (
    <div className={cls} id={id}>
      <div className="cp-section__label">
        <span className="cp-section__n">{String(n).padStart(2, "0")}</span>
        <span className="cp-section__title">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Paywall
// ============================================================================

function CareerPackPaywall() {
  return (
    <div className="cp-paywall">
      <div className="cp-paywall__lock">
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#818cf8" strokeWidth="1.5"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="cp-paywall__title">Career Pack Required</h2>
      <p className="cp-paywall__sub">
        Your Career Pack combines outputs from all HireEdge tools into one unified Transition Plan.
        Available with Career Pack, Pro, or Elite.
      </p>
      <div className="cp-paywall__features">
        {[
          "Full Career Transition Plan (8 sections)",
          "Positioning strategy + gap analysis",
          "Recommended pathway with phases",
          "Visa eligibility for your target country",
          "30 / 60 / 90 day execution plan",
          "CV, LinkedIn + interview activation",
          "Final outcome with salary target",
        ].map((f, i) => (
          <div key={i} className="cp-paywall__feature">
            <span className="cp-paywall__feature-tick">+</span>
            <span className="cp-paywall__feature-text">{f}</span>
          </div>
        ))}
      </div>
      <div className="cp-paywall__ctas">
        <Link href="/billing?plan=career_pack" className="cp-paywall__cta cp-paywall__cta--primary">
          Unlock Career Pack -- PS6.99 one-time
        </Link>
        <p className="cp-paywall__cta-note">No subscription. Includes all 7 career tools.</p>
        <Link href="/billing?plan=pro" className="cp-paywall__cta cp-paywall__cta--secondary">
          Go Pro for full platform -- PS19/month
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Section 01 -- Hero Summary
// ============================================================================

function HeroSummary({ hero }) {
  if (!hero) return null;
  const readColour = hero.readiness_pct >= 65 ? "#10b981" : hero.readiness_pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="cp-hero">
      <div className="cp-hero__eyebrow">
        <span className="cp-hero__from">{hero.current_role}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="cp-hero__arrow-icon">
          <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="cp-hero__to">{hero.target_role}</span>
        <span className="cp-hero__country">{hero.country}</span>
      </div>

      {hero.headline && (
        <p className="cp-hero__headline">{hero.headline}</p>
      )}

      <div className="cp-hero__metrics">
        <div className="cp-hero__metric">
          <span className="cp-hero__metric-label">Readiness</span>
          <span className="cp-hero__metric-val" style={{ color: readColour }}>
            {hero.readiness_pct}%
          </span>
          <CpBar pct={hero.readiness_pct} colour={readColour} />
        </div>
        <div className="cp-hero__metric-sep" />
        <div className="cp-hero__metric">
          <span className="cp-hero__metric-label">Difficulty</span>
          <span className="cp-hero__metric-val">
            <CpBadge v={hero.difficulty} />
          </span>
        </div>
        <div className="cp-hero__metric-sep" />
        <div className="cp-hero__metric">
          <span className="cp-hero__metric-label">Timeline</span>
          <span className="cp-hero__metric-val cp-hero__metric-val--mono">
            {hero.estimated_timeline}
          </span>
        </div>
        <div className="cp-hero__metric-sep" />
        <div className="cp-hero__metric">
          <span className="cp-hero__metric-label">Salary Growth</span>
          <span className="cp-hero__metric-val cp-hero__metric-val--green">
            {hero.salary_growth}
          </span>
        </div>
      </div>

      {hero.overall_verdict && (
        <p className="cp-hero__verdict">{hero.overall_verdict}</p>
      )}
    </div>
  );
}

// ============================================================================
// Section 02 -- Positioning
// ============================================================================

function PositioningSection({ data }) {
  if (!data) return null;
  return (
    <CpSection n={1} label="Market Positioning" id="cp-positioning" accent>
      <p className="cp-section__intro">
        How the market reads this profile now -- and how it needs to read it.
      </p>

      <div className="cp-pos-identity-row">
        <div className="cp-pos-block cp-pos-block--current">
          <span className="cp-pos-block__label">Current Market Identity</span>
          <p className="cp-pos-block__text">{data.current_market_identity}</p>
        </div>
        <div className="cp-pos-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="cp-pos-block cp-pos-block--target">
          <span className="cp-pos-block__label">Target Identity</span>
          <p className="cp-pos-block__text">{data.target_identity}</p>
        </div>
      </div>

      {data.positioning_gap && (
        <div className="cp-pos-gap">
          <span className="cp-pos-gap__label">The Gap</span>
          <p className="cp-pos-gap__text">{data.positioning_gap}</p>
        </div>
      )}

      {data.reframe_strategy && (
        <div className="cp-pos-reframe">
          <span className="cp-pos-reframe__label">Reframe Strategy</span>
          <p className="cp-pos-reframe__text">{data.reframe_strategy}</p>
        </div>
      )}

      {data.transferable_strengths?.length > 0 && (
        <div className="cp-pos-strengths">
          <span className="cp-pos-strengths__label">Transferable Strengths</span>
          <div className="cp-pos-strengths__grid">
            {data.transferable_strengths.map((s, i) => (
              <div key={i} className="cp-pos-strength-card">
                <span className="cp-pos-strength-card__name">{s.strength}</span>
                <p className="cp-pos-strength-card__map">{s.how_it_maps}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.positioning_statement && (
        <div className="cp-pos-statement">
          <span className="cp-pos-statement__label">Your Positioning Statement</span>
          <p className="cp-pos-statement__text">"{data.positioning_statement}"</p>
        </div>
      )}
    </CpSection>
  );
}

// ============================================================================
// Section 03 -- Gap Summary
// ============================================================================

function GapSummarySection({ data }) {
  if (!data) return null;
  const sevColour = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };
  return (
    <CpSection n={2} label="Gap Analysis" id="cp-gaps">
      <div className="cp-gap-header">
        <div className="cp-gap-header__metric">
          <span className="cp-gap-header__label">Overall Gap</span>
          <CpBadge v={data.overall_gap_severity} />
        </div>
        <div className="cp-gap-header__metric">
          <span className="cp-gap-header__label">Skill Match</span>
          <span className="cp-gap-header__val"
            style={{ color: data.skill_match_pct >= 60 ? "#10b981" : data.skill_match_pct >= 40 ? "#f59e0b" : "#ef4444" }}>
            {data.skill_match_pct}%
          </span>
        </div>
        {data.market_perception?.biggest_barrier && (
          <div className="cp-gap-header__barrier">
            <span className="cp-gap-header__barrier-label">Biggest Barrier</span>
            <p className="cp-gap-header__barrier-text">{data.market_perception.biggest_barrier}</p>
          </div>
        )}
      </div>

      {data.top_skill_gaps?.length > 0 && (
        <div className="cp-gap-skills">
          <span className="cp-gap-skills__label">Top Skill Gaps</span>
          <div className="cp-gap-skills__list">
            {data.top_skill_gaps.map((g, i) => (
              <div key={i} className="cp-gap-skill-row">
                <div className="cp-gap-skill-row__top">
                  <span className="cp-gap-skill-row__name">{g.skill}</span>
                  <div className="cp-gap-skill-row__pills">
                    <CpBadge v={g.severity} />
                    {g.time_to_close && (
                      <span className="cp-gap-skill-row__time">{g.time_to_close}</span>
                    )}
                  </div>
                </div>
                {g.why_it_matters && (
                  <p className="cp-gap-skill-row__why">{g.why_it_matters}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.experience_gaps?.length > 0 && (
        <div className="cp-gap-exp">
          <span className="cp-gap-exp__label">Experience Gaps</span>
          {data.experience_gaps.map((g, i) => (
            <div key={i} className="cp-gap-exp-item">
              <div className="cp-gap-exp-item__top">
                <span className="cp-gap-exp-item__name">{g.gap}</span>
                <CpBadge v={g.severity} />
              </div>
              {g.explanation && (
                <p className="cp-gap-exp-item__text">{g.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.market_perception && (
        <div className="cp-gap-market">
          {data.market_perception.recruiter_view && (
            <div className="cp-gap-market__row cp-gap-market__row--recruiter">
              <span className="cp-gap-market__label">Recruiter View</span>
              <p className="cp-gap-market__text">{data.market_perception.recruiter_view}</p>
            </div>
          )}
          {data.market_perception.hiring_manager_view && (
            <div className="cp-gap-market__row cp-gap-market__row--hm">
              <span className="cp-gap-market__label">Hiring Manager View</span>
              <p className="cp-gap-market__text">{data.market_perception.hiring_manager_view}</p>
            </div>
          )}
        </div>
      )}

      {data.bridge_roles?.length > 0 && (
        <div className="cp-gap-bridges">
          <span className="cp-gap-bridges__label">Bridge Roles</span>
          <div className="cp-gap-bridges__chips">
            {data.bridge_roles.map((r, i) => (
              <span key={i} className="cp-gap-bridge-chip">{r}</span>
            ))}
          </div>
        </div>
      )}
    </CpSection>
  );
}

// ============================================================================
// Section 04 -- Best Pathway
// ============================================================================

const PHASE_COLOURS = ["#10b981", "#f59e0b", "#6366f1"];

function BestPathwaySection({ data }) {
  if (!data) return null;
  const [openPhase, setOpenPhase] = useState(0);
  return (
    <CpSection n={3} label="Recommended Pathway" id="cp-pathway" accent>
      <div className="cp-path-header">
        <div className="cp-path-header__left">
          <span className="cp-path-type">{data.recommended_path}</span>
          {data.path_headline && <p className="cp-path-headline">{data.path_headline}</p>}
        </div>
        <div className="cp-path-header__right">
          <div className="cp-path-meta-item">
            <span className="cp-path-meta-label">Timeline</span>
            <span className="cp-path-meta-val">{data.total_timeline}</span>
          </div>
          <div className="cp-path-meta-item">
            <span className="cp-path-meta-label">Probability</span>
            <span className="cp-path-meta-val" style={{ color: data.probability_score >= 65 ? "#10b981" : data.probability_score >= 45 ? "#f59e0b" : "#ef4444" }}>
              {data.probability_score}%
            </span>
          </div>
        </div>
      </div>

      {data.phases?.length > 0 && (
        <div className="cp-phases">
          {data.phases.map((ph, i) => (
            <div key={i} className="cp-phase">
              <button
                className={"cp-phase__header" + (openPhase === i ? " cp-phase__header--open" : "")}
                onClick={() => setOpenPhase(openPhase === i ? -1 : i)}
                type="button"
                style={{ "--ph-colour": PHASE_COLOURS[i] || "#6366f1" }}
              >
                <div className="cp-phase__header-left">
                  <span className="cp-phase__num" style={{ background: (PHASE_COLOURS[i] || "#6366f1") + "22", color: PHASE_COLOURS[i] || "#6366f1", border: "1px solid " + (PHASE_COLOURS[i] || "#6366f1") + "44" }}>
                    {ph.phase}
                  </span>
                  <div>
                    <span className="cp-phase__label" style={{ color: PHASE_COLOURS[i] || "#6366f1" }}>
                      {ph.label}
                    </span>
                    <span className="cp-phase__duration">{ph.duration}</span>
                  </div>
                </div>
                <div className="cp-phase__header-right">
                  <span className="cp-phase__goal-short">{ph.goal}</span>
                  <span className="cp-phase__chevron">{openPhase === i ? "v" : ">"}</span>
                </div>
              </button>
              {openPhase === i && (
                <div className="cp-phase__body">
                  <p className="cp-phase__goal">{ph.goal}</p>
                  <div className="cp-phase__actions">
                    {(ph.actions || []).map((a, j) => (
                      <div key={j} className="cp-phase__action">
                        <span className="cp-phase__action-dot" style={{ background: PHASE_COLOURS[i] || "#6366f1" }} />
                        <span className="cp-phase__action-text">{a}</span>
                      </div>
                    ))}
                  </div>
                  {ph.milestone && (
                    <div className="cp-phase__milestone">
                      <span className="cp-phase__milestone-label">Milestone</span>
                      <p className="cp-phase__milestone-text">{ph.milestone}</p>
                    </div>
                  )}
                </div>
              )}
              {i < (data.phases.length - 1) && <div className="cp-phase__connector" />}
            </div>
          ))}
        </div>
      )}

      {data.success_factors?.length > 0 && (
        <div className="cp-path-factors">
          <span className="cp-path-factors__label">Success Factors</span>
          <div className="cp-path-factors__list">
            {data.success_factors.map((f, i) => (
              <div key={i} className="cp-path-factor">
                <span className="cp-path-factor__dot" />
                <span className="cp-path-factor__text">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CpSection>
  );
}

// ============================================================================
// Section 05 -- Visa Strategy
// ============================================================================

function VisaStrategySection({ data, country }) {
  if (!data) return null;
  const eligColour = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444", "Not Applicable": "#6b7280" }[data.eligibility] || "#f59e0b";
  return (
    <CpSection n={4} label={"Visa Strategy -- " + country} id="cp-visa">
      <div className="cp-visa-header">
        <div className="cp-visa-header__elig">
          <span className="cp-visa-header__label">Eligibility</span>
          <span className="cp-visa-header__val" style={{ color: eligColour }}>{data.eligibility}</span>
        </div>
        {data.best_route && (
          <div className="cp-visa-header__route">
            <span className="cp-visa-header__label">Best Route</span>
            <span className="cp-visa-header__route-name">{data.best_route}</span>
          </div>
        )}
      </div>

      {data.note && (
        <p className="cp-visa-note">{data.note}</p>
      )}

      {data.key_requirements?.length > 0 && (
        <div className="cp-visa-reqs">
          <span className="cp-visa-reqs__label">Key Requirements</span>
          {data.key_requirements.map((r, i) => (
            <div key={i} className="cp-visa-req">
              <span className="cp-visa-req__dot" />
              <span className="cp-visa-req__text">{r}</span>
            </div>
          ))}
        </div>
      )}

      <div className="cp-visa-meta">
        {data.salary_threshold && (
          <div className="cp-visa-meta__row">
            <span className="cp-visa-meta__label">Salary Threshold</span>
            <span className="cp-visa-meta__val">{data.salary_threshold}</span>
          </div>
        )}
        {data.sponsorship_note && (
          <div className="cp-visa-meta__row">
            <span className="cp-visa-meta__label">Sponsorship</span>
            <span className="cp-visa-meta__val">{data.sponsorship_note}</span>
          </div>
        )}
      </div>
    </CpSection>
  );
}

// ============================================================================
// Section 06 -- Execution Plan
// ============================================================================

const DAY_CFG = [
  { key: "day_30", colour: "#ef4444", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.2)" },
  { key: "day_60", colour: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)" },
  { key: "day_90", colour: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.2)" },
];

function ExecutionPlan({ data }) {
  if (!data) return null;
  return (
    <CpSection n={5} label="30 / 60 / 90 Day Execution Plan" id="cp-execution" gold>
      <p className="cp-section__intro">
        Ordered by impact. Each block builds on the previous.
      </p>
      <div className="cp-exec-grid">
        {DAY_CFG.map(({ key, colour, bg, border }) => {
          const block = data[key];
          if (!block) return null;
          return (
            <div key={key} className="cp-exec-block" style={{ "--ec": colour, "--eb": bg, "--ebr": border }}>
              <div className="cp-exec-block__strip">
                <span className="cp-exec-block__label">{block.label}</span>
                {block.theme && <span className="cp-exec-block__theme">{block.theme}</span>}
              </div>
              <div className="cp-exec-block__actions">
                {(block.actions || []).map((a, i) => (
                  <div key={i} className="cp-exec-action">
                    <span className="cp-exec-action__num" style={{ background: colour + "22", color: colour, border: "1px solid " + colour + "44" }}>
                      {i + 1}
                    </span>
                    <div className="cp-exec-action__body">
                      <p className="cp-exec-action__text">{a.action}</p>
                      {a.why && (
                        <p className="cp-exec-action__why">
                          <span className="cp-exec-action__why-label">Why: </span>{a.why}
                        </p>
                      )}
                      {a.output && (
                        <p className="cp-exec-action__output">
                          <span className="cp-exec-action__output-label">Output: </span>{a.output}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CpSection>
  );
}

// ============================================================================
// Section 07 -- Tool Activation
// ============================================================================

function ToolActivation({ data }) {
  if (!data) return null;
  const [tab, setTab] = useState("cv");
  const tabs = [
    { key: "cv",        label: "CV / Resume" },
    { key: "linkedin",  label: "LinkedIn" },
    { key: "interview", label: "Interview" },
  ];

  return (
    <CpSection n={6} label="Tool Activation" id="cp-tools">
      <p className="cp-section__intro">
        Specific changes to make to each tool before applying.
      </p>

      <div className="cp-tool-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={"cp-tool-tab" + (tab === t.key ? " cp-tool-tab--active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cv" && data.cv && (
        <div className="cp-tool-panel">
          {data.cv.headline_change && (
            <div className="cp-tool-highlight">
              <span className="cp-tool-highlight__label">Most Important Change</span>
              <p className="cp-tool-highlight__text">{data.cv.headline_change}</p>
            </div>
          )}
          <div className="cp-tool-cols">
            {data.cv.add?.length > 0 && (
              <div className="cp-tool-col cp-tool-col--add">
                <span className="cp-tool-col__label">Add</span>
                {data.cv.add.map((item, i) => (
                  <div key={i} className="cp-tool-list-item">
                    <span className="cp-tool-list-item__dot cp-tool-list-item__dot--green" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
            {data.cv.remove?.length > 0 && (
              <div className="cp-tool-col cp-tool-col--remove">
                <span className="cp-tool-col__label">Remove</span>
                {data.cv.remove.map((item, i) => (
                  <div key={i} className="cp-tool-list-item">
                    <span className="cp-tool-list-item__dot cp-tool-list-item__dot--red" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {data.cv.key_adjustments?.length > 0 && (
            <div className="cp-tool-adjustments">
              <span className="cp-tool-adjustments__label">Key Adjustments</span>
              {data.cv.key_adjustments.map((a, i) => (
                <div key={i} className="cp-tool-adjustment">
                  <span className="cp-tool-adjustment__n">{i + 1}</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "linkedin" && data.linkedin && (
        <div className="cp-tool-panel">
          {data.linkedin.headline_recommendation && (
            <div className="cp-tool-highlight">
              <span className="cp-tool-highlight__label">Recommended Headline</span>
              <p className="cp-tool-highlight__text cp-tool-highlight__text--headline">
                "{data.linkedin.headline_recommendation}"
              </p>
            </div>
          )}
          {data.linkedin.about_focus && (
            <div className="cp-tool-info-row">
              <span className="cp-tool-info-label">About Section Focus</span>
              <p className="cp-tool-info-text">{data.linkedin.about_focus}</p>
            </div>
          )}
          {data.linkedin.key_signals?.length > 0 && (
            <div className="cp-tool-adjustments">
              <span className="cp-tool-adjustments__label">Key Signals to Add</span>
              {data.linkedin.key_signals.map((s, i) => (
                <div key={i} className="cp-tool-adjustment">
                  <span className="cp-tool-adjustment__n">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "interview" && data.interview && (
        <div className="cp-tool-panel">
          {data.interview.narrative && (
            <div className="cp-tool-highlight">
              <span className="cp-tool-highlight__label">Your Transition Narrative</span>
              <p className="cp-tool-highlight__text">{data.interview.narrative}</p>
            </div>
          )}
          {data.interview.gap_handling && (
            <div className="cp-tool-info-row">
              <span className="cp-tool-info-label">How to Handle the Transition Question</span>
              <p className="cp-tool-info-text">{data.interview.gap_handling}</p>
            </div>
          )}
          {data.interview.top_questions?.length > 0 && (
            <div className="cp-tool-questions">
              <span className="cp-tool-adjustments__label">Top Interview Questions</span>
              {data.interview.top_questions.map((q, i) => (
                <div key={i} className="cp-tool-question">
                  <p className="cp-tool-question__q">Q: {q.question}</p>
                  {q.framing && (
                    <p className="cp-tool-question__frame">
                      <span className="cp-tool-question__frame-label">Framing: </span>{q.framing}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CpSection>
  );
}

// ============================================================================
// Section 08 -- Final Outcome
// ============================================================================

function FinalOutcome({ data }) {
  if (!data) return null;
  const probColour = data.transition_probability >= 65 ? "#10b981" : data.transition_probability >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <CpSection n={7} label="Final Outcome" id="cp-outcome" gold>
      <div className="cp-outcome-hero">
        <div className="cp-outcome-prob">
          <span className="cp-outcome-prob__label">Transition Probability</span>
          <span className="cp-outcome-prob__val" style={{ color: probColour }}>
            {data.transition_probability}%
          </span>
          <CpBar pct={data.transition_probability} colour={probColour} />
          {data.probability_note && (
            <p className="cp-outcome-prob__note">{data.probability_note}</p>
          )}
        </div>

        <div className="cp-outcome-salary">
          <span className="cp-outcome-salary__label">Target Salary Range</span>
          <span className="cp-outcome-salary__val">{data.target_salary_range}</span>
        </div>
      </div>

      {data.success_definition && (
        <div className="cp-outcome-success">
          <span className="cp-outcome-success__label">What Success Looks Like</span>
          <p className="cp-outcome-success__text">{data.success_definition}</p>
        </div>
      )}

      {(data.biggest_risk || data.time_sensitive_note) && (
        <div className="cp-outcome-alerts">
          {data.biggest_risk && (
            <div className="cp-outcome-alert cp-outcome-alert--risk">
              <span className="cp-outcome-alert__label">Biggest Risk</span>
              <p className="cp-outcome-alert__text">{data.biggest_risk}</p>
            </div>
          )}
          {data.time_sensitive_note && (
            <div className="cp-outcome-alert cp-outcome-alert--time">
              <span className="cp-outcome-alert__label">Why Start Now</span>
              <p className="cp-outcome-alert__text">{data.time_sensitive_note}</p>
            </div>
          )}
        </div>
      )}
    </CpSection>
  );
}

// ============================================================================
// Report nav
// ============================================================================

function ReportNav() {
  const sections = [
    { id: "cp-positioning", label: "Positioning" },
    { id: "cp-gaps",        label: "Gaps" },
    { id: "cp-pathway",     label: "Pathway" },
    { id: "cp-visa",        label: "Visa" },
    { id: "cp-execution",   label: "Execution" },
    { id: "cp-tools",       label: "Tools" },
    { id: "cp-outcome",     label: "Outcome" },
  ];
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <nav className="cp-report-nav">
      {sections.map(s => (
        <button key={s.id} type="button" className="cp-report-nav__item" onClick={() => scrollTo(s.id)}>
          {s.label}
        </button>
      ))}
    </nav>
  );
}

// ============================================================================
// Full Report
// ============================================================================

function CareerPackReport({ data, country }) {
  if (!data) return null;
  return (
    <div className="cp-report">
      <div className="cp-report__badge">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
          <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1L2 5.5l4.2-.9L8 1Z" stroke="#818cf8" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
        Career Transition Plan
      </div>
      <div className="edgex-report-header">
        <div className="edgex-report-header__badge"><EDGEXBadge size="large" /></div>
      </div>
      <HeroSummary hero={data.hero} />
      <ReportNav />
      <div className="cp-report__sections">
        <PositioningSection data={data.positioning} />
        <GapSummarySection  data={data.gap_summary} />
        <BestPathwaySection data={data.best_pathway} />
        <VisaStrategySection data={data.visa_strategy} country={country} />
        <ExecutionPlan      data={data.execution_plan} />
        <ToolActivation     data={data.tool_plan} />
        <FinalOutcome       data={data.final_outcome} />
        <div className="edgex-tool-footer"><EDGEXBadge /></div>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function CareerPackPage() {
  const router  = useRouter();
  const autoRan = useRef(false);
  useEDGEXContext();

  const [currentRole, setCurrentRole] = useState(null);
  const [targetRole,  setTargetRole]  = useState(null);
  const [country,     setCountry]     = useState("UK");
  const [yearsExp,    setYearsExp]    = useState("");
  const [education,   setEducation]   = useState("");
  const [skills,      setSkills]      = useState("");

  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [err,        setErr]        = useState(null);
  const [userIsPaid, setUserIsPaid] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setUserIsPaid(isPaidPlan()); }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const { from, current, to, target, country: qc } = router.query;
    const cr = from || current;
    const tr = to   || target;
    if (cr) setCurrentRole({ slug: cr, title: slugToTitle(cr) });
    if (tr) setTargetRole({  slug: tr, title: slugToTitle(tr) });
    if (qc) setCountry(qc);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !currentRole || !targetRole) return;
    autoRan.current = true;
    run();
  }, [currentRole, targetRole, router.isReady]);

  useEffect(() => {
    if (loading) {
      setStep(0);
      timer.current = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 2800);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [loading]);

  async function run() {
    if (!currentRole) { setErr({ type: "error", message: "Please enter your current role." }); return; }
    if (!targetRole)  { setErr({ type: "error", message: "Please enter your target role."  }); return; }
    if (currentRole.slug === targetRole.slug) { setErr({ type: "error", message: "Current and target roles must be different." }); return; }

    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await fetch(`${API}/api/tools/career-pack`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          currentRole: currentRole.slug || currentRole.title,
          targetRole:  targetRole.slug  || targetRole.title,
          country,
          yearsExp: yearsExp ? parseInt(yearsExp) : null,
          education: education || null,
          skills:    skills   || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        if (json.reason === "access_denied" || json.reason === "tool_not_in_plan") {
          setErr({ type: "upgrade" });
        } else {
          setErr({ type: "error", message: json.error || "Something went wrong. Please try again." });
        }
        return;
      }
      setResult(json.data);
    } catch {
      setErr({ type: "error", message: "Network error -- please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Career Pack -- HireEdge</title></Head>
      <div className="tool-page cp-page">

        {/* Header */}
        <div className="cp-header">
          <span className="cp-header__badge">Career Pack</span>
          <h1 className="cp-header__title">Career Transition Plan</h1>
          <p className="cp-header__sub">
            A unified, intelligence-driven plan combining positioning, gap analysis,
            pathway strategy, visa eligibility, 30/60/90 execution, and tool activation --
            built for your specific transition.
          </p>
        </div>

        {/* Form */}
        <div className="tool-form cp-form">
          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">
                Current Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you are now..."
                onSelect={setCurrentRole}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">+ {currentRole.title}</span>}
            </div>
            <div className="tool-form__field">
              <label className="tool-form__label">
                Target Role <span className="tool-form__req">*</span>
              </label>
              <RoleSearch
                placeholder="Where you want to go..."
                onSelect={setTargetRole}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">+ {targetRole.title}</span>}
            </div>
          </div>

          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Target Country</label>
              <select
                className="tool-form__input"
                value={country}
                onChange={e => setCountry(e.target.value)}
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
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
                <option value="">Select...</option>
                {EDUCATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">
              Current Skills <span className="tool-form__optional">(optional -- improves accuracy)</span>
            </label>
            <input
              type="text"
              className="tool-form__input"
              placeholder="e.g. SQL, Stakeholder Management, Project Delivery, Excel..."
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
          </div>

          {/* Errors */}
          {err?.type === "upgrade" && !userIsPaid && (
            <div className="cp-form-upgrade">
              <p className="cp-form-upgrade__text">
                Career Pack requires a paid plan. Upgrade to generate your full Transition Plan.
              </p>
              <Link href="/billing?plan=career_pack" className="cp-form-upgrade__btn">
                Unlock Career Pack
              </Link>
            </div>
          )}
          {err?.type === "error" && (
            <div className="tool-form__error">{err.message}</div>
          )}

          <button
            className="tool-form__submit cp-submit"
            onClick={run}
            disabled={loading || !currentRole || !targetRole}
          >
            {loading ? LOADING_STEPS[step] : "Generate Career Transition Plan"}
          </button>
          <p className="cgd-benchmark-note">
            Intelligence-driven plan built from career transition data across 1,000+ roles and the {country} job market.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="tool-loading cp-loading">
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

        {/* Paywall -- show if not paid and no result */}
        {!userIsPaid && !result && !loading && (
          <CareerPackPaywall />
        )}

        {/* Report */}
        {result && (
          <CareerPackReport data={result} country={country} />
        )}

      </div>
    </>
  );
}
