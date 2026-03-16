// ============================================================================
// components/tools/GapExplainerCard.js
// ============================================================================

import ToolResultCard, { InfoRow } from "./ToolResultCard";

const VERDICT_STYLES = {
  easy: { bg: "rgba(16,185,129,0.1)", color: "var(--accent-400)" },
  moderate: { bg: "rgba(251,191,36,0.1)", color: "var(--amber-400)" },
  hard: { bg: "rgba(239,68,68,0.08)", color: "var(--red-400)" },
  very_hard: { bg: "rgba(239,68,68,0.15)", color: "var(--red-400)" },
  unreachable: { bg: "rgba(107,114,128,0.1)", color: "var(--text-muted)" },
};

export default function GapExplainerCard({ data }) {
  if (!data) return null;
  const { from, to, verdict, composite_score, factors, narrative, recommendations } = data;
  const vstyle = VERDICT_STYLES[verdict] || VERDICT_STYLES.moderate;

  return (
    <div className="tool-results">
      <ToolResultCard title="Transition Verdict">
        <div className="gap-verdict" style={{ background: vstyle.bg }}>
          <span className="gap-verdict__label" style={{ color: vstyle.color }}>{verdict.replace(/_/g, " ")}</span>
          <span className="gap-verdict__score">{composite_score}/100</span>
        </div>
        <InfoRow label="From" value={`${from.title} (${from.seniority})`} />
        <InfoRow label="To" value={`${to.title} (${to.seniority})`} />
      </ToolResultCard>

      <ToolResultCard title="Explanation">
        {narrative.map((line, i) => (
          <p key={i} className="tool-guidance-item">• {line}</p>
        ))}
      </ToolResultCard>

      <ToolResultCard title={`Factors (${factors.length})`}>
        {factors.map((f, i) => (
          <div key={i} className="gap-factor">
            <div className="gap-factor__header">
              <span className="gap-factor__label">{f.label.replace(/_/g, " ")}</span>
              <span className="gap-factor__weight" style={{
                color: f.weight >= 60 ? "var(--red-400)" : f.weight >= 35 ? "var(--amber-400)" : "var(--accent-400)"
              }}>{f.weight}/100</span>
            </div>
            <p className="gap-factor__explanation">{f.explanation}</p>
          </div>
        ))}
      </ToolResultCard>

      {recommendations?.length > 0 && (
        <ToolResultCard title="Recommendations">
          {recommendations.map((r, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{r.type.replace(/_/g, " ")} ({r.priority})</span>
              <p className="tool-guidance-block__text">{r.message}</p>
            </div>
          ))}
        </ToolResultCard>
      )}
    </div>
  );
}
