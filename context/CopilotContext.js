// ============================================================================
// context/CopilotContext.js  (v4)
//
// BREAKING CHANGE from v3:
//   - Removed: messages, loading, send, inputDraft, setDraft
//   - Kept:    context (role/target/etc), updateContext, clear
//
// WHY: ChatWindow-v4 owns all message state locally.
//      Context only stores the resolved career profile so the sidebar
//      (EDGEXShell) can read role/target/lastIntent without coupling
//      to the message list.
//
// EDGEXShell reads context.role, context.target, context.lastIntent.
// ChatWindow calls updateContext() after each API response.
// ============================================================================

import { createContext, useContext, useState, useCallback } from "react";

//  Storage helpers 

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

//  Context 

const CopilotContext = createContext(null);

//  Provider 

export function CopilotProvider({ children }) {
  const [context, setContext] = useState(() => loadContext());

  // Merge new fields into context and persist
  const updateContext = useCallback((partial) => {
    if (!partial || typeof partial !== "object") return;
    setContext(prev => {
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

  // Clear context + localStorage
  const clear = useCallback(() => {
    setContext({});
    clearStoredContext();
  }, []);

  const value = { context, updateContext, clear };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

//  Hooks 

export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    return {
      context:       {},
      updateContext: () => {},
      clear:         () => {},
    };
  }
  return ctx;
}

// Legacy alias -- keeps any component that still calls useCopilot() working
export function useCopilot() { return useEDGEXContext(); }
