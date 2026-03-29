// ============================================================================
// context/CopilotContext.js
//
// Shared state for the EDGEX chat experience.
// Exposes: context, updateContext, clear, conversationId, setConversationId,
//          messageCount, incrementMessageCount
//
// messageCount is a session-only integer incremented by ChatWindow each time
// an assistant reply lands. EDGEXShell reads it for sidebar display.
// The messages array itself lives in ChatWindow — only the count is shared.
// ============================================================================

import { createContext, useContext, useState, useCallback } from "react";

const CTX_KEY = "hireedge_edgex_context";

function loadContext() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CTX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveContext(ctx) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CTX_KEY, JSON.stringify(ctx)); } catch {}
}

function clearStoredContext() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(CTX_KEY); } catch {}
}

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
  const [context,        setContext]        = useState(() => loadContext());
  const [conversationId, setConversationId] = useState(null);
  const [messageCount,   setMessageCount]   = useState(0);

  const updateContext = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;
    setContext(prev => {
      const next = { ...prev };
      for (const k of ["role", "target", "yearsExp", "country", "lastIntent"]) {
        if (partial[k] !== undefined && partial[k] !== null) next[k] = partial[k];
      }
      saveContext(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setContext({});
    clearStoredContext();
    setConversationId(null);
    setMessageCount(0);
  }, []);

  const incrementMessageCount = useCallback(() => {
    setMessageCount(n => n + 1);
  }, []);

  const value = {
    context,
    updateContext,
    clear,
    conversationId,
    setConversationId,
    messageCount,
    incrementMessageCount,
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
      context:              {},
      updateContext:        () => {},
      clear:                () => {},
      conversationId:       null,
      setConversationId:    () => {},
      messageCount:         0,
      incrementMessageCount:() => {},
    };
  }
  return ctx;
}

// Legacy alias — keeps any component using useCopilot() working
export function useCopilot() { return useEDGEXContext(); }
