// ============================================================================
// services/careerPackService.js
// HireEdge Frontend — Career Pack API service
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Build a full career pack.
 * GET /api/career-pack/build?role=...&target=...&skills=...&yearsExp=...
 */
export async function buildCareerPack({ role, target, skills, yearsExp }) {
  const p = new URLSearchParams({ role, target, skills: skills.join(",") });
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  return _get(`/api/career-pack/build?${p}`);
}

/**
 * Get the export download URL (browser navigates to this directly).
 */
export function getExportUrl({ role, target, skills, yearsExp }) {
  const p = new URLSearchParams({ role, target, skills: skills.join(",") });
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  return `${API_BASE}/api/career-pack/export?${p}`;
}

/**
 * Trigger export download by opening the URL.
 */
export function downloadCareerPack({ role, target, skills, yearsExp }) {
  const url = getExportUrl({ role, target, skills, yearsExp });
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}

// ===========================================================================

async function _get(endpoint) {
  const plan = typeof window !== "undefined" ? (localStorage.getItem("hireedge_plan") || "free") : "free";
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "X-HireEdge-Plan": plan },
  });
  const json = await res.json();
  if (!res.ok) {
    const e = new Error(json.message || json.error || "Career Pack API error");
    e.status = res.status;
    e.reason = json.reason;
    e.upgrade_to = json.upgrade_to;
    e.data = json;
    throw e;
  }
  return json;
}
