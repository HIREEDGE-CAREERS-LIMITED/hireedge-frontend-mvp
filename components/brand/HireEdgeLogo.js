// ============================================================================
// components/brand/HireEdgeLogo.js
//
// HireEdge — production brand mark. Final.
//
// GEOMETRY (32×32 viewBox) — UNCHANGED:
//   Leaning quadrilateral: TL(5,3) · BL(2,29) · APEX(30,16)
//   Left edge leans forward — breaks vertical symmetry.
//   Indigo stripe on top face only — the literal "hire edge".
//
// PROPS:
//   size        {number}  rendered px size (default 32)
//   animated    {bool}    load reveal — clip-path left→right, once on mount
//   interactive {bool}    hover: nudge forward + edge sharpens + edge glow
//   pulse       {bool}    hero breathing — very slow scale 1→1.03→1, 3s loop
//   solid       {bool}    monochromatic teal — for use on coloured fills
//   color       {string}  override fill color (solid mode only)
//
// USAGE:
//   <HireEdgeLogo size={32} />                  sidebar, topbar, favicon
//   <HireEdgeLogo size={48} animated />         hero / onboarding load reveal
//   <HireEdgeLogo size={32} interactive />      nav CTA, sidebar logo link
//   <HireEdgeLogo size={64} animated pulse />   landing hero, splash screens
//   <HireEdgeLogo size={32} solid />            on teal or coloured fills
//
// ANIMATION SYSTEM:
//
//   animated  — clip-path reveal left→right. Body: 500ms ease-out.
//               Indigo edge: 320ms, delayed 60ms after body settles.
//               Reads as "structure first, intelligence second."
//               Runs once on mount. Never loops.
//
//   interactive — hover: +2px translateX (whole mark), 160ms ease-out.
//               Indigo edge: scaleX(1→1.14) + drop-shadow glow.
//               Glow = filter:drop-shadow on .he-edge only.
//               Indigo, 4px blur, 0.55 opacity. Calm, not flashy.
//               On hover-out: reverses smoothly.
//
//   pulse     — scale 1→1.03→1, 3s ease-in-out, infinite.
//               Transform-origin: center. For hero/splash contexts only.
//               Combine with animated: <HireEdgeLogo animated pulse />
//               Never use in sidebar, nav, or always-visible contexts.
//
// WHAT CHANGED vs previous version:
//   + pulse prop (new): breathing animation for hero use
//   + hover glow: drop-shadow on .he-edge only (new)
//   ~ timing: reveal 480ms→500ms, edge delay 520ms→560ms (more separation)
//   ~ edge scaleX on hover: 1.18→1.14 (slightly more restrained)
//   = geometry: BODY and EDGE paths identical — not touched
//   = injectStyles() architecture: identical
// ============================================================================

const TEAL   = "#0F6E56";
const INDIGO = "#4f46e5";

// Geometry — do not touch
const BODY = "M 5,3 L 30,16 L 2,29 Z";
const EDGE = "M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z";

// ── CSS injected once on client ──────────────────────────────────────────────

const STYLES = `
@keyframes he-reveal {
  from { clip-path: inset(0 100% 0 0 round 1px); }
  to   { clip-path: inset(0 0%   0 0 round 1px); }
}
@keyframes he-edge-in {
  from { opacity: 0; transform: scaleX(0.15); }
  to   { opacity: 1; transform: scaleX(1);    }
}
@keyframes he-pulse {
  0%,100% { transform: scale(1);    }
  50%     { transform: scale(1.03); }
}

.he-animated {
  animation: he-reveal 500ms cubic-bezier(0.4,0,0.2,1) 100ms both;
}
.he-animated .he-edge {
  transform-origin: 15.6% 50%;
  animation: he-edge-in 320ms cubic-bezier(0.4,0,0.2,1) 560ms both;
}

.he-pulse {
  animation: he-pulse 3s ease-in-out infinite;
  transform-origin: center;
}

.he-wrap {
  display: inline-flex;
  line-height: 0;
  cursor: pointer;
}
.he-wrap svg {
  transition: transform 160ms cubic-bezier(0.4,0,0,1);
}
.he-wrap:hover svg {
  transform: translateX(2px);
}
.he-wrap .he-edge {
  transform-origin: 15.6% 50%;
  transition:
    transform 160ms cubic-bezier(0.4,0,0,1),
    filter    200ms cubic-bezier(0.4,0,0.2,1);
}
.he-wrap:hover .he-edge {
  transform: scaleX(1.14);
  filter: drop-shadow(0 0 4px rgba(79,70,229,0.55));
}
`;

let injected = false;
function injectStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.setAttribute("data-hireedge", "");
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

// ── Inner SVG ────────────────────────────────────────────────────────────────

function Mark({ size, solid, color, animated, pulse, className }) {
  const classes = [
    animated ? "he-animated" : "",
    pulse    ? "he-pulse"    : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes || undefined}
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
      aria-label="HireEdge"
      role="img"
    >
      <path d={BODY} fill={solid ? (color || TEAL) : TEAL} />
      {!solid && <path className="he-edge" d={EDGE} fill={INDIGO} />}
    </svg>
  );
}

// ── Public component ─────────────────────────────────────────────────────────

export default function HireEdgeLogo({
  size        = 32,
  animated    = false,
  interactive = false,
  pulse       = false,
  solid       = false,
  color,
  className   = "",
  style       = {},
}) {
  if (animated || interactive || pulse) injectStyles();

  const mark = (
    <Mark
      size={size}
      solid={solid}
      color={color}
      animated={animated}
      pulse={pulse}
      className={className}
    />
  );

  if (interactive) {
    return (
      <span className="he-wrap" style={{ display: "inline-flex", ...style }}>
        {mark}
      </span>
    );
  }

  if (style && Object.keys(style).length > 0) {
    return (
      <span style={{ display: "inline-flex", ...style }}>
        {mark}
      </span>
    );
  }

  return mark;
}
