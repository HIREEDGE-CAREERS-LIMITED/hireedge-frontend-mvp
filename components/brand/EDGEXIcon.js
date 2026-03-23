// ============================================================================
// components/brand/EDGEXIcon.js
//
// Teal X mark icon — SSR-safe, no hooks.
//
// States (via CSS animations):
//   idle     -- static
//   thinking -- slow rotation
//   new      -- draw-in on mount
//
// Usage:
//   <EDGEXIcon size={28} state="idle" color="#0F6E56" />
//   <EDGEXIcon size={28} state="thinking" />
//   <EDGEXIcon size={48} state="new" />
// ============================================================================

const TEAL = "#0F6E56";

export default function EDGEXIcon({ size = 28, state = "idle", color = TEAL, className = "" }) {
  const s = size;
  const sw = Math.max(1.5, s * 0.13);
  const pad = s * 0.20;
  const a = pad;
  const b = s - pad;
  const len = Math.round(Math.sqrt(Math.pow(b - a, 2) * 2) * 10) / 10;

  const isThinking = state === "thinking";
  const isNew      = state === "new";

  const spinStyle = isThinking
    ? { animation: "edgex-spin 5s linear infinite", transformOrigin: "center", display: "block" }
    : { display: "block" };

  const lineStyleA = isNew
    ? { strokeDasharray: len, strokeDashoffset: len, animation: "edgex-draw 0.45s cubic-bezier(0.4,0,0.2,1) 0.1s forwards" }
    : {};

  const lineStyleB = isNew
    ? { strokeDasharray: len, strokeDashoffset: len, animation: "edgex-draw 0.45s cubic-bezier(0.4,0,0.2,1) 0.32s forwards" }
    : {};

  return (
    <svg
      width={s}
      height={s}
      viewBox={"0 0 " + s + " " + s}
      fill="none"
      className={className}
      style={spinStyle}
      xmlns="http://www.w3.org/2000/svg"
    >
      {(isThinking || isNew) && (
        <style>{`
          @keyframes edgex-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes edgex-draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}
      <line
        x1={a} y1={a} x2={b} y2={b}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={lineStyleA}
      />
      <line
        x1={b} y1={a} x2={a} y2={b}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={lineStyleB}
      />
    </svg>
  );
}
