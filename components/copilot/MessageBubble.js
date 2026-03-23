// ============================================================================
// components/copilot/MessageBubble.js  (v2)
//
// Handles three message types:
//   - assistant  : normal EDGEX reply with optional next_actions
//   - clarification : missing-fields gate -- renders question actions only,
//                     never tool buttons
//   - user        : plain user message
//
// RULES:
//   - clarification responses NEVER render tool buttons
//   - next_actions of type "tool" are suppressed until context is complete
// ============================================================================

import { useRouter } from "next/router";

const ENDPOINT_MAP = {
  "/api/tools/career-gap-explainer":  "/tools/career-gap-explainer",
  "/api/tools/career-roadmap":        "/tools/career-roadmap",
  "/api/tools/visa-intelligence":     "/tools/visa-intelligence",
  "/api/tools/interview-prep":        "/tools/interview-prep",
  "/api/tools/resume-optimiser":      "/tools/resume-optimiser",
  "/api/tools/linkedin-optimiser":    "/tools/linkedin-optimiser",
  "/api/tools/career-pack":           "/career-pack",
};

function resolveToolRoute(endpoint) {
  return ENDPOINT_MAP[endpoint] || null;
}

//  Clarification bubble 
function ClarificationBubble({ message, missingFields, actions, onAction }) {
  return (
    <div className="edgex-bubble edgex-bubble--clarification">
      <div className="edgex-bubble__avatar edgex-bubble__avatar--edgex">
        <span className="edgex-bubble__avatar-icon">X</span>
      </div>
      <div className="edgex-bubble__body">
        <div className="edgex-bubble__meta">
          <span className="edgex-bubble__name">EDGEX</span>
          <span className="edgex-bubble__badge edgex-bubble__badge--info">Needs info</span>
        </div>
        <div className="edgex-bubble__text">{message}</div>
        {missingFields && missingFields.length > 0 && (
          <div className="edgex-bubble__missing-fields">
            {missingFields.map(f => (
              <span key={f} className="edgex-bubble__missing-tag">
                {f === "current_role" ? "Current role" : "Target role"}
              </span>
            ))}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="edgex-bubble__actions">
            {actions.map((action, i) => (
              <button
                key={i}
                className="edgex-bubble__action edgex-bubble__action--question"
                onClick={() => onAction && onAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

//  Normal assistant bubble 
function AssistantBubble({ text, nextActions, onAction, router }) {
  // Format **bold** and newlines
  const formatted = text
    .split("\n")
    .map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="edgex-bubble__line">{parts}</p>;
    });

  return (
    <div className="edgex-bubble edgex-bubble--assistant">
      <div className="edgex-bubble__avatar edgex-bubble__avatar--edgex">
        <span className="edgex-bubble__avatar-icon">X</span>
      </div>
      <div className="edgex-bubble__body">
        <div className="edgex-bubble__meta">
          <span className="edgex-bubble__name">EDGEX</span>
        </div>
        <div className="edgex-bubble__text">{formatted}</div>
        {nextActions && nextActions.length > 0 && (
          <div className="edgex-bubble__actions">
            {nextActions.map((action, i) => {
              if (action.type === "tool") {
                const route = resolveToolRoute(action.endpoint);
                if (!route) return null;
                return (
                  <button
                    key={i}
                    className="edgex-bubble__action edgex-bubble__action--tool"
                    onClick={() => router.push(route)}
                  >
                    {action.label}
                  </button>
                );
              }
              // type === "question"
              return (
                <button
                  key={i}
                  className="edgex-bubble__action edgex-bubble__action--question"
                  onClick={() => onAction && onAction(action)}
                >
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

//  User bubble 
function UserBubble({ text }) {
  return (
    <div className="edgex-bubble edgex-bubble--user">
      <div className="edgex-bubble__avatar edgex-bubble__avatar--user">
        <span className="edgex-bubble__avatar-icon">U</span>
      </div>
      <div className="edgex-bubble__body">
        <div className="edgex-bubble__text">{text}</div>
      </div>
    </div>
  );
}

//  Main export 
export default function MessageBubble({ message, onAction }) {
  const router = useRouter();

  if (!message) return null;

  // User message
  if (message.role === "user") {
    return <UserBubble text={message.content} />;
  }

  // Clarification gate -- missing required fields
  if (message.type === "clarification") {
    return (
      <ClarificationBubble
        message={message.content}
        missingFields={message.missing_fields || []}
        actions={message.actions || []}
        onAction={onAction}
      />
    );
  }

  // Normal assistant response
  return (
    <AssistantBubble
      text={message.content || ""}
      nextActions={message.next_actions || []}
      onAction={onAction}
      router={router}
    />
  );
}
