// ============================================================================
// components/billing/UsageMeter.js
// ============================================================================

import { getUsageLimits, getCurrentPlan, getPlanDetails } from "../../services/billingService";

export default function UsageMeter({ compact }) {
  const limits = getUsageLimits();
  const plan = getPlanDetails(getCurrentPlan());

  if (plan.unlimited) {
    return compact ? null : (
      <div className="usage-meter usage-meter--unlimited">
        <span className="usage-meter__label">Unlimited usage on Elite</span>
      </div>
    );
  }

  return (
    <div className={`usage-meter ${compact ? "usage-meter--compact" : ""}`}>
      <MeterBar
        label="Copilot"
        used={limits.copilot.used}
        limit={limits.copilot.limit}
        pct={limits.copilot.pct}
        compact={compact}
      />
      <MeterBar
        label="Tools"
        used={limits.tools.used}
        limit={limits.tools.limit}
        pct={limits.tools.pct}
        compact={compact}
      />
    </div>
  );
}

function MeterBar({ label, used, limit, pct, compact }) {
  const color = pct >= 90 ? "var(--red-400)" : pct >= 70 ? "var(--amber-400)" : "var(--accent-500)";
  const isAtLimit = pct >= 100;

  return (
    <div className={`meter ${isAtLimit ? "meter--depleted" : ""}`}>
      <div className="meter__header">
        <span className="meter__label">{label}</span>
        {!compact && (
          <span className="meter__count" style={{ color: isAtLimit ? "var(--red-400)" : undefined }}>
            {used}/{limit === Infinity ? "∞" : limit}
          </span>
        )}
      </div>
      <div className="meter__track">
        <div
          className="meter__fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
      {isAtLimit && !compact && (
        <span className="meter__warning">Daily limit reached</span>
      )}
    </div>
  );
}

/**
 * Tiny inline usage indicator for the sidebar.
 */
export function UsageDot({ type }) {
  const limits = getUsageLimits();
  const data = limits[type] || { pct: 0 };
  const color = data.pct >= 90 ? "var(--red-400)" : data.pct >= 70 ? "var(--amber-400)" : "var(--accent-500)";

  return (
    <span className="usage-dot" style={{ background: color }} title={`${data.used}/${data.limit} ${type} today`} />
  );
}
