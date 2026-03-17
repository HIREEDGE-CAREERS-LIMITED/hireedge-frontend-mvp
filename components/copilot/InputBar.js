// ============================================================================
// components/copilot/InputBar.js
// HireEdge Frontend — Chat input bar
// ============================================================================

import { useRef, useEffect } from "react";
import { useCopilot } from "../../context/CopilotContext";

export default function InputBar() {
  const { send, loading, inputDraft, setDraft } = useCopilot();
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [inputDraft]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!inputDraft.trim() || loading) return;
    send(inputDraft);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-bar">
      <div className="input-bar__inner">
        <textarea
          ref={textareaRef}
          className="input-bar__textarea"
          placeholder="Ask about your career path, skills, salary, interviews..."
          value={inputDraft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
          aria-label="Message input"
        />

        <button
          className={`input-bar__send ${inputDraft.trim() && !loading ? "input-bar__send--active" : ""}`}
          onClick={handleSubmit}
          disabled={!inputDraft.trim() || loading}
          aria-label="Send message"
        >
          {loading ? (
            <span className="input-bar__spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 15l12-6L3 3v4.5L11 9 3 10.5z" fill="currentColor"/>
            </svg>
          )}
        </button>
      </div>

      <div className="input-bar__footer">
        <span className="input-bar__hint">
          <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
}
