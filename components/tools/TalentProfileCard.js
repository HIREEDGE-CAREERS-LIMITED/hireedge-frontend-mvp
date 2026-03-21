// ============================================================================
// components/tools/TalentProfileCard.js
// HireEdge — Talent Profile Card (v2)
//
// Upgrades over v1:
//   - NAV REMOVED → pure continuous scroll story
//   - Hero: 3 inline key metrics (confidence, timeline, salary growth)
//   - Section 3: Career DNA Snapshot (NEW)
//   - Transition Confidence: upgraded with success/risk factor lists
//   - Action Priorities: urgency tags (#MUST DO THIS WEEK etc) + impact
//   - Section 11: Risk Warning (NEW) — what happens if no action taken
//   - All sections polished: spacing, hierarchy, rhythm
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

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
  return <button className="tp-copy" onClick={go}>{copied ? "✓" : "Copy"}</button>;
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
  const c = impact === "High" ? "tp-impact--high" : impact === "Low" ? "tp-impact--low" : "tp-impact--med";
  return <span className={`tp-impact ${c}`}>{impact} impact</span>;
}

function RiskPill({ level }) {
  const c = { Low:"tp-risk--low", Medium:"tp-risk--med", High:"tp-risk--high" }[level] || "tp-risk--med";
  return <span className={`tp-risk-pill ${c}`}>{level} risk</span>;
}

function PathPill({ path }) {
  const c = { "Safe path":"tp-path--safe","Fast path":"tp-path--fast","Hybrid path":"tp-path--hybrid" }[path] || "tp-path--safe";
  return <span className={`tp-path-pill ${c}`}>{path}</span>;
}

function SectionDivider({ label }) {
  return (
    <div className="tp-divider">
      <div className="tp-divider__line" />
      {label && <span className="tp-divider__label">{label}</span>}
      <div className="tp-divider__line" />
    </div>
  );
}

function Section({ id, title, tag, children, variant }) {
  return (
    <section className={`tp-section tp-section--${variant || "default"}`} id={id}>
      <div className="tp-section__header">
        {tag && <span className="tp-section__tag">{tag}</span>}
        <h2 className="tp-section__title">{title}</h2>
      </div>
      <div className="tp-section__body">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "Strong Fit":        { colour: "#059669", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
  "High Potential":    { colour: "#2563eb", bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.25)" },
  "Needs Development": { colour: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.25)" },
  "Weak Position":     { colour: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.25)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO — upgraded with 3 inline key metrics
// ─────────────────────────────────────────────────────────────────────────────

function TalentScoreHero({ score, currentRole, targetRole, confidence, roi, recommendation }) {
  if (!score) return null;
  const cfg    = STATUS_CONFIG[score.status] || STATUS_CONFIG["High Potential"];
  const colour = cfg.colour;
  const pct    = `${score.score}%`;

  return (
    <div className="tp-hero" style={{ "--tp-colour": colour, "--tp-bg": cfg.bg, "--tp-border": cfg.border }}>

      {/* Route breadcrumb */}
      <div className="tp-hero__route">
        <span className="tp-hero__role">{currentRole?.title}</span>
        {targetRole && (
          <>
            <svg className="tp-hero__route-arrow" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="tp-hero__role tp-hero__role--target">{targetRole.title}</span>
          </>
        )}
        <span className="tp-hero__report-label">Career Intelligence Report</span>
      </div>

      {/* Main hero body */}
      <div className="tp-hero__main">

        {/* Score ring */}
        <div className="tp-hero__ring-wrap">
          <div className="tp-score-ring" style={{ "--tp-pct": pct, "--tp-colour": colour }}>
            <div className="tp-score-ring__inner">
              <span className="tp-score-ring__num" style={{ color: colour }}>{score.score}</span>
              <span className="tp-score-ring__sublabel">/ 100</span>
            </div>
          </div>
          <span className="tp-score-ring__caption">Talent Score</span>
        </div>

        {/* Verdict + status */}
        <div className="tp-hero__content">
          <div className="tp-hero__status-row">
            <span className="tp-hero__status" style={{ color: colour, background: cfg.bg, borderColor: cfg.border }}>
              {score.status}
            </span>
            {score.risk_level && <RiskPill level={score.risk_level} />}
          </div>
          <p className="tp-hero__verdict">"{score.verdict}"</p>

          {/* 3 key metrics inline */}
          <div className="tp-hero__metrics">
            <div className="tp-hero__metric">
              <span className="tp-hero__metric-val" style={{ color: colour }}>
                {confidence?.probability ?? "—"}%
              </span>
              <span className="tp-hero__metric-label">Transition Confidence</span>
            </div>
            <div className="tp-hero__metric-sep" />
            <div className="tp-hero__metric">
              <span className="tp-hero__metric-val">
                {recommendation?.timeline || "—"}
              </span>
              <span className="tp-hero__metric-label">Est. Timeline</span>
            </div>
            <div className="tp-hero__metric-sep" />
            <div className="tp-hero__metric">
              <span className="tp-hero__metric-val tp-hero__metric-val--green">
                {roi?.salary_growth || "—"}
              </span>
              <span className="tp-hero__metric-label">Salary Growth</span>
            </div>
          </div>
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
    { label: "Who you are",             text: summary.who_they_are,       icon: "◈", variant: "" },
    { label: "How the market sees you", text: summary.market_perception,  icon: "◉", variant: "" },
    { label: "Strongest asset",         text: summary.biggest_strength,   icon: "✦", variant: "strength" },
    { label: "What's holding you back", text: summary.holding_them_back,  icon: "⚡", variant: "barrier" },
  ];
  return (
    <Section id="executive-summary" title="Executive Summary" tag="01">
      <div className="tp-exec-grid">
        {blocks.map((b, i) => (
          <div key={i} className={`tp-exec-block tp-exec-block--${b.variant || "default"}`}>
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
// 3. CAREER DNA SNAPSHOT (NEW)
// ─────────────────────────────────────────────────────────────────────────────

function CareerDNA({ score, currentRole, targetRole, scorecards, strengths, gaps }) {
  // Build DNA statements from existing data — no new API fields needed
  const statements = [];

  // From scorecards
  if (scorecards?.length) {
    const top    = [...scorecards].sort((a, b) => b.score - a.score)[0];
    const bottom = [...scorecards].sort((a, b) => a.score - b.score)[0];
    if (top)    statements.push({ text: `${top.dimension} is your standout dimension — ${top.note}`, type: "strength" });
    if (bottom) statements.push({ text: `${bottom.dimension} is the area most in need of attention — ${bottom.note}`, type: "gap" });
  }

  // From strengths
  if (strengths?.length >= 1) {
    statements.push({ text: strengths[0].strength + (strengths[0].detail ? ` — ${strengths[0].detail}` : ""), type: "strength" });
  }

  // From gaps
  if (gaps?.length >= 1) {
    statements.push({ text: gaps[0].gap + (gaps[0].impact ? `. ${gaps[0].impact}` : ""), type: "gap" });
  }

  // Core identity from score
  const coreIdentity = score?.verdict || null;

  if (!statements.length && !coreIdentity) return null;

  return (
    <Section id="career-dna" title="Career DNA Snapshot" tag="02" variant="dna">
      <p className="tp-dna__intro">
        A snapshot of who you are as a professional — derived from your skills, experience, and market positioning.
      </p>

      <div className="tp-dna__statements">
        {statements.map((s, i) => (
          <div key={i} className={`tp-dna__statement tp-dna__statement--${s.type}`}>
            <span className="tp-dna__statement-bullet">
              {s.type === "strength" ? "▲" : "▼"}
            </span>
            <p className="tp-dna__statement-text">{s.text}</p>
          </div>
        ))}
      </div>

      {coreIdentity && (
        <div className="tp-dna__core">
          <span className="tp-dna__core-label">Core Identity</span>
          <p className="tp-dna__core-text">"{coreIdentity}"</p>
          <CopyBtn text={coreIdentity} />
        </div>
      )}
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Transition Confidence — UPGRADED with success/risk factor lists
// ─────────────────────────────────────────────────────────────────────────────

function TransitionConfidence({ confidence, strengths, gaps }) {
  if (!confidence) return null;
  const pct    = confidence.probability ?? 0;
  const colour = pct >= 70 ? "#059669" : pct >= 45 ? "#d97706" : "#dc2626";

  // SVG semicircle
  const r   = 52, cx = 60, cy = 60;
  const deg = (pct / 100) * 180;
  const rad = (deg - 180) * (Math.PI / 180);
  const x   = cx + r * Math.cos(rad);
  const y   = cy + r * Math.sin(rad);
  const lg  = deg > 180 ? 1 : 0;

  // Build success factors from strengths, risk factors from gaps
  const successFactors = (strengths || []).slice(0, 3).map(s => s.strength);
  const riskFactors    = (gaps || []).slice(0, 3).map(g => g.gap);

  return (
    <Section id="transition-confidence" title="Transition Confidence" tag="04">
      <div className="tp-confidence-v2">

        {/* Gauge + score */}
        <div className="tp-confidence-v2__top">
          <div className="tp-confidence-v2__gauge-wrap">
            <svg viewBox="0 0 120 72" className="tp-confidence__gauge">
              <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" strokeLinecap="round"/>
              {pct > 0 && <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${lg} 1 ${x} ${y}`} fill="none" stroke={colour} strokeWidth="10" strokeLinecap="round"/>}
            </svg>
            <div className="tp-confidence__val" style={{ color: colour }}>{pct}<span className="tp-confidence__pct">%</span></div>
            <div className="tp-confidence__label">{confidence.label}</div>
          </div>
          <div className="tp-confidence-v2__explanation">
            <p className="tp-confidence__explanation">{confidence.explanation}</p>
          </div>
        </div>

        {/* Success / Risk factor lists */}
        <div className="tp-confidence-v2__factors">
          <div className="tp-confidence-v2__factor-col tp-confidence-v2__factor-col--up">
            <div className="tp-confidence-v2__factor-header">
              <span className="tp-confidence-v2__factor-icon">↑</span>
              <span className="tp-confidence-v2__factor-title">What increases success</span>
            </div>
            {successFactors.length > 0 ? (
              successFactors.map((f, i) => (
                <div key={i} className="tp-confidence-v2__factor-item tp-confidence-v2__factor-item--up">
                  <span className="tp-confidence-v2__factor-dot" />
                  <p className="tp-confidence-v2__factor-text">{f}</p>
                </div>
              ))
            ) : (
              <p className="tp-confidence-v2__factor-empty">Add your CV for personalised factors</p>
            )}
          </div>

          <div className="tp-confidence-v2__factor-col tp-confidence-v2__factor-col--down">
            <div className="tp-confidence-v2__factor-header">
              <span className="tp-confidence-v2__factor-icon tp-confidence-v2__factor-icon--red">↓</span>
              <span className="tp-confidence-v2__factor-title">What reduces success</span>
            </div>
            {riskFactors.length > 0 ? (
              riskFactors.map((f, i) => (
                <div key={i} className="tp-confidence-v2__factor-item tp-confidence-v2__factor-item--down">
                  <span className="tp-confidence-v2__factor-dot tp-confidence-v2__factor-dot--red" />
                  <p className="tp-confidence-v2__factor-text">{f}</p>
                </div>
              ))
            ) : (
              <p className="tp-confidence-v2__factor-empty">Add your CV for personalised factors</p>
            )}
          </div>
        </div>

      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Scorecards
// ─────────────────────────────────────────────────────────────────────────────

function Scorecards({ cards }) {
  if (!cards?.length) return null;
  return (
    <Section id="scorecards" title="Career Health Scorecards" tag="05">
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
// 6. Strengths
// ─────────────────────────────────────────────────────────────────────────────

function Strengths({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <Section id="strengths" title="Strengths to Leverage" tag="06">
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
// 7. Critical Gaps
// ─────────────────────────────────────────────────────────────────────────────

function CriticalGaps({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <Section id="critical-gaps" title="Critical Gaps" tag="07">
      <div className="tp-gaps">
        {gaps.map((g, i) => (
          <div key={i} className="tp-gap-card">
            <div className="tp-gap-card__header">
              <span className="tp-gap-card__name">{g.gap}</span>
              {g.urgency && <UrgencyPip urgency={g.urgency} />}
            </div>
            {g.impact && (
              <div className="tp-gap-card__impact">
                <span className="tp-gap-card__impact-label">Market impact</span>
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
// 8. Market Positioning
// ─────────────────────────────────────────────────────────────────────────────

function MarketPositioning({ positioning }) {
  if (!positioning) return null;
  return (
    <Section id="market-positioning" title="Market Positioning" tag="08">
      <div className="tp-positioning">
        <div className="tp-positioning-block tp-positioning-block--perception">
          <span className="tp-positioning-block__label">How recruiters see you today</span>
          <p className="tp-positioning-block__text">{positioning.how_recruiters_see}</p>
        </div>
        <div className="tp-positioning-block tp-positioning-block--fit">
          <span className="tp-positioning-block__label">Where you realistically fit right now</span>
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
// 9. Strategic Recommendation
// ─────────────────────────────────────────────────────────────────────────────

function StrategicRecommendation({ rec }) {
  if (!rec) return null;
  return (
    <Section id="strategic-recommendation" title="Strategic Recommendation" tag="09" variant="accent">
      <div className="tp-strategy-card">
        <div className="tp-strategy-card__header">
          <div className="tp-strategy-card__meta">
            {rec.path       && <PathPill path={rec.path} />}
            {rec.risk_level  && <RiskPill level={rec.risk_level} />}
            {rec.timeline    && <span className="tp-strategy-card__timeline">⏱ {rec.timeline}</span>}
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
// 10. Action Priority Plan — UPGRADED with urgency tags
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_URGENCY = [
  { tag: "MUST DO THIS WEEK", colour: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)" },
  { tag: "DO IN 30 DAYS",     colour: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)" },
  { tag: "DO IN 90 DAYS",     colour: "#2563eb", bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.25)" },
];

function ActionPriorities({ actions }) {
  if (!actions?.length) return null;
  return (
    <Section id="action-priorities" title="Action Priority Plan" tag="10">
      <p className="tp-section__hint">Execute in order. Don't start #2 until #1 is done.</p>
      <div className="tp-actions-v2">
        {actions.map((a, i) => {
          const urgency = ACTION_URGENCY[i] || ACTION_URGENCY[2];
          return (
            <div key={i} className="tp-action-v2" style={{ "--act-colour": urgency.colour, "--act-bg": urgency.bg, "--act-border": urgency.border }}>
              <div className="tp-action-v2__urgency-strip">
                <span className="tp-action-v2__urgency-tag">#{a.priority} {urgency.tag}</span>
                {a.impact && <ImpactPip impact={a.impact} />}
              </div>
              <div className="tp-action-v2__body">
                <p className="tp-action-v2__text">{a.action}</p>
                {a.why && <p className="tp-action-v2__why">{a.why}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. RISK WARNING (NEW)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_RISK_WARNINGS = [
  "Skill gap widens relative to market as competitors upskill",
  "Transition difficulty increases significantly after 18 months of inaction",
  "Recruiters re-categorise your profile into a narrower, lower-demand niche",
  "Target role salary bands move upward while your positioning stays static",
];

function RiskWarning({ gaps, currentRole, targetRole }) {
  // Generate warnings from gaps + generic market risks
  const gapWarnings = (gaps || []).slice(0, 2).map(g =>
    `${g.gap} remains unaddressed — ${g.impact || "this will cost you opportunities"}`
  );
  const warnings = [...gapWarnings, ...DEFAULT_RISK_WARNINGS].slice(0, 4);

  return (
    <Section id="risk-warning" title="What Happens If You Take No Action" tag="11" variant="warning">
      <div className="tp-risk-warning">
        <div className="tp-risk-warning__header">
          <span className="tp-risk-warning__icon">⚠</span>
          <p className="tp-risk-warning__intro">
            Based on your current profile and the {targetRole?.title || "target role"} market, inaction carries real cost.
          </p>
        </div>
        <div className="tp-risk-warning__items">
          {warnings.map((w, i) => (
            <div key={i} className="tp-risk-warning__item">
              <span className="tp-risk-warning__item-dot" />
              <p className="tp-risk-warning__item-text">{w}</p>
            </div>
          ))}
        </div>
        <div className="tp-risk-warning__cta">
          <span className="tp-risk-warning__cta-text">
            The optimal window for this transition is <strong>now</strong>. Start with Action #1 above.
          </span>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Outcome / ROI
// ─────────────────────────────────────────────────────────────────────────────

function OutcomeROI({ roi }) {
  if (!roi) return null;
  return (
    <Section id="outcome-roi" title="Expected Outcome &amp; ROI" tag="12">
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
// Main export — NO TABS, pure scroll story
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
    <div className="tp-report tp-report--v2">

      {/* 1. Hero — with key metrics */}
      <TalentScoreHero
        score={talent_score}
        currentRole={current_role}
        targetRole={target_role}
        confidence={transition_confidence}
        roi={outcome_roi}
        recommendation={strategic_recommendation}
      />

      {/* Report flow — continuous scroll */}
      <div className="tp-report__flow">

        {/* 2. Executive Summary */}
        <ExecutiveSummary summary={executive_summary} />

        <SectionDivider />

        {/* 3. Career DNA Snapshot (NEW) */}
        <CareerDNA
          score={talent_score}
          currentRole={current_role}
          targetRole={target_role}
          scorecards={scorecards}
          strengths={strengths}
          gaps={critical_gaps}
        />

        <SectionDivider />

        {/* 4. Transition Confidence (UPGRADED) */}
        <TransitionConfidence
          confidence={transition_confidence}
          strengths={strengths}
          gaps={critical_gaps}
        />

        <SectionDivider />

        {/* 5. Scorecards */}
        <Scorecards cards={scorecards} />

        <SectionDivider />

        {/* 6. Strengths */}
        <Strengths strengths={strengths} />

        <SectionDivider />

        {/* 7. Critical Gaps */}
        <CriticalGaps gaps={critical_gaps} />

        <SectionDivider />

        {/* 8. Market Positioning */}
        <MarketPositioning positioning={market_positioning} />

        <SectionDivider />

        {/* 9. Strategic Recommendation */}
        <StrategicRecommendation rec={strategic_recommendation} />

        <SectionDivider />

        {/* 10. Action Priorities (UPGRADED) */}
        <ActionPriorities actions={action_priorities} />

        <SectionDivider />

        {/* 11. Risk Warning (NEW) */}
        <RiskWarning
          gaps={critical_gaps}
          currentRole={current_role}
          targetRole={target_role}
        />

        <SectionDivider />

        {/* 12. Outcome / ROI */}
        <OutcomeROI roi={outcome_roi} />

      </div>
    </div>
  );
}
