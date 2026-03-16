// ============================================================================
// components/tools/ToolShell.js
// HireEdge Frontend — Shared tool page shell
// ============================================================================

export default function ToolShell({ title, description, icon, badge, children }) {
  return (
    <div className="tool-shell">
      <div className="tool-shell__header">
        {icon && <span className="tool-shell__icon">{icon}</span>}
        <div>
          <div className="tool-shell__title-row">
            <h1 className="tool-shell__title">{title}</h1>
            {badge && <span className="tool-shell__badge">{badge}</span>}
          </div>
          {description && <p className="tool-shell__desc">{description}</p>}
        </div>
      </div>
      <div className="tool-shell__body">{children}</div>
    </div>
  );
}
