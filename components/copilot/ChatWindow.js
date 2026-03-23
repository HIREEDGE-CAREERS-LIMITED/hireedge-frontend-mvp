// ============================================================================
// components/copilot/ChatWindow.js  (v4)
//
// Fixes from v3:
//   1. try/catch now logs the actual error so we can see what threw
//   2. updateContext called safely -- never called with undefined
//   3. context passed to API as plain serialisable object (no undefined keys)
//   4. Clarification action handler calls send() correctly
//   5. detectToolsFromText is null-safe
//   6. getPlan() moved outside component so it doesnt re-create on every render
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import EDGEXIcon from "../brand/EDGEXIcon";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

//  Tool catalogue 
const TOOLS = {
  gap:       { label: "Career Gap Explainer", desc: "See exactly which skills and experiences are missing for your target role.", route: "/tools/career-gap-explainer",  color: "#f59e0b" },
  roadmap:   { label: "Career Roadmap",       desc: "Get a phased action plan from where you are to where you want to be.",      route: "/tools/career-roadmap",        color: "#10b981" },
  visa:      { label: "Visa Intelligence",    desc: "Check your eligibility for UK and international work visa routes.",          route: "/tools/visa-intelligence",     color: "#3b82f6" },
  interview: { label: "Interview Prep",       desc: "Role-specific interview questions and answer frameworks.",                   route: "/tools/interview-prep",        color: "#8b5cf6" },
  cv:        { label: "CV Optimiser",         desc: "Tailor your CV for ATS and hiring managers in your target field.",           route: "/tools/resume-optimiser",      color: "#ec4899" },
  pack:      { label: "Career Pack",          desc: "Full transition report: positioning, gap analysis, 30/60/90 plan.",          route: "/career-pack",                 color: "#4f46e5", premium: true },
};

const ENDPOINT_TO_KEY = {
  "/api/tools/career-gap-explainer": "gap",
  "/api/tools/career-roadmap":       "roadmap",
  "/api/tools/visa-intelligence":    "visa",
  "/api/tools/interview-prep":       "interview",
  "/api/tools/resume-optimiser":     "cv",
  "/api/tools/career-pack":          "pack",
};

const TOOL_TRIGGERS = {
  gap:       /skill.?gap|missing skill|gap analysis|what.?skill|qualify/i,
  roadmap:   /roadmap|action plan|step.?by.?step|phases|phased/i,
  visa:      /visa|immigrat|skilled worker|work permit|sponsorship|right to work/i,
  interview: /interview|interview prep|practice question/i,
  cv:        /\bcv\b|resume|linkedin|profile optim/i,
  pack:      /transition plan|90.day|30.day|full plan|complete plan/i,
};

function detectToolsFromText(text) {
  if (!text || typeof text !== "string") return [];
  const found = [];
  for (const [key, pattern] of Object.entries(TOOL_TRIGGERS)) {
    if (pattern.test(text)) found.push(key);
  }
  return found.slice(0, 3);
}

function getPlan() {
  if (typeof window === "undefined") return "free";
  try { return localStorage.getItem("hireedge_plan") || "free"; } catch { return "free"; }
}

//  Safe context serialiser -- strips undefined so JSON.stringify is clean 
function safeContext(ctx) {
  if (!ctx || typeof ctx !== "object") return {};
  const out = {};
  const keys = ["role", "target", "yearsExp", "country", "lastIntent"];
  for (const k of keys) {
    if (ctx[k] !== undefined && ctx[k] !== null) out[k] = ctx[k];
  }
  return out;
}

//  Inline tool card 
function ToolCard({ toolKey, router }) {
  const tool = TOOLS[toolKey];
  if (!tool) return null;
  return (
    <button
      className="ex-tool-card"
      style={{ "--tool-color": tool.color }}
      onClick={() => router.push(tool.route)}
    >
      <span className="ex-tool-card__dot" />
      <span className="ex-tool-card__body">
        <span className="ex-tool-card__label">
          {tool.label}
          {tool.premium && <span className="ex-tool-card__pro">PRO</span>}
        </span>
        <span className="ex-tool-card__desc">{tool.desc}</span>
      </span>
      <span className="ex-tool-card__arrow">-&gt;</span>
    </button>
  );
}

//  Message components 

function UserMessage({ content }) {
  return (
    <div className="ex-msg ex-msg--user">
      <div className="ex-msg__bubble--user">{content}</div>
    </div>
  );
}

function renderText(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    // Section headers: lines that are ALL CAPS words (e.g. TRANSITION SNAPSHOT)
    const isHeader = /^[A-Z][A-Z0-9 ()/-]{4,}$/.test(line.trim());
    if (isHeader) {
      return <p key={i} className="ex-msg__para ex-msg__header">{line.trim()}</p>;
    }

    // Inline **bold** spans
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="ex-msg__bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    return <p key={i} className="ex-msg__para">{parts}</p>;
  });
}

function AssistantMessage({ content, nextActions, toolCards, onSend, router }) {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar">
        <EDGEXIcon size={26} state="idle" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-msg__text">{renderText(content)}</div>
        {toolCards && toolCards.length > 0 && (
          <div className="ex-tool-cards">
            {toolCards.map(k => <ToolCard key={k} toolKey={k} router={router} />)}
          </div>
        )}
        {nextActions && nextActions.length > 0 && (
          <div className="ex-actions">
            {nextActions.map((action, i) => {
              if (action.type === "tool") {
                const key = ENDPOINT_TO_KEY[action.endpoint];
                const route = TOOLS[key]?.route;
                if (!route) return null;
                return (
                  <button key={i} className="ex-action ex-action--tool" onClick={() => router.push(route)}>
                    {action.label}
                  </button>
                );
              }
              return (
                <button key={i} className="ex-action ex-action--q" onClick={() => onSend(action.prompt)}>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ClarificationMessage({ content, missingFields, actions, onSend }) {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar">
        <EDGEXIcon size={26} state="idle" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-msg__clarify-banner">
          <span className="ex-msg__clarify-icon">!</span>
          <span>{content}</span>
        </div>
        {missingFields && missingFields.length > 0 && (
          <div className="ex-msg__missing">
            {missingFields.map(f => (
              <span key={f} className="ex-msg__missing-tag">
                {f === "current_role" ? "Current role missing" : "Target role missing"}
              </span>
            ))}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="ex-actions">
            {actions.map((a, i) => (
              <button key={i} className="ex-action ex-action--q" onClick={() => {
                if (a && a.prompt) onSend(a.prompt);
              }}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ content }) {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar ex-msg__avatar--err">!</div>
      <div className="ex-msg__body">
        <p className="ex-msg__para ex-msg__para--err">{content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar">
        <EDGEXIcon size={26} state="thinking" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-typing"><span/><span/><span/></div>
      </div>
    </div>
  );
}

//  Empty state 
const STARTERS = [
  { label: "Plan my career transition",         prompt: "I want to plan a career transition. What do I need to know?" },
  { label: "What skills am I missing?",         prompt: "I want to understand what skills I am missing for my target role." },
  { label: "UK salary benchmarks",              prompt: "What are typical UK salary ranges for senior tech roles?" },
  { label: "UK visa options for my move",       prompt: "What UK work visa routes are available for skilled workers?" },
  { label: "How long will my transition take?", prompt: "How long does a typical career transition take?" },
  { label: "What do hiring managers look for?", prompt: "What do UK hiring managers look for when screening career changers?" },
];

function EmptyState({ onSend }) {
  return (
    <div className="ex-empty">
      <div className="ex-empty__icon">
        <EDGEXIcon size={36} state="new" />
      </div>
      <h1 className="ex-empty__title">EDGEX</h1>
      <p className="ex-empty__sub">Career intelligence. Ask anything about transitions, salaries, skills, or visas.</p>
      <div className="ex-empty__starters">
        {STARTERS.map((s, i) => (
          <button key={i} className="ex-empty__starter" onClick={() => onSend(s.prompt)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

//  Main component 
export default function ChatWindow() {
  const router = useRouter();
  const { context, updateContext, clear } = useEDGEXContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        message: trimmed,
        context: safeContext(context),
      };

      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify(payload),
      });

      // Parse response -- handle non-JSON gracefully
      let json;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        json = await res.json();
      } else {
        const txt = await res.text();
        throw new Error("Non-JSON response (" + res.status + "): " + txt.slice(0, 120));
      }

      if (!res.ok || !json.ok) {
        setMessages(prev => [...prev, {
          role: "assistant", type: "error",
          content: (json && json.error) ? json.error : "Something went wrong. Please try again.",
        }]);
        return;
      }

      const data = json.data;
      if (!data) throw new Error("Response missing data field");

      if (data.type === "clarification") {
        setMessages(prev => [...prev, {
          role: "assistant", type: "clarification",
          content: data.reply || "I need a bit more information.",
          missingFields: data.missing_fields || [],
          actions: data.next_actions || [],
        }]);
        if (data.context && typeof data.context === "object") {
          updateContext(safeContext(data.context));
        }
        return;
      }

      const toolCards = detectToolsFromText(data.reply);

      setMessages(prev => [...prev, {
        role: "assistant", type: "assistant",
        content: data.reply || "",
        nextActions: Array.isArray(data.next_actions) ? data.next_actions : [],
        toolCards,
      }]);

      if (data.context && typeof data.context === "object") {
        updateContext(safeContext(data.context));
      }

    } catch (err) {
      console.error("[ChatWindow] send error:", err);
      setMessages(prev => [...prev, {
        role: "assistant", type: "error",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [context, loading, updateContext]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="ex-chat">

      {/* Header */}
      <div className="ex-header">
        <div className="ex-header__brand">
          <span className="ex-header__star">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11.5L8.5 6.8L9.5 11L6 8.8L2.5 11L3.5 6.8L0.5 4.5H4.5L6 1Z" fill="currentColor"/>
            </svg>
          </span>
          EDGEX
          <span className="ex-header__sub">Career Intelligence</span>
        </div>
        <button className="ex-header__new" onClick={() => {
          setMessages([]);
          setInput("");
          clear();
          setTimeout(() => inputRef.current?.focus(), 50);
        }}>
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="ex-messages">
        {messages.length === 0 && !loading && <EmptyState onSend={send} />}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return <UserMessage key={i} content={msg.content} />;
          }
          if (msg.type === "clarification") {
            return (
              <ClarificationMessage
                key={i}
                content={msg.content}
                missingFields={msg.missingFields}
                actions={msg.actions}
                onSend={send}
              />
            );
          }
          if (msg.type === "error") {
            return <ErrorMessage key={i} content={msg.content} />;
          }
          return (
            <AssistantMessage
              key={i}
              content={msg.content}
              nextActions={msg.nextActions}
              toolCards={msg.toolCards}
              onSend={send}
              router={router}
            />
          );
        })}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ex-input-wrap">
        <div className="ex-input-box">
          <textarea
            ref={inputRef}
            className="ex-input"
            placeholder="Ask about your career, skills, salary, visa..."
            value={input}
            rows={1}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ex-send"
            disabled={loading || !input.trim()}
            onClick={() => send(input)}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12.5L12.5 7L2 1.5V5.8L9 7L2 8.2V12.5Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <p className="ex-input-hint">
          <kbd>Enter</kbd> to send &nbsp;&nbsp; <kbd>Shift+Enter</kbd> for new line
        </p>
      </div>

    </div>
  );
}
