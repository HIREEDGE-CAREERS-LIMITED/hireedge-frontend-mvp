// ============================================================================
// components/copilot/EDGEXShell.js  (v3)
//
// Layout: [ Chat column (flex:1) ] [ Right sidebar (300px) ]
//
// Chat column: new v3 ChatWindow (ChatGPT/Claude style, full height)
// Sidebar:     session context memory, tool recommendations, premium CTA
//              (preserved from original EDGEXShell)
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
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

// Derive tools from context.lastIntent when no message history available
function deriveFromContext(context) {
  if (!context) return TOOLS.slice(0, 3);
  const intent = (context.lastIntent || "").replace(/_/g, " ");
  const hasTransition = /transition|career|move|switch/.test(intent);
  const hasVisa = /visa/.test(intent);
  const base = [TOOLS[0], TOOLS[1]]; // gap + roadmap always
  if (hasVisa) return [TOOLS[0], TOOLS[2], TOOLS.find(t => t.key === "pack")];
  if (hasTransition) return [TOOLS[0], TOOLS[1], TOOLS.find(t => t.key === "pack")];
  return TOOLS.slice(0, 3);
}

function deriveRecommendedTools(messages, context) {
  if (!messages || !messages.length) return deriveFromContext(context);

  const text = messages
    .map(m => m.content || "")
    .join(" ")
    .toLowerCase();

  const scored = TOOLS.map(t => ({
    ...t,
    score: t.trigger.filter(kw => text.includes(kw)).length,
  })).sort((a, b) => b.score - a.score);

  const hasTransition = /transition|move|switch|change|from.*to/.test(text);
  const primary = scored.filter(t => t.key !== "pack").slice(0, hasTransition ? 2 : 3);
  if (hasTransition) {
    const pack = TOOLS.find(t => t.key === "pack");
    return [...primary, pack];
  }
  return primary;
}

//  Memory block 

function MemoryBlock({ context }) {
  const hasData = context?.role || context?.target || context?.country;
  const msgCount = 0;

  return (
    <div className="exs-block">
      <div className="exs-block__header">
        <span className="exs-block__label">Session Context</span>
        <span className="exs-block__count">{msgCount} msg</span>
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
                {(context.lastIntent || "").replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="exs-memory__empty">
          Tell EDGEX your current role and target -- it will use this across all recommendations.
        </p>
      )}
    </div>
  );
}

//  Tool recommendation cards 

function ToolRecommendations({ tools, router }) {
  return (
    <div className="exs-block">
      <div className="exs-block__header">
        <span className="exs-block__label">Recommended Tools</span>
      </div>
      <div className="exs-tools">
        {tools.map(t => (
          <div key={t.key} className="exs-tool" style={{ "--tc": t.colour }}>
            <div className="exs-tool__header">
              <span className="exs-tool__icon" style={{ background: t.colour + "22", color: t.colour }}>
                {t.icon}
              </span>
              <div className="exs-tool__meta">
                <span className="exs-tool__name">{t.name}</span>
                {t.isPro && <span className="exs-tool__pro">PRO</span>}
              </div>
            </div>
            <p className="exs-tool__desc">{t.desc}</p>
            <button
              className="exs-tool__btn"
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
    <div className="exs-block exs-premium">
      <div className="exs-premium__glow" />
      <span className="exs-premium__badge">Career Pack</span>
      <p className="exs-premium__title">
        Turn this conversation into a complete transition plan
      </p>
      <p className="exs-premium__body">
        One unified report: positioning, gap analysis, pathway, visa strategy,
        30/60/90 execution, CV + LinkedIn + interview activation.
      </p>
      <button
        className="exs-premium__btn"
        onClick={() => router.push("/billing?plan=career_pack")}
      >
        Unlock Career Pack -- PS6.99
      </button>
      <p className="exs-premium__note">One-time. No subscription.</p>
    </div>
  );
}

//  Sidebar 

function EDGEXSidebar({ context, router }) {
  const isPaid =
    typeof window !== "undefined"
      ? ["career_pack", "pro", "elite"].includes(
          localStorage.getItem("hireedge_plan") || "free"
        )
      : false;

  const recommendedTools = deriveRecommendedTools([], context);

  return (
    <aside className="exs-sidebar">
      <MemoryBlock context={context} />
      <ToolRecommendations tools={recommendedTools} router={router} />
      <PremiumCTA router={router} hasPro={isPaid} />
    </aside>
  );
}

//  Mobile sidebar toggle 

function SidebarToggle({ open, onToggle }) {
  return (
    <button className="exs-toggle" onClick={onToggle} title="Toggle sidebar" aria-label="Toggle sidebar">
      {open ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 2l10 10M2 12L12 2" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 3h12M1 7h12M1 11h12" />
        </svg>
      )}
    </button>
  );
}

//  Main shell 

export default function EDGEXShell() {
  const { context } = useEDGEXContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="exs-shell">

      {/* Mobile bar */}
      <div className="exs-mobile-bar">
        <span className="exs-mobile-bar__title">EDGEX</span>
        <SidebarToggle open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
      </div>

      {/* Two-column layout */}
      <div className="exs-layout">

        {/* Chat column -- v3 ChatWindow (ChatGPT style) */}
        <div className="exs-chat-col">
          <ChatWindow />
        </div>

        {/* Right sidebar */}
        {sidebarOpen && (
          <EDGEXSidebar
            context={context}
            router={router}
          />
        )}

      </div>
    </div>
  );
}
