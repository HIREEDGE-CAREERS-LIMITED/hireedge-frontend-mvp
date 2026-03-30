// ============================================================================
// components/copilot/ChatWindow.js  —  EDGEX Final Production (corrected)
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import { useAuth } from "../../contexts/AuthContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import {
  createConversation,
  listConversations,
  loadConversation,
  saveMessage,
  updateConversationTitle,
} from "../../lib/conversations";
import {
  TOOLS,
  INTELLIGENCE_MODES,
  getPlan,
  isPaid,
  classifyIntent,
  buildRequestPayload,
  parseReplyIntoSections,
  detectUploadType,
  getUploadActions,
} from "../../lib/edgexOrchestrator";
import { extractDocument, estimateTokens } from "../../lib/documentExtractor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

const ENDPOINT_TO_ROUTE = {
  "/api/tools/career-gap-explainer": "/tools/career-gap-explainer",
  "/api/tools/career-roadmap": "/tools/career-roadmap",
  "/api/tools/visa-intelligence": "/tools/visa-intelligence",
  "/api/tools/interview-prep": "/tools/interview-prep",
  "/api/tools/resume-optimiser": "/tools/resume-optimiser",
  "/api/tools/linkedin-optimiser": "/tools/linkedin-optimiser",
  "/api/tools/salary-benchmark": "/tools/salary-benchmark",
  "/api/tools/career-pack": "/career-pack",
};

const INTENT_CONFIG = {
  career_transition: { label: "Career Transition", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  skill_gap: { label: "Skill Gap", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  salary_benchmark: { label: "Salary Benchmark", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  visa_eligibility: { label: "Visa Eligibility", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  resume_optimise: { label: "CV Optimisation", color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  linkedin_optimise: { label: "LinkedIn", color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  interview_prep: { label: "Interview Prep", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  general_career: { label: "Career Intelligence", color: "#0F6E56", bg: "rgba(15,110,86,0.12)" },
  unclear: { label: "Exploring", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

function _safe(ctx) {
  if (!ctx || typeof ctx !== "object") return {};
  const out = {};
  for (const k of ["role", "target", "yearsExp", "country", "lastIntent"]) {
    if (ctx[k] != null) out[k] = ctx[k];
  }
  return out;
}

function dbRowToMsg(row) {
  const m = row.meta || {};
  return {
    role: row.role,
    content: row.content,
    type: m.type || (row.role === "user" ? "user" : "assistant"),
    intent: m.intent || null,
    confidence: m.confidence || null,
    nextActions: m.nextActions || [],
    missingFields: m.missingFields || [],
    actions: m.actions || [],
    intelligenceMode: m.intelligenceMode || null,
    fileName: m.fileName || null,
  };
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return mobile;
}

function smartSuggestions(ctx) {
  const role = ctx?.role || "";
  const target = ctx?.target || "";

  if (!role && !target) {
    return [
      { label: "Find my skill gaps", prompt: "I want to discover exactly which skills I am missing for my target role.", cat: "Skills" },
      { label: "Check my salary potential", prompt: "What salary could I earn if I transitioned to a higher role in the UK?", cat: "Salary" },
      { label: "Plan my career transition", prompt: "I want a step-by-step transition plan to move into a new career.", cat: "Plan" },
      { label: "Explore UK visa options", prompt: "What UK work visa routes are available for skilled workers wanting to relocate?", cat: "Visa" },
    ];
  }

  if (role && !target) {
    return [
      { label: "Map my transition path", prompt: "What is the best career transition path from " + role + "?", cat: "Transition" },
      { label: "Salary potential", prompt: "What salary should a " + role + " target in the UK?", cat: "Salary" },
      { label: "Identify my skill gaps", prompt: "What skills am I missing to advance beyond " + role + "?", cat: "Skills" },
      { label: "Build a career roadmap", prompt: "Build me a phased roadmap from my " + role + " role", cat: "Plan" },
    ];
  }

  const short = target.split(" ").slice(0, 2).join(" ");
  return [
    { label: "Reveal skill gaps", prompt: "What skills am I missing to become a " + target + "?", cat: "Skills" },
    { label: "Salary jump breakdown", prompt: "What salary does a " + target + " earn vs " + role + " in the UK?", cat: "Salary" },
    { label: "Full transition plan", prompt: "Build me a step-by-step transition plan from " + role + " to " + target, cat: "Plan" },
    { label: "Interview prep for " + short, prompt: "Help me prepare for a " + target + " interview with role-specific questions.", cat: "Interview" },
  ];
}

const CAT_COLOR = {
  Skills: "#f59e0b",
  Salary: "#10b981",
  Plan: "#0F6E56",
  Visa: "#3b82f6",
  Transition: "#6366f1",
  Interview: "#8b5cf6",
  CV: "#ec4899",
};

const CAT_ICON = {
  Skills: "G",
  Salary: "£",
  Plan: "P",
  Visa: "V",
  Transition: "T",
  Interview: "I",
  CV: "C",
};

function ThinkingState({ mode }) {
  const MSGS_BY_MODE = {
    salary: ["Querying UK salary data...", "Benchmarking your role...", "Checking market rates...", "Crunching compensation data..."],
    transition: ["Scoring transition difficulty...", "Checking demand signals...", "Mapping your move...", "Calculating success factors..."],
    skills: ["Mapping skill requirements...", "Comparing role profiles...", "Identifying gaps...", "Scoring your readiness..."],
    path: ["Charting career routes...", "Finding stepping-stone roles...", "Mapping alternatives...", "Calculating best path..."],
  };

  const msgs =
    MSGS_BY_MODE[mode] || [
      "Analysing your career path...",
      "Checking 1,200+ UK roles...",
      "Calculating transition metrics...",
      "Building your intelligence report...",
    ];

  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % msgs.length), 1900);
    return () => clearInterval(t);
  }, [msgs.length]);

  return (
    <div className="ex-thinking">
      <div className="ex-thinking__icon">
        <EDGEXIcon size={20} state="thinking" color="#0F6E56" />
        <div className="ex-thinking__pulse" />
      </div>
      <span className="ex-thinking__text">{msgs[i]}</span>
    </div>
  );
}

function IntentBadge({ intent, confidence, intelligenceMode }) {
  if (intelligenceMode) {
    const m = INTELLIGENCE_MODES.find((x) => x.key === intelligenceMode);
    if (m) {
      return (
        <span className="ex-badge" style={{ background: m.color + "18", color: m.color, borderColor: m.color + "28" }}>
          <span className="ex-badge__icon">{m.icon}</span>
          {m.label}
        </span>
      );
    }
  }

  if (!intent) return null;

  const cfg = INTENT_CONFIG[intent] || INTENT_CONFIG.general_career;
  return (
    <span className="ex-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + "28" }}>
      {cfg.label}
      {confidence ? " · " + Math.round(confidence * 100) + "%" : ""}
    </span>
  );
}

function PersonalizationBar({ context, onEdit }) {
  if (!context?.role && !context?.target) return null;

  const intent = context?.lastIntent;
  const cfg = intent ? INTENT_CONFIG[intent] || INTENT_CONFIG.general_career : null;

  return (
    <div className="ex-pbar">
      {context.role && (
        <div className="ex-pbar__item">
          <span className="ex-pbar__label">CURRENT</span>
          <span className="ex-pbar__value">{context.role}</span>
        </div>
      )}

      {context.target && (
        <>
          <span className="ex-pbar__sep">→</span>
          <div className="ex-pbar__item">
            <span className="ex-pbar__label">TARGET</span>
            <span className="ex-pbar__value ex-pbar__value--teal">{context.target}</span>
          </div>
        </>
      )}

      {cfg && (
        <span className="ex-pbar__mode" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "28" }}>
          <span className="ex-pbar__mode-dot" style={{ background: cfg.color }} />
          {cfg.label}
        </span>
      )}

      <button className="ex-pbar__edit" onClick={onEdit} title="Edit context">
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
          <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Edit
      </button>
    </div>
  );
}

const SECTION_DISPLAY = {
  summary: { display: "Summary" },
  insight: { display: "Key Insight" },
  gap: { display: "Gap / Opportunity" },
  next_step: { display: "Next Step" },
  snapshot: { display: "Snapshot" },
  skills: { display: "Skills" },
  market: { display: "Market" },
  position: { display: "Positioning" },
  action: { display: "Action" },
};

function RLine({ item }) {
  if (!item || item.type === "gap") return null;
  if (item.type === "bullet") {
    return (
      <div className="ex-rline ex-rline--bullet">
        <span className="ex-rline__dot" />
        <span>{item.text}</span>
      </div>
    );
  }
  return <p className="ex-rline">{item.text}</p>;
}

function RCard({ section }) {
  const lines = (section.lines || []).filter((l) => l && l.type !== "gap");
  const isPlain = section.key === "plain" || section.key === "intro";
  const meta = SECTION_DISPLAY[section.key];

  if (!lines.length) return null;

  if (isPlain) {
    return (
      <div className="ex-prose">
        {(section.lines || []).map((item, i) => {
          if (!item || item.type === "gap") return <div key={i} style={{ height: 5 }} />;
          return <RLine key={i} item={item} />;
        })}
      </div>
    );
  }

  return (
    <div className={"ex-rcard ex-rcard--" + section.key} style={{ "--rc": section.color }}>
      <div className="ex-rcard__hd">
        <span className="ex-rcard__icon" style={{ background: section.color + "18", color: section.color }}>
          {section.icon}
        </span>
        <span className="ex-rcard__title" style={{ color: section.color }}>
          {meta?.display || section.title}
        </span>
      </div>
      <div className="ex-rcard__body">
        {(section.lines || []).map((item, i) => (
          <RLine key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function UserMsg({ content, fileName }) {
  return (
    <div className="ex-msg ex-msg--user">
      {fileName && (
        <div className="ex-fchip ex-fchip--msg">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M3 1h5l2 2v8H3V1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {fileName}
        </div>
      )}
      <div className="ex-msg__bubble">{content}</div>
    </div>
  );
}

function AssistantMsg({ content, nextActions, intent, confidence, intelligenceMode, onSend, router }) {
  const sections = parseReplyIntoSections(content || "");
  const hasCards = sections.some((s) => !["plain", "intro"].includes(s.key));

  return (
    <div className="ex-msg ex-msg--ai">
      <div className="ex-msg__av">
        <EDGEXIcon size={20} state="idle" color="#0F6E56" />
      </div>
      <div className="ex-msg__body">
        <IntentBadge intent={intent} confidence={confidence} intelligenceMode={intelligenceMode} />
        <div className={hasCards ? "ex-rcards" : "ex-prose-wrap"}>
          {sections.map((s, i) => (
            <RCard key={i} section={s} />
          ))}
        </div>
        {nextActions?.length > 0 && (
          <div className="ex-actions">
            {nextActions.map((a, i) => {
              if (a.type === "tool") {
                const route = ENDPOINT_TO_ROUTE[a.endpoint];
                if (!route) return null;
                return (
                  <button key={i} className="ex-act ex-act--tool" onClick={() => router.push(route)}>
                    {a.label}
                  </button>
                );
              }
              return (
                <button key={i} className="ex-act ex-act--q" onClick={() => onSend(a.prompt)}>
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ClarifyMsg({ content, missingFields, actions, onSend }) {
  return (
    <div className="ex-msg ex-msg--ai">
      <div className="ex-msg__av">
        <EDGEXIcon size={20} state="idle" color="#0F6E56" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-clarify">
          <span className="ex-clarify__icon">!</span>
          <span className="ex-clarify__text">{content}</span>
        </div>
        {missingFields?.length > 0 && (
          <div className="ex-missing">
            {missingFields.map((f) => (
              <span key={f} className="ex-missing__tag">
                {f === "current_role" ? "Current role" : "Target role"}
              </span>
            ))}
          </div>
        )}
        {actions?.length > 0 && (
          <div className="ex-actions">
            {actions.map((a, i) => (
              <button key={i} className="ex-act ex-act--q" onClick={() => a?.prompt && onSend(a.prompt)}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorMsg({ content }) {
  return (
    <div className="ex-msg ex-msg--ai">
      <div className="ex-msg__av">
        <div className="ex-msg__av--err">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="ex-msg__body">
        <p className="ex-err-text">{content}</p>
      </div>
    </div>
  );
}

function UploadMsg({ fileName, uploadType, actions, onSend, extractionState, tokenCount, extractionError }) {
  const TYPE_MAP = {
    cv: { label: "CV uploaded", color: "#6366f1" },
    jd: { label: "Job description uploaded", color: "#10b981" },
    cover: { label: "Cover letter uploaded", color: "#f59e0b" },
    document: { label: "Document uploaded", color: "#0F6E56" },
  };
  const t = TYPE_MAP[uploadType] || TYPE_MAP.document;

  return (
    <div className="ex-msg ex-msg--ai">
      <div className="ex-msg__av">
        <EDGEXIcon size={20} state="idle" color="#0F6E56" />
      </div>
      <div className="ex-msg__body">
        <div className="ex-upload-card" style={{ "--uc": t.color }}>
          <div className="ex-upload-card__hd">
            <span className="ex-upload-card__icon" style={{ background: t.color + "18", color: t.color }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M3 1h5l3 3v9H3V1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 1v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="ex-upload-card__type" style={{ color: t.color }}>
                {t.label}
              </div>
              <div className="ex-upload-card__name">{fileName}</div>
            </div>
          </div>

          {extractionState === "extracting" && (
            <div className="ex-upload-card__status ex-upload-card__status--extracting">
              <span className="ex-upload-card__spinner" />
              Reading document content...
            </div>
          )}

          {extractionState === "ready" && tokenCount != null && (
            <div className="ex-upload-card__status ex-upload-card__status--ready">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Content read — approximately {tokenCount.toLocaleString()} tokens
            </div>
          )}

          {extractionState === "error" && (
            <div className="ex-upload-card__status ex-upload-card__status--error">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v4M6 9v1" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {extractionError || "Could not read this file. EDGEX will use filename context only."}
            </div>
          )}

          {extractionState !== "extracting" && (
            <>
              <p className="ex-upload-card__hint">What would you like EDGEX to do?</p>
              <div className="ex-actions ex-actions--wrap">
                {actions.map((a, i) => (
                  <button key={i} className="ex-act ex-act--q" onClick={() => onSend(a.prompt)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const IDLE_MSGS = [
  "Ready to analyse your career",
  "Powered by 1,200+ UK roles",
  "Real data. Not generic advice.",
  "Ask anything about your career",
];

const CONTEXT_MSGS = [
  "Understanding your profile...",
  "Career data loaded",
  "Transition intelligence ready",
  "Building your career path...",
];

function StatusCycle({ context }) {
  const msgs = context?.role || context?.target ? CONTEXT_MSGS : IDLE_MSGS;
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % msgs.length), 3000);
    return () => clearInterval(t);
  }, [msgs.length]);

  return <span className="ex-empty__status-text">{msgs[i]}</span>;
}

function IntelPreview({ onSend }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={"ex-preview" + (open ? " ex-preview--open" : "")}
      onClick={() => !open && setOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !open && setOpen(true)}
    >
      <div className="ex-preview__hd">
        <span className="ex-preview__label">Example Intelligence Output</span>
        <span className="ex-preview__live">Live</span>
      </div>
      <div className="ex-preview__pills">
        <span className="ex-pill">Sales Manager</span>
        <span className="ex-pill__arrow">→</span>
        <span className="ex-pill ex-pill--green">Product Manager</span>
        <span className="ex-pill ex-pill--amber">+30% salary</span>
        {!open && <span className="ex-preview__tap">tap to expand</span>}
      </div>
      {open && (
        <div className="ex-preview__body" onClick={(e) => e.stopPropagation()}>
          <div className="ex-preview__row">
            <span className="ex-preview__k">Difficulty</span>
            <span className="ex-preview__v">
              <span className="ex-preview__badge">Medium · 65/100</span>
            </span>
          </div>
          <div className="ex-preview__row">
            <span className="ex-preview__k">Salary jump</span>
            <span className="ex-preview__v ex-preview__v--green">£45k → £65k (+30%)</span>
          </div>
          <div className="ex-preview__row">
            <span className="ex-preview__k">Top skill gap</span>
            <span className="ex-preview__v">Product lifecycle management</span>
          </div>
          <div className="ex-preview__row">
            <span className="ex-preview__k">Timeline</span>
            <span className="ex-preview__v">9–14 months with deliberate steps</span>
          </div>
          <button
            className="ex-preview__cta"
            onClick={() => onSend("I am a sales manager and want to become a product manager. Run a full transition analysis.")}
          >
            Run this analysis for my profile
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 5 }}>
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onSend, context }) {
  const sugg = smartSuggestions(context);

  return (
    <div className="ex-empty">
      <div className="ex-empty__glow" />
      <div className="ex-empty__flow">
        <div className="ex-empty__hero">
          <div className="ex-empty__orbit">
            <div className="ex-empty__ring" />
            <div className="ex-empty__ring ex-empty__ring--2" />
            <div className="ex-empty__core">
              <EDGEXIcon size={28} state="hero" color="#0F6E56" />
            </div>
          </div>
          <div className="ex-empty__status">
            <span className="ex-empty__dot" />
            <StatusCycle context={context} />
          </div>
        </div>

        <h1 className="ex-empty__h1">Your AI Career Intelligence Engine</h1>
        <p className="ex-empty__sub">Real career data. Market intelligence. Not generic advice.</p>

        <IntelPreview onSend={onSend} />

        <button
          className="ex-empty__cta"
          onClick={() =>
            onSend("Start my career analysis. Help me understand my current market position, skill gaps, and career opportunities.")
          }
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <line x1="4.5" y1="4.5" x2="10.2" y2="10.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="19.5" y1="4.5" x2="13.8" y2="10.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="4.5" y1="19.5" x2="10.2" y2="13.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="19.5" y1="19.5" x2="13.8" y2="13.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          Start my career analysis
        </button>

        <div className="ex-empty__grid">
          {sugg.map((s, i) => (
            <button
              key={i}
              className="ex-sugg"
              onClick={() => onSend(s.prompt)}
              style={{ "--sc": CAT_COLOR[s.cat] || "#0F6E56" }}
            >
              <span className="ex-sugg__icon" style={{ color: CAT_COLOR[s.cat] || "#0F6E56", background: (CAT_COLOR[s.cat] || "#0F6E56") + "18" }}>
                {CAT_ICON[s.cat] || "·"}
              </span>
              <span className="ex-sugg__label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ open, onClose, isMobile, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open || isMobile) return;

    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };

    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open, isMobile, onClose]);

  if (!open) return null;

  if (isMobile) {
    return (
      <>
        <div className="ex-backdrop" onClick={onClose} />
        <div className="ex-sheet" role="dialog" aria-modal="true">
          <div className="ex-sheet__handle" />
          {children}
        </div>
      </>
    );
  }

  return (
    <div className={"ex-pop " + className} ref={ref} role="dialog">
      {children}
    </div>
  );
}

function ToolsPanel({ open, onClose, isMobile, router, onNeedUpgrade }) {
  const paid = isPaid();

  const handleTool = (t) => {
    if (t.paid && !paid) {
      onNeedUpgrade(t);
      onClose();
      return;
    }
    if (t.route) router.push(t.route);
    onClose();
  };

  return (
    <Panel open={open} onClose={onClose} isMobile={isMobile} className="ex-pop--tools">
      <div className="ex-panel">
        <div className="ex-panel__hd">
          <span className="ex-panel__title">Career Tools</span>
          <button className="ex-panel__x" onClick={onClose}>✕</button>
        </div>
        <ul className="ex-panel__list">
          {TOOLS.map((t) => (
            <li key={t.key}>
              <button className="ex-tool-item" onClick={() => handleTool(t)}>
                <span className="ex-tool-item__dot" style={{ background: t.color }} />
                <div className="ex-tool-item__body">
                  <span className="ex-tool-item__name">{t.label}</span>
                  <span className="ex-tool-item__tag">{t.tagline}</span>
                </div>
                <span className={"ex-tier " + (t.paid ? (paid ? "ex-tier--pro" : "ex-tier--locked") : "ex-tier--free")}>
                  {t.paid ? "Pro" : "Free"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function IntelPanel({ open, onClose, isMobile, activeMode, onSelect }) {
  return (
    <Panel open={open} onClose={onClose} isMobile={isMobile} className="ex-pop--intel">
      <div className="ex-panel">
        <div className="ex-panel__hd">
          <span className="ex-panel__title">Intelligence Mode</span>
          <span className="ex-panel__free">Free</span>
          <button className="ex-panel__x" onClick={onClose}>✕</button>
        </div>
        <p className="ex-panel__sub">Select a mode for deeper structured analysis in chat</p>
        <div className="ex-imode-grid">
          {INTELLIGENCE_MODES.map((m) => (
            <button
              key={m.key}
              className={"ex-imode" + (activeMode === m.key ? " ex-imode--on" : "")}
              style={{ "--im": m.color }}
              onClick={() => {
                onSelect(activeMode === m.key ? null : m.key);
                onClose();
              }}
            >
              <span className="ex-imode__icon" style={{ background: m.color + "18", color: m.color }}>
                {m.icon}
              </span>
              <span className="ex-imode__label">{m.label}</span>
              <span className="ex-imode__desc">{m.tagline}</span>
              {activeMode === m.key && <span className="ex-imode__check">✓</span>}
            </button>
          ))}
        </div>
        {activeMode && (
          <button
            className="ex-panel__clear"
            onClick={() => {
              onSelect(null);
              onClose();
            }}
          >
            Clear mode
          </button>
        )}
      </div>
    </Panel>
  );
}

function UploadPanel({ open, onClose, isMobile, onFile }) {
  const fileRef = useRef(null);
  const [accept, setAccept] = useState("*");

  const TYPES = [
    { key: "cv", icon: "C", label: "CV / Resume", desc: "EDGEX analyses gaps, ATS fit, and rewrite suggestions", color: "#6366f1", accept: ".pdf,.doc,.docx" },
    { key: "jd", icon: "J", label: "Job Description", desc: "EDGEX scores your fit and identifies what to close", color: "#10b981", accept: ".pdf,.txt,.doc,.docx" },
    { key: "cover", icon: "L", label: "Cover Letter", desc: "EDGEX reviews impact, tone, and opening strength", color: "#f59e0b", accept: ".pdf,.doc,.docx,.txt" },
  ];

  return (
    <Panel open={open} onClose={onClose} isMobile={isMobile} className="ex-pop--upload">
      <div className="ex-panel">
        <div className="ex-panel__hd">
          <span className="ex-panel__title">Upload Document</span>
          <button className="ex-panel__x" onClick={onClose}>✕</button>
        </div>
        <p className="ex-panel__sub">EDGEX will analyse your document in the context of your career goals</p>
        <ul className="ex-upload-list">
          {TYPES.map((ut) => (
            <li key={ut.key}>
              <button
                className="ex-utype"
                onClick={() => {
                  setAccept(ut.accept);
                  fileRef.current?.click();
                  onClose();
                }}
              >
                <span className="ex-utype__icon" style={{ background: ut.color + "18", color: ut.color }}>
                  {ut.icon}
                </span>
                <div className="ex-utype__body">
                  <span className="ex-utype__name">{ut.label}</span>
                  <span className="ex-utype__desc">{ut.desc}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </Panel>
  );
}

function UpgradeModal({ tool, onClose, router }) {
  if (!tool) return null;

  return (
    <>
      <div className="ex-backdrop" onClick={onClose} />
      <div className="ex-sheet ex-sheet--upgrade" role="dialog" aria-modal="true">
        <div className="ex-sheet__handle" />
        <div className="ex-upgrade">
          <div className="ex-upgrade__icon" style={{ background: tool.color + "18", color: tool.color }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2l1.5 3.5L14 7l-2.5 2.5.6 3.5L9 11.5 6.9 13l.6-3.5L5 7l3.5-1.5z" />
            </svg>
          </div>
          <h3 className="ex-upgrade__title">{tool.label}</h3>
          <p className="ex-upgrade__desc">{tool.tagline}</p>
          <div className="ex-upgrade__options">
            <button
              className="ex-upgrade__pack"
              onClick={() => {
                router.push("/billing?plan=career_pack");
                onClose();
              }}
            >
              <div className="ex-upgrade__pack-inner">
                <span className="ex-upgrade__pack-label">Career Pack</span>
                <span className="ex-upgrade__pack-price">£6.99 one-time</span>
              </div>
              <span className="ex-upgrade__pack-note">All tools · One payment · No subscription</span>
            </button>
            <button
              className="ex-upgrade__pro"
              onClick={() => {
                router.push("/billing?plan=pro");
                onClose();
              }}
            >
              Unlock with Pro — £14.99/mo
            </button>
          </div>
          <button className="ex-upgrade__dismiss" onClick={onClose}>Not now</button>
        </div>
      </div>
    </>
  );
}

function PowerBar({
  input,
  setInput,
  loading,
  onSend,
  uploadedFile,
  onClearFile,
  intelligenceMode,
  onOpenTools,
  onOpenIntel,
  onOpenUpload,
}) {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  }, [input]);

  const activeMode = intelligenceMode ? INTELLIGENCE_MODES.find((m) => m.key === intelligenceMode) : null;

  const submit = () => onSend(input);

  const keyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="ex-powerbar">
      {activeMode && (
        <div className="ex-mode-pill" style={{ "--mp": activeMode.color }}>
          <span className="ex-mode-pill__icon" style={{ color: activeMode.color }}>
            {activeMode.icon}
          </span>
          <span className="ex-mode-pill__name" style={{ color: activeMode.color }}>
            {activeMode.label} active
          </span>
          <button className="ex-mode-pill__clear" onClick={onOpenIntel} title="Change or clear mode">✕</button>
        </div>
      )}

      {uploadedFile && (
        <div className="ex-fchip">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M3 1h5l2 2v8H3V1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="ex-fchip__name">{uploadedFile.name}</span>
          <button className="ex-fchip__rm" onClick={onClearFile}>✕</button>
        </div>
      )}

      <div className="ex-bar">
        <div className="ex-bar__ctrl">
          <button className="ex-ctrl ex-ctrl--tools" onClick={onOpenTools} type="button">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z" />
            </svg>
            <span className="ex-ctrl__lbl">Tools</span>
          </button>

          <button
            className={"ex-ctrl ex-ctrl--intel" + (activeMode ? " ex-ctrl--on" : "")}
            style={activeMode ? { "--cc": activeMode.color } : {}}
            onClick={onOpenIntel}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="3" />
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" />
            </svg>
            <span className="ex-ctrl__lbl">{activeMode ? activeMode.label : "Intelligence"}</span>
            <span className="ex-ctrl__free">Free</span>
          </button>

          <button
            className={"ex-ctrl ex-ctrl--upload" + (uploadedFile ? " ex-ctrl--on" : "")}
            onClick={onOpenUpload}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10V3M4 6l3-3 3 3" />
              <path d="M2 12h10" />
            </svg>
            <span className="ex-ctrl__lbl">{uploadedFile ? "1 file" : "Upload"}</span>
          </button>
        </div>

        <div className="ex-bar__input">
          <textarea
            ref={textRef}
            className="ex-bar__textarea"
            placeholder={
              activeMode
                ? activeMode.label + " — describe your role and goal..."
                : "Type your role and goal — I'll analyse your career instantly"
            }
            value={input}
            rows={1}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={keyDown}
          />
          <button className="ex-send" disabled={loading || !input.trim()} onClick={submit} aria-label="Send" type="button">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 12.5L12.5 7L2 1.5V5.8L9 7L2 8.2V12.5Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <p className="ex-hint">
        <kbd>Enter</kbd> to send &nbsp;<kbd>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}

export default function ChatWindow() {
  const router = useRouter();
  const {
    context,
    updateContext,
    clear,
    conversationId,
    setConversationId,
    incrementMessageCount,
    registerNewChat,
  } = useEDGEXContext();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentText, setDocumentText] = useState(null);
  const [intelligenceMode, setIntelligenceMode] = useState(null);
  const [thinkMode, setThinkMode] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [upgradeTool, setUpgradeTool] = useState(null);

  const bottomRef = useRef(null);
  const titleSet = useRef(false);
  const loadedConv = useRef(null);
  const isNewChatRef = useRef(false);

  const closeAll = useCallback(() => {
    setToolsOpen(false);
    setIntelOpen(false);
    setUploadOpen(false);
  }, []);

  const newChat = useCallback(() => {
    isNewChatRef.current = true;

    closeAll();
    setMessages([]);
    setInput("");
    setUploadedFile(null);
    setDocumentText(null);
    setIntelligenceMode(null);
    setThinkMode(null);
    setLoading(false);

    clear();
    setConversationId(null);
    loadedConv.current = null;
    titleSet.current = false;

    const basePath = router.pathname === "/edgex" ? "/edgex" : "/copilot";

    if (router.asPath !== basePath) {
      router.replace(basePath, undefined, { shallow: true });
    } else if (router.query?.conv) {
      router.replace(basePath, undefined, { shallow: true });
    }

    requestAnimationFrame(() => {
      isNewChatRef.current = false;
    });
  }, [clear, closeAll, router, setConversationId]);

  useEffect(() => {
    registerNewChat(newChat);
  }, [registerNewChat, newChat]);

  useEffect(() => {
    const scroller = bottomRef.current;
    if (!scroller) return;
    scroller.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  useEffect(() => {
    if (!router.isReady || !user) return;

    const conv = router.query?.conv;
    if (typeof conv === "string" && conv && conv !== conversationId) {
      closeAll();
      setConversationId(conv);
      loadedConv.current = null;
      titleSet.current = false;
    }
  }, [router.isReady, router.query?.conv, user, conversationId, setConversationId, closeAll]);

  useEffect(() => {
    if (!user || conversationId || isNewChatRef.current) return;

    listConversations(user.id).then(({ data }) => {
      if (isNewChatRef.current) return;
      if (data?.length && !conversationId) {
        setConversationId(data[0].id);
      }
    });
  }, [user, conversationId, setConversationId]);

  useEffect(() => {
    if (!user || !conversationId || loadedConv.current === conversationId) return;

    loadConversation(conversationId, user.id).then(({ data }) => {
      setMessages((data || []).map(dbRowToMsg));
      loadedConv.current = conversationId;
      titleSet.current = (data || []).some((r) => r.role === "user");
    });
  }, [user, conversationId]);

  const handleFile = useCallback(
    async (file) => {
      setUploadedFile(file);
      setDocumentText(null);

      const uploadType = detectUploadType(file.name);
      const actions = getUploadActions(uploadType, context);
      const msgId = Date.now();

      setMessages((prev) => [
        ...prev,
        {
          role: "upload",
          type: "upload",
          msgId,
          fileName: file.name,
          uploadType,
          actions,
          extractionState: "extracting",
          tokenCount: null,
          extractionError: null,
        },
      ]);

      const result = await extractDocument(file);

      if (result.error) {
        setMessages((prev) =>
          prev.map((m) => (m.msgId === msgId ? { ...m, extractionState: "error", extractionError: result.error } : m))
        );
      } else {
        const tokens = estimateTokens(result.text);
        setDocumentText(result.text);
        setMessages((prev) =>
          prev.map((m) => (m.msgId === msgId ? { ...m, extractionState: "ready", tokenCount: tokens } : m))
        );
      }
    },
    [context]
  );

  const send = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || loading) return;

      closeAll();

      const intent = classifyIntent(trimmed, context);
      const useMode = intelligenceMode || (intent.type === "intelligence" ? intent.mode : null);
      const fileSnap = uploadedFile;
      const docTextSnap = documentText;

      setThinkMode(useMode);
      setMessages((prev) => [...prev, { role: "user", content: trimmed, fileName: fileSnap?.name || null }]);
      setInput("");
      setUploadedFile(null);
      setDocumentText(null);
      setLoading(true);

      let convId = conversationId;
      if (!convId && user) {
        const { data } = await createConversation(user.id);
        if (data) {
          convId = data.id;
          setConversationId(data.id);
          loadedConv.current = data.id;
          titleSet.current = false;
        }
      }

      if (convId && user) {
        await saveMessage({
          conversationId: convId,
          userId: user.id,
          role: "user",
          content: trimmed,
          meta: { type: "user", fileName: fileSnap?.name || null },
        });

        if (!titleSet.current) {
          await updateConversationTitle(convId, user.id, trimmed.slice(0, 60));
          titleSet.current = true;
        }
      }

      try {
        const payload = buildRequestPayload(trimmed, context, intent, useMode, fileSnap, docTextSnap);
        const res = await fetch(`${API_BASE}/api/copilot/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-HireEdge-Plan": getPlan(),
          },
          body: JSON.stringify(payload),
        });

        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error("Non-JSON response");
        }

        if (!res.ok || !json.ok) {
          const e = { role: "assistant", type: "error", content: json?.error || "Something went wrong." };
          setMessages((p) => [...p, e]);

          if (convId && user) {
            await saveMessage({
              conversationId: convId,
              userId: user.id,
              role: "assistant",
              content: e.content,
              meta: { type: "error" },
            });
          }
          return;
        }

        const data = json.data;
        if (!data) throw new Error("Empty response");

        if (data.type === "clarification") {
          const m = {
            role: "assistant",
            type: "clarification",
            content: data.reply,
            missingFields: data.missing_fields || [],
            actions: data.next_actions || [],
          };

          setMessages((p) => [...p, m]);
          if (data.context) updateContext(_safe(data.context));

          if (convId && user) {
            await saveMessage({
              conversationId: convId,
              userId: user.id,
              role: "assistant",
              content: m.content,
              meta: {
                type: "clarification",
                missingFields: m.missingFields,
                actions: m.actions,
              },
            });
          }
          return;
        }

        const m = {
          role: "assistant",
          type: "assistant",
          content: data.reply,
          nextActions: data.next_actions || [],
          intent: data.intent?.name,
          confidence: data.intent?.confidence,
          intelligenceMode: useMode,
        };

        setMessages((p) => [...p, m]);
        incrementMessageCount();

        if (data.context) updateContext(_safe(data.context));

        if (convId && user) {
          await saveMessage({
            conversationId: convId,
            userId: user.id,
            role: "assistant",
            content: m.content,
            meta: {
              type: "assistant",
              intent: m.intent,
              confidence: m.confidence,
              nextActions: m.nextActions,
              intelligenceMode: useMode,
            },
          });
        }
      } catch {
        const e = { role: "assistant", type: "error", content: "Connection error. Please try again." };
        setMessages((p) => [...p, e]);

        if (convId && user) {
          await saveMessage({
            conversationId: convId,
            userId: user.id,
            role: "assistant",
            content: e.content,
            meta: { type: "error" },
          });
        }
      } finally {
        setLoading(false);
        setThinkMode(null);
      }
    },
    [
      closeAll,
      context,
      loading,
      updateContext,
      conversationId,
      setConversationId,
      user,
      uploadedFile,
      intelligenceMode,
      documentText,
      incrementMessageCount,
    ]
  );

  const editContext = () => {
    const role = window.prompt("Current role:", context?.role || "");
    const target = window.prompt("Target role:", context?.target || "");
    if (role !== null || target !== null) {
      updateContext({
        role: role || context?.role,
        target: target || context?.target,
      });
    }
  };

  return (
    <div className="ex-chat">
      <ToolsPanel
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        isMobile={isMobile}
        router={router}
        onNeedUpgrade={(t) => setUpgradeTool(t)}
      />

      <IntelPanel
        open={intelOpen}
        onClose={() => setIntelOpen(false)}
        isMobile={isMobile}
        activeMode={intelligenceMode}
        onSelect={setIntelligenceMode}
      />

      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        isMobile={isMobile}
        onFile={handleFile}
      />

      {upgradeTool && <UpgradeModal tool={upgradeTool} onClose={() => setUpgradeTool(null)} router={router} />}

      <PersonalizationBar context={context} onEdit={editContext} />

      <div className="ex-messages">
        {messages.length === 0 && !loading && <EmptyState onSend={send} context={context} />}

        {messages.map((msg, i) => {
          if (msg.type === "upload") {
            return (
              <UploadMsg
                key={i}
                fileName={msg.fileName}
                uploadType={msg.uploadType}
                actions={msg.actions}
                onSend={send}
                extractionState={msg.extractionState}
                tokenCount={msg.tokenCount}
                extractionError={msg.extractionError}
              />
            );
          }

          if (msg.role === "user") {
            return <UserMsg key={i} content={msg.content} fileName={msg.fileName} />;
          }

          if (msg.type === "clarification") {
            return (
              <ClarifyMsg
                key={i}
                content={msg.content}
                missingFields={msg.missingFields}
                actions={msg.actions}
                onSend={send}
              />
            );
          }

          if (msg.type === "error") {
            return <ErrorMsg key={i} content={msg.content} />;
          }

          return (
            <AssistantMsg
              key={i}
              content={msg.content}
              nextActions={msg.nextActions}
              intent={msg.intent}
              confidence={msg.confidence}
              intelligenceMode={msg.intelligenceMode}
              onSend={send}
              router={router}
            />
          );
        })}

        {loading && <ThinkingState mode={thinkMode} />}
        <div ref={bottomRef} />
      </div>

      <PowerBar
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={send}
        uploadedFile={uploadedFile}
        onClearFile={() => {
          setUploadedFile(null);
          setDocumentText(null);
        }}
        intelligenceMode={intelligenceMode}
        onOpenTools={() => {
          setIntelOpen(false);
          setUploadOpen(false);
          setToolsOpen((v) => !v);
        }}
        onOpenIntel={() => {
          setToolsOpen(false);
          setUploadOpen(false);
          setIntelOpen((v) => !v);
        }}
        onOpenUpload={() => {
          setToolsOpen(false);
          setIntelOpen(false);
          setUploadOpen((v) => !v);
        }}
      />
    </div>
  );
}
