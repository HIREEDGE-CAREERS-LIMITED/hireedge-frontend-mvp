// ============================================================================
// context/CopilotContext.js  (v5)
//
// CHANGES from v4:
//   - Added conversationId state
//   - Added setConversationId to context value
//   - All existing role/target/country/yearsExp/lastIntent logic unchanged
// ============================================================================

import { createContext, useContext, useState, useCallback } from "react";

// ── Storage helpers — unchanged ───────────────────────────────────────────────

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

// ── Context ───────────────────────────────────────────────────────────────────

const CopilotContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function CopilotProvider({ children }) {
  const [context,        setContext]        = useState(() => loadContext());
  const [conversationId, setConversationId] = useState(null); // ← ADDED

  // Merge new fields into context and persist — unchanged
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

  // Clear context + localStorage — unchanged
  const clear = useCallback(() => {
    setContext({});
    clearStoredContext();
    setConversationId(null); // ← ADDED: reset active conversation on new chat
  }, []);

  const value = {
    context,
    updateContext,
    clear,
    conversationId,        // ← ADDED
    setConversationId,     // ← ADDED
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

// ── Hooks — unchanged ─────────────────────────────────────────────────────────

export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    return {
      context:           {},
      updateContext:     () => {},
      clear:             () => {},
      conversationId:    null,      // ← ADDED to fallback
      setConversationId: () => {},  // ← ADDED to fallback
    };
  }
  return ctx;
}

// Legacy alias — keeps any component that still calls useCopilot() working
export function useCopilot() { return useEDGEXContext(); }
