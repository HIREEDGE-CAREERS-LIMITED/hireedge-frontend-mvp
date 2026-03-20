// ============================================================================
// components/copilot/ChatWindow.js
// HireEdge Frontend — EDGEX chat window
// ============================================================================

import { useRef, useEffect } from "react";
import { useCopilot } from "../../context/CopilotContext";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

const STARTER_PROMPTS = [
  { label: "How do I become a data architect?", icon: "🗺️" },
  { label: "What skills do I need for product manager?", icon: "🎯" },
  { label: "Help me prepare for interviews", icon: "🎤" },
  { label: "What are my career options?", icon: "🔍" },
  { label: "Compare data analyst and data engineer", icon: "⚖️" },
  { label: "Check my visa eligibility", icon: "🌍" },
];

function EDGEXIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8" />
    </svg>
  );
}

export default function ChatWindow() {
  const { messages, loading, send, clear } = useCopilot();
  const scrollRef = useRef(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 1 ? "smooth" : "instant" });
  }, [messages.length, loading]);

  const handleAction = (action) => {
    if (action.prompt) {
      send(action.prompt);
    } else if (action.endpoint) {
      send(`Run ${action.label}`);
    }
  };

  return (
    <div className="chat">
      {/* Header */}
      <div className="chat__header">
        <div className="chat__header-left">
          <div className="chat__title">
            <span className="chat__title-icon">
              <EDGEXIcon size={18} />
            </span>
            {/* CHANGED: "Career Copilot" → "EDGEX" */}
            <span>EDGEX</span>
            <span className="chat__title-badge">Career Intelligence</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="chat__clear" onClick={clear} title="New conversation">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 3l12 12M3 15L15 3"/>
            </svg>
            <span>New chat</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="chat__messages" ref={scrollRef}>
        {isEmpty ? (
          <div className="chat__empty">
            <div className="chat__empty-icon shimmer-text">✦</div>
            <h2 className="chat__empty-title">What can I help you with?</h2>
            {/* CHANGED: first-person Copilot copy → EDGEX positioning */}
            <p className="chat__empty-subtitle">
              EDGEX is your AI career intelligence engine. Ask about career paths, skill gaps, salary benchmarks, interview prep, and more.
            </p>
            <div className="chat__starters">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button key={i} className="chat__starter" onClick={() => send(prompt.label)}>
                  <span className="chat__starter-icon">{prompt.icon}</span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
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
                    {/* CHANGED: "HireEdge" → "EDGEX" */}
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
