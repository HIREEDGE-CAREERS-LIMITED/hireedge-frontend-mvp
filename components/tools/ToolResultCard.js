// ============================================================================
// components/tools/ToolResultCard.js
// HireEdge Frontend — Generic result section wrapper
// ============================================================================

export default function ToolResultCard({ title, children, collapsible, defaultOpen }) {
  return (
    <details className="tool-result" open={defaultOpen !== false}>
      <summary className="tool-result__header">
        <h3 className="tool-result__title">{title}</h3>
        <span className="tool-result__toggle">▾</span>
      </summary>
      <div className="tool-result__body">{children}</div>
    </details>
  );
}

export function ScoreBadge({ score, label, max = 100 }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const color = pct >= 70 ? "var(--accent-400)" : pct >= 40 ? "var(--amber-400)" : "var(--red-400)";
  return (
    <div className="score-badge">
      <div className="score-badge__bar">
        <div className="score-badge__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-badge__value" style={{ color }}>{score}/{max}</span>
      {label && <span className="score-badge__label">{label}</span>}
    </div>
  );
}

export function TagList({ items, variant }) {
  if (!items?.length) return null;
  return (
    <div className="tool-tags">
      {items.map((item, i) => (
        <span key={i} className={`tool-tag ${variant ? `tool-tag--${variant}` : ""}`}>
          {typeof item === "string" ? item : item.skill || item.label || item}
        </span>
      ))}
    </div>
  );
}

export function InfoRow({ label, value, accent }) {
  return (
    <div className="tool-info-row">
      <span className="tool-info-row__label">{label}</span>
      <span className={`tool-info-row__value ${accent ? "tool-info-row__value--accent" : ""}`}>{value}</span>
    </div>
  );
}
