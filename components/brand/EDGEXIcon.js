// ============================================================================
// components/brand/EDGEXIcon.js
//
// EDGEX — premium product symbol. SSR-safe, zero hooks.
//
// CONSTRUCTION:
//   Not two crossing lines (= close icon).
//   Four independent arms radiating from a hollow centre diamond.
//   Each arm: bold stroke, round caps, starts 1.8px from centre.
//   This reads as an engineered mark — an AI node — not a UI affordance.
//
// STATES:
//   idle      — solid mark, no animation. Avatars, sidebar.
//   hero      — solid mark + soft CSS glow via filter. Empty state.
//   thinking  — very slow breathing pulse (opacity 0.6↔1.0, 3s). Generating.
//   header    — thinner strokes, no animation. Next to wordmark.
//
// USAGE:
//   <EDGEXIcon size={64} state="hero" />        empty state hero
//   <EDGEXIcon size={22} state="idle" />        AI message avatar
//   <EDGEXIcon size={24} state="thinking" />    generating
//   <EDGEXIcon size={16} state="header" />      wordmark lockup
// ============================================================================

const TEAL = "#0F6E56";

// Fixed 24×24 geometry — proportions locked at all sizes
const CX = 12, CY = 12;  // centre
const G  = 1.8;           // half-gap from centre (creates hollow diamond)
const E  = 9.3;           // extent: arm tip distance from centre (axis)

// Four arm endpoints: [x1,y1, x2,y2]
const ARMS = [
  [CX - G, CY - G,  CX - E, CY - E],   // top-left
  [CX + G, CY - G,  CX + E, CY - E],   // top-right
  [CX - G, CY + G,  CX - E, CY + E],   // bottom-left
  [CX + G, CY + G,  CX + E, CY + E],   // bottom-right
];

export default function EDGEXIcon({
  size      = 24,
  state     = "idle",
  color     = TEAL,
  className = "",
  style     = {},
}) {
  const isHero     = state === "hero";
  const isThinking = state === "thinking";
  const isHeader   = state === "header";

  // Stroke weight — bold for identity, slightly refined for header
  const sw = isHeader ? 2.4 : 3.2;

  // SVG-level filter for hero glow (no DOM wrappers needed)
  const filterId = "edgex-glow";

  const svgStyle = {
    display:    "block",
    flexShrink: 0,
    overflow:   "visible",          // needed so glow filter isn't clipped
    ...(isThinking ? {
      animation:       "edgex-breathe 3s ease-in-out infinite",
      transformOrigin: "center",
    } : {}),
    ...style,
  };

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
      {/* Keyframes — injected only when the state needs them */}
      {isThinking && (
        <style>{`
          @keyframes edgex-breathe {
            0%,100% { opacity: 1; }
            50%      { opacity: 0.45; }
          }
        `}</style>
      )}

      {/* SVG filter for hero glow — defined once, referenced below */}
      {isHero && (
        <defs>
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      )}

      {/* The four arms — each is an independent line segment */}
      <g
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        filter={isHero ? `url(#${filterId})` : undefined}
      >
        {ARMS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
}
