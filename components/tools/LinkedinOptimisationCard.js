// ============================================================================
// components/tools/LinkedinOptimisationCard.js
// ============================================================================

import ToolResultCard, { ScoreBadge, TagList, InfoRow } from "./ToolResultCard";

export default function LinkedinOptimisationCard({ data }) {
  if (!data) return null;
  const { strength_score, headlines, about_section, skills_strategy, keyword_strategy, experience_tips, featured_section } = data;

  return (
    <div className="tool-results">
      <ToolResultCard title="Profile Strength">
        <ScoreBadge score={strength_score.score} label={strength_score.label.replace(/_/g, " ")} />
        <div className="tool-results__grid">
          {Object.entries(strength_score.breakdown).map(([k, v]) => (
            <InfoRow key={k} label={k.replace(/_/g, " ")} value={`${v}/20`} />
          ))}
        </div>
      </ToolResultCard>

      <ToolResultCard title="Headline Variants">
        {headlines.map((h, i) => (
          <div key={i} className="tool-headline">
            <div className="tool-headline__badge">{h.style}</div>
            <p className="tool-headline__text">{h.headline}</p>
            <p className="tool-headline__rationale">{h.rationale}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title="About Section Blueprint">
        <p className="tool-advice">{about_section.recommended_length}</p>
        {about_section.paragraphs.map((para, i) => (
          <div key={i} className="tool-guidance-block">
            <span className="tool-guidance-block__label">{para.label} ({para.length})</span>
            <p className="tool-guidance-block__text">{para.guidance}</p>
          </div>
        ))}
        <div className="tool-subsection">
          <span className="tool-subsection__label">Tips</span>
          {about_section.formatting_tips.map((t, i) => <p key={i} className="tool-guidance-item">• {t}</p>)}
        </div>
      </ToolResultCard>

      <ToolResultCard title="Skills Strategy">
        <div className="tool-subsection">
          <span className="tool-subsection__label">Pin These Top 3</span>
          <TagList items={skills_strategy.top_3} variant="match" />
        </div>
        <InfoRow label="Total Skills Used" value={`${skills_strategy.used_slots}/50 slots`} />
        <p className="tool-advice">{skills_strategy.advice}</p>
      </ToolResultCard>

      <ToolResultCard title="Keyword Strategy" defaultOpen={false}>
        <div className="tool-subsection">
          <span className="tool-subsection__label">Primary Keywords</span>
          <TagList items={keyword_strategy.primary} />
        </div>
        {keyword_strategy.industry?.length > 0 && (
          <div className="tool-subsection">
            <span className="tool-subsection__label">Industry</span>
            <TagList items={keyword_strategy.industry} />
          </div>
        )}
      </ToolResultCard>

      <ToolResultCard title="Experience Tips" defaultOpen={false}>
        {experience_tips.map((tip, i) => (
          <div key={i} className="tool-guidance-block">
            <span className="tool-guidance-block__label">{tip.area.replace(/_/g, " ")}</span>
            <p className="tool-guidance-block__text">{tip.advice}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title="Featured Section" defaultOpen={false}>
        {featured_section.map((rec, i) => (
          <div key={i} className="tool-guidance-block">
            <span className="tool-guidance-block__label">{rec.type.replace(/_/g, " ")}</span>
            <p className="tool-guidance-block__text">{rec.advice}</p>
          </div>
        ))}
      </ToolResultCard>
    </div>
  );
}
