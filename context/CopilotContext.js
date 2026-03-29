// ============================================================================
// context/CopilotContext.js  (FINAL)
// ============================================================================

import { createContext, useContext, useState, useCallback } from "react";

const CTX_KEY = "hireedge_edgex_context";

function loadContext() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CTX_KEY);
    return raw ? JSON.parse(raw) : {};
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
  const [conversationId, setConversationId] = useState(null);
  const [isStartingFresh, setIsStartingFresh] = useState(false);

  const updateContext = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;

    setContext((prev) => {
      const next = { ...prev };
      const keys = ["role", "target", "yearsExp", "country", "lastIntent"];

      for (const k of keys) {
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
    setConversationId(null);
    setIsStartingFresh(true);
  }, []);

  const value = {
    context,
    updateContext,
    clear,
    conversationId,
    setConversationId,
    isStartingFresh,
    setIsStartingFresh,
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
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
      isStartingFresh: false,
      setIsStartingFresh: () => {},
    };
  }

  return ctx;
}

export function useCopilot() {
  return useEDGEXContext();
}
