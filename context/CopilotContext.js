// ============================================================================
// context/CopilotContext.js
// HireEdge -- EDGEX Context (v3)
// Fixes: localStorage message persistence, useEDGEXContext + useCopilot exports
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  sendMessage,
  saveContext,
  loadContext,
  clearContext,
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
} from "../services/copilotService";

// ── Storage keys ──────────────────────────────────────────────────────────

const MESSAGES_KEY = "hireedge_edgex_messages";
const MAX_STORED   = 50; // cap to avoid localStorage bloat

// ── Helpers ───────────────────────────────────────────────────────────────

function loadMessages() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  if (typeof window === "undefined") return;
  try {
    // Keep only the last MAX_STORED messages
    const toSave = messages.slice(-MAX_STORED);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(toSave));
  } catch {
    // Fail silently if localStorage is full or unavailable
  }
}

function clearMessages() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(MESSAGES_KEY); } catch { /* silent */ }
}

// ── Context ───────────────────────────────────────────────────────────────

const CopilotContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────

export function CopilotProvider({ children }) {
  // Restore messages from localStorage on first render
  const [messages,   setMessages] = useState(() => loadMessages());
  const [loading,    setLoading]  = useState(false);
  const [inputDraft, setDraft]    = useState("");
  const [context,    setCtx]      = useState(() => loadContext());

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const send = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || loading) return;

    setDraft("");
    setMessages(prev => [...prev, createUserMessage(trimmed)]);
    setLoading(true);

    try {
      const plan   = typeof window !== "undefined" ? (localStorage.getItem("hireedge_plan") || "free") : "free";
      const userId = typeof window !== "undefined" ? (localStorage.getItem("hireedge_user_id") || "") : "";

      const response = await sendMessage(trimmed, context, { plan, userId });
      setMessages(prev => [...prev, createAssistantMessage(response)]);

      if (response?.data?.context) {
        const newCtx = response.data.context;
        setCtx(newCtx);
        saveContext(newCtx);
      }
    } catch (err) {
      setMessages(prev => [...prev, createErrorMessage(err)]);
    } finally {
      setLoading(false);
    }
  }, [loading, context]);

  // Clear messages + context + localStorage
  const clear = useCallback(() => {
    setMessages([]);
    setCtx({});
    clearMessages();
    clearContext();
  }, []);

  const value = { messages, loading, send, clear, context, inputDraft, setDraft };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────

/** Primary hook -- use in all new code */
export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    return {
      messages: [], loading: false, send: () => {}, clear: () => {},
      context: {}, inputDraft: "", setDraft: () => {},
    };
  }
  return ctx;
}

/** Legacy alias -- keeps all existing components working unchanged */
export function useCopilot() { return useEDGEXContext(); }
