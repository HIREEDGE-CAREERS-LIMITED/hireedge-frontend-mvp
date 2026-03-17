// ============================================================================
// components/copilot/ActionChips.js
// HireEdge Frontend — Clickable action chips from Copilot next_actions
// ============================================================================

const TYPE_ICONS = {
  tool: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z"/>
    </svg>
  ),
  question: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14l4-1L15 4l-1-1L5 12z"/><path d="M11 5l2 2"/>
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11l4-4"/><path d="M11 11h-4V7"/>
    </svg>
  ),
};

export default function ActionChips({ actions, onAction }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="chips">
      <div className="chips__label">Suggested next steps</div>
      <div className="chips__list">
        {actions.slice(0, 4).map((action, i) => (
          <button
            key={i}
            className="chip"
            onClick={() => onAction?.(action)}
            title={action.prompt || action.label}
          >
            <span className="chip__icon">
              {TYPE_ICONS[action.type] || TYPE_ICONS.question}
            </span>
            <span className="chip__label">{action.label}</span>
            {action.type === "tool" && (
              <span className="chip__badge">API</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
