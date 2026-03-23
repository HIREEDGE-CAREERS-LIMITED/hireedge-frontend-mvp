// ============================================================================
// components/brand/EDGEXIcon.js
//
// EDGEX premium symbol — SSR-safe, no hooks.
//
// Design system:
//   - Fixed 24×24 viewBox regardless of rendered size (consistent proportions)
//   - Two strokes crossing at exact centre (12,12)
//   - strokeLinecap="round" + extra padding = symbol feel, not close-icon feel
//   - Stroke weight scales with size but stays bold (min 2.5px equivalent)
//
// States:
//   idle      — static, used for avatars and sidebar header
//   header    — static, slightly smaller weight, used next to wordmark
//   thinking  — slow 6s rotation, used while generating
//   new       — sequential draw-in, used on empty state hero load
//
// Usage:
//   <EDGEXIcon size={64} state="new" />          hero
//   <EDGEXIcon size={18} state="header" />       next to "EDGEX" wordmark
//   <EDGEXIcon size={22} state="idle" />         AI message avatar
//   <EDGEXIcon size={22} state="thinking" />     generating state
// ============================================================================

const TEAL = "#0F6E56";

// Fixed geometry on 24×24 viewBox
// Padding 4px each side → strokes from (4,4)→(20,20) and (20,4)→(4,20)
// Centre cross at (12,12) — perfectly balanced
const VB   = 24;
const PAD  = 4.5;
const A    = PAD;
const B    = VB - PAD;
// Diagonal length for dasharray animation
const DIAG = Math.round(Math.sqrt(Math.pow(B - A, 2) * 2) * 100) / 100; // ≈ 21.92

export default function EDGEXIcon({
  size      = 24,
  state     = "idle",
  color     = TEAL,
  className = "",
  style     = {},
}) {
  const isThinking = state === "thinking";
  const isNew      = state === "new";
  const isHeader   = state === "header";

  // Stroke weight: bold for identity, slightly lighter for header
  // Relative to viewBox (24), then scales with size automatically
  const sw = isHeader ? 2.0 : 2.6;

  const svgStyle = {
    display: "block",
    flexShrink: 0,
    ...(isThinking ? {
      animation: "edgex-spin 6s linear infinite",
      transformOrigin: "center",
    } : {}),
    ...style,
  };

  const lineA = isNew ? {
    strokeDasharray:  DIAG,
    strokeDashoffset: DIAG,
    animation: "edgex-draw 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s forwards",
  } : {};

  const lineB = isNew ? {
    strokeDasharray:  DIAG,
    strokeDashoffset: DIAG,
    animation: "edgex-draw 0.5s cubic-bezier(0.4,0,0.2,1) 0.28s forwards",
  } : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={svgStyle}
      aria-hidden="true"
    >
      {/* Keyframes — injected only when needed */}
      {isThinking && (
        <style>{`
          @keyframes edgex-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      )}
      {isNew && (
        <style>{`
          @keyframes edgex-draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}

      {/* Top-left → bottom-right */}
      <line
        x1={A} y1={A} x2={B} y2={B}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={lineA}
      />
      {/* Top-right → bottom-left */}
      <line
        x1={B} y1={A} x2={A} y2={B}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={lineB}
      />
    </svg>
  );
}
