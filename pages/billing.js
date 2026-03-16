// ============================================================================
// pages/billing.js
// HireEdge Frontend — Billing / Pricing page
// ============================================================================

import { useState } from "react";
import { PLANS, PLAN_ORDER, getCurrentPlan, setCurrentPlan, getUpgradeUrl } from "../services/billingService";
import PricingCard from "../components/billing/PricingCard";
import PlanBadge from "../components/billing/PlanBadge";
import UsageMeter from "../components/billing/UsageMeter";

export default function BillingPage() {
  const [currentPlan, setCurrentPlanState] = useState(getCurrentPlan());
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleSelect = (planId) => {
    // In production, this would redirect to Stripe Checkout.
    // For MVP, we set the plan locally.
    setCurrentPlan(planId);
    setCurrentPlanState(planId);
  };

  return (
    <div className="billing-page">
      {/* Header */}
      <div className="billing-page__header">
        <h1 className="billing-page__title">Plans & Pricing</h1>
        <p className="billing-page__subtitle">
          Choose the plan that fits your career goals. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="billing-current">
        <div className="billing-current__info">
          <span className="billing-current__label">Current Plan</span>
          <PlanBadge plan={currentPlan} size="lg" showIcon />
        </div>
        <UsageMeter />
      </div>

      {/* Billing cycle toggle */}
      <div className="billing-toggle">
        <button
          className={`billing-toggle__btn ${billingCycle === "monthly" ? "billing-toggle__btn--active" : ""}`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button
          className={`billing-toggle__btn ${billingCycle === "yearly" ? "billing-toggle__btn--active" : ""}`}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly
          <span className="billing-toggle__save">Save 33%</span>
        </button>
      </div>

      {/* Pricing grid */}
      <div className="billing-grid">
        {PLAN_ORDER.map((planId) => (
          <PricingCard
            key={planId}
            plan={PLANS[planId]}
            isCurrentPlan={planId === currentPlan}
            onSelect={handleSelect}
            billingCycle={billingCycle}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className="billing-faq">
        <h3 className="billing-faq__title">Frequently Asked Questions</h3>
        <div className="billing-faq__grid">
          <FaqItem
            q="Can I switch plans anytime?"
            a="Yes. Upgrade instantly, downgrade at the end of your billing cycle. No lock-in."
          />
          <FaqItem
            q="What payment methods do you accept?"
            a="All major credit/debit cards via Stripe. Apple Pay and Google Pay also supported."
          />
          <FaqItem
            q="Do limits reset daily?"
            a="Yes. Copilot messages and tool uses reset every day at midnight UTC."
          />
          <FaqItem
            q="Is the Career Pack a one-time purchase?"
            a="Yes. Pay once and keep full career pack access indefinitely."
          />
          <FaqItem
            q="What happens when I hit a limit?"
            a="You'll see a clear upgrade prompt. Your data is never lost — just upgrade to continue."
          />
          <FaqItem
            q="Can I get a refund?"
            a="Yes, within 14 days of purchase if you're not satisfied."
          />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="billing-faq__item">
      <summary className="billing-faq__q">{q}</summary>
      <p className="billing-faq__a">{a}</p>
    </details>
  );
}
