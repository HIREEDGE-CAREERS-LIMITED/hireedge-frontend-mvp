// ============================================================================
// components/copilot/ChatWindow.js
// HireEdge -- EDGEX Chat Window (v2)
//
// Upgrades from v1:
//   - useCopilot() -> useEDGEXContext() (canonical, legacy alias still works)
//   - Empty state: 2x2 category grid instead of emoji row
//   - Header: context bar showing detected role/target
//   - Preserves all existing CSS class names from copilot.css
// ============================================================================

import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import { resolveAction, buildUrl } from "../../utils/actionRouter";

//  Starter prompt categories 

const STARTER_CATEGORIES = [
  {
    label: "Career Transition",
    colour: "#10b981",
    prompts: [
      "How do I transition from Sales Manager to Product Manager?",
      "What roles can I move into from Data Analyst?",
    ],
  },
  {
    label: "Skills and Gaps",
    colour: "#f59e0b",
    prompts: [
      "What skills do I need to become a Data Architect?",
      "What is missing from my profile for a senior engineering role?",
    ],
  },
  {
    label: "Visa and Global",
    colour: "#818cf8",
    prompts: [
      "Can I get a UK Skilled Worker visa as a Software Engineer?",
      "What are my visa options for working in Canada?",
    ],
  },
  {
    label: "Strategy and Tools",
    colour: "#f87171",
    prompts: [
      "Which HireEdge tool should I use first?",
      "Build me a 90-day career transition plan",
    ],
  },
];

//  EDGEX icon 

function EDGEXIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8" />
    </svg>
  );
}

//  Context bar 

function ContextBar({ context }) {
  if (!context?.role && !context?.target) return null;
  return (
    <div className="edgex-ctx-bar">
      {context.role && (
        <span className="edgex-ctx-bar__chip edgex-ctx-bar__chip--from">{context.role}</span>
      )}
      {context.role && context.target && (
        <span className="edgex-ctx-bar__sep">-&gt;</span>
      )}
      {context.target && (
        <span className="edgex-ctx-bar__chip edgex-ctx-bar__chip--to">{context.target}</span>
      )}
    </div>
  );
}

//  Premium empty state 

function EmptyState({ onSend }) {
  return (
    <div className="chat__empty edgex-empty-v2">
      <div className="edgex-empty-v2__glow" />

      <div className="edgex-empty-v2__icon-ring">
        <EDGEXIcon size={26} />
      </div>

      <h2 className="chat__empty-title">EDGEX Career Intelligence</h2>
      <p className="chat__empty-subtitle">
        One conversation to navigate roles, transitions, skill gaps, visa routes, salary benchmarks, and career strategy.
      </p>

      <div className="edgex-starter-grid">
        {STARTER_CATEGORIES.map((cat, ci) => (
          <div key={ci} className="edgex-starter-col">
            <span className="edgex-starter-col__label" style={{ color: cat.colour }}>
              {cat.label}
            </span>
            {cat.prompts.map((p, pi) => (
              <button
                key={pi}
                className="edgex-starter-btn"
                onClick={() => onSend(p)}
                style={{ "--sc": cat.colour }}
              >
                <span className="edgex-starter-btn__dot" style={{ background: cat.colour }} />
                <span>{p}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

//  Main ChatWindow 

export default function ChatWindow() {
  const { messages, loading, send, clear, context } = useEDGEXContext();
  const scrollRef = useRef(null);
  const router    = useRouter();
  const isEmpty   = messages.length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 1 ? "smooth" : "instant" });
  }, [messages.length, loading]);

  const handleAction = (action) => {
    if (!action) return;
    if (action.type === "question") {
      if (action.prompt) send(action.prompt);
      return;
    }
    const resolved = resolveAction(action, context || {});
    if (resolved) {
      router.push(buildUrl(resolved.route, resolved.query));
      return;
    }
    if (action.prompt) send(action.prompt);
  };

  return (
    <div className="chat">
      {/* Header */}
      <div className="chat__header">
        <div className="chat__header-left">
          <div className="chat__title">
            <span className="chat__title-icon" style={{ color: "var(--accent-400)" }}>
              <EDGEXIcon size={18} />
            </span>
            <span>EDGEX</span>
            <span className="chat__title-badge">Career Intelligence</span>
          </div>
          <ContextBar context={context} />
        </div>

        {messages.length > 0 && (
          <button className="chat__clear" onClick={clear} title="New conversation">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3l12 12M3 15L15 3" />
            </svg>
            <span>New chat</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat__messages" ref={scrollRef}>
        {isEmpty ? (
          <EmptyState onSend={send} />
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} onAction={handleAction} />
            ))}
            {loading && (
              <div className="bubble bubble--assistant">
                <div className="bubble__avatar">
                  <div className="bubble__avatar-ai">
                    <EDGEXIcon size={16} />
                  </div>
                </div>
                <div className="bubble__body">
                  <div className="bubble__header">
                    <span className="bubble__sender">EDGEX</span>
                  </div>
                  <div className="bubble__typing">
                    <span className="bubble__dot" />
                    <span className="bubble__dot" />
                    <span className="bubble__dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <InputBar />
    </div>
  );
}
