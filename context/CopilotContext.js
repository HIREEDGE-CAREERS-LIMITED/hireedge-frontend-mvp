// ============================================================================
// context/CopilotContext.js
// HireEdge Frontend — Copilot state management
// ============================================================================

import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
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
  messages: [],
  context: {},        // backend conversation context (role, target, skills, etc.)
  loading: false,
  error: null,
  inputDraft: "",     // persisted input draft
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

  // ── Send a message ─────────────────────────────────────────────────────

  const send = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || state.loading) return;

    // Add user message to the conversation
    const userMsg = createUserMessage(trimmed);
    dispatch({ type: "ADD_MESSAGE", payload: userMsg });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_DRAFT", payload: "" });

    try {
      // Call backend
      const response = await sendMessage(trimmed, state.context);

      // Add assistant message
      const assistantMsg = createAssistantMessage(response);
      dispatch({ type: "ADD_MESSAGE", payload: assistantMsg });

      // Update conversation context from response
      if (response?.data?.context) {
        dispatch({ type: "UPDATE_CONTEXT", payload: response.data.context });
      }

      dispatch({ type: "SET_LOADING", payload: false });
    } catch (err) {
      const errorMsg = createErrorMessage(err);
      dispatch({ type: "ADD_MESSAGE", payload: errorMsg });
      dispatch({ type: "SET_ERROR", payload: err.message || "Request failed" });
    }
  }, [state.context, state.loading]);

  // ── Clear conversation ─────────────────────────────────────────────────

  const clear = useCallback(() => {
    clearContext();
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, []);

  // ── Update draft ───────────────────────────────────────────────────────

  const setDraft = useCallback((text) => {
    dispatch({ type: "SET_DRAFT", payload: text });
  }, []);

  // ── Set context directly (for onboarding, profile imports, etc.) ───────

  const setContext = useCallback((ctx) => {
    dispatch({ type: "UPDATE_CONTEXT", payload: ctx });
  }, []);

  const value = {
    messages: state.messages,
    context: state.context,
    loading: state.loading,
    error: state.error,
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

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within a CopilotProvider");
  return ctx;
}
