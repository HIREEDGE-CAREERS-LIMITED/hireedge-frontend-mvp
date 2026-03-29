// ============================================================================
// components/copilot/EDGEXShell.js
//
// Layout wrapper for the EDGEX experience:
//   [ Chat column (flex:1) ] [ Right sidebar (300px) ]
//
// Changes from original:
//   • Reads messageCount from CopilotContext (not raw.messages which was always [])
//   • Derives recommended tools from context.lastIntent instead of scanning
//     message text (which required raw messages array — not available here)
//   • Imports TOOLS from lib/edgexOrchestrator — single source of truth
//   • All other sidebar logic (MemoryBlock, PremiumCTA) unchanged
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import { TOOLS } from "../../lib/edgexOrchestrator";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

// ─── Tool recommendation logic ─────────────────────────────────────────────────
// Derives 3 recommended tools from context.lastIntent rather than scanning
// message text. This is reliable because ChatWindow always updates lastIntent
// via updateContext when the API responds.

const INTENT_TOOL_MAP = {
  career_transition: ["gap", "roadmap", "resume"],
  skill_gap:         ["gap", "roadmap", "resume"],
  salary_benchmark:  ["gap", "resume",  "linkedin"],
  visa_eligibility:  ["visa", "gap",    "roadmap"],
  resume_optimise:   ["resume", "gap",  "linkedin"],
  linkedin_optimise: ["linkedin", "resume", "gap"],
  interview_prep:    ["interview", "gap", "roadmap"],
  general_career:    ["gap", "roadmap",  "resume"],
};

function deriveRecommendedTools(context) {
  const intent = context?.lastIntent;
  const keys   = (intent && INTENT_TOOL_MAP[intent]) || ["gap", "roadmap", "visa"];
  return keys.map(k => TOOLS.find(t => t.key === k)).filter(Boolean);
}

// ─── Memory block ──────────────────────────────────────────────────────────────

function MemoryBlock({ context, messageCount }) {
  const hasData = context?.role || context?.target || context?.country;

  return (
    <div className="exs-block">
      <div className="exs-block__header">
        <span className="exs-block__label">Session Context</span>
        <span className="exs-block__count">{messageCount} msg</span>
      </div>

      {hasData ? (
        <div className="exs-memory">
          {context.role && (
            <div className="exs-memory__row">
              <span className="exs-memory__key">Current role</span>
              <span className="exs-memory__val">{context.role}</span>
            </div>
          )}
          {context.target && (
            <div className="exs-memory__row">
              <span className="exs-memory__key">Target role</span>
              <span className="exs-memory__val exs-memory__val--accent">{context.target}</span>
            </div>
          )}
          {context.country && (
            <div className="exs-memory__row">
              <span className="exs-memory__key">Country</span>
              <span className="exs-memory__val">{context.country}</span>
            </div>
          )}
          {context.yearsExp && (
            <div className="exs-memory__row">
              <span className="exs-memory__key">Experience</span>
              <span className="exs-memory__val">{context.yearsExp}y</span>
            </div>
          )}
          {context.lastIntent && (
            <div className="exs-memory__row">
              <span className="exs-memory__key">Last intent</span>
              <span className="exs-memory__val exs-memory__val--muted">
                {context.lastIntent.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="exs-memory__empty">
          Tell EDGEX your current role and target — it will use this across all recommendations.
        </p>
      )}
    </div>
  );
}

// ─── Tool recommendation cards ─────────────────────────────────────────────────

function ToolRecommendations({ tools, router }) {
  return (
    <div className="exs-block">
      <div className="exs-block__header">
        <span className="exs-block__label">Recommended Tools</span>
      </div>
      <div className="exs-tools">
        {tools.map(t => (
          <div key={t.key} className="exs-tool" style={{ "--tool-colour": t.color }}>
            <div className="exs-tool__header">
              <span className="exs-tool__icon" style={{ background: t.color + "22", color: t.color }}>
                {t.label[0]}
              </span>
              <div className="exs-tool__meta">
                <span className="exs-tool__name">{t.label}</span>
                {t.paid && <span className="exs-tool__pro">PRO</span>}
              </div>
            </div>
            <p className="exs-tool__desc">{t.tagline}</p>
            <button
              className="exs-tool__btn"
              onClick={() => router.push(t.route)}
              style={{ borderColor: t.color + "44", color: t.color }}
            >
              Open tool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Premium CTA ───────────────────────────────────────────────────────────────

function PremiumCTA({ router, hasPro }) {
  if (hasPro) return null;
  return (
    <div className="exs-block exs-premium">
      <div className="exs-premium__glow" />
      <span className="exs-premium__badge">Career Pack</span>
      <p className="exs-premium__title">Turn this conversation into a complete transition plan</p>
      <p className="exs-premium__body">
        One unified report: positioning, gap analysis, pathway, visa strategy, 30/60/90 execution, CV + LinkedIn + interview activation.
      </p>
      <button
        className="exs-premium__btn"
        onClick={() => router.push("/billing?plan=career_pack")}
      >
        Unlock Career Pack — £6.99
      </button>
      <p className="exs-premium__note">One-time. No subscription.</p>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────

function EDGEXSidebar({ context, messageCount, router }) {
  const isPaid = typeof window !== "undefined"
    ? ["career_pack", "pro", "elite"].includes(localStorage.getItem("hireedge_plan") || "free")
    : false;

  const recommendedTools = deriveRecommendedTools(context);

  return (
    <aside className="exs-sidebar">
      <MemoryBlock context={context} messageCount={messageCount} />
      <ToolRecommendations tools={recommendedTools} router={router} />
      <PremiumCTA router={router} hasPro={isPaid} />
    </aside>
  );
}

// ─── Mobile bar toggle ─────────────────────────────────────────────────────────

function SidebarToggle({ open, onToggle }) {
  return (
    <button className="exs-toggle" onClick={onToggle} title="Toggle sidebar">
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {open
          ? <path d="M4 4l10 10M4 14L14 4" />
          : <><path d="M2 5h14" /><path d="M2 9h14" /><path d="M2 13h14" /></>
        }
      </svg>
    </button>
  );
}

// ─── Main shell ────────────────────────────────────────────────────────────────

export default function EDGEXShell() {
  const { context, messageCount } = useEDGEXContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="exs-shell">

      {/* Mobile top bar */}
      <div className="exs-mobile-bar">
        <div className="exs-mobile-bar__title">
          <EDGEXIcon size={16} state="header" color="#0F6E56" />
          <span>EDGEX</span>
        </div>
        <SidebarToggle open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
      </div>

      {/* Main layout */}
      <div className="exs-layout">
        <div className="exs-chat-col">
          <ChatWindow />
        </div>

        {sidebarOpen && (
          <EDGEXSidebar
            context={context}
            messageCount={messageCount}
            router={router}
          />
        )}
      </div>

    </div>
  );
}
