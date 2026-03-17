// ============================================================================
// components/copilot/MessageBubble.js
// HireEdge Frontend — Single chat message bubble
// ============================================================================

import ActionChips from "./ActionChips";

export default function MessageBubble({ message, onAction }) {
  const isUser = message.role === "user";
  const isError = message.data?.error;
  const intent = message.data?.intent;
  const recommendations = message.data?.recommendations || [];
  const nextActions = message.data?.next_actions || [];

  return (
    <div className={`bubble ${isUser ? "bubble--user" : "bubble--assistant"} ${isError ? "bubble--error" : ""}`}>
      {/* Avatar */}
      <div className="bubble__avatar">
        {isUser ? (
          <div className="bubble__avatar-user">U</div>
        ) : (
          <div className="bubble__avatar-ai">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bubble__body">
        {/* Header: role label + intent badge */}
        <div className="bubble__header">
          <span className="bubble__sender">{isUser ? "You" : "HireEdge"}</span>
          {intent && !isError && (
            <span className="bubble__intent">
              {intent.name?.replace(/_/g, " ")}
              {intent.confidence >= 0.8 && (
                <span className="bubble__confidence">{Math.round(intent.confidence * 100)}%</span>
              )}
            </span>
          )}
          {isError && (
            <span className="bubble__intent bubble__intent--error">error</span>
          )}
        </div>

        {/* Message text */}
        <div className="bubble__text">{message.content}</div>

        {/* Recommendations (assistant only) */}
        {!isUser && recommendations.length > 0 && (
          <div className="bubble__recs">
            <div className="bubble__recs-title">Recommendations</div>
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="bubble__rec">
                <span className={`bubble__rec-priority bubble__rec-priority--${rec.priority}`}>
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

        {/* Next actions (assistant only) */}
        {!isUser && nextActions.length > 0 && (
          <ActionChips actions={nextActions} onAction={onAction} />
        )}

        {/* Upgrade prompt for billing errors */}
        {isError && message.data?.upgrade_to && (
          <div className="bubble__upgrade">
            <a href="/billing" className="bubble__upgrade-btn">
              Upgrade to {message.data.upgrade_to}
            </a>
          </div>
        )}

        {/* Timestamp */}
        <div className="bubble__time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
