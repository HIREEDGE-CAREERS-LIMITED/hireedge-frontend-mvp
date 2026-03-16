// ============================================================================
// components/billing/PlanBadge.js
// ============================================================================

const BADGE_STYLES = {
  free: { bg: "var(--bg-elevated)", color: "var(--text-secondary)", border: "var(--border-default)" },
  career_pack: { bg: "rgba(16,185,129,0.08)", color: "var(--accent-400)", border: "rgba(16,185,129,0.2)" },
  pro: { bg: "rgba(16,185,129,0.12)", color: "var(--accent-300)", border: "rgba(16,185,129,0.3)" },
  elite: { bg: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(16,185,129,0.1))", color: "var(--amber-400)", border: "rgba(251,191,36,0.25)" },
};

const PLAN_LABELS = {
  free: "Free",
  career_pack: "Career Pack",
  pro: "Pro",
  elite: "Elite",
};

export default function PlanBadge({ plan, size, showIcon }) {
  const style = BADGE_STYLES[plan] || BADGE_STYLES.free;
  const label = PLAN_LABELS[plan] || "Free";
  const sizeClass = size === "lg" ? "plan-badge--lg" : size === "sm" ? "plan-badge--sm" : "";

  return (
    <span
      className={`plan-badge ${sizeClass}`}
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {showIcon && plan !== "free" && <span className="plan-badge__icon">✦</span>}
      {label}
    </span>
  );
}

/**
 * Inline "PRO" lock indicator for navigation / tool titles.
 */
export function ProTag() {
  return (
    <span className="pro-tag">PRO</span>
  );
}
