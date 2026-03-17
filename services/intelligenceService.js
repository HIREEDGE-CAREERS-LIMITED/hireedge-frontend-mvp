// ============================================================================
// services/intelligenceService.js
// HireEdge Frontend — Career Intelligence API service
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ── Role Intelligence ──────────────────────────────────────────────────────

export async function fetchRoleProfile(slug) {
  return _get(`/api/role-intelligence?action=profile&slug=${enc(slug)}`);
}

export async function searchRoles(query, { category, seniority, limit } = {}) {
  const p = new URLSearchParams({ action: "search", q: query });
  if (category) p.set("category", category);
  if (seniority) p.set("seniority", seniority);
  if (limit) p.set("limit", String(limit));
  return _get(`/api/role-intelligence?${p}`);
}

export async function compareRoles(slugA, slugB) {
  return _get(`/api/role-intelligence?action=compare&slugA=${enc(slugA)}&slugB=${enc(slugB)}`);
}

export async function fetchCategories() {
  return _get("/api/role-intelligence?action=categories");
}

export async function fetchCategoryIntelligence(category) {
  return _get(`/api/role-intelligence?action=category&category=${enc(category)}`);
}

// ── Role Path ──────────────────────────────────────────────────────────────

export async function fetchShortestPath(from, to) {
  return _get(`/api/role-path?action=shortest&from=${enc(from)}&to=${enc(to)}`);
}

export async function fetchAllPaths(from, to, { maxDepth, maxResults } = {}) {
  const p = new URLSearchParams({ action: "all", from, to });
  if (maxDepth) p.set("maxDepth", String(maxDepth));
  if (maxResults) p.set("maxResults", String(maxResults));
  return _get(`/api/role-path?${p}`);
}

export async function fetchNextMoves(slug, sortBy = "salary") {
  return _get(`/api/role-path?action=next&slug=${enc(slug)}&sortBy=${enc(sortBy)}`);
}

export async function fetchPreviousMoves(slug) {
  return _get(`/api/role-path?action=previous&slug=${enc(slug)}`);
}

// ── Salary Intelligence ────────────────────────────────────────────────────

export async function fetchSalaryIntelligence(slug) {
  return _get(`/api/career-intelligence/salary-intelligence?action=role&slug=${enc(slug)}`);
}

export async function compareSalaries(slugs) {
  return _get(`/api/career-intelligence/salary-intelligence?action=compare&slugs=${slugs.map(enc).join(",")}`);
}

export async function fetchTopPaying({ category, seniority, limit } = {}) {
  const p = new URLSearchParams({ action: "top" });
  if (category) p.set("category", category);
  if (seniority) p.set("seniority", seniority);
  if (limit) p.set("limit", String(limit));
  return _get(`/api/career-intelligence/salary-intelligence?${p}`);
}

export async function fetchSalaryBySeniority(category) {
  return _get(`/api/career-intelligence/salary-intelligence?action=byseniority&category=${enc(category)}`);
}

// ── Skills Gap ─────────────────────────────────────────────────────────────

export async function analyseSkillsGap(skills, targetSlug) {
  return _get(`/api/career-intelligence/skills-gap?action=analyse&target=${enc(targetSlug)}&skills=${skills.map(enc).join(",")}`);
}

export async function analyseTransitionGap(from, to) {
  return _get(`/api/career-intelligence/skills-gap?action=transition&from=${enc(from)}&to=${enc(to)}`);
}

export async function matchSkillsToRoles(skills, { category, limit } = {}) {
  const p = new URLSearchParams({ action: "match", skills: skills.join(",") });
  if (category) p.set("category", category);
  if (limit) p.set("limit", String(limit));
  return _get(`/api/career-intelligence/skills-gap?${p}`);
}

// ── Graph ──────────────────────────────────────────────────────────────────

export async function fetchRoleGraph(slug, depth = 2) {
  return _get(`/api/role-graph?slug=${enc(slug)}&depth=${depth}`);
}

export async function fetchGraphStats() {
  return _get("/api/career-intelligence/role-graph-meta?action=stats");
}

// ===========================================================================

function enc(s) {
  return encodeURIComponent(s);
}

async function _get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  const json = await res.json();

  if (!res.ok) {
    const e = new Error(json.message || json.error || "Intelligence API error");
    e.status = res.status;
    e.data = json;
    throw e;
  }

  return json;
}
