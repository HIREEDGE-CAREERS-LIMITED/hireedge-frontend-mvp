// ============================================================================
// services/toolsService.js
// HireEdge Frontend — Career Tools API service
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchResumeBlueprint({ target, skills, current, yearsExp }) {
  const p = new URLSearchParams({ action: "blueprint", target, skills: skills.join(",") });
  if (current) p.set("current", current);
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  return _get(`/api/tools/resume-optimiser?${p}`);
}

export async function fetchLinkedinOptimisation({ role, skills, yearsExp, target, industry }) {
  const p = new URLSearchParams({ role, skills: skills.join(",") });
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  if (target) p.set("target", target);
  if (industry) p.set("industry", industry);
  return _get(`/api/tools/linkedin-optimiser?${p}`);
}

export async function fetchInterviewPrep({ target, skills, current, yearsExp }) {
  const p = new URLSearchParams({ target, skills: skills.join(",") });
  if (current) p.set("current", current);
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  return _get(`/api/tools/interview-prep?${p}`);
}

export async function fetchTalentProfile({ role, skills, yearsExp, target }) {
  const p = new URLSearchParams({ role, skills: skills.join(",") });
  if (yearsExp != null) p.set("yearsExp", String(yearsExp));
  if (target) p.set("target", target);
  return _get(`/api/tools/talent-profile?${p}`);
}

export async function fetchCareerRoadmap({ from, to, strategy }) {
  const p = new URLSearchParams({ action: "build", from, to });
  if (strategy) p.set("strategy", strategy);
  return _get(`/api/tools/career-roadmap?${p}`);
}

export async function fetchGapExplainer({ from, to }) {
  return _get(`/api/tools/career-gap-explainer?action=explain&from=${enc(from)}&to=${enc(to)}`);
}

export async function fetchVisaEligibility({ role, salary, age, hasUkDegree, skills }) {
  const p = new URLSearchParams({ action: "assess", role });
  if (salary != null) p.set("salary", String(salary));
  if (age != null) p.set("age", String(age));
  if (hasUkDegree != null) p.set("hasUkDegree", String(hasUkDegree));
  if (skills?.length) p.set("skills", skills.join(","));
  return _get(`/api/tools/visa-eligibility?${p}`);
}

function enc(s) { return encodeURIComponent(s); }

async function _get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "X-HireEdge-Plan": typeof window !== "undefined" ? (localStorage.getItem("hireedge_plan") || "free") : "free",
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const e = new Error(json.message || json.error || "Tool API error");
    e.status = res.status;
    e.reason = json.reason;
    e.upgrade_to = json.upgrade_to;
    e.data = json;
    throw e;
  }
  return json;
}
