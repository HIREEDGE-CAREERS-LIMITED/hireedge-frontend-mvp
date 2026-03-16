// ============================================================================
// components/tools/InterviewPrepCard.js
// ============================================================================

import ToolResultCard, { ScoreBadge, InfoRow } from "./ToolResultCard";

export default function InterviewPrepCard({ data }) {
  if (!data) return null;
  const { readiness, competency_questions, technical_questions, behavioural_questions, star_preparation, questions_to_ask, salary_negotiation, weakness_strategy } = data;

  return (
    <div className="tool-results">
      <ToolResultCard title="Interview Readiness">
        <ScoreBadge score={readiness.score} label={readiness.label.replace(/_/g, " ")} />
      </ToolResultCard>

      <ToolResultCard title={`Competency Questions (${competency_questions.length})`}>
        {competency_questions.map((q, i) => (
          <div key={i} className="tool-question">
            <div className="tool-question__header">
              <span className="tool-question__cat">{q.category.replace(/_/g, " ")}</span>
              {q.skill && <span className="tool-question__skill">{q.skill}</span>}
            </div>
            <p className="tool-question__text">{q.question}</p>
            <p className="tool-question__tip">💡 {q.preparation_tip}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title={`Technical Questions (${technical_questions.length})`}>
        {technical_questions.map((q, i) => (
          <div key={i} className="tool-question">
            <div className="tool-question__header">
              <span className={`tool-question__skill ${q.you_have_this ? "tool-question__skill--have" : "tool-question__skill--miss"}`}>
                {q.skill} {q.you_have_this ? "✓" : "✗"}
              </span>
            </div>
            <p className="tool-question__text">{q.question}</p>
            <p className="tool-question__tip">💡 {q.preparation_tip}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title={`Behavioural Questions (${behavioural_questions.length})`}>
        {behavioural_questions.map((q, i) => (
          <div key={i} className="tool-question">
            <span className="tool-question__cat">{q.category.replace(/_/g, " ")}</span>
            <p className="tool-question__text">{q.question}</p>
            <p className="tool-question__meta">Framework: {q.framework}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title="STAR Preparation">
        <p className="tool-advice">{star_preparation.framework_summary}</p>
        {star_preparation.stories_to_prepare.map((s, i) => (
          <div key={i} className="tool-star">
            <div className="tool-star__header">
              <span className="tool-star__skill">{s.skill}</span>
              <span className={s.you_have_this ? "tool-tag--match" : "tool-tag--danger"}>{s.you_have_this ? "You have this" : "Gap"}</span>
            </div>
            <div className="tool-star__grid">
              <div><strong>S:</strong> {s.situation}</div>
              <div><strong>T:</strong> {s.task}</div>
              <div><strong>A:</strong> {s.action}</div>
              <div><strong>R:</strong> {s.result}</div>
            </div>
            <p className="tool-question__tip">💡 {s.preparation_note}</p>
          </div>
        ))}
      </ToolResultCard>

      <ToolResultCard title={`Questions to Ask (${questions_to_ask.length})`} defaultOpen={false}>
        {questions_to_ask.map((q, i) => (
          <div key={i} className="tool-question">
            <span className="tool-question__cat">{q.category.replace(/_/g, " ")}</span>
            <p className="tool-question__text">{q.question}</p>
            <p className="tool-question__meta">{q.rationale}</p>
          </div>
        ))}
      </ToolResultCard>

      {salary_negotiation && (
        <ToolResultCard title="Salary Negotiation" defaultOpen={false}>
          <InfoRow label="Range" value={`£${salary_negotiation.target_range.min.toLocaleString()} – £${salary_negotiation.target_range.max.toLocaleString()}`} />
          <InfoRow label="Mean" value={`£${salary_negotiation.target_range.mean.toLocaleString()}`} accent />
          <InfoRow label="Conservative Ask" value={`£${salary_negotiation.recommended_ask.conservative.toLocaleString()}`} />
          <InfoRow label="Target Ask" value={`£${salary_negotiation.recommended_ask.target.toLocaleString()}`} accent />
          <InfoRow label="Ambitious Ask" value={`£${salary_negotiation.recommended_ask.ambitious.toLocaleString()}`} />
          <div className="tool-subsection">
            {salary_negotiation.negotiation_tips.map((t, i) => <p key={i} className="tool-guidance-item">• {t}</p>)}
          </div>
        </ToolResultCard>
      )}

      {weakness_strategy?.length > 0 && (
        <ToolResultCard title="Weakness Strategy" defaultOpen={false}>
          {weakness_strategy.map((w, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{w.weakness}</span>
              <p className="tool-guidance-block__text">{w.reframe}</p>
              <p className="tool-question__meta">{w.principle}</p>
            </div>
          ))}
        </ToolResultCard>
      )}
    </div>
  );
}
