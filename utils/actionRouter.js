// ============================================================================
// utils/actionRouter.js
// HireEdge Frontend — EDGEX action router
//
// Single source of truth that maps backend planner.js endpoint strings to
// the correct frontend page routes, and builds the query string from the
// action params + current EDGEX context.
//
// Used by ChatWindow.js handleAction() to decide whether an action chip
// should navigate to a tool page or send a chat message.
// ============================================================================

/**
 * Map of backend API endpoint → frontend page route.
 * Keys are the endpoint strings produced by lib/copilot/planner.js.
 */
const ENDPOINT_TO_ROUTE = {
  // Tools
  "/api/tools/career-roadmap":       "/tools/roadmap",
  "/api/tools/resume-optimiser":     "/tools/resume",
  "/api/tools/linkedin-optimiser":   "/tools/linkedin",
  "/api/tools/interview-prep":       "/tools/interview",
  "/api/tools/visa-eligibility":     "/tools/visa",
  "/api/tools/talent-profile":       "/tools/talent-profile",
  "/api/tools/career-gap-explainer": "/tools/career-gap-explainer",

  // Career Pack
  "/api/career-pack/build":          "/career-pack",
  "/api/career-pack/export":         "/career-pack",

  // Intelligence
  "/api/career-intelligence/role-graph":           "/intelligence/graph",
  "/api/career-intelligence/skills-gap":           "/intelligence/skills-gap",
  "/api/career-intelligence/salary-intelligence":  "/intelligence/salary",
  "/api/career-intelligence/role-intelligence":    "/intelligence",
  "/api/career-intelligence/role-path":            "/intelligence/career-path",
};

/**
 * Map of backend param keys → frontend query param names.
 * Normalises the planner's param names into what the tool pages expect.
 */
const PARAM_MAP = {
  from:      "from",
  to:        "to",
  role:      "role",
  target:    "target",
  current:   "current",
  skills:    "skills",
  yearsExp:  "yearsExp",
  strategy:  "strategy",
  slug:      "slug",
  depth:     "depth",
  action:    "action",
  limit:     "limit",
};

/**
 * Resolve an action into a { route, query } object, or null if it should
 * be handled as a chat message instead.
 *
 * @param {{ type: string, endpoint?: string, params?: object, prompt?: string }} action
 * @param {{ role?: string, target?: string, skills?: string[], yearsExp?: number }} edgexContext
 * @returns {{ route: string, query: object } | null}
 */
export function resolveAction(action, edgexContext = {}) {
  const { type, endpoint, params = {} } = action;

  // "question" type → always send as chat, never navigate
  if (type === "question") return null;

  // "link" type with a frontend path (starts with /) → direct navigation
  if (type === "link" && endpoint?.startsWith("/") && !endpoint.startsWith("/api")) {
    return { route: endpoint, query: {} };
  }

  // "tool" or "link" with an API endpoint → map to frontend route
  if (endpoint) {
    const route = ENDPOINT_TO_ROUTE[endpoint];
    if (route) {
      const query = _buildQuery(params, edgexContext, endpoint);
      return { route, query };
    }
  }

  return null;
}

/**
 * Build a query string object from action params + EDGEX context.
 * Context fills in any gaps left by the action params.
 * Skills arrays are serialised as comma-separated strings.
 *
 * @param {object} params       - From planner.js action.params
 * @param {object} ctx          - EDGEX conversation context
 * @param {string} endpoint     - Backend endpoint (used to decide context merging)
 * @returns {object}            - Next.js router.push query object
 */
function _buildQuery(params, ctx, endpoint) {
  const q = {};

  // Start with mapped action params
  for (const [key, val] of Object.entries(params || {})) {
    if (val == null || val === "") continue;
    const mappedKey = PARAM_MAP[key] || key;
    q[mappedKey] = Array.isArray(val) ? val.join(",") : String(val);
  }

  // Fill missing fields from EDGEX context
  const isCareerPack  = endpoint?.includes("career-pack");
  const isTool        = endpoint?.includes("/api/tools/");
  const isIntelligence = endpoint?.includes("/api/career-intelligence/");

  if (isTool || isCareerPack) {
    if (!q.role    && ctx.role)                q.role    = ctx.role;
    if (!q.from    && ctx.role)                q.from    = ctx.role;
    if (!q.current && ctx.role)                q.current = ctx.role;
    if (!q.target  && ctx.target)              q.target  = ctx.target;
    if (!q.to      && ctx.target)              q.to      = ctx.target;
    if (!q.skills  && ctx.skills?.length > 0)  q.skills  = ctx.skills.join(",");
    if (!q.yearsExp && ctx.yearsExp != null)   q.yearsExp = String(ctx.yearsExp);
  }

  if (isIntelligence) {
    if (!q.slug && ctx.role)   q.slug = ctx.role;
    if (!q.from && ctx.role)   q.from = ctx.role;
    if (!q.to   && ctx.target) q.to   = ctx.target;
    if (!q.skills && ctx.skills?.length > 0) q.skills = ctx.skills.join(",");
  }

  return q;
}

/**
 * Build a URL string from a route + query object.
 * Used for Next.js router.push().
 *
 * @param {string} route
 * @param {object} query
 * @returns {string}
 */
export function buildUrl(route, query = {}) {
  const entries = Object.entries(query).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return route;
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  return `${route}?${qs}`;
}
