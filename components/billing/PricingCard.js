// ============================================================================
// components/billing/PricingCard.js
// ============================================================================

export default function PricingCard({ plan, isCurrentPlan, onSelect, billingCycle }) {
  const showYearly = billingCycle === "yearly" && plan.yearlyPrice;
  const displayPrice = showYearly ? plan.yearlyPrice.split("(")[1]?.replace(")", "") || plan.yearlyPrice : plan.price;
  const displayNote = showYearly ? "/month billed yearly" : plan.priceNote;

  return (
    <div className={`pricing-card ${plan.popular ? "pricing-card--popular" : ""} ${isCurrentPlan ? "pricing-card--current" : ""}`}>
      {plan.popular && <div className="pricing-card__ribbon">Most Popular</div>}
      {isCurrentPlan && <div className="pricing-card__current-badge">Current Plan</div>}

      <div className="pricing-card__header">
        <h3 className="pricing-card__name">{plan.name}</h3>
        <div className="pricing-card__price">
          <span className="pricing-card__amount">{displayPrice}</span>
          <span className="pricing-card__note">{displayNote}</span>
        </div>
        {showYearly && (
          <div className="pricing-card__yearly-total">
            {plan.yearlyPrice.split("/")[0]}
          </div>
        )}
      </div>

      <div className="pricing-card__features">
        {plan.features.map((feature, i) => (
          <div key={i} className="pricing-card__feature">
            <span className="pricing-card__check">✓</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="pricing-card__footer">
        {isCurrentPlan ? (
          <button className="pricing-card__btn pricing-card__btn--current" disabled>
            Your Plan
          </button>
        ) : plan.cta ? (
          <button
            className={`pricing-card__btn ${plan.popular ? "pricing-card__btn--primary" : "pricing-card__btn--secondary"}`}
            onClick={() => onSelect?.(plan.id)}
          >
            {plan.cta}
          </button>
        ) : (
          <button className="pricing-card__btn pricing-card__btn--muted" disabled>
            Current
          </button>
        )}
      </div>

      {/* CHANGED: "Copilot/day" → "EDGEX/day" */}
      <div className="pricing-card__limits">
        <span className="pricing-card__limit">
          {plan.copilot_per_day === Infinity ? "Unlimited" : plan.copilot_per_day} EDGEX/day
        </span>
        <span className="pricing-card__limit-sep">·</span>
        <span className="pricing-card__limit">
          {plan.tools_per_day === Infinity ? "Unlimited" : plan.tools_per_day} Tools/day
        </span>
      </div>
    </div>
  );
}
