// components/FlowPanelClean.js
// Clean flow panel — no dependency on existing mkt-flow-panel CSS.
// All styles are inline to guarantee rendering regardless of CSS cascade.

export default function FlowPanelClean() {
  const steps = [
    { num: "01", label: "You",           sub: "Your position" },
    { num: "02", label: "EDGEX",         sub: "AI reasoning" },
    { num: "03", label: "Intelligence",  sub: "UK role intelligence" },
    { num: "04", label: "Tools",         sub: "Action outputs" },
    { num: "05", label: "Outcome",       sub: "Your next move" },
  ];

  const isOutcome = (num) => num === "05";
  const isPlatform = (num) => ["02","03","04"].includes(num);

  const nodeBackground = (num) => {
    if (isOutcome(num))  return "rgba(16,185,129,0.09)";
    if (isPlatform(num)) return "rgba(79,70,229,0.09)";
    return "rgba(255,255,255,0.05)";
  };

  const nodeBorder = (num) => {
    if (isOutcome(num))  return "1px solid rgba(16,185,129,0.36)";
    if (isPlatform(num)) return "1px solid rgba(79,70,229,0.32)";
    return "1px solid rgba(255,255,255,0.14)";
  };

  const numColor = (num) => {
    if (isOutcome(num))  return "rgba(52,211,153,0.50)";
    if (isPlatform(num)) return "rgba(129,140,248,0.50)";
    return "rgba(255,255,255,0.22)";
  };

  const subColor = (num) => {
    if (isOutcome(num))  return "rgba(52,211,153,0.45)";
    if (isPlatform(num)) return "rgba(165,180,252,0.42)";
    return "rgba(255,255,255,0.28)";
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "8px",
      margin: "48px 0 56px",
      padding: "24px 28px",
      background: "rgba(255,255,255,0.016)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px",
      overflowX: "auto",
    }}>
      {steps.map((step, i) => (
        <div key={step.num} style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0",
          flex: i < steps.length - 1 ? "1" : "0 0 auto",
        }}>
          {/* Station: num → card → sub stacked vertically */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0",
            flexShrink: 0,
          }}>
            {/* Layer 1: step number */}
            <span style={{
              display: "block",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.18em",
              color: numColor(step.num),
              lineHeight: "1",
              marginBottom: "10px",
            }}>
              {step.num}
            </span>

            {/* Layer 2: card */}
            <div style={{
              padding: "13px 20px",
              borderRadius: "12px",
              background: nodeBackground(step.num),
              border: nodeBorder(step.num),
              minWidth: "100px",
              textAlign: "center",
              marginBottom: "10px",
              cursor: "default",
            }}>
              <span style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.4px",
                lineHeight: "1",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}>
                {step.label}
              </span>
            </div>

            {/* Layer 3: descriptor */}
            <span style={{
              display: "block",
              fontSize: "10px",
              fontWeight: "500",
              color: subColor(step.num),
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              lineHeight: "1",
              textAlign: "center",
            }}>
              {step.sub}
            </span>
          </div>

          {/* Connector between nodes */}
          {i < steps.length - 1 && (
            <div style={{
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "20px", /* aligns with card mid-height */
              minWidth: "24px",
            }}>
              <svg width="100%" height="2" viewBox="0 0 48 2" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <line
                  x1="0" y1="1" x2="48" y2="1"
                  stroke="url(#fcg)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <defs>
                  <linearGradient id="fcg" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                    <stop offset="0%"   stopColor="rgba(79,70,229,0.5)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
