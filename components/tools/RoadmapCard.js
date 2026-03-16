// ============================================================================
// components/tools/RoadmapCard.js
// ============================================================================

import ToolResultCard, { InfoRow, TagList } from "./ToolResultCard";

export default function RoadmapCard({ data }) {
  if (!data) return null;
  if (!data.reachable) {
    return (
      <div className="tool-results">
        <div className="tool-result__empty">
          No career path found between <strong>{data.from?.title}</strong> and <strong>{data.to?.title}</strong>.
          This would be an unconventional transition.
        </div>
      </div>
    );
  }

  const { summary, steps, alternatives } = data;

  return (
    <div className="tool-results">
      <ToolResultCard title="Roadmap Summary">
        <div className="tool-results__grid">
          <InfoRow label="Steps" value={summary.total_steps} />
          <InfoRow label="Estimated Time" value={`~${summary.total_estimated_years} years`} />
          <InfoRow label="Salary Growth" value={`+${summary.salary_growth_pct}%`} accent />
          <InfoRow label="Total Difficulty" value={`${summary.total_difficulty} (avg ${summary.avg_difficulty_per_step}/step)`} />
          <InfoRow label="New Skills Needed" value={summary.total_new_skills_across_path} />
          {summary.category_changes > 0 && <InfoRow label="Category Changes" value={summary.category_changes} />}
        </div>
      </ToolResultCard>

      <ToolResultCard title="Step-by-Step Path">
        <div className="roadmap-steps">
          {steps.map((step, i) => (
            <div key={step.slug} className={`roadmap-step ${step.is_current ? "roadmap-step--current" : ""} ${step.is_target ? "roadmap-step--target" : ""}`}>
              <div className="roadmap-step__num">{step.step}</div>
              <div className="roadmap-step__content">
                <div className="roadmap-step__title">{step.title}</div>
                <div className="roadmap-step__meta">
                  {step.category} · {step.seniority}
                  {step.salary && ` · £${step.salary.mean?.toLocaleString()}`}
                </div>

                {step.transition_in && (
                  <div className="roadmap-step__transition">
                    <span className={`roadmap-step__diff roadmap-step__diff--${step.transition_in.difficulty_label}`}>
                      {step.transition_in.difficulty_label}
                    </span>
                    <span>~{step.transition_in.estimated_years}yr</span>
                    <span>+{step.transition_in.salary_growth_pct}%</span>
                  </div>
                )}

                {step.skills_gap_to_next && step.skills_gap_to_next.new_needed_count > 0 && (
                  <div className="roadmap-step__gap">
                    <span className="tool-subsection__label">Skills to learn for next step</span>
                    <TagList items={step.skills_gap_to_next.new_skills_needed} variant="warn" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ToolResultCard>

      {alternatives?.length > 0 && (
        <ToolResultCard title="Alternative Routes" defaultOpen={false}>
          {alternatives.map((alt, i) => (
            <div key={i} className="roadmap-alt">
              <div className="roadmap-alt__header">
                Route {i + 2}: {alt.steps} steps · ~{alt.total_years}yr · +{alt.salary_growth_pct}%
              </div>
              <div className="roadmap-alt__path">
                {alt.path.map((slug, j) => (
                  <span key={slug}>
                    {j > 0 && <span className="roadmap-alt__arrow">→</span>}
                    <span className="roadmap-alt__node">{slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </ToolResultCard>
      )}
    </div>
  );
}
