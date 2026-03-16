// ============================================================================
// components/billing/UpgradeModal.js
// ============================================================================

import { useEffect, useRef } from "react";
import Link from "next/link";
import { getPlanDetails, getUpgradeUrl, PLAN_ORDER } from "../../services/billingService";
import PlanBadge from "./PlanBadge";

/**
 * Reusable upgrade modal. Triggered when a 403 / billing block occurs.
 *
 * Props:
 *   open        - boolean
 *   onClose     - () => void
 *   reason      - "upgrade_required" | "daily_limit_reached" | "tool_not_in_plan" | "career_pack_required"
 *   upgradeTo   - plan ID hint from backend
 *   currentPlan - current user plan ID
 *   message     - optional custom message
 */
export default function UpgradeModal({ open, onClose, reason, upgradeTo, currentPlan, message }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const targetPlan = getPlanDetails(upgradeTo || "pro");
  const isLimitHit = reason === "daily_limit_reached";

  const headline = isLimitHit
    ? "You've hit your daily limit"
    : reason === "career_pack_required"
      ? "Career Pack Required"
      : "Upgrade to Unlock";

  const description = message || (isLimitHit
    ? `Your ${currentPlan || "Free"} plan allows limited daily usage. Upgrade for more.`
    : `This feature requires the ${targetPlan.name} plan.`);

  return (
    <div className="upgrade-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}>
      <div className="upgrade-modal">
        {/* Close button */}
        <button className="upgrade-modal__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4l10 10M4 14L14 4" />
          </svg>
        </button>

        {/* Content */}
        <div className="upgrade-modal__icon shimmer-text">✦</div>
        <h2 className="upgrade-modal__title">{headline}</h2>
        <p className="upgrade-modal__desc">{description}</p>

        {/* Target plan card */}
        <div className="upgrade-modal__plan">
          <div className="upgrade-modal__plan-header">
            <PlanBadge plan={targetPlan.id} size="lg" showIcon />
            <div className="upgrade-modal__plan-price">
              <span className="upgrade-modal__plan-amount">{targetPlan.price}</span>
              <span className="upgrade-modal__plan-note">{targetPlan.priceNote}</span>
            </div>
          </div>
          <div className="upgrade-modal__plan-features">
            {targetPlan.features.slice(0, 5).map((f, i) => (
              <div key={i} className="upgrade-modal__feature">
                <span className="upgrade-modal__check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="upgrade-modal__actions">
          <Link href={getUpgradeUrl(targetPlan.id)} className="upgrade-modal__btn upgrade-modal__btn--primary" onClick={onClose}>
            {targetPlan.cta || `Upgrade to ${targetPlan.name}`}
          </Link>
          <Link href="/billing" className="upgrade-modal__btn upgrade-modal__btn--secondary" onClick={onClose}>
            Compare all plans
          </Link>
        </div>
      </div>
    </div>
  );
}
