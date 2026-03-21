// ============================================================================
// components/tools/TalentProfileCard.js
// HireEdge — Talent Profile Card (v1)
//
// 10 sections in order:
//   1. Hero — Talent Score ring + status + verdict + risk
//   2. Executive Summary — 4 insight blocks
//   3. Transition Confidence — probability gauge + explanation
//   4. Core Scorecards — 5 dimensions with bars + labels
//   5. Strengths — 4–6 specific advantage cards
//   6. Critical Gaps — 3–5 gap cards with urgency + impact
//   7. Market Positioning — 3 insight blocks
//   8. Strategic Recommendation — path card with key bets
//   9. Action Priorities — 3 ordered action cards
//  10. Outcome & ROI — salary growth + potential + timeline
// ============================================================================

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  async function go() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button className="tp-copy" onClick={go}>{copied ? "✓" : "Copy"}</button>
  );
}

function UrgencyPip({ urgency }) {
  const c = { High:"tp-urgency--high", Medium:"tp-urgency--med", Low:"tp-urgency--low" }[urgency] || "tp-urgency--med";
  return <span className={`tp-urgency ${c}`}>{urgency}</span>;
}

function ScoreLbl({ label }) {
  const c = { strength:"tp-scorelbl--strength", developing:"tp-scorelbl--developing", gap:"tp-scorelbl--gap" }[label] || "tp-scorelbl--developing";
  return <span className={`tp-scorelbl ${c}`}>{label}</span>;
}

function ImpactPip({ impact }) {
  return <span className={`tp-impact tp-impact--${impact === "High" ? "high" : "med"}`}>{impact} impact</span>;
}

function RiskPill({ level }) {
  const c = { Low:"tp-risk--low", Medium:"tp-risk--med", High:"tp-risk--high" }[level] || "tp-risk--med";
  return <span className={`tp-risk-pill ${c}`}>{level} risk</span>;
}

function PathPill({ path }) {
  const c = { "Safe path":"tp-path--safe", "Fast path":"tp-path--fast", "Hybrid path":"tp-path--hybrid" }[path] || "tp-path--safe";
  return <span className={`tp-path-pill ${c}`}>{path}</span>;
}

// Section wrapper
function Section({ id, title, subtitle, children, accent }) {
  return (
    <section className={`tp-section ${accent ? "tp-section--accent" : ""}`} id={id}>
      <div className="tp-section__header">
        <h2 className="tp-section__title">{title}</h2>
        {subtitle && <p className="tp-section__sub">{subtitle}</p>}
      </div>
      <div className="tp-section__body">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Hero — Talent Score
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "Strong Fit":        { colour: "#059669", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
  "High Potential":    { colour: "#2563eb", bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.25)" },
  "Needs Development": { colour: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.25)" },
  "Weak Position":     { colour: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.25)" },
};

function TalentScoreHero({ score, currentRole, targetRole }) {
  if (!score) return null;
  const cfg    = STATUS_CONFIG[score.status] || STATUS_CONFIG["High Potential"];
  const colour = cfg.colour;
  const pct    = `${score.score}%`;

  return (
    <div className="tp-hero" style={{ "--tp-colour": colour, "--tp-bg": cfg.bg, "--tp-border": cfg.border }}>
      {/* Route */}
      <div className="tp-hero__route">
        <span className="tp-hero__role">{currentRole?.title}</span>
        {targetRole && (
          <>
            <span className="tp-hero__arrow">→</span>
            <span className="tp-hero__role tp-hero__role--target">{targetRole.title}</span>
          </>
        )}
      </div>

      <div className="tp-hero__main">
        {/* Score ring */}
        <div className="tp-hero__ring-wrap">
          <div className="tp-score-ring" style={{ "--tp-pct": pct, "--tp-colour": colour }}>
            <div className="tp-score-ring__inner">
              <span className="tp-score-ring__num" style={{ color: colour }}>{score.score}</span>
              <span className="tp-score-ring__label">/ 100</span>
            </div>
          </div>
          <span className="tp-score-ring__caption">Talent Score</span>
        </div>

        {/* Status + verdict */}
        <div className="tp-hero__content">
          <div className="tp-hero__status-row">
            <span className="tp-hero__status" style={{ color: colour, background: cfg.bg, borderColor: cfg.border }}>
              {score.status}
            </span>
            {score.risk_level && <RiskPill level={score.risk_level} />}
          </div>
          <p className="tp-hero__verdict">"{score.verdict}"</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Executive Summary
// ─────────────────────────────────────────────────────────────────────────────

function ExecutiveSummary({ summary }) {
  if (!summary) return null;
  const blocks = [
    { label: "Who you are",          text: summary.who_they_are,      icon: "◈" },
    { label: "How the market sees you", text: summary.market_perception, icon: "◉" },
    { label: "Strongest asset",      text: summary.biggest_strength,   icon: "✦" },
    { label: "What's holding you back", text: summary.holding_them_back, icon: "⚡" },
  ];

  return (
    <Section id="executive-summary" title="Executive Summary">
      <div className="tp-exec-grid">
        {blocks.map((b, i) => (
          <div key={i} className={`tp-exec-block ${i === 2 ? "tp-exec-block--strength" : i === 3 ? "tp-exec-block--barrier" : ""}`}>
            <span className="tp-exec-block__icon">{b.icon}</span>
            <span className="tp-exec-block__label">{b.label}</span>
            <p className="tp-exec-block__text">{b.text}</p>
            <CopyBtn text={b.text} />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Transition Confidence
// ─────────────────────────────────────────────────────────────────────────────

function TransitionConfidence({ confidence }) {
  if (!confidence) return null;
  const pct    = confidence.probability ?? 0;
  const colour = pct >= 70 ? "#059669" : pct >= 45 ? "#d97706" : "#dc2626";

  // SVG semicircle gauge
  const r   = 52, cx = 60, cy = 60;
  const deg = (pct / 100) * 180;
  const rad = (deg - 180) * (Math.PI / 180);
  const x   = cx + r * Math.cos(rad);
  const y   = cy + r * Math.sin(rad);
  const lg  = deg > 180 ? 1 : 0;

  return (
    <Section id="transition-confidence" title="Transition Confidence">
      <div className="tp-confidence">
        <div className="tp-confidence__gauge-wrap">
          <svg viewBox="0 0 120 72" className="tp-confidence__gauge">
            <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" strokeLinecap="round"/>
            {pct > 0 && <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${lg} 1 ${x} ${y}`} fill="none" stroke={colour} strokeWidth="10" strokeLinecap="round"/>}
          </svg>
          <div className="tp-confidence__val" style={{ color: colour }}>{pct}<span className="tp-confidence__pct">%</span></div>
          <div className="tp-confidence__label">{confidence.label}</div>
        </div>
        <div className="tp-confidence__detail">
          <p className="tp-confidence__explanation">{confidence.explanation}</p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Core Scorecards
// ─────────────────────────────────────────────────────────────────────────────

function Scorecards({ cards }) {
  if (!cards?.length) return null;
  return (
    <Section id="scorecards" title="Career Health Scorecards">
      <div className="tp-scorecards">
        {cards.map((c, i) => {
          const colour = c.score >= 70 ? "#059669" : c.score >= 45 ? "#d97706" : "#dc2626";
          return (
            <div key={i} className="tp-scorecard">
              <div className="tp-scorecard__header">
                <span className="tp-scorecard__dim">{c.dimension}</span>
                <div className="tp-scorecard__right">
                  {c.label && <ScoreLbl label={c.label} />}
                  <span className="tp-scorecard__score" style={{ color: colour }}>{c.score}</span>
                </div>
              </div>
              <div className="tp-scorecard__track">
                <div className="tp-scorecard__fill" style={{ width: `${c.score}%`, background: colour }} />
              </div>
              {c.note && <p className="tp-scorecard__note">{c.note}</p>}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Strengths
// ─────────────────────────────────────────────────────────────────────────────

function Strengths({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <Section id="strengths" title="Strengths to Leverage">
      <div className="tp-strengths">
        {strengths.map((s, i) => (
          <div key={i} className="tp-strength-card">
            <div className="tp-strength-card__num">{i + 1}</div>
            <div className="tp-strength-card__body">
              <div className="tp-strength-card__name">{s.strength}</div>
              <p className="tp-strength-card__detail">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Critical Gaps
// ─────────────────────────────────────────────────────────────────────────────

function CriticalGaps({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <Section id="critical-gaps" title="Critical Gaps">
      <div className="tp-gaps">
        {gaps.map((g, i) => (
          <div key={i} className="tp-gap-card">
            <div className="tp-gap-card__header">
              <span className="tp-gap-card__name">{g.gap}</span>
              {g.urgency && <UrgencyPip urgency={g.urgency} />}
            </div>
            {g.impact && (
              <div className="tp-gap-card__impact">
                <span className="tp-gap-card__impact-label">Impact</span>
                <p className="tp-gap-card__impact-text">{g.impact}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Market Positioning
// ─────────────────────────────────────────────────────────────────────────────

function MarketPositioning({ positioning }) {
  if (!positioning) return null;
  return (
    <Section id="market-positioning" title="Market Positioning">
      <div className="tp-positioning">
        <div className="tp-positioning-block tp-positioning-block--perception">
          <span className="tp-positioning-block__label">How recruiters see you today</span>
          <p className="tp-positioning-block__text">{positioning.how_recruiters_see}</p>
        </div>
        <div className="tp-positioning-block tp-positioning-block--fit">
          <span className="tp-positioning-block__label">Where you realistically fit now</span>
          <p className="tp-positioning-block__text tp-positioning-block__text--role">{positioning.fits_today}</p>
        </div>
        <div className="tp-positioning-block tp-positioning-block--change">
          <span className="tp-positioning-block__label">What must change to reach your target</span>
          <p className="tp-positioning-block__text">{positioning.what_must_change}</p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Strategic Recommendation
// ─────────────────────────────────────────────────────────────────────────────

function StrategicRecommendation({ rec }) {
  if (!rec) return null;
  return (
    <Section id="strategic-recommendation" title="Strategic Recommendation" accent>
      <div className="tp-strategy-card">
        <div className="tp-strategy-card__header">
          <div className="tp-strategy-card__meta">
            {rec.path      && <PathPill path={rec.path} />}
            {rec.risk_level && <RiskPill level={rec.risk_level} />}
            {rec.timeline   && <span className="tp-strategy-card__timeline">⏱ {rec.timeline}</span>}
          </div>
          <span className="tp-strategy-card__label">{rec.path_label}</span>
        </div>

        <p className="tp-strategy-card__why">{rec.why_best}</p>

        {rec.key_bets?.length > 0 && (
          <div className="tp-strategy-card__bets">
            <span className="tp-strategy-card__bets-label">Critical success factors</span>
            {rec.key_bets.map((bet, i) => (
              <div key={i} className="tp-strategy-card__bet">
                <span className="tp-strategy-card__bet-num">{i + 1}</span>
                <span className="tp-strategy-card__bet-text">{bet}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Action Priorities
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY_COLOURS = ["#059669", "#d97706", "#2563eb"];

function ActionPriorities({ actions }) {
  if (!actions?.length) return null;
  return (
    <Section id="action-priorities" title="Action Priority Plan">
      <p className="tp-section__hint">In order of impact. Start with #1 and don't move on until it's done.</p>
      <div className="tp-actions">
        {actions.map((a, i) => {
          const colour = PRIORITY_COLOURS[i] || "#2563eb";
          return (
            <div key={i} className="tp-action" style={{ "--tp-action-colour": colour }}>
              <div className="tp-action__num" style={{ background: colour }}>{a.priority}</div>
              <div className="tp-action__body">
                <div className="tp-action__header">
                  <span className="tp-action__text">{a.action}</span>
                  <div className="tp-action__pills">
                    {a.impact && <ImpactPip impact={a.impact} />}
                    {a.timeframe && <span className="tp-action__timeframe">{a.timeframe}</span>}
                  </div>
                </div>
                {a.why && <p className="tp-action__why">{a.why}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Outcome / ROI
// ─────────────────────────────────────────────────────────────────────────────

function OutcomeROI({ roi }) {
  if (!roi) return null;
  return (
    <Section id="outcome-roi" title="Expected Outcome &amp; ROI">
      <div className="tp-roi">
        <div className="tp-roi-metric tp-roi-metric--salary">
          <span className="tp-roi-metric__icon">£</span>
          <div>
            <span className="tp-roi-metric__label">Salary Growth</span>
            <span className="tp-roi-metric__val">{roi.salary_growth}</span>
          </div>
        </div>

        <div className="tp-roi-metric tp-roi-metric--time">
          <span className="tp-roi-metric__icon">⏱</span>
          <div>
            <span className="tp-roi-metric__label">Time to Results</span>
            <span className="tp-roi-metric__val">{roi.time_to_results}</span>
          </div>
        </div>

        {roi.growth_potential && (
          <div className="tp-roi-potential">
            <span className="tp-roi-potential__label">Career growth potential</span>
            <p className="tp-roi-potential__text">{roi.growth_potential}</p>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky nav — jump to sections
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  ["executive-summary",        "Summary"],
  ["transition-confidence",    "Confidence"],
  ["scorecards",               "Scorecards"],
  ["strengths",                "Strengths"],
  ["critical-gaps",            "Gaps"],
  ["market-positioning",       "Positioning"],
  ["strategic-recommendation", "Strategy"],
  ["action-priorities",        "Actions"],
  ["outcome-roi",              "ROI"],
];

function ProfileNav() {
  const [active, setActive] = useState("executive-summary");

  function scrollTo(id) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="tp-nav">
      {NAV_ITEMS.map(([id, label]) => (
        <button
          key={id}
          className={`tp-nav__item ${active === id ? "tp-nav__item--active" : ""}`}
          onClick={() => scrollTo(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function TalentProfileCard({ data }) {
  if (!data) return null;

  const {
    current_role,
    target_role,
    talent_score,
    executive_summary,
    transition_confidence,
    scorecards            = [],
    strengths             = [],
    critical_gaps         = [],
    market_positioning,
    strategic_recommendation,
    action_priorities     = [],
    outcome_roi,
  } = data;

  return (
    <div className="tp-report">

      {/* Hero */}
      <TalentScoreHero score={talent_score} currentRole={current_role} targetRole={target_role} />

      {/* Section nav */}
      <ProfileNav />

      {/* Report body */}
      <div className="tp-report__body">
        <ExecutiveSummary       summary={executive_summary} />
        <TransitionConfidence   confidence={transition_confidence} />
        <Scorecards             cards={scorecards} />
        <Strengths              strengths={strengths} />
        <CriticalGaps           gaps={critical_gaps} />
        <MarketPositioning      positioning={market_positioning} />
        <StrategicRecommendation rec={strategic_recommendation} />
        <ActionPriorities       actions={action_priorities} />
        <OutcomeROI             roi={outcome_roi} />
      </div>

    </div>
  );
}
