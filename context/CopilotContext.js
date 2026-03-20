// ============================================================================
// context/CopilotContext.js
// HireEdge Frontend — EDGEX state management
//
// IMPORTANT: Export names (CopilotProvider, useCopilot) are intentionally
// preserved. Renaming them would require updating every import across the
// codebase. The user-facing brand is EDGEX; these are internal names only.
//
// CHANGE in this version:
//   - useCopilot() now exposes `context` in its return value so that
//     ChatWindow.js can pass the live EDGEX context (role, target, skills,
//     yearsExp) to actionRouter.js when resolving tool navigation.
//   - Added useEDGEXContext() as a named export alias — tool pages and
//     CareerPackForm can call this to optionally pre-populate their forms
//     with the user's current role/target/skills from the chat session.
// ============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
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

// ── State shape ────────────────────────────────────────────────────────────

const initialState = {
  messages:   [],
  context:    {},     // EDGEX conversation context: { role, target, skills, yearsExp, ... }
  loading:    false,
  error:      null,
  inputDraft: "",
};

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "SET_CONTEXT":
      return { ...state, context: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_CONTEXT":
      return { ...state, context: { ...state.context, ...action.payload } };
    case "SET_DRAFT":
      return { ...state, inputDraft: action.payload };
    case "CLEAR_CONVERSATION":
      return { ...initialState };
    default:
      return state;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function CopilotProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore context from sessionStorage on mount
  useEffect(() => {
    const saved = loadContext();
    if (saved && Object.keys(saved).length > 0) {
      dispatch({ type: "SET_CONTEXT", payload: saved });
    }
  }, []);

  // Persist context on every change
  useEffect(() => {
    if (Object.keys(state.context).length > 0) {
      saveContext(state.context);
    }
  }, [state.context]);

  // ── Send a message ──────────────────────────────────────────────────────

  const send = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || state.loading) return;

      const userMsg = createUserMessage(trimmed);
      dispatch({ type: "ADD_MESSAGE", payload: userMsg });
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_DRAFT",   payload: "" });

      try {
        const response     = await sendMessage(trimmed, state.context);
        const assistantMsg = createAssistantMessage(response);
        dispatch({ type: "ADD_MESSAGE", payload: assistantMsg });

        // EDGEX backend returns updated context after each turn —
        // merge it in so subsequent actions have the latest role/target/skills
        if (response?.data?.context) {
          dispatch({ type: "UPDATE_CONTEXT", payload: response.data.context });
        }

        dispatch({ type: "SET_LOADING", payload: false });
      } catch (err) {
        const errorMsg = createErrorMessage(err);
        dispatch({ type: "ADD_MESSAGE", payload: errorMsg });
        dispatch({ type: "SET_ERROR",   payload: err.message || "Request failed" });
      }
    },
    [state.context, state.loading]
  );

  // ── Clear conversation ──────────────────────────────────────────────────

  const clear = useCallback(() => {
    clearContext();
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, []);

  // ── Update draft ────────────────────────────────────────────────────────

  const setDraft = useCallback((text) => {
    dispatch({ type: "SET_DRAFT", payload: text });
  }, []);

  // ── Set context directly (onboarding, profile imports) ──────────────────

  const setContext = useCallback((ctx) => {
    dispatch({ type: "UPDATE_CONTEXT", payload: ctx });
  }, []);

  const value = {
    messages:   state.messages,
    // CHANGED: context is now exposed so ChatWindow can pass it to actionRouter
    context:    state.context,
    loading:    state.loading,
    error:      state.error,
    inputDraft: state.inputDraft,
    send,
    clear,
    setDraft,
    setContext,
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

// ── Primary hook ───────────────────────────────────────────────────────────
// Keep name as useCopilot — all existing imports work unchanged.

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error("useCopilot must be used within a CopilotProvider");
  }
  return ctx;
}

// ── EDGEX context accessor ─────────────────────────────────────────────────
// Tool pages and CareerPackForm call this to optionally pre-populate their
// forms with the user's role/target/skills from the active chat session.
//
// Returns null if there is no active CopilotProvider in scope (e.g. the
// user navigated directly to /tools/resume without going through EDGEX chat).

export function useEDGEXContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) return null;

  // Return only the career-relevant fields — not the full chat state
  return {
    role:     ctx.context?.role     || null,
    target:   ctx.context?.target   || null,
    skills:   ctx.context?.skills   || [],
    yearsExp: ctx.context?.yearsExp || null,
  };
}
