// ============================================================================
// components/tools/TalentProfileCard.js
// ============================================================================

import ToolResultCard, { ScoreBadge, TagList, InfoRow } from "./ToolResultCard";

export default function TalentProfileCard({ data }) {
  if (!data) return null;
  const { current_role, role_fitness, experience, strengths, gaps, salary_context, next_moves, best_fit_roles, target_role_analysis } = data;

  return (
    <div className="tool-results">
      <ToolResultCard title="Role Fitness">
        <ScoreBadge score={role_fitness.fitness_pct} label={role_fitness.label.replace(/_/g, " ")} />
        <InfoRow label="Matched" value={`${role_fitness.matched_count} / ${role_fitness.total_required} skills`} />
      </ToolResultCard>

      {experience && (
        <ToolResultCard title="Experience Assessment">
          <InfoRow label="Your Experience" value={`${experience.user_years} years`} />
          <InfoRow label="Typical Range" value={`${experience.role_typical.min}–${experience.role_typical.max} years`} />
          <p className="tool-advice">{experience.note}</p>
        </ToolResultCard>
      )}

      <ToolResultCard title="Strengths">
        {strengths.core_skills_held?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Core</span>
            <TagList items={strengths.core_skills_held} variant="match" />
          </div>
        )}
        {strengths.technical_skills_held?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Technical</span>
            <TagList items={strengths.technical_skills_held} variant="match" />
          </div>
        )}
        {strengths.bonus_skills?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Bonus Skills</span>
            <TagList items={strengths.bonus_skills} />
          </div>
        )}
      </ToolResultCard>

      {gaps.total_gaps > 0 && (
        <ToolResultCard title={`Gaps (${gaps.total_gaps})`}>
          {gaps.critical_gaps?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Critical</span>
              <TagList items={gaps.critical_gaps} variant="danger" />
            </div>
          )}
          {gaps.technical_missing?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Technical</span>
              <TagList items={gaps.technical_missing} variant="warn" />
            </div>
          )}
        </ToolResultCard>
      )}

      {salary_context && (
        <ToolResultCard title="Salary Context">
          <InfoRow label="Current Mean" value={`£${salary_context.current_mean?.toLocaleString()}`} />
          <InfoRow label="Category Mean" value={`£${salary_context.category_mean?.toLocaleString()}`} />
          <InfoRow label="Percentile" value={`${salary_context.percentile_in_category}th`} />
          {salary_context.best_salary_move && (
            <InfoRow label="Best Move" value={`${salary_context.best_salary_move.title} (+${salary_context.best_salary_move.growth_pct}%)`} accent />
          )}
        </ToolResultCard>
      )}

      {next_moves?.length > 0 && (
        <ToolResultCard title="Next Moves">
          {next_moves.slice(0, 5).map((m, i) => (
            <div key={i} className="tool-next-move">
              <div className="tool-next-move__title">{m.title}</div>
              <div className="tool-next-move__meta">
                {m.difficulty_label} · ~{m.estimated_years}yr · +{m.salary_growth_pct}%
                {m.readiness_pct != null && ` · ${m.readiness_pct}% ready`}
              </div>
              {m.missing_skills?.length > 0 && <TagList items={m.missing_skills} variant="warn" />}
            </div>
          ))}
        </ToolResultCard>
      )}

      {target_role_analysis && (
        <ToolResultCard title={`Target: ${target_role_analysis.title}`}>
          <ScoreBadge score={target_role_analysis.readiness_pct} label="readiness" />
          <div className="tool-subsection">
            <span className="tool-subsection__label">Missing Skills</span>
            <TagList items={target_role_analysis.missing_skills} variant="danger" />
          </div>
        </ToolResultCard>
      )}
    </div>
  );
}
