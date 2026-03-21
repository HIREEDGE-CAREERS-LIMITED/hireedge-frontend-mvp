// ============================================================================
// components/tools/RoadmapCard.js
// HireEdge — Career Roadmap Result Card (Production v3)
//
// Section order (highest value first):
//   1. Journey header — from → to, feasibility, timeline
//   2. This week — 3 immediate actions
//   3. Recommended path — phased 0–3 / 3–6 / 6–12 month accordion
//   4. Key gaps — structured gap cards
//   5. Strengths to leverage — strength + how-to cards
//   6. Alternative paths — 3 named route cards
//   7. Graph steps — engine data, collapsed by default
//   8. Salary & timeline — supporting detail
// ============================================================================

import { useState } from "react";
import ToolResultCard, { TagList, InfoRow } from "./ToolResultCard";

// ─────────────────────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────────────────────

function FeasBadge({ label }) {
  const colour = {
    "very achievable": "badge--green",
    "achievable":      "badge--green",
    "challenging":     "badge--amber",
    "ambitious":       "badge--amber",
    "unconventional":  "badge--red",
  }[label] || "badge--mid";
  return <span className={`badge ${colour}`}>{label}</span>;
}

function DiffBadge({ label }) {
  const colour = { easy: "badge--green", moderate: "badge--amber", hard: "badge--red", very_hard: "badge--red" }[label] || "badge--mid";
  return <span className={`badge ${colour}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Journey header strip
// ─────────────────────────────────────────────────────────────────────────────

function JourneyStrip({ from, to, feasibility, recommendedPath }) {
  return (
    <div className="rm-journey">
      <div className="rm-journey__route">
        <span className="rm-journey__role rm-journey__role--from">{from?.title}</span>
        <div className="rm-journey__arrow-wrap">
          <svg className="rm-journey__arrow-line" viewBox="0 0 80 12" fill="none">
            <line x1="0" y1="6" x2="68" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
            <polyline points="62,2 72,6 62,10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <span className="rm-journey__role rm-journey__role--to">{to?.title}</span>
      </div>

      <div className="rm-journey__meta">
        {feasibility?.label && <FeasBadge label={feasibility.label} />}
        {recommendedPath?.total_timeline && (
          <span className="rm-journey__timeline">⏱ {recommendedPath.total_timeline}</span>
        )}
        {recommendedPath?.label && (
          <span className="rm-journey__strat">{recommendedPath.label}</span>
        )}
      </div>

      {feasibility?.headline && (
        <p className="rm-journey__headline">{feasibility.headline}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// This week — immediate actions
// ─────────────────────────────────────────────────────────────────────────────

function ThisWeekSection({ actions }) {
  if (!actions?.length) return null;
  return (
    <ToolResultCard title="What to do this week" defaultOpen={true}>
      <p className="rm-hint">Three actions you can start today. Don't move on until these are done.</p>
      <div className="rm-week-grid">
        {actions.map((a, i) => (
          <div key={i} className="rm-week-card">
            <div className="rm-week-card__num">{i + 1}</div>
            <div className="rm-week-card__body">
              <div className="rm-week-card__action">{a.action}</div>
              <div className="rm-week-card__detail">{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended path — phased plan
// ─────────────────────────────────────────────────────────────────────────────

function PhaseBlock({ phase, index, isLast }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`rm-phase ${open ? "rm-phase--open" : ""}`}>
      <button className="rm-phase__header" onClick={() => setOpen((o) => !o)}>
        <div className="rm-phase__header-left">
          <span className="rm-phase__label">{phase.label}</span>
          <span className="rm-phase__title">{phase.title}</span>
        </div>
        <div className="rm-phase__header-right">
          <span className="rm-phase__goal-short">{phase.goal}</span>
          <span className="rm-phase__chevron">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="rm-phase__body">
          <p className="rm-phase__goal">{phase.goal}</p>

          {phase.actions?.length > 0 && (
            <div className="rm-phase__actions">
              {phase.actions.map((a, i) => (
                <div key={i} className="rm-phase__action">
                  <div className="rm-phase__action-bullet" />
                  <div className="rm-phase__action-body">
                    <div className="rm-phase__action-text">{a.action}</div>
                    {a.detail && <div className="rm-phase__action-detail">{a.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {phase.skills_focus?.length > 0 && (
            <div className="rm-phase__skills">
              <span className="rm-phase__skills-label">Focus skills</span>
              <div className="rm-phase__skills-tags">
                {phase.skills_focus.map((s, i) => (
                  <span key={i} className="rm-skill-tag">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLast && <div className="rm-phase__connector" />}
    </div>
  );
}

function RecommendedPathSection({ path }) {
  if (!path?.phases?.length) return null;
  return (
    <ToolResultCard title="Recommended Path" defaultOpen={true}>
      <div className="rm-path-header">
        <div>
          <span className="rm-path-label">{path.label}</span>
          <p className="rm-path-headline">{path.headline}</p>
        </div>
        <div className="rm-path-meta">
          {path.total_timeline && <span className="rm-path-timeline">{path.total_timeline}</span>}
          {path.difficulty && <FeasBadge label={path.difficulty} />}
        </div>
      </div>

      <div className="rm-phases">
        {path.phases.map((phase, i) => (
          <PhaseBlock key={i} phase={phase} index={i} isLast={i === path.phases.length - 1} />
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Key gaps
// ─────────────────────────────────────────────────────────────────────────────

function GapsSection({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <ToolResultCard title="Key Gaps to Close" defaultOpen={true}>
      <p className="rm-hint">These are the specific things hiring managers will probe in interviews. Address them before you apply.</p>
      <div className="rm-gaps">
        {gaps.map((g, i) => (
          <div key={i} className="rm-gap">
            <div className="rm-gap__header">
              <span className="rm-gap__num">{i + 1}</span>
              <span className="rm-gap__name">{g.gap}</span>
            </div>
            <div className="rm-gap__body">
              <div className="rm-gap__row">
                <span className="rm-gap__field">Why it matters</span>
                <span className="rm-gap__value">{g.why_it_matters}</span>
              </div>
              <div className="rm-gap__row rm-gap__row--action">
                <span className="rm-gap__field">How to close it</span>
                <span className="rm-gap__value">{g.how_to_close}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Strengths to leverage
// ─────────────────────────────────────────────────────────────────────────────

function StrengthsSection({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <ToolResultCard title="Strengths to Leverage" defaultOpen={true}>
      <p className="rm-hint">These are your competitive advantages. Use them to differentiate yourself from candidates who came up through a traditional PM path.</p>
      <div className="rm-strengths">
        {strengths.map((s, i) => (
          <div key={i} className="rm-strength">
            <div className="rm-strength__icon">✓</div>
            <div className="rm-strength__body">
              <div className="rm-strength__name">{s.strength}</div>
              <div className="rm-strength__how">{s.how_to_use}</div>
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Alternative paths
// ─────────────────────────────────────────────────────────────────────────────

function AltPathsSection({ paths, aiPaths, fromTitle, toTitle }) {
  // Prefer AI-generated paths; fall back to graph alternatives
  const displayPaths = aiPaths?.length > 0 ? aiPaths : _formatGraphAlts(paths, fromTitle, toTitle);
  if (!displayPaths?.length) return null;

  return (
    <ToolResultCard title="Alternative Paths" defaultOpen={false}>
      <div className="rm-alt-paths">
        {displayPaths.map((p, i) => (
          <div key={i} className="rm-alt-path">
            <div className="rm-alt-path__header">
              <span className="rm-alt-path__label">{p.label}</span>
              {p.timeline && <span className="rm-alt-path__time">⏱ {p.timeline}</span>}
            </div>

            {p.headline && <p className="rm-alt-path__headline">{p.headline}</p>}

            {p.route?.length > 0 && (
              <div className="rm-alt-path__route">
                {p.route.map((r, j) => (
                  <span key={j} className="rm-alt-path__route-wrap">
                    {j > 0 && <span className="rm-alt-path__arrow">→</span>}
                    <span className={`rm-alt-path__node ${j === 0 ? "rm-alt-path__node--from" : j === p.route.length - 1 ? "rm-alt-path__node--to" : "rm-alt-path__node--mid"}`}>
                      {r}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {(p.trade_off || p.best_for) && (
              <div className="rm-alt-path__detail">
                {p.trade_off && (
                  <div className="rm-alt-path__row">
                    <span className="rm-alt-path__field">Trade-off</span>
                    <span className="rm-alt-path__value">{p.trade_off}</span>
                  </div>
                )}
                {p.best_for && (
                  <div className="rm-alt-path__row">
                    <span className="rm-alt-path__field">Best for</span>
                    <span className="rm-alt-path__value">{p.best_for}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

function _formatGraphAlts(alts, fromTitle, toTitle) {
  if (!alts?.length) return [];
  return alts.map((a, i) => ({
    label:    i === 0 ? "Alternative route" : `Route via ${a.title}`,
    headline: `Reach ${a.title || toTitle} in ~${a.total_years} year${a.total_years !== 1 ? "s" : ""}`,
    route:    [fromTitle, a.title].filter(Boolean),
    timeline: `~${a.total_years}yr`,
    trade_off:null,
    best_for: null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph steps (engine data — collapsed by default)
// ─────────────────────────────────────────────────────────────────────────────

function GraphStepNode({ step }) {
  return (
    <div className={`rm-graph-step ${step.is_current ? "rm-graph-step--current" : ""} ${step.is_target ? "rm-graph-step--target" : ""}`}>
      <div className="rm-graph-step__num">{step.step}</div>
      <div className="rm-graph-step__body">
        <div className="rm-graph-step__title">
          {step.title}
          {step.is_current && <span className="rm-graph-step__tag rm-graph-step__tag--you">You are here</span>}
          {step.is_target  && <span className="rm-graph-step__tag rm-graph-step__tag--target">Target</span>}
        </div>
        <div className="rm-graph-step__meta">
          {step.category} · {step.seniority}
          {step.salary?.mean ? ` · £${step.salary.mean.toLocaleString()}` : ""}
        </div>
        {step.transition_in && (
          <div className="rm-graph-step__transition">
            <DiffBadge label={step.transition_in.difficulty_label} />
            <span>~{step.transition_in.estimated_years}yr</span>
            {step.transition_in.salary_growth_pct != null && (
              <span className={step.transition_in.salary_growth_pct >= 0 ? "rm-graph-step__growth--up" : "rm-graph-step__growth--down"}>
                {step.transition_in.salary_growth_pct >= 0 ? "+" : ""}{step.transition_in.salary_growth_pct}%
              </span>
            )}
          </div>
        )}
        {step.skills_gap_to_next?.new_skills_needed?.length > 0 && (
          <TagList items={step.skills_gap_to_next.new_skills_needed.slice(0, 5)} variant="warn" />
        )}
      </div>
    </div>
  );
}

function GraphStepsSection({ steps, summary, bridgeRole }) {
  if (!steps?.length) return null;
  return (
    <ToolResultCard title="Step-by-Step Graph Path" defaultOpen={false}>
      {summary && (
        <div className="rm-summary-grid">
          <InfoRow label="Steps"         value={summary.total_steps} />
          <InfoRow label="Est. time"     value={`~${summary.total_estimated_years} years`} />
          {summary.salary_growth_pct != null && (
            <InfoRow label="Salary Δ" value={`${summary.salary_growth_pct >= 0 ? "+" : ""}${summary.salary_growth_pct}%`} accent />
          )}
          {summary.total_new_skills_across_path > 0 && (
            <InfoRow label="New skills" value={summary.total_new_skills_across_path} />
          )}
        </div>
      )}
      {bridgeRole && (
        <div className="rm-bridge-note">
          Path runs via <strong>{bridgeRole.title}</strong> — no direct route exists in the graph.
        </div>
      )}
      <div className="rm-graph-steps">
        {steps.map((step, i) => (
          <div key={step.slug || i}>
            {i > 0 && <div className="rm-graph-step__connector" />}
            <GraphStepNode step={step} />
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Salary & timeline
// ─────────────────────────────────────────────────────────────────────────────

function SalarySection({ trajectory, feasibility }) {
  if (!trajectory && !feasibility?.why) return null;
  return (
    <ToolResultCard title="Salary & Timeline" defaultOpen={false}>
      {trajectory && (
        <div className="rm-salary-row">
          <div className="rm-salary-band">
            <span className="rm-salary-band__label">Current range</span>
            <span className="rm-salary-band__value">{trajectory.current}</span>
          </div>
          <div className="rm-salary-arrow">→</div>
          <div className="rm-salary-band rm-salary-band--target">
            <span className="rm-salary-band__label">Target range</span>
            <span className="rm-salary-band__value">{trajectory.target}</span>
          </div>
        </div>
      )}
      {trajectory?.note && <p className="rm-salary-note">{trajectory.note}</p>}
      {feasibility?.why && (
        <div className="rm-feasibility-detail">
          <span className="rm-feasibility-detail__label">Transition analysis</span>
          <p className="rm-feasibility-detail__text">{feasibility.why}</p>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// No-path fallback
// ─────────────────────────────────────────────────────────────────────────────

function NoPathSection({ from, to, adjacentFrom, adjacentTo, feasibility }) {
  return (
    <ToolResultCard title="No Direct Path Found" defaultOpen={true}>
      <div className="rm-no-path">
        <p className="rm-no-path__explain">
          {feasibility?.why || `A direct graph path from ${from?.title} to ${to?.title} doesn't exist in the dataset. This doesn't mean it's impossible — it means you'll need a stepping-stone route.`}
        </p>
        {adjacentFrom?.length > 0 && (
          <div className="rm-no-path__section">
            <span className="rm-no-path__label">Roles you can reach from {from?.title}</span>
            <div className="rm-no-path__nodes">
              {adjacentFrom.map((r) => <span key={r.slug} className="rm-adj-node">{r.title}</span>)}
            </div>
          </div>
        )}
        {adjacentTo?.length > 0 && (
          <div className="rm-no-path__section">
            <span className="rm-no-path__label">Roles that lead into {to?.title}</span>
            <div className="rm-no-path__nodes">
              {adjacentTo.map((r) => <span key={r.slug} className="rm-adj-node">{r.title}</span>)}
            </div>
          </div>
        )}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function RoadmapCard({ data }) {
  if (!data) return null;

  const {
    from, to,
    reachable, bridge_mode, bridge_role,
    steps = [], summary, alternatives = [],
    adjacent_from = [], adjacent_to = [],
    ai = {},
  } = data;

  const {
    feasibility,
    recommended_path,
    alternative_paths  = [],
    strengths_to_leverage = [],
    gaps_to_close      = [],
    this_week          = [],
    salary_trajectory,
  } = ai;

  return (
    <div className="tool-results">

      {/* ── 1. Journey header ─────────────────────────────────────────────── */}
      <JourneyStrip
        from={from}
        to={to}
        feasibility={feasibility}
        recommendedPath={recommended_path}
      />

      {/* ── No path fallback ──────────────────────────────────────────────── */}
      {!reachable && bridge_mode && !steps.length && (
        <NoPathSection
          from={from} to={to}
          adjacentFrom={adjacent_from}
          adjacentTo={adjacent_to}
          feasibility={feasibility}
        />
      )}

      {/* ── 2. This week ──────────────────────────────────────────────────── */}
      <ThisWeekSection actions={this_week} />

      {/* ── 3. Recommended path — phased ──────────────────────────────────── */}
      <RecommendedPathSection path={recommended_path} />

      {/* ── 4. Key gaps ───────────────────────────────────────────────────── */}
      <GapsSection gaps={gaps_to_close} />

      {/* ── 5. Strengths to leverage ──────────────────────────────────────── */}
      <StrengthsSection strengths={strengths_to_leverage} />

      {/* ── 6. Alternative paths ──────────────────────────────────────────── */}
      <AltPathsSection
        paths={alternatives}
        aiPaths={alternative_paths}
        fromTitle={from?.title}
        toTitle={to?.title}
      />

      {/* ── 7. Graph steps (engine detail) ────────────────────────────────── */}
      <GraphStepsSection steps={steps} summary={summary} bridgeRole={bridge_role} />

      {/* ── 8. Salary & timeline ──────────────────────────────────────────── */}
      <SalarySection trajectory={salary_trajectory} feasibility={feasibility} />

    </div>
  );
}
