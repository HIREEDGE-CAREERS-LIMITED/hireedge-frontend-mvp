// ============================================================================
// services/billingService.js
// HireEdge Frontend — Billing & plan service
// ============================================================================

const PLAN_KEY = "hireedge_plan";
const USAGE_KEY = "hireedge_usage";

// ── Plan definitions (mirrors backend planLimits.js) ───────────────────────

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: "£0",
    priceNote: "forever",
    copilot_per_day: 10,
    tools_per_day: 15,
    career_pack: false,
    premium_tools: false,
    unlimited: false,
    features: [
      "Role Explorer",
      "Salary Insights",
      "Skills Gap Analysis",
      "Career Graph",
      "Talent Profile",
      "Gap Explainer",
      "10 Copilot messages/day",
      "15 tool uses/day",
    ],
    cta: null,
  },
  career_pack: {
    id: "career_pack",
    name: "Career Pack",
    price: "£19.99",
    priceNote: "one-time",
    copilot_per_day: 20,
    tools_per_day: 25,
    career_pack: true,
    premium_tools: false,
    unlimited: false,
    features: [
      "Everything in Free",
      "Full Career Pack (build + export)",
      "Career Roadmap",
      "20 Copilot messages/day",
      "25 tool uses/day",
    ],
    cta: "Get Career Pack",
    stripe_key: "career_pack",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "£14.99",
    priceNote: "/month",
    yearlyPrice: "£119.88/yr (£9.99/mo)",
    copilot_per_day: 100,
    tools_per_day: 100,
    career_pack: true,
    premium_tools: true,
    unlimited: false,
    popular: true,
    features: [
      "Everything in Career Pack",
      "Resume Optimiser",
      "LinkedIn Optimiser",
      "Interview Prep",
      "Visa Eligibility",
      "100 Copilot messages/day",
      "100 tool uses/day",
    ],
    cta: "Upgrade to Pro",
    stripe_key: "career_pro",
  },
  elite: {
    id: "elite",
    name: "Elite",
    price: "£29.99",
    priceNote: "/month",
    yearlyPrice: "£239.88/yr (£19.99/mo)",
    copilot_per_day: Infinity,
    tools_per_day: Infinity,
    career_pack: true,
    premium_tools: true,
    unlimited: true,
    features: [
      "Everything in Pro",
      "Unlimited Copilot messages",
      "Unlimited tool uses",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Elite",
    stripe_key: "career_elite",
  },
};

export const PLAN_ORDER = ["free", "career_pack", "pro", "elite"];

// ── Current plan ───────────────────────────────────────────────────────────

export function getCurrentPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem(PLAN_KEY) || "free";
}

export function setCurrentPlan(planId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, planId);
}

export function getPlanDetails(planId) {
  return PLANS[planId] || PLANS.free;
}

// ── Plan comparison ────────────────────────────────────────────────────────

export function isPlanHigherOrEqual(planId, requiredPlan) {
  const order = PLAN_ORDER;
  return order.indexOf(planId) >= order.indexOf(requiredPlan);
}

export function canAccessTool(tool) {
  const plan = getCurrentPlan();
  const FREE_TOOLS = new Set([
    "role-intelligence", "role-path", "skills-gap", "salary-intelligence",
    "role-graph", "role-graph-meta", "talent-profile", "career-gap-explainer",
  ]);
  const PRO_TOOLS = new Set([
    "career-roadmap", "resume-optimiser", "linkedin-optimiser",
    "interview-prep", "visa-eligibility",
  ]);

  if (plan === "elite" || plan === "pro") return true;
  if (FREE_TOOLS.has(tool)) return true;
  if (tool === "career-pack-build" || tool === "career-pack-export") {
    return isPlanHigherOrEqual(plan, "career_pack");
  }
  if (PRO_TOOLS.has(tool)) return plan === "pro" || plan === "elite";
  return false;
}

export function getRequiredPlan(tool) {
  const PRO_TOOLS = new Set([
    "career-roadmap", "resume-optimiser", "linkedin-optimiser",
    "interview-prep", "visa-eligibility",
  ]);
  if (tool === "career-pack-build" || tool === "career-pack-export") return "career_pack";
  if (PRO_TOOLS.has(tool)) return "pro";
  return "free";
}

// ── Usage tracking (client-side, mirrors backend usageTracker) ─────────────

export function getUsage() {
  if (typeof window === "undefined") return { copilot: 0, tools: 0, date: "" };
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return { copilot: 0, tools: 0, date: today };
    return data;
  } catch { return { copilot: 0, tools: 0, date: "" }; }
}

export function trackLocalUsage(type) {
  const today = new Date().toISOString().slice(0, 10);
  const usage = getUsage();
  if (usage.date !== today) {
    usage.copilot = 0;
    usage.tools = 0;
    usage.date = today;
  }
  if (type === "copilot") usage.copilot++;
  else usage.tools++;
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch {}
  return usage;
}

export function getUsageLimits() {
  const plan = getPlanDetails(getCurrentPlan());
  const usage = getUsage();
  return {
    copilot: { used: usage.copilot, limit: plan.copilot_per_day, pct: plan.copilot_per_day === Infinity ? 0 : Math.round((usage.copilot / plan.copilot_per_day) * 100) },
    tools: { used: usage.tools, limit: plan.tools_per_day, pct: plan.tools_per_day === Infinity ? 0 : Math.round((usage.tools / plan.tools_per_day) * 100) },
  };
}

// ── Upgrade URL (placeholder for Stripe checkout) ──────────────────────────

export function getUpgradeUrl(planId) {
  return `/billing?upgrade=${planId}`;
}
