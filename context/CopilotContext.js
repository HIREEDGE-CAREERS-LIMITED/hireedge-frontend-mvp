// ============================================================================
// context/CopilotContext.js
// ============================================================================

import { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";

const CTX_KEY = "hireedge_edgex_context";

function loadContext() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CTX_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveContext(ctx) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CTX_KEY, JSON.stringify(ctx));
  } catch {}
}

function clearStoredContext() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CTX_KEY);
  } catch {}
}

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
  const [context, setContext] = useState(() => loadContext());
  const [conversationId, setConversationIdState] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const newChatRef = useRef(null);

  const setConversationId = useCallback((id) => {
    setConversationIdState(id || null);
  }, []);

  const updateContext = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;

    setContext((prev) => {
      const next = { ...prev };

      for (const k of ["role", "target", "yearsExp", "country", "lastIntent"]) {
        if (partial[k] !== undefined && partial[k] !== null) {
          next[k] = partial[k];
        }
      }

      saveContext(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setContext({});
    clearStoredContext();
    setConversationIdState(null);
    setMessageCount(0);
  }, []);

  const incrementMessageCount = useCallback(() => {
    setMessageCount((n) => n + 1);
  }, []);

  const resetMessageCount = useCallback(() => {
    setMessageCount(0);
  }, []);

  const setMessageCountValue = useCallback((value) => {
    setMessageCount(typeof value === "number" && value >= 0 ? value : 0);
  }, []);

  const registerNewChat = useCallback((fn) => {
    newChatRef.current = typeof fn === "function" ? fn : null;
  }, []);

  const triggerNewChat = useCallback(() => {
    if (typeof newChatRef.current === "function") {
      newChatRef.current();
    }
  }, []);

  const value = useMemo(
    () => ({
      context,
      updateContext,
      clear,

      conversationId,
      setConversationId,

      messageCount,
      incrementMessageCount,
      resetMessageCount,
      setMessageCount: setMessageCountValue,

      registerNewChat,
      triggerNewChat,
    }),
    [
      context,
      updateContext,
      clear,
      conversationId,
      setConversationId,
      messageCount,
      incrementMessageCount,
      resetMessageCount,
      setMessageCountValue,
      registerNewChat,
      triggerNewChat,
    ]
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);

  if (!ctx) {
    return {
      context: {},
      updateContext: () => {},
      clear: () => {},

      conversationId: null,
      setConversationId: () => {},

      messageCount: 0,
      incrementMessageCount: () => {},
      resetMessageCount: () => {},
      setMessageCount: () => {},

      registerNewChat: () => {},
      triggerNewChat: () => {},
    };
  }

  return ctx;
}

export function useCopilot() {
  return useEDGEXContext();
}
