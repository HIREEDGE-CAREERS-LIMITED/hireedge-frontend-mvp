// ============================================================================
// components/copilot/EDGEXShell.js
// HireEdge -- EDGEX Career Intelligence Shell (v2)
//
// Layout:
//   [ Chat column (flex:1) ] [ Right sidebar (320px) ]
//
// Chat column:  header, message stream, input bar
// Sidebar:      memory block, tool recommendations, premium CTA
//
// The existing ChatWindow.js is preserved unchanged.
// This shell wraps it and adds the sidebar.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

//  Tool catalogue 

const TOOLS = [
  {
    key: "gap",
    name: "Career Gap Explainer",
    icon: "G",
    colour: "#f59e0b",
    desc: "See exactly which skills and experiences are missing for your target role.",
    route: "/tools/career-gap-explainer",
    trigger: ["gap", "skill", "missing", "transition"],
  },
  {
    key: "roadmap",
    name: "Career Roadmap",
    icon: "R",
    colour: "#10b981",
    desc: "Get a phased action plan from where you are to where you want to be.",
    route: "/tools/career-roadmap",
    trigger: ["roadmap", "plan", "path", "move"],
  },
  {
    key: "visa",
    name: "Visa Intelligence",
    icon: "V",
    colour: "#818cf8",
    desc: "Check your eligibility for UK and international work visa routes.",
    route: "/tools/visa-intelligence",
    trigger: ["visa", "country", "uk", "move abroad", "immigrat"],
  },
  {
    key: "linkedin",
    name: "LinkedIn Optimiser",
    icon: "L",
    colour: "#0ea5e9",
    desc: "Rewrite your LinkedIn profile to attract the right recruiters.",
    route: "/tools/linkedin-optimiser",
    trigger: ["linkedin", "profile", "recruiter"],
  },
  {
    key: "interview",
    name: "Interview Prep",
    icon: "I",
    colour: "#a78bfa",
    desc: "Role-specific questions, STAR answers, and gap handling scripts.",
    route: "/tools/interview-prep",
    trigger: ["interview", "question", "prepare"],
  },
  {
    key: "resume",
    name: "Resume Optimiser",
    icon: "C",
    colour: "#f87171",
    desc: "Fix CV gaps, reframe experience, and pass ATS screens.",
    route: "/tools/resume-optimiser",
    trigger: ["cv", "resume", "ats"],
  },
  {
    key: "pack",
    name: "Career Pack",
    icon: "P",
    colour: "#6366f1",
    desc: "Your full unified transition plan: positioning, gaps, pathway, visa, 30/60/90.",
    route: "/career-pack",
    trigger: ["everything", "full plan", "complete", "pack"],
    isPro: true,
  },
];

//  Derive recommended tools from conversation 

function deriveRecommendedTools(messages, context) {
  if (!messages.length) return TOOLS.slice(0, 3);

  const text = messages
    .map(m => m.content || "")
    .join(" ")
    .toLowerCase();

  const scored = TOOLS.map(t => {
    const score = t.trigger.filter(kw => text.includes(kw)).length;
    return { ...t, score };
  }).sort((a, b) => b.score - a.score);

  // Always show Career Pack last if a transition is mentioned
  const hasTransition = /transition|move|switch|change|from.*to/.test(text);
  const primary = scored.filter(t => t.key !== "pack").slice(0, 3);
  if (hasTransition) {
    const pack = TOOLS.find(t => t.key === "pack");
    return [...primary.slice(0, 2), pack];
  }
  return primary;
}

//  EDGEX icon 

//  Memory block 

function MemoryBlock({ context, messages }) {
  const hasData = context?.role || context?.target || context?.country;

  return (
    <div className="edgex-sidebar__block">
      <div className="edgex-sidebar__block-header">
        <span className="edgex-sidebar__block-label">Session Context</span>
        <span className="edgex-sidebar__block-count">{messages.length} msg</span>
      </div>

      {hasData ? (
        <div className="edgex-memory">
          {context.role && (
            <div className="edgex-memory__row">
              <span className="edgex-memory__key">Current role</span>
              <span className="edgex-memory__val">{context.role}</span>
            </div>
          )}
          {context.target && (
            <div className="edgex-memory__row">
              <span className="edgex-memory__key">Target role</span>
              <span className="edgex-memory__val edgex-memory__val--accent">{context.target}</span>
            </div>
          )}
          {context.country && (
            <div className="edgex-memory__row">
              <span className="edgex-memory__key">Country</span>
              <span className="edgex-memory__val">{context.country}</span>
            </div>
          )}
          {context.yearsExp && (
            <div className="edgex-memory__row">
              <span className="edgex-memory__key">Experience</span>
              <span className="edgex-memory__val">{context.yearsExp}y</span>
            </div>
          )}
          {context.lastIntent && (
            <div className="edgex-memory__row">
              <span className="edgex-memory__key">Last intent</span>
              <span className="edgex-memory__val edgex-memory__val--muted">
                {(context.lastIntent || "").replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="edgex-memory__empty">
          Tell EDGEX your current role and target -- it will use this across all recommendations.
        </p>
      )}
    </div>
  );
}

//  Tool recommendation cards 

function ToolRecommendations({ tools, router }) {
  return (
    <div className="edgex-sidebar__block">
      <div className="edgex-sidebar__block-header">
        <span className="edgex-sidebar__block-label">Recommended Tools</span>
      </div>
      <div className="edgex-tool-recs">
        {tools.map((t, i) => (
          <div key={t.key} className="edgex-tool-rec" style={{ "--tr-colour": t.colour }}>
            <div className="edgex-tool-rec__header">
              <span className="edgex-tool-rec__icon" style={{ background: t.colour + "22", color: t.colour }}>
                {t.icon}
              </span>
              <div className="edgex-tool-rec__meta">
                <span className="edgex-tool-rec__name">{t.name}</span>
                {t.isPro && <span className="edgex-tool-rec__pro">PRO</span>}
              </div>
            </div>
            <p className="edgex-tool-rec__desc">{t.desc}</p>
            <button
              className="edgex-tool-rec__cta"
              onClick={() => router.push(t.route)}
              style={{ borderColor: t.colour + "44", color: t.colour }}
            >
              Open tool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

//  Premium CTA 

function PremiumCTA({ router, hasPro }) {
  if (hasPro) return null;
  return (
    <div className="edgex-sidebar__block edgex-premium-cta">
      <div className="edgex-premium-cta__glow" />
      <span className="edgex-premium-cta__badge">Career Pack</span>
      <p className="edgex-premium-cta__title">
        Turn this conversation into a complete transition plan
      </p>
      <p className="edgex-premium-cta__body">
        One unified report: positioning, gap analysis, pathway, visa strategy, 30/60/90 execution, CV + LinkedIn + interview activation.
      </p>
      <button
        className="edgex-premium-cta__btn"
        onClick={() => router.push("/billing?plan=career_pack")}
      >
        Unlock Career Pack -- £6.99
      </button>
      <p className="edgex-premium-cta__note">One-time. No subscription.</p>
    </div>
  );
}

//  Sidebar 

function EDGEXSidebar({ context, messages, router }) {
  const isPaid = typeof window !== "undefined"
    ? ["career_pack", "pro", "elite"].includes(localStorage.getItem("hireedge_plan") || "free")
    : false;

  const recommendedTools = deriveRecommendedTools(messages, context);

  return (
    <aside className="edgex-sidebar">
      <MemoryBlock context={context} messages={messages} />
      <ToolRecommendations tools={recommendedTools} router={router} />
      <PremiumCTA router={router} hasPro={isPaid} />
    </aside>
  );
}

//  Sidebar toggle (mobile) 

function SidebarToggle({ open, onToggle }) {
  return (
    <button className="edgex-sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {open
          ? <path d="M4 4l10 10M4 14L14 4" />
          : <><path d="M2 5h14M2 9h14M2 13h14" /></>
        }
      </svg>
    </button>
  );
}

//  Main shell 

export default function EDGEXShell() {
  const { messages, context } = useEDGEXContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="edgex-shell">

      {/* Mobile sidebar toggle */}
      <div className="edgex-mobile-bar">
        <div className="edgex-mobile-bar__title">
          <EDGEXIcon size={14} />
          <span>EDGEX</span>
        </div>
        <SidebarToggle open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
      </div>

      {/* Main layout */}
      <div className="edgex-shell__layout">

        {/* Chat column -- uses existing ChatWindow unchanged */}
        <div className="edgex-shell__chat">
          <ChatWindow />
        </div>

        {/* Right sidebar */}
        {sidebarOpen && (
          <EDGEXSidebar
            context={context}
            messages={messages}
            router={router}
          />
        )}
      </div>
    </div>
  );
}
