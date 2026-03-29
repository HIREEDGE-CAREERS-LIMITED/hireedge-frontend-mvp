// ============================================================================
// components/copilot/EDGEXShell.js
//
// THE ONLY header in the EDGEX experience.
// ChatWindow no longer has its own <header> — this file owns it.
//
// Layout:
//   exs-shell
//     exs-header  (single top bar — desktop + mobile, always visible)
//     exs-layout
//       exs-chat-col  -> ChatWindow (no header inside)
//       exs-sidebar   -> memory, tools, premium CTA
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import { TOOLS } from "../../lib/edgexOrchestrator";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

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
      <button className="exs-premium__btn" onClick={() => router.push("/billing?plan=career_pack")}>
        Unlock Career Pack — £6.99
      </button>
      <p className="exs-premium__note">One-time. No subscription.</p>
    </div>
  );
}

function EDGEXSidebar({ context, messageCount, router, open }) {
  const isPaid = typeof window !== "undefined"
    ? ["career_pack", "pro", "elite"].includes(localStorage.getItem("hireedge_plan") || "free")
    : false;
  const recommendedTools = deriveRecommendedTools(context);
  return (
    <aside className={"exs-sidebar" + (open ? " exs-sidebar--open" : "")}>
      <MemoryBlock context={context} messageCount={messageCount} />
      <ToolRecommendations tools={recommendedTools} router={router} />
      <PremiumCTA router={router} hasPro={isPaid} />
    </aside>
  );
}

export default function EDGEXShell() {
  const { context, messageCount, triggerNewChat } = useEDGEXContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on desktop, closed on mobile
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 900);
  }, []);

  return (
    <div className="exs-shell">

      {/* Single header — replaces both exs-mobile-bar AND ChatWindow's ex-header */}
      <header className="exs-header">
        <div className="exs-header__brand">
          <EDGEXIcon size={17} state="header" color="#0F6E56" />
          <span className="exs-header__name">EDGEX</span>
          <span className="exs-header__sep" />
          <span className="exs-header__sub">Career Intelligence</span>
        </div>
        <div className="exs-header__actions">
          <button className="exs-header__new" onClick={triggerNewChat}>
            New chat
          </button>
          <button
            className="exs-header__sidebar-toggle"
            onClick={() => setSidebarOpen(v => !v)}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 5h14" /><path d="M2 9h14" /><path d="M2 13h14" />
            </svg>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="exs-layout">
        <div className="exs-chat-col">
          <ChatWindow />
        </div>
        <EDGEXSidebar context={context} messageCount={messageCount} router={router} open={sidebarOpen} />
      </div>

    </div>
  );
}
