// ============================================================================
// components/copilot/MessageBubble.js
// HireEdge -- EDGEX Message Bubble (v2)
// Fixes: action buttons rendered inline, tool routing vs question send
// ============================================================================

import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";

// ── Tool endpoint -> frontend route map ──────────────────────────────────

const ENDPOINT_MAP = {
  "/api/tools/career-gap-explainer": "/tools/career-gap-explainer",
  "/api/tools/career-roadmap":        "/tools/career-roadmap",
  "/api/tools/visa-intelligence":     "/tools/visa-intelligence",
  "/api/tools/linkedin-optimiser":    "/tools/linkedin-optimiser",
  "/api/tools/interview-prep":        "/tools/interview-prep",
  "/api/tools/resume-optimiser":      "/tools/resume-optimiser",
  "/api/tools/talent-profile":        "/tools/talent-profile",
  "/api/tools/career-pack":           "/career-pack",
};

function resolveToolRoute(endpoint) {
  return ENDPOINT_MAP[endpoint] || null;
}

// ── EDGEX icon ─────────────────────────────────────────────────────────────

function EDGEXIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8"/>
    </svg>
  );
}

// ── Action buttons ─────────────────────────────────────────────────────────

function ActionButtons({ actions, onAction }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="bubble-actions">
      <span className="bubble-actions__label">Next steps</span>
      <div className="bubble-actions__list">
        {actions.slice(0, 4).map((action, i) => {
          const isToolAction = action.type === "tool";
          return (
            <button
              key={i}
              className={"bubble-action-btn" + (isToolAction ? " bubble-action-btn--tool" : "")}
              onClick={() => onAction(action)}
              title={action.prompt || action.label}
            >
              {isToolAction && (
                <span className="bubble-action-btn__icon">
                  <svg width="11" height="11" viewBox="0 0 18 18" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z"/>
                  </svg>
                </span>
              )}
              {!isToolAction && (
                <span className="bubble-action-btn__icon">
                  <svg width="11" height="11" viewBox="0 0 18 18" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h12M11 5l4 4-4 4"/>
                  </svg>
                </span>
              )}
              <span className="bubble-action-btn__label">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main bubble ─────────────────────────────────────────────────────────────

export default function MessageBubble({ message, onAction: externalOnAction }) {
  const router = useRouter();
  const { send } = useEDGEXContext();
  const isUser  = message.role === "user";
  const isError = message.data?.error;
  const intent  = message.data?.intent;
  const recommendations = message.data?.recommendations || [];
  const nextActions     = message.data?.next_actions     || [];

  // Handle action dispatch: tool -> route, question -> send as message
  function handleAction(action) {
    if (!action) return;

    if (action.type === "tool" && action.endpoint) {
      const route = resolveToolRoute(action.endpoint);
      if (route) {
        router.push(route);
        return;
      }
    }

    if (action.type === "question" && action.prompt) {
      send(action.prompt);
      return;
    }

    // Fallback: treat as question
    if (action.prompt) send(action.prompt);

    // Delegate to parent handler if present
    if (externalOnAction) externalOnAction(action);
  }

  return (
    <div className={
      "bubble " +
      (isUser ? "bubble--user" : "bubble--assistant") +
      (isError ? " bubble--error" : "")
    }>
      {/* Avatar */}
      <div className="bubble__avatar">
        {isUser ? (
          <div className="bubble__avatar-user">U</div>
        ) : (
          <div className="bubble__avatar-ai"><EDGEXIcon /></div>
        )}
      </div>

      {/* Content */}
      <div className="bubble__body">
        <div className="bubble__header">
          <span className="bubble__sender">{isUser ? "You" : "EDGEX"}</span>
          {intent && !isError && (
            <span className="bubble__intent">
              {intent.name?.replace(/_/g, " ")}
              {intent.confidence >= 0.8 && (
                <span className="bubble__confidence">
                  {Math.round(intent.confidence * 100)}%
                </span>
              )}
            </span>
          )}
          {isError && <span className="bubble__intent bubble__intent--error">error</span>}
        </div>

        {/* Message text -- rendered safely as plain text */}
        <div className="bubble__text">
          {formatReply(message.content)}
        </div>

        {/* Inline recommendations */}
        {!isUser && recommendations.length > 0 && (
          <div className="bubble__recs">
            <div className="bubble__recs-title">Recommendations</div>
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="bubble__rec">
                <span className={"bubble__rec-priority bubble__rec-priority--" + rec.priority}>
                  {rec.priority}
                </span>
                <div className="bubble__rec-content">
                  <div className="bubble__rec-action">{rec.action}</div>
                  <div className="bubble__rec-reason">{rec.reason}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {!isUser && nextActions.length > 0 && (
          <ActionButtons actions={nextActions} onAction={handleAction} />
        )}

        {/* Upgrade prompt */}
        {isError && message.data?.upgrade_to && (
          <div className="bubble__upgrade">
            <a href="/billing" className="bubble__upgrade-btn">
              Upgrade to {message.data.upgrade_to}
            </a>
          </div>
        )}

        <div className="bubble__time">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

// ── Format reply text with basic structure support ─────────────────────────
// Renders numbered sections (1. TITLE\n text) and paragraphs cleanly.
// Does NOT use dangerouslySetInnerHTML -- safe plain text rendering.

function formatReply(text) {
  if (!text) return null;
  const lines = text.split("\n").filter(l => l.trim() !== "");
  return lines.map((line, i) => {
    // Section header: starts with "1." "2." etc
    if (/^\d+\.\s+[A-Z]/.test(line.trim())) {
      return (
        <div key={i} className="bubble-section-header">
          {line.trim()}
        </div>
      );
    }
    return (
      <p key={i} className="bubble-line">
        {line}
      </p>
    );
  });
}
