// ============================================================================
// components/tools/RoadmapCard.js
// HireEdge Frontend — Career Roadmap (Production v2)
//
// Handles three states:
//   1. reachable=true   — full enriched path
//   2. bridge_mode=true, reachable=true  — path via intermediary bridge role
//   3. reachable=false  — no graph path; show adjacent roles + alternatives
// ============================================================================

import ToolResultCard, { InfoRow, TagList } from "./ToolResultCard";

function FeasBadge({ label }) {
  const map = {
    "very achievable":  "badge--green",
    "achievable":       "badge--green",
    "challenging":      "badge--amber",
    "ambitious":        "badge--amber",
    "unconventional":   "badge--red",
  };
  return <span className={`badge ${map[label] || "badge--mid"}`}>{label}</span>;
}

function DiffBadge({ label }) {
  const map = { easy: "badge--green", moderate: "badge--amber", hard: "badge--red", very_hard: "badge--red" };
  return <span className={`badge ${map[label] || "badge--mid"}`}>{label}</span>;
}

function RoadmapStep({ step }) {
  return (
    <div className={["roadmap-step", step.is_current ? "roadmap-step--current" : "", step.is_target ? "roadmap-step--target" : ""].join(" ").trim()}>
      <div className="roadmap-step__num">{step.step}</div>
      <div className="roadmap-step__content">
        <div className="roadmap-step__title">{step.title}</div>
        <div className="roadmap-step__meta">
          {step.category} · {step.seniority}
          {step.salary?.mean ? ` · £${step.salary.mean.toLocaleString()}` : ""}
          {step.is_current ? " · You are here" : ""}
          {step.is_target  ? " · Target" : ""}
        </div>
        {step.transition_in && (
          <div className="roadmap-step__transition">
            <DiffBadge label={step.transition_in.difficulty_label} />
            <span>~{step.transition_in.estimated_years}yr</span>
            {step.transition_in.salary_growth_pct != null && (
              <span className="roadmap-step__growth">
                {step.transition_in.salary_growth_pct >= 0 ? "+" : ""}{step.transition_in.salary_growth_pct}%
              </span>
            )}
          </div>
        )}
        {step.skills_gap_to_next?.new_needed_count > 0 && (
          <div className="roadmap-step__gap">
            <span className="tool-subsection__label">Skills for next step</span>
            <TagList items={step.skills_gap_to_next.new_skills_needed.slice(0, 6)} variant="warn" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapCard({ data }) {
  if (!data) return null;

  const {
    from, to,
    ai = {},
    steps = [],
    summary,
    alternatives = [],
    bridge_mode,
    bridge_role,
    adjacent_from = [],
    adjacent_to   = [],
  } = data;

  const {
    feasibility,
    top_blockers           = [],
    first_3_actions        = [],
    transferable_strengths = [],
    salary_direction,
    realistic_timeline,
  } = ai;

  return (
    <div className="tool-results">

      {/* Journey strip */}
      <div className="edgex-strip edgex-strip--roadmap">
        <div className="edgex-strip__journey">
          <span className="edgex-strip__from">{from?.title}</span>
          <span className="edgex-strip__arrow">→</span>
          <span className="edgex-strip__to">{to?.title}</span>
        </div>
        {feasibility && (
          <div className="edgex-strip__tags" style={{ marginTop: "0.5rem" }}>
            <FeasBadge label={feasibility.label} />
            {bridge_role && <span className="badge badge--mid">via {bridge_role.title}</span>}
          </div>
        )}
        {feasibility?.headline && <p className="edgex-strip__sub" style={{ marginTop: "0.5rem" }}>{feasibility.headline}</p>}
      </div>

      {/* No direct path */}
      {!data.reachable && bridge_mode && (
        <ToolResultCard title="No Direct Path — Here's What To Do" defaultOpen>
          <div className="tool-guidance-block tool-guidance-block--info">
            <span className="tool-guidance-block__label">Why this happens</span>
            <p className="tool-guidance-block__text">
              {feasibility?.why || `A direct path from ${from?.title} to ${to?.title} doesn't exist in the HireEdge dataset. This doesn't mean the move is impossible — it means you'll need a stepping-stone route. Use the alternatives and adjacent roles below.`}
            </p>
          </div>
          {adjacent_from.length > 0 && (
            <div className="tool-subsection" style={{ marginTop: "1rem" }}>
              <span className="tool-subsection__label">Roles you can move to from {from?.title}</span>
              <div className="roadmap-adj">{adjacent_from.map((r) => <span key={r.slug} className="roadmap-adj__node">{r.title}</span>)}</div>
            </div>
          )}
          {adjacent_to.length > 0 && (
            <div className="tool-subsection" style={{ marginTop: "0.75rem" }}>
              <span className="tool-subsection__label">Roles that lead into {to?.title}</span>
              <div className="roadmap-adj">{adjacent_to.map((r) => <span key={r.slug} className="roadmap-adj__node">{r.title}</span>)}</div>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* Summary (reachable) */}
      {data.reachable && summary && (
        <ToolResultCard title={bridge_role ? `Route via ${bridge_role.title}` : "Roadmap Summary"} defaultOpen>
          <div className="tool-results__grid">
            <InfoRow label="Steps"            value={summary.total_steps} />
            <InfoRow label="Estimated time"   value={`~${summary.total_estimated_years} years`} />
            {summary.salary_growth_pct != null && <InfoRow label="Salary growth" value={`${summary.salary_growth_pct >= 0 ? "+" : ""}${summary.salary_growth_pct}%`} accent />}
            {summary.total_difficulty && <InfoRow label="Total difficulty" value={`${summary.total_difficulty} (avg ${summary.avg_difficulty_per_step}/step)`} />}
            {summary.total_new_skills_across_path > 0 && <InfoRow label="New skills needed" value={summary.total_new_skills_across_path} />}
            {summary.category_changes > 0 && <InfoRow label="Category changes" value={summary.category_changes} />}
          </div>
          {bridge_role && (
            <div className="tool-guidance-block" style={{ marginTop: "1rem" }}>
              <span className="tool-guidance-block__label">Bridge route</span>
              <p className="tool-guidance-block__text">No direct path exists. The best available route goes via <strong>{bridge_role.title}</strong>.</p>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <ToolResultCard title="Step-by-Step Path" defaultOpen>
          <div className="roadmap-steps">
            {steps.map((step, i) => (
              <div key={step.slug || i}>
                {i > 0 && <div className="roadmap-arrow">↓</div>}
                <RoadmapStep step={step} />
              </div>
            ))}
          </div>
        </ToolResultCard>
      )}

      {/* AI transition analysis */}
      {feasibility?.why && data.reachable && (
        <ToolResultCard title="Transition Analysis" defaultOpen>
          <p className="tool-guidance-block__text">{feasibility.why}</p>
        </ToolResultCard>
      )}

      {/* Blockers */}
      {top_blockers.length > 0 && (
        <ToolResultCard title="Top Blockers" defaultOpen>
          {top_blockers.map((b, i) => (
            <div key={i} className="tool-guidance-block tool-guidance-block--warn">
              <p className="tool-guidance-block__text">⚡ {b}</p>
            </div>
          ))}
        </ToolResultCard>
      )}

      {/* First 3 actions */}
      {first_3_actions.length > 0 && (
        <ToolResultCard title="Your First 3 Actions" defaultOpen>
          {first_3_actions.map((a, i) => (
            <div key={i} className="action-item">
              <div className="action-item__num">{i + 1}</div>
              <div className="action-item__body">
                <div className="action-item__action">{a.action}</div>
                <div className="action-item__meta">{a.timeframe}</div>
                <div className="action-item__why">{a.why}</div>
              </div>
            </div>
          ))}
        </ToolResultCard>
      )}

      {/* Transferable strengths */}
      {transferable_strengths.length > 0 && (
        <ToolResultCard title="Transferable Strengths" defaultOpen>
          {transferable_strengths.map((s, i) => <p key={i} className="tool-guidance-item">✓ {s}</p>)}
        </ToolResultCard>
      )}

      {/* Salary + timeline */}
      {(salary_direction || realistic_timeline) && (
        <ToolResultCard title="Salary & Timeline" defaultOpen={false}>
          {salary_direction && (
            <div className="tool-guidance-block">
              <span className="tool-guidance-block__label">Salary direction</span>
              <p className="tool-guidance-block__text">{salary_direction}</p>
            </div>
          )}
          {realistic_timeline && (
            <div className="tool-guidance-block">
              <span className="tool-guidance-block__label">Realistic timeline</span>
              <p className="tool-guidance-block__text">{realistic_timeline}</p>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <ToolResultCard title="Alternative Routes" defaultOpen={!data.reachable}>
          {alternatives.map((alt, i) => (
            <div key={i} className="roadmap-alt">
              <div className="roadmap-alt__header">
                {alt.title
                  ? `${alt.title} (${alt.seniority || ""}) — ${alt.total_steps} steps · ~${alt.total_years}yr${alt.salary_growth_pct != null ? ` · ${alt.salary_growth_pct >= 0 ? "+" : ""}${alt.salary_growth_pct}%` : ""}`
                  : `Route ${i + 2}: ${alt.steps || alt.total_steps} steps · ~${alt.total_years}yr`}
              </div>
              {alt.path && (
                <div className="roadmap-alt__path">
                  {alt.path.map((slug, j) => (
                    <span key={slug}>
                      {j > 0 && <span className="roadmap-alt__arrow">→</span>}
                      <span className="roadmap-alt__node">{slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ToolResultCard>
      )}

    </div>
  );
}
