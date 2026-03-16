// ============================================================================
// services/dashboardService.js
// HireEdge Frontend — Dashboard API service
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/dashboard/profile
 */
export async function fetchProfile({ role, skills, yearsExp, target }) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (skills?.length) params.set("skills", skills.join(","));
  if (yearsExp != null) params.set("yearsExp", String(yearsExp));
  if (target) params.set("target", target);
  return _get(`/api/dashboard/profile?${params}`);
}

/**
 * GET /api/dashboard/saved-roles
 */
export async function fetchSavedRoles({ roles, current, skills }) {
  const params = new URLSearchParams();
  if (roles?.length) params.set("roles", roles.join(","));
  if (current) params.set("current", current);
  if (skills?.length) params.set("skills", skills.join(","));
  return _get(`/api/dashboard/saved-roles?${params}`);
}

/**
 * GET /api/dashboard/recommendations
 */
export async function fetchRecommendations({ role, skills, target, yearsExp }) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (skills?.length) params.set("skills", skills.join(","));
  if (target) params.set("target", target);
  if (yearsExp != null) params.set("yearsExp", String(yearsExp));
  return _get(`/api/dashboard/recommendations?${params}`);
}

/**
 * POST /api/dashboard/activity
 */
export async function fetchActivity(activityPayload) {
  return _post("/api/dashboard/activity", activityPayload);
}

// ── Local storage helpers for user career context ──────────────────────────

const CAREER_KEY = "hireedge_career_ctx";

export function saveCareerContext(ctx) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CAREER_KEY, JSON.stringify(ctx)); } catch {}
}

export function loadCareerContext() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Local saved roles ──────────────────────────────────────────────────────

const SAVED_KEY = "hireedge_saved_roles";

export function getSavedRoleSlugs() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addSavedRole(slug) {
  const current = getSavedRoleSlugs();
  if (!current.includes(slug)) {
    const updated = [...current, slug];
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(updated)); } catch {}
    return updated;
  }
  return current;
}

export function removeSavedRole(slug) {
  const updated = getSavedRoleSlugs().filter((s) => s !== slug);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(updated)); } catch {}
  return updated;
}

// ── Local activity ledger ──────────────────────────────────────────────────

const ACTIVITY_KEY = "hireedge_activity";

export function getLocalActivity() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function pushActivity(type, entry) {
  const activity = getLocalActivity();
  if (!activity[type]) activity[type] = [];
  activity[type].unshift({ ...entry, timestamp: new Date().toISOString() });
  activity[type] = activity[type].slice(0, 20);
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)); } catch {}
  return activity;
}

// ===========================================================================
// Fetch wrappers
// ===========================================================================

async function _get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  const json = await res.json();
  if (!res.ok) throw _err(json, res.status);
  return json;
}

async function _post(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw _err(json, res.status);
  return json;
}

function _err(json, status) {
  const e = new Error(json.message || json.error || "Dashboard request failed");
  e.status = status;
  e.data = json;
  return e;
}
