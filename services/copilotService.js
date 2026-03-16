// ============================================================================
// services/copilotService.js
// HireEdge Frontend — Copilot API service
//
// Matches the backend contract at /api/copilot/*.
// Handles request construction, auth headers, error normalisation,
// and context persistence across multi-turn conversations.
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Send a chat message to the Copilot.
 *
 * Backend contract:
 *   POST /api/copilot/chat
 *   Body: { message, context: { role, target, skills, yearsExp, lastIntent, history } }
 *   Response: { ok, data: { reply, intent, insights, recommendations, next_actions, context } }
 *
 * @param {string} message
 * @param {object} [context]  - Conversation context (sent back from previous response)
 * @param {object} [auth]     - { userId, plan }
 * @returns {Promise<object>}
 */
export async function sendMessage(message, context = {}, auth = {}) {
  const res = await _post("/api/copilot/chat", { message, context }, auth);
  return res;
}

/**
 * Get raw orchestration results (no composed reply).
 *
 * @param {string} message
 * @param {object} [context]
 * @param {object} [auth]
 * @returns {Promise<object>}
 */
export async function orchestrate(message, context = {}, auth = {}) {
  return _post("/api/copilot/orchestrate", { message, context }, auth);
}

/**
 * Get recommendations only.
 *
 * @param {string} message
 * @param {object} [context]
 * @param {object} [auth]
 * @returns {Promise<object>}
 */
export async function getRecommendations(message, context = {}, auth = {}) {
  return _post("/api/copilot/recommend", { message, context }, auth);
}

/**
 * Get planned next actions only.
 *
 * @param {string} message
 * @param {object} [context]
 * @param {object} [auth]
 * @returns {Promise<object>}
 */
export async function getNextActions(message, context = {}, auth = {}) {
  return _post("/api/copilot/plan", { message, context }, auth);
}

// ===========================================================================
// Context helpers — persist across page refreshes via sessionStorage
// ===========================================================================

const CONTEXT_KEY = "hireedge_copilot_context";

/**
 * Save conversation context to sessionStorage.
 * @param {object} context
 */
export function saveContext(context) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    // sessionStorage unavailable or full — fail silently
  }
}

/**
 * Load conversation context from sessionStorage.
 * @returns {object}
 */
export function loadContext() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Clear conversation context.
 */
export function clearContext() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CONTEXT_KEY);
  } catch {
    // fail silently
  }
}

// ===========================================================================
// Message history — local conversation display (not sent to backend)
// ===========================================================================

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {object} [data]       - Full assistant response data (insights, recs, actions)
 * @property {string} timestamp
 */

/**
 * Create a user message object.
 * @param {string} content
 * @returns {ChatMessage}
 */
export function createUserMessage(content) {
  return {
    id: `msg_${Date.now()}_u`,
    role: "user",
    content,
    data: null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an assistant message from the API response.
 * @param {object} apiResponse - The full response from sendMessage()
 * @returns {ChatMessage}
 */
export function createAssistantMessage(apiResponse) {
  const data = apiResponse?.data || {};
  return {
    id: `msg_${Date.now()}_a`,
    role: "assistant",
    content: data.reply || "I couldn't process that request. Please try again.",
    data: {
      intent: data.intent || null,
      insights: data.insights || null,
      recommendations: data.recommendations || [],
      next_actions: data.next_actions || [],
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error message.
 * @param {object} error
 * @returns {ChatMessage}
 */
export function createErrorMessage(error) {
  const isUpgrade = error?.reason === "daily_limit_reached" || error?.reason === "tool_not_in_plan";
  return {
    id: `msg_${Date.now()}_e`,
    role: "assistant",
    content: isUpgrade
      ? `You've reached your daily limit. ${error.message || "Upgrade your plan for more."}`
      : "Something went wrong. Please try again.",
    data: {
      error: true,
      reason: error?.reason || "unknown",
      upgrade_to: error?.upgrade_to || null,
    },
    timestamp: new Date().toISOString(),
  };
}

// ===========================================================================
// Internal fetch wrapper
// ===========================================================================

async function _post(endpoint, body, auth = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Billing auth headers (backend reads X-HireEdge-Plan and X-HireEdge-User-Id)
  if (auth.plan) headers["X-HireEdge-Plan"] = auth.plan;
  if (auth.userId) headers["X-HireEdge-User-Id"] = auth.userId;

  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.message || json.error || "API request failed");
    error.status = res.status;
    error.reason = json.reason || null;
    error.upgrade_to = json.upgrade_to || null;
    error.data = json;
    throw error;
  }

  return json;
}
