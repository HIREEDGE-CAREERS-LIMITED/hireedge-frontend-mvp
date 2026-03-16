// ============================================================================
// pages/copilot.js
// HireEdge Frontend — Copilot (primary experience)
// Phase 2 will implement the full ChatWindow, InputBar, InsightsPanel.
// ============================================================================

export default function CopilotPage() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "var(--text-tertiary)",
      fontSize: "var(--text-lg)",
      fontWeight: "var(--weight-medium)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="shimmer-text" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-4)" }}>
          HireEdge Copilot
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Your AI career intelligence assistant — Phase 2
        </p>
      </div>
    </div>
  );
}
