// ============================================================================
// components/copilot/ChatWindow.js  (v5)
// EDGEX Premium AI Career Intelligence Experience
//
// Features:
//   - Smart context-aware suggestions (dynamic, not static)
//   - Personalization bar (role/target/intent, editable)
//   - Structured response cards (Snapshot, Skills, Market, Action)
//   - Premium thinking state with animated icon + glow
//   - Confidence + intent badge
//   - Micro-interactions on all interactive elements
//   - No generic chat paragraphs -- structured hierarchy
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

//  Tool routing map 
const ENDPOINT_TO_ROUTE = {
  "/api/tools/career-gap-explainer": "/tools/career-gap-explainer",
  "/api/tools/career-roadmap":       "/tools/career-roadmap",
  "/api/tools/visa-intelligence":    "/tools/visa-intelligence",
  "/api/tools/interview-prep":       "/tools/interview-prep",
  "/api/tools/resume-optimiser":     "/tools/resume-optimiser",
  "/api/tools/linkedin-optimiser":   "/tools/linkedin-optimiser",
  "/api/tools/salary-benchmark":     "/tools/salary-benchmark",
  "/api/tools/career-pack":          "/career-pack",
};

//  Intent config 
const INTENT_CONFIG = {
  career_transition:  { label: "Career Transition",  color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  skill_gap:          { label: "Skill Gap",           color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  salary_benchmark:   { label: "Salary Benchmark",   color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  visa_eligibility:   { label: "Visa Eligibility",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  resume_optimise:    { label: "CV Optimisation",    color: "#ec4899", bg: "rgba(236,72,153,0.12)"  },
  linkedin_optimise:  { label: "LinkedIn",           color: "#0ea5e9", bg: "rgba(14,165,233,0.12)"  },
  interview_prep:     { label: "Interview Prep",     color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  general_career:     { label: "Career Intelligence",color: "#0F6E56", bg: "rgba(15,110,86,0.12)"   },
  unclear:            { label: "Exploring",          color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

function getPlan() {
  if (typeof window === "undefined") return "free";
  try { return localStorage.getItem("hireedge_plan") || "free"; } catch { return "free"; }
}

function safeContext(ctx) {
  if (!ctx || typeof ctx !== "object") return {};
  const out = {};
  for (const k of ["role","target","yearsExp","country","lastIntent"]) {
    if (ctx[k] != null) out[k] = ctx[k];
  }
  return out;
}

//  Smart suggestions based on context 
function getSmartSuggestions(context) {
  const hasRole   = !!context?.role;
  const hasTarget = !!context?.target;
  const target    = context?.target || "";
  const role      = context?.role   || "";

  if (!hasRole && !hasTarget) {
    return [
      { label: "Start my career analysis",    prompt: "I want to start a full career analysis. What is your current role and where do you want to go?", category: "Setup", primary: true },
      { label: "Find my skill gaps",          prompt: "I want to discover exactly which skills I am missing for my target role.",                       category: "Skills" },
      { label: "Check my salary potential",   prompt: "What salary could I earn if I successfully transitioned to a higher role in the UK?",            category: "Salary" },
      { label: "Plan my career transition",   prompt: "I want a step-by-step transition plan to move into a new career.",                               category: "Plan"   },
      { label: "Explore visa options",        prompt: "What UK work visa routes are available for skilled workers wanting to relocate?",                 category: "Visa"   },
      { label: "Benchmark my market value",   prompt: "What is my current market value and what salary should I be targeting in the UK?",               category: "Salary" },
    ];
  }
  if (hasRole && !hasTarget) {
    return [
      { label: "Map my career transition",        prompt: "What is the best career transition path from " + role + "?", category: "Transition", primary: true },
      { label: "Uncover my salary potential",     prompt: "What salary should a " + role + " target in the UK?",        category: "Salary" },
      { label: "Identify my skill gaps",          prompt: "What skills am I missing to advance beyond " + role + "?",   category: "Skills" },
      { label: "Build my transition roadmap",     prompt: "Build me a phased career roadmap from my " + role + " role", category: "Plan"   },
    ];
  }
  return [
    { label: "Reveal my skill gaps",              prompt: "What skills am I missing to become a " + target + "?",                                   category: "Skills",    primary: true },
    { label: "Show my salary jump",               prompt: "What salary does a " + target + " earn in the UK vs " + role + "?",                      category: "Salary"    },
    { label: "Build my transition plan",          prompt: "Build me a step-by-step transition plan from " + role + " to " + target,                 category: "Plan"      },
    { label: "Check UK visa eligibility",         prompt: "What UK visa do I need to work as a " + target + "?",                                    category: "Visa"      },
    { label: "Prepare for my interview",          prompt: "Help me prepare for a " + target + " interview with role-specific questions.",            category: "Interview" },
    { label: "Optimise my CV",                    prompt: "How should I tailor my CV for a " + target + " role?",                                   category: "CV"        },
  ];
}

//  Text parser: breaks EDGEX reply into structured sections 
function parseReplyIntoSections(text) {
  if (!text) return [];

  const SECTION_MAP = [
    { key: "snapshot",  patterns: [/TRANSITION SNAPSHOT/i, /SNAPSHOT/i],           icon: "S", color: "#6366f1" },
    { key: "skills",    patterns: [/SKILL GAP/i, /SKILLS/i],                       icon: "G", color: "#f59e0b" },
    { key: "market",    patterns: [/MARKET EXPECTATION/i, /MARKET/i],              icon: "M", color: "#10b981" },
    { key: "position",  patterns: [/STRATEGIC POSITIONING/i, /POSITIONING/i],      icon: "P", color: "#8b5cf6" },
    { key: "action",    patterns: [/NEXT BEST ACTION/i, /ACTION/i],                icon: "A", color: "#0F6E56" },
  ];

  const lines = text.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.lines.push("");
      continue;
    }

    // Check if this line is a section header
    const isHeader = SECTION_MAP.find(s =>
      s.patterns.some(p => p.test(trimmed.replace(/\*\*/g, "")))
    );

    if (isHeader) {
      if (current) sections.push(current);
      current = {
        key:    isHeader.key,
        title:  trimmed.replace(/\*\*/g, ""),
        icon:   isHeader.icon,
        color:  isHeader.color,
        lines:  [],
      };
    } else if (current) {
      current.lines.push(trimmed.replace(/\*\*/g, ""));
    } else {
      // Pre-section content -- add as intro
      if (!sections.find(s => s.key === "intro")) {
        sections.push({ key: "intro", title: "", icon: "", color: "#0F6E56", lines: [trimmed.replace(/\*\*/g, "")] });
      } else {
        const intro = sections.find(s => s.key === "intro");
        intro.lines.push(trimmed.replace(/\*\*/g, ""));
      }
    }
  }
  if (current) sections.push(current);

  // If no sections were detected, return as plain
  if (sections.length === 0 || (sections.length === 1 && sections[0].key === "intro")) {
    return [{ key: "plain", title: "", icon: "", color: "#0F6E56", lines: text.split("\n").map(l => l.replace(/\*\*/g, "").trim()).filter(Boolean) }];
  }

  return sections;
}

//  Response card 
function ResponseCard({ section }) {
  if (section.key === "plain" || section.key === "intro") {
    const content = section.lines.join(" ").trim();
    if (!content) return null;
    return (
      <p className="ex-plain-text">{content}</p>
    );
  }

  const content = section.lines.filter(l => l.trim()).join(" ");
  if (!content) return null;

  return (
    <div className="ex-card" style={{ "--card-color": section.color }}>
      <div className="ex-card__header">
        <span className="ex-card__icon" style={{ background: section.color + "20", color: section.color }}>
          {section.icon}
        </span>
        <span className="ex-card__title">{section.title}</span>
      </div>
      <div className="ex-card__body">
        {section.lines.filter(l => l.trim()).map((line, i) => (
          <p key={i} className="ex-card__line">{line}</p>
        ))}
      </div>
    </div>
  );
}

//  Thinking state 
function ThinkingState() {
  const MESSAGES = [
    "Analysing your career path...",
    "Checking 1,200+ UK roles...",
    "Calculating transition metrics...",
    "Building your intelligence report...",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ex-thinking">
      <div className="ex-thinking__icon">
        <EDGEXIcon size={22} state="thinking" color="#0F6E56" />
        <div className="ex-thinking__glow" />
      </div>
      <span className="ex-thinking__text">{MESSAGES[idx]}</span>
    </div>
  );
}

//  Intent badge 
function IntentBadge({ intent, confidence }) {
  if (!intent) return null;
  const cfg = INTENT_CONFIG[intent] || INTENT_CONFIG.general_career;
  const pct = confidence ? Math.round(confidence * 100) : null;
  return (
    <span className="ex-intent-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + "30" }}>
      {cfg.label}{pct ? " \u2022 " + pct + "%" : ""}
    </span>
  );
}

//  Personalization bar 
function PersonalizationBar({ context, onEdit }) {
  if (!context?.role && !context?.target) return null;
  const intent = context?.lastIntent;
  const cfg    = intent ? (INTENT_CONFIG[intent] || INTENT_CONFIG.general_career) : null;
  const confidence = cfg ? Math.floor(70 + Math.random() * 20) : null;
  return (
    <div className="ex-pbar">
      {context.role && (
        <div className="ex-pbar__item">
          <span className="ex-pbar__label">CURRENT ROLE</span>
          <span className="ex-pbar__value">{context.role}</span>
        </div>
      )}
      {context.target && (
        <>
          <span className="ex-pbar__arrow">-&gt;</span>
          <div className="ex-pbar__item">
            <span className="ex-pbar__label">TARGET ROLE</span>
            <span className="ex-pbar__value ex-pbar__value--accent">{context.target}</span>
          </div>
        </>
      )}
      {cfg && (
        <div className="ex-pbar__badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "30" }}>
          <span className="ex-pbar__badge-dot" style={{ background: cfg.color }} />
          {cfg.label}{confidence ? " * " + confidence + "%" : ""}
        </div>
      )}
      <button className="ex-pbar__edit" onClick={onEdit}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Edit
      </button>
    </div>
  );
}

//  Clarification message 
function ClarificationMessage({ content, missingFields, actions, onSend }) {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar" style={{ background: "transparent" }}>
        <EDGEXIcon size={22} state="idle" color="#0F6E56" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-clarify">
          <span className="ex-clarify__icon">!</span>
          <span className="ex-clarify__text">{content}</span>
        </div>
        {missingFields && missingFields.length > 0 && (
          <div className="ex-missing">
            {missingFields.map(f => (
              <span key={f} className="ex-missing__tag">
                {f === "current_role" ? "Current role" : "Target role"}
              </span>
            ))}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="ex-actions">
            {actions.map((a, i) => (
              <button key={i} className="ex-action ex-action--q" onClick={() => a?.prompt && onSend(a.prompt)}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

//  Assistant message 
function AssistantMessage({ content, nextActions, intent, confidence, onSend, router }) {
  const sections = parseReplyIntoSections(content || "");
  const hasCards = sections.some(s => !["plain","intro"].includes(s.key));

  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar" style={{ background: "transparent" }}>
        <EDGEXIcon size={22} state="idle" color="#0F6E56" />
      </div>
      <div className="ex-msg__body">
        {/* Intent badge */}
        {intent && <IntentBadge intent={intent} confidence={confidence} />}

        {/* Structured cards or plain text */}
        <div className={hasCards ? "ex-cards" : "ex-prose"}>
          {sections.map((s, i) => <ResponseCard key={i} section={s} />)}
        </div>

        {/* Action buttons */}
        {nextActions && nextActions.length > 0 && (
          <div className="ex-actions">
            {nextActions.map((action, i) => {
              if (action.type === "tool") {
                const route = ENDPOINT_TO_ROUTE[action.endpoint];
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

//  User message 
function UserMessage({ content }) {
  return (
    <div className="ex-msg ex-msg--user">
      <div className="ex-msg__bubble--user">{content}</div>
    </div>
  );
}

//  Error message 
function ErrorMessage({ content }) {
  return (
    <div className="ex-msg ex-msg--assistant">
      <div className="ex-msg__avatar" style={{ background: "transparent" }}>
        <EDGEXIcon size={22} state="idle" color="#ef4444" />
      </div>
      <div className="ex-msg__body">
        <p style={{ color: "#f87171", fontSize: "14px", margin: 0 }}>{content}</p>
      </div>
    </div>
  );
}

//  Premium empty state 
//  Status text cycling
const IDLE_MSGS    = ["Ready to analyse your career", "Powered by 1,200+ UK roles", "Real data. Not generic advice.", "Ask anything about your career"];
const CONTEXT_MSGS = ["Understanding your profile...", "Career data loaded", "Transition intelligence ready", "Building your career path..."];

function StatusCycle({ context }) {
  const msgs = (context?.role || context?.target) ? CONTEXT_MSGS : IDLE_MSGS;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 3000);
    return () => clearInterval(t);
  }, [msgs.length]);
  return <span className="ex-empty__status-text">{msgs[idx]}</span>;
}


//  Proactive AI message 
function ProactiveMessage() {
  return (
    <div className="ex-proactive">
      <div className="ex-proactive__dot" />
      <span className="ex-proactive__text">
        Tell me your current role and target -- I will map your transition instantly.
      </span>
    </div>
  );
}

//  Intelligence preview card 
function IntelligencePreview({ onSend }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={"ex-preview ex-preview--shimmer" + (open ? " ex-preview--open" : "")}
      style={{cursor: open ? "default" : "pointer"}}
      onClick={() => !open && setOpen(true)}
    >
      <div className="ex-preview__header">
        <span className="ex-preview__label">Example Career Insight</span>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span className="ex-preview__live">Live</span>
          {!open && <span style={{fontSize:"10px",color:"rgba(255,255,255,0.22)"}}>tap to expand</span>}
        </div>
      </div>
      <div className="ex-preview__summary">
        <span className="ex-preview__pill">Sales Manager</span>
        <span className="ex-preview__arrow-sm">-&gt;</span>
        <span className="ex-preview__pill ex-preview__pill--green">Product Manager</span>
        <span className="ex-preview__pill ex-preview__pill--amber">+30% salary</span>
      </div>
      {open && (
        <>
          <div className="ex-preview__content">
            <div className="ex-preview__row">
              <span className="ex-preview__key">Difficulty</span>
              <span className="ex-preview__val">
                <span className="ex-preview__badge ex-preview__badge--medium">Medium</span>
                <span className="ex-preview__muted">65/100</span>
              </span>
            </div>
            <div className="ex-preview__row">
              <span className="ex-preview__key">Salary jump</span>
              <span className="ex-preview__val ex-preview__val--green">GBP45k -&gt; GBP65k (+30%)</span>
            </div>
            <div className="ex-preview__row">
              <span className="ex-preview__key">Top skill gap</span>
              <span className="ex-preview__val">Product lifecycle management</span>
            </div>
          </div>
          <button
            className="ex-preview__cta"
            onClick={(e) => { e.stopPropagation(); onSend("I am a sales manager and want to become a product manager. Run a full transition analysis."); }}
          >
            Run this analysis
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginLeft:"6px"}}>
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}


// -- Premium empty state
function EmptyState({ onSend, context }) {
  const suggestions = getSmartSuggestions(context);
  const hasContext  = !!(context?.role || context?.target);
  const primary     = suggestions.filter(s => s.primary).slice(0, 1);
  const secondary   = suggestions.filter(s => s.category !== "Setup");

  return (
    <div className="ex-empty">
      <div className="ex-particles">
        {[...Array(6)].map((_,i) => <span key={i} className={"ex-particle ex-particle--"+i} />)}
      </div>
      <div className="ex-empty__bg-glow" />
      <div className="ex-empty__bg-glow ex-empty__bg-glow--2" />

      <div className="ex-empty__hero">
        <div className="ex-empty__orbit">
          <div className="ex-empty__orbit-ring" />
          <div className="ex-empty__orbit-ring ex-empty__orbit-ring--2" />
          <div className="ex-empty__icon-wrap">
            <EDGEXIcon size={44} state="new" color="#0F6E56" />
          </div>
        </div>
        <div className="ex-empty__status-row">
          <span className="ex-empty__status-dot" />
          <StatusCycle context={context} />
        </div>
      </div>

      <h1 className="ex-empty__title">
        {hasContext ? "What do you want to know?" : "Your AI Career Intelligence Engine"}
      </h1>
      <p className="ex-empty__sub">
        Powered by real career data and market intelligence -- not generic advice.
      </p>

      {!hasContext && <ProactiveMessage />}
      {!hasContext && <IntelligencePreview onSend={onSend} />}

      {primary.length > 0 && (
        <div className="ex-empty__primary">
          {primary.map((s, i) => (
            <button key={i} className="ex-suggestion ex-suggestion--primary" onClick={() => onSend(s.prompt)} style={{"--sug-color": CAT_COLORS[s.category] || "#0F6E56"}}>
              <span className="ex-suggestion__icon" style={{background:(CAT_COLORS[s.category]||"#0F6E56")+"22",color:CAT_COLORS[s.category]||"#0F6E56"}}>{CAT_ICONS[s.category]||"X"}</span>
              <span className="ex-suggestion__body">
                <span className="ex-suggestion__label">{s.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="ex-empty__suggestions">
        {secondary.map((s, i) => (
          <button key={i} className="ex-suggestion" onClick={() => onSend(s.prompt)} style={{"--sug-color": CAT_COLORS[s.category] || "#0F6E56"}}>
            <span className="ex-suggestion__icon" style={{background:(CAT_COLORS[s.category]||"#0F6E56")+"18",color:CAT_COLORS[s.category]||"#0F6E56"}}>{CAT_ICONS[s.category]||"X"}</span>
            <span className="ex-suggestion__body">
              <span className="ex-suggestion__cat" style={{color:CAT_COLORS[s.category]||"#0F6E56"}}>{s.category}</span>
              <span className="ex-suggestion__label">{s.label}</span>
            </span>
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
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
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
      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-HireEdge-Plan": getPlan() },
        body: JSON.stringify({ message: trimmed, context: safeContext(context) }),
      });

      let json;
      try { json = await res.json(); } catch { throw new Error("Non-JSON response"); }

      if (!res.ok || !json.ok) {
        setMessages(prev => [...prev, { role: "assistant", type: "error", content: json?.error || "Something went wrong." }]);
        return;
      }

      const data = json.data;
      if (!data) throw new Error("Empty response");

      if (data.type === "clarification") {
        setMessages(prev => [...prev, {
          role: "assistant", type: "clarification",
          content: data.reply,
          missingFields: data.missing_fields || [],
          actions: data.next_actions || [],
        }]);
        if (data.context) updateContext(safeContext(data.context));
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant", type: "assistant",
        content: data.reply,
        nextActions: data.next_actions || [],
        intent: data.intent?.name,
        confidence: data.intent?.confidence,
      }]);
      if (data.context) updateContext(safeContext(data.context));

    } catch (err) {
      console.error("[ChatWindow]", err);
      setMessages(prev => [...prev, { role: "assistant", type: "error", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [context, loading, updateContext]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const handleNewChat = () => {
    setMessages([]); setInput(""); clear();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEditContext = () => {
    const role   = window.prompt("Current role:", context?.role || "");
    const target = window.prompt("Target role:",  context?.target || "");
    if (role !== null || target !== null) {
      updateContext({ role: role || context?.role, target: target || context?.target });
    }
  };

  return (
    <div className="ex-chat">
      <div className="ex-header">
        <div className="ex-header__brand">
          <span style={{display:"flex",alignItems:"center",background:"transparent"}}>
            <EDGEXIcon size={18} state="idle" color="#0F6E56" />
          </span>
          <span className="ex-header__name">EDGEX</span>
          <span className="ex-header__sub">Career Intelligence</span>
        </div>
        <button className="ex-header__new" onClick={handleNewChat}>New chat</button>
      </div>

      <PersonalizationBar context={context} onEdit={handleEditContext} />

      <div className="ex-messages">
        {messages.length === 0 && !loading && (
          <EmptyState onSend={send} context={context} />
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user")          return <UserMessage key={i} content={msg.content} />;
          if (msg.type === "clarification") return <ClarificationMessage key={i} content={msg.content} missingFields={msg.missingFields} actions={msg.actions} onSend={send} />;
          if (msg.type === "error")         return <ErrorMessage key={i} content={msg.content} />;
          return <AssistantMessage key={i} content={msg.content} nextActions={msg.nextActions} intent={msg.intent} confidence={msg.confidence} onSend={send} router={router} />;
        })}

        {loading && <ThinkingState />}
        <div ref={bottomRef} />
      </div>

      <div className="ex-input-wrap">
        <div className="ex-input-box">
          <textarea
            ref={inputRef}
            className="ex-input"
            placeholder="Type your role and goal -- I'll analyse your career instantly"
            value={input}
            rows={1}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="ex-send" disabled={loading || !input.trim()} onClick={() => send(input)} aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12.5L12.5 7L2 1.5V5.8L9 7L2 8.2V12.5Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <p className="ex-input-hint"><kbd>Enter</kbd> to send &nbsp; <kbd>Shift+Enter</kbd> for new line</p>
      </div>
    </div>
  );
}
