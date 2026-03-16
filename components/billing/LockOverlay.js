// ============================================================================
// components/billing/LockOverlay.js
// ============================================================================

import Link from "next/link";
import { getRequiredPlan, getPlanDetails, getUpgradeUrl } from "../../services/billingService";
import PlanBadge from "./PlanBadge";

/**
 * Full-page lock overlay for premium tools / sections.
 * Render this as a wrapper: if locked, it shows the overlay; otherwise children.
 */
export default function LockOverlay({ tool, isLocked, children }) {
  if (!isLocked) return <>{children}</>;

  const requiredPlan = getRequiredPlan(tool);
  const planInfo = getPlanDetails(requiredPlan);

  return (
    <div className="lock-overlay-wrap">
      {/* Blurred content behind */}
      <div className="lock-overlay__bg">
        {children}
      </div>

      {/* Lock card */}
      <div className="lock-overlay">
        <div className="lock-overlay__card">
          <div className="lock-overlay__icon">🔒</div>
          <h3 className="lock-overlay__title">Premium Feature</h3>
          <p className="lock-overlay__text">
            This tool requires the <PlanBadge plan={requiredPlan} size="sm" showIcon /> plan or higher.
          </p>
          <div className="lock-overlay__features">
            {planInfo.features.slice(0, 4).map((f, i) => (
              <div key={i} className="lock-overlay__feature">
                <span className="lock-overlay__check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Link href={getUpgradeUrl(requiredPlan)} className="lock-overlay__btn">
            {planInfo.cta || `Upgrade to ${planInfo.name}`}
          </Link>
          <Link href="/billing" className="lock-overlay__compare">
            Compare all plans
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline lock badge — small indicator next to a tool/nav item.
 */
export function LockBadge({ tool }) {
  const required = getRequiredPlan(tool);
  if (required === "free") return null;

  return (
    <span className="lock-badge">
      <span className="lock-badge__icon">🔒</span>
      <PlanBadge plan={required} size="sm" />
    </span>
  );
}
