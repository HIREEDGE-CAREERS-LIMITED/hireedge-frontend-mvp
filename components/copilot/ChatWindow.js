// ============================================================================
// components/copilot/ChatWindow.js  (v2)
//
// Key change from v1:
//   - send() is now the ONLY entry point for all messages:
//     predefined action clicks, empty-state tiles, and typed input.
//   - No message is ever sent directly to the API without going through
//     send(), which passes context to the backend validation layer.
//   - Clarification responses (type: "clarification") are stored as a
//     distinct message type and rendered by MessageBubble with question
//     actions only -- never tool buttons.
//   - Context is stored in state and accumulated across turns so the
//     validation gate gets the full picture.
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { useEDGEXContext } from "../../context/CopilotContext";
import MessageBubble from "./MessageBubble";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function ChatWindow() {
  const { context, updateContext, clearContext } = useEDGEXContext();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  Core send function 
  // ALL triggers -- typed input, action clicks, tile clicks -- go through here.
  // Context is always forwarded so the backend validation layer has full picture.
  const send = useCallback(async (text) => {
    if (!text || !text.trim() || loading) return;
    const trimmed = text.trim();

    // Append user message
    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          message: trimmed,
          context,            // always pass full context -- validation depends on it
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          type: "error",
          content: json.error || "Something went wrong. Please try again.",
        }]);
        return;
      }

      const data = json.data;

      //  Clarification response (missing required fields) 
      if (data.type === "clarification") {
        setMessages(prev => [...prev, {
          role:           "assistant",
          type:           "clarification",
          content:        data.reply,
          missing_fields: data.missing_fields || [],
          actions:        data.next_actions   || [],
        }]);
        // Accumulate any partial context the backend resolved
        if (data.context) updateContext(data.context);
        return;
      }

      //  Normal response 
      setMessages(prev => [...prev, {
        role:         "assistant",
        type:         "assistant",
        content:      data.reply,
        next_actions: data.next_actions || [],
      }]);

      // Persist resolved context for next turn
      if (data.context) updateContext(data.context);

    } catch (err) {
      setMessages(prev => [...prev, {
        role:    "assistant",
        type:    "error",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [context, loading, updateContext]);

  //  Action handler (question buttons inside clarification or assistant bubbles)
  const handleAction = useCallback((action) => {
    if (action.type === "question" && action.prompt) {
      send(action.prompt);
    }
    // type === "tool" is handled directly by MessageBubble via router.push
    // It never calls send() -- no validation needed for direct navigation
  }, [send]);

  //  Input submission 
  const handleSubmit = () => {
    send(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  //  Empty state tiles 
  // These send the prompt text through send() -- they do NOT bypass validation.
  const STARTER_TILES = [
    {
      category: "Transition",
      label:    "Plan my career move",
      prompt:   "I want to plan a career transition. Can you help me figure out the steps?",
    },
    {
      category: "Skills",
      label:    "Analyse my skill gaps",
      prompt:   "I want to understand what skills I am missing for my target role.",
    },
    {
      category: "Salary",
      label:    "UK salary benchmarks",
      prompt:   "What are typical UK salary ranges I should know about?",
    },
    {
      category: "Visa",
      label:    "UK visa options",
      prompt:   "What UK work visa routes are available for my situation?",
    },
  ];

  //  Render 
  return (
    <div className="edgex-chat">

      {/* Messages area */}
      <div className="edgex-chat__messages">
        {messages.length === 0 && !loading && (
          <div className="edgex-chat__empty">
            <div className="edgex-chat__empty-logo">
              <span className="edgex-chat__empty-x">X</span>
            </div>
            <h2 className="edgex-chat__empty-title">EDGEX Career Intelligence</h2>
            <p className="edgex-chat__empty-sub">
              Your AI career strategist. Ask about transitions, salaries, skill gaps, or visas.
            </p>
            <div className="edgex-chat__tiles">
              {STARTER_TILES.map((tile, i) => (
                <button
                  key={i}
                  className="edgex-chat__tile"
                  onClick={() => send(tile.prompt)}
                >
                  <span className="edgex-chat__tile-category">{tile.category}</span>
                  <span className="edgex-chat__tile-label">{tile.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onAction={handleAction}
          />
        ))}

        {loading && (
          <div className="edgex-bubble edgex-bubble--assistant edgex-bubble--loading">
            <div className="edgex-bubble__avatar edgex-bubble__avatar--edgex">
              <span className="edgex-bubble__avatar-icon">X</span>
            </div>
            <div className="edgex-bubble__body">
              <div className="edgex-bubble__typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="edgex-chat__input-bar">
        <textarea
          className="edgex-chat__input"
          placeholder="Ask about your career path, skills, salary, interviews..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="edgex-chat__send"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          &gt;
        </button>
      </div>
      <p className="edgex-chat__hints">
        <kbd>Enter</kbd> to send &nbsp; <kbd>Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}

//  Util 
function getPlan() {
  if (typeof window === "undefined") return "free";
  try {
    const p = localStorage.getItem("hireedge_plan");
    return p || "free";
  } catch { return "free"; }
}
