// ============================================================================
// components/tools/ResumeBlueprintCard.js
// ============================================================================

import ToolResultCard, { ScoreBadge, TagList, InfoRow } from "./ToolResultCard";

export default function ResumeBlueprintCard({ data }) {
  if (!data) return null;
  const { ats_score, keywords, skills_section, summary_guidance, experience_guidance, transition_narrative, formatting_rules } = data;

  return (
    <div className="tool-results">
      <ToolResultCard title="ATS Score">
        <ScoreBadge score={ats_score.score} label={ats_score.label} />
        <div className="tool-results__grid">
          <InfoRow label="Keyword Coverage" value={`${ats_score.breakdown.keyword_coverage_pct}%`} />
          <InfoRow label="Critical Missing" value={ats_score.breakdown.critical_skills_missing} />
          <InfoRow label="Overall Readiness" value={`${ats_score.breakdown.overall_readiness_pct}%`} />
        </div>
      </ToolResultCard>

      <ToolResultCard title="Keyword Strategy">
        <div className="tool-subsection">
          <span className="tool-subsection__label">Matched Keywords</span>
          <TagList items={keywords.matched} variant="match" />
        </div>
        {keywords.missing_critical?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Critical Missing</span>
            <TagList items={keywords.missing_critical} variant="danger" />
          </div>
        )}
        {keywords.missing_preferred?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Preferred Missing</span>
            <TagList items={keywords.missing_preferred} variant="warn" />
          </div>
        )}
        <p className="tool-advice">{keywords.keyword_density_advice}</p>
      </ToolResultCard>

      <ToolResultCard title="Professional Summary">
        {summary_guidance.elements.map((el, i) => (
          <p key={i} className="tool-guidance-item">• {el}</p>
        ))}
      </ToolResultCard>

      <ToolResultCard title="Experience Guidance">
        {experience_guidance.guidance.map((g, i) => (
          <div key={i} className="tool-guidance-block">
            <span className="tool-guidance-block__label">{g.principle.replace(/_/g, " ")}</span>
            <p className="tool-guidance-block__text">{g.detail}</p>
          </div>
        ))}
        {experience_guidance.bullet_templates?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Bullet Templates</span>
            {experience_guidance.bullet_templates.map((bt, i) => (
              <div key={i} className="tool-template">
                <span className="tool-template__skill">{bt.skill}</span>
                <span className="tool-template__text">{bt.template}</span>
              </div>
            ))}
          </div>
        )}
      </ToolResultCard>

      {transition_narrative && (
        <ToolResultCard title="Transition Narrative">
          <InfoRow label="Skill Overlap" value={`${transition_narrative.overlap_pct}%`} />
          <InfoRow label="Recommended Format" value={transition_narrative.recommended_format.replace(/_/g, " ")} />
          {transition_narrative.narrative.map((n, i) => (
            <p key={i} className="tool-guidance-item">• {n}</p>
          ))}
        </ToolResultCard>
      )}

      <ToolResultCard title="Formatting Rules" defaultOpen={false}>
        <InfoRow label="Length" value={formatting_rules.recommended_length} />
        <InfoRow label="Font" value={formatting_rules.font_guidance} />
        <div className="tool-subsection">
          <span className="tool-subsection__label">Section Order</span>
          <ol className="tool-ordered-list">
            {formatting_rules.section_order.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        <div className="tool-subsection">
          <span className="tool-subsection__label">ATS Tips</span>
          {formatting_rules.ats_tips.map((t, i) => <p key={i} className="tool-guidance-item">• {t}</p>)}
        </div>
      </ToolResultCard>
    </div>
  );
}
