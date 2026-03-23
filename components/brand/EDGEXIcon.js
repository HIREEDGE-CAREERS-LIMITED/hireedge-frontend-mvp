// ============================================================================
// components/brand/EDGEXIcon.js
//
// Teal X mark icon with three states:
//   idle     -- static
//   thinking -- slow rotation (use while EDGEX is generating)
//   new      -- draw-in animation (use on new chat / page load)
//
// Usage:
//   <EDGEXIcon size={28} state="idle" color="#0F6E56" />
//   <EDGEXIcon size={28} state="thinking" />
//   <EDGEXIcon size={48} state="new" />
// ============================================================================

import { useEffect, useState } from "react";

const TEAL = "#0F6E56";

export default function EDGEXIcon({ size = 28, state = "idle", color = TEAL, className = "" }) {
  const s = size;
  const sw = Math.max(2, s * 0.13); // stroke width scales with size
  const pad = s * 0.20;
  const a = pad;
  const b = s - pad;

  // Draw-in: animate stroke-dashoffset from full length to 0
  const len = Math.sqrt(Math.pow(b - a, 2) * 2).toFixed(1);

  // Key changes on state so animation re-triggers on "new"
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (state === "new") setKey(k => k + 1);
  }, [state]);

  const isThinking = state === "thinking";
  const isNew      = state === "new";

  return (
    <svg
      key={key}
      width={s}
      height={s}
      viewBox={"0 0 " + s + " " + s}
      fill="none"
      className={className}
      style={isThinking ? { animation: "edgex-spin 5s linear infinite", transformOrigin: "center" } : {}}
      xmlns="http://www.w3.org/2000/svg"
    >
      {isNew && (
        <style>{`
          @keyframes edgex-draw-a {
            from { stroke-dashoffset: ${len}; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes edgex-draw-b {
            from { stroke-dashoffset: ${len}; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>
      )}
      {isThinking && (
        <style>{`
          @keyframes edgex-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      )}
      <line
        x1={a} y1={a} x2={b} y2={b}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={isNew ? {
          strokeDasharray: len,
          strokeDashoffset: len,
          animation: "edgex-draw-a 0.45s cubic-bezier(0.4,0,0.2,1) 0.1s forwards",
        } : {}}
      />
      <line
        x1={b} y1={a} x2={a} y2={b}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        style={isNew ? {
          strokeDasharray: len,
          strokeDashoffset: len,
          animation: "edgex-draw-b 0.45s cubic-bezier(0.4,0,0.2,1) 0.32s forwards",
        } : {}}
      />
    </svg>
  );
}
