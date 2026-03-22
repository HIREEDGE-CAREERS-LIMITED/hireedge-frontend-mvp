// ============================================================================
// context/CopilotContext.js
// HireEdge -- EDGEX Chat Intelligence Context (v2)
//
// Exports useEDGEXContext() (canonical) + useCopilot() (legacy alias).
// All existing tool pages calling useEDGEXContext() and all existing
// components calling useCopilot() work without any changes.
// ============================================================================

import { createContext, useContext, useState, useCallback } from "react";
import {
  sendMessage,
  saveContext,
  loadContext,
  clearContext,
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
} from "../services/copilotService";

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
  const [messages,   setMessages] = useState([]);
  const [loading,    setLoading]  = useState(false);
  const [inputDraft, setDraft]    = useState("");
  const [context,    setCtx]      = useState(() => loadContext());

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

  const clear = useCallback(() => {
    setMessages([]);
    setCtx({});
    clearContext();
  }, []);

  const value = { messages, loading, send, clear, context, inputDraft, setDraft };
  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

/** Primary hook -- use in all new code */
export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    return { messages: [], loading: false, send: () => {}, clear: () => {},
             context: {}, inputDraft: "", setDraft: () => {} };
  }
  return ctx;
}

/** Legacy alias -- keeps all existing components working */
export function useCopilot() { return useEDGEXContext(); }
