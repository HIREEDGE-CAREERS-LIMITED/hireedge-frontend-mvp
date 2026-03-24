// ============================================================================
// pages/billing.js
// HireEdge — Billing / Plan Selection
//
// CHANGES vs previous version:
//   - Career Pack price: £19.99 → £6.99
//   - Career Pack CTA: "Get Career Pack" → "Unlock Career Pack — £6.99"
//   - Pro CTA: "Upgrade to Pro" → "Start Pro — £14.99/month"
//   - Elite CTA: "Go Elite" → "Upgrade to Elite — £29.99/month"
//   - Added: headline, priceNote2, positioning per plan
//   - Removed: "Talent Profile" from Free features (Pro tool)
//   - PricingCard renders new headline, priceNote2, positioning fields
//   - TrustRow added above .billing-grid
//   - ComparisonNote added below .billing-grid
//   - Layout, toggle, FAQ, UsageMeter, PlanBadge: unchanged
// ============================================================================

import { useState, useEffect } from "react";

// ── Plan data (inline — single source of truth for this page) ─────────────

const STORAGE_KEY = "hireedge_plan";

const PLANS_CONFIG = {
  free: {
    id:              "free",
    name:            "Free",
    headline:        "Explore your career basics",
    price:           "£0",
    priceNote:       "forever",
    priceNote2:      null,
    positioning:     null,
    copilot_per_day: 10,
    tools_per_day:   15,
    career_pack:     false,
    premium_tools:   false,
    unlimited:       false,
    features: [
      "Role Explorer",
      "Salary Insights",
      "Skills Gap Analysis",
      "Career Graph",
      "Gap Explainer",
      "10 EDGEX messages/day",
      "15 tool uses/day",
    ],
    cta: null,
  },
  career_pack: {
    id:              "career_pack",
    name:            "Career Pack",
    headline:        "One-time career transformation plan",
    price:           "£6.99",
    priceNote:       "one-time",
    priceNote2:      "One-time payment • No subscription",
    positioning:     "Best for a one-time structured plan",
    copilot_per_day: 20,
    tools_per_day:   25,
    career_pack:     true,
    premium_tools:   false,
    unlimited:       false,
    features: [
      "Everything in Free",
      "Full Career Pack (build + export)",
      "Career Roadmap",
      "20 EDGEX messages/day",
      "25 tool uses/day",
    ],
    cta:        "Unlock Career Pack — £6.99",
    stripe_key: "career_pack",
  },
  pro: {
    id:              "pro",
    name:            "Pro",
    headline:        "Full career acceleration toolkit",
    price:           "£14.99",
    priceNote:       "/month",
    priceNote2:      "Monthly subscription • Cancel anytime",
    positioning:     "Best for continuous career growth",
    yearlyPrice:     "£119.88/yr (£9.99/mo)",
    copilot_per_day: 100,
    tools_per_day:   100,
    career_pack:     true,
    premium_tools:   true,
    unlimited:       false,
    popular:         true,
    features: [
      "Everything in Career Pack",
      "Resume Optimiser",
      "LinkedIn Optimiser",
      "Interview Prep",
      "Visa Intelligence",
      "Talent Profile",
      "100 EDGEX messages/day",
      "100 tool uses/day",
    ],
    cta:        "Start Pro — £14.99/month",
    stripe_key: "career_pro",
  },
  elite: {
    id:              "elite",
    name:            "Elite",
    headline:        "Maximum growth with priority support",
    price:           "£29.99",
    priceNote:       "/month",
    priceNote2:      "Monthly subscription • Cancel anytime",
    positioning:     null,
    yearlyPrice:     "£239.88/yr (£19.99/mo)",
    copilot_per_day: Infinity,
    tools_per_day:   Infinity,
    career_pack:     true,
    premium_tools:   true,
    unlimited:       true,
    features: [
      "Everything in Pro",
      "Unlimited EDGEX messages",
      "Unlimited tool uses",
      "Priority support",
      "Early access to new features",
    ],
    cta:        "Upgrade to Elite — £29.99/month",
    stripe_key: "career_elite",
  },
};

const PLAN_ORDER = ["free", "career_pack", "pro", "elite"];

function getCurrentPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem(STORAGE_KEY) || "free";
}

function setPlan(planId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, planId);
}

function getPlan(planId) {
  return PLANS_CONFIG[planId] || PLANS_CONFIG.free;
}

function getUsage() {
  const plan = getPlan(getCurrentPlan());
  const raw = (() => {
    if (typeof window === "undefined") return { copilot: 0, tools: 0, date: "" };
    try {
      const stored = localStorage.getItem("hireedge_usage");
      const parsed = stored ? JSON.parse(stored) : {};
      const today  = new Date().toISOString().slice(0, 10);
      if (parsed.date !== today) return { copilot: 0, tools: 0, date: today };
      return parsed;
    } catch {
      return { copilot: 0, tools: 0, date: "" };
    }
  })();
  return {
    copilot: {
      used:  raw.copilot,
      limit: plan.copilot_per_day,
      pct:   plan.copilot_per_day === Infinity ? 0 : Math.round((raw.copilot / plan.copilot_per_day) * 100),
    },
    tools: {
      used:  raw.tools,
      limit: plan.tools_per_day,
      pct:   plan.tools_per_day === Infinity ? 0 : Math.round((raw.tools / plan.tools_per_day) * 100),
    },
  };
}

// ── Plan badge ────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  free:        { bg: "var(--bg-elevated)",                                   color: "var(--text-secondary)",  border: "var(--border-default)" },
  career_pack: { bg: "rgba(16,185,129,0.08)",                                color: "var(--accent-400)",      border: "rgba(16,185,129,0.2)"  },
  pro:         { bg: "rgba(16,185,129,0.12)",                                color: "var(--accent-300)",      border: "rgba(16,185,129,0.3)"  },
  elite:       { bg: "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(16,185,129,0.1))", color: "var(--amber-400)", border: "rgba(251,191,36,0.25)" },
};

const PLAN_LABELS = { free: "Free", career_pack: "Career Pack", pro: "Pro", elite: "Elite" };

function PlanBadge({ plan, size, showIcon }) {
  const style = BADGE_STYLES[plan] || BADGE_STYLES.free;
  const label = PLAN_LABELS[plan] || "Free";
  return (
    <span
      className={`plan-badge ${size === "lg" ? "plan-badge--lg" : size === "sm" ? "plan-badge--sm" : ""}`}
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {showIcon && plan !== "free" && <span className="plan-badge__icon">✦</span>}
      {label}
    </span>
  );
}

// ── Usage meter ───────────────────────────────────────────────────────────

function UsageMeter({ compact }) {
  const usage    = getUsage();
  const planData = getPlan(getCurrentPlan());

  if (planData.unlimited) {
    return compact ? null : (
      <div className="usage-meter usage-meter--unlimited">
        <span className="usage-meter__label">Unlimited usage on Elite</span>
      </div>
    );
  }

  return (
    <div className={`usage-meter ${compact ? "usage-meter--compact" : ""}`}>
      <Meter label="EDGEX" used={usage.copilot.used} limit={usage.copilot.limit} pct={usage.copilot.pct} compact={compact} />
      <Meter label="Tools" used={usage.tools.used}   limit={usage.tools.limit}   pct={usage.tools.pct}   compact={compact} />
    </div>
  );
}

function Meter({ label, used, limit, pct, compact }) {
  const depleted = pct >= 100;
  return (
    <div className={`meter ${depleted ? "meter--depleted" : ""}`}>
      <div className="meter__header">
        <span className="meter__label">{label}</span>
        {!compact && (
          <span className="meter__count" style={{ color: depleted ? "var(--red-400)" : undefined }}>
            {used}/{limit === Infinity ? "∞" : limit}
          </span>
        )}
      </div>
      <div className="meter__track">
        <div
          className="meter__fill"
          style={{
            width:      `${Math.min(pct, 100)}%`,
            background: pct >= 90 ? "var(--red-400)" : pct >= 70 ? "var(--amber-400)" : "var(--accent-500)",
          }}
        />
      </div>
      {depleted && !compact && <span className="meter__warning">Daily limit reached</span>}
    </div>
  );
}

// ── Pricing card ──────────────────────────────────────────────────────────

function PricingCard({ plan, isCurrentPlan, onSelect, billingCycle }) {
  const showYearly  = billingCycle === "yearly" && plan.yearlyPrice;
  const displayPrice = showYearly
    ? plan.yearlyPrice.split("(")[1]?.replace(")", "") || plan.yearlyPrice
    : plan.price;
  const displayNote = showYearly ? "/month billed yearly" : plan.priceNote;

  return (
    <div className={`pricing-card ${plan.popular ? "pricing-card--popular" : ""} ${isCurrentPlan ? "pricing-card--current" : ""}`}>
      {plan.popular     && <div className="pricing-card__ribbon">Most Popular</div>}
      {isCurrentPlan    && <div className="pricing-card__current-badge">Current Plan</div>}

      <div className="pricing-card__header">
        <h3 className="pricing-card__name">{plan.name}</h3>

        {/* Value headline — new */}
        {plan.headline && (
          <p className="pricing-card__headline">{plan.headline}</p>
        )}

        <div className="pricing-card__price">
          <span className="pricing-card__amount">{displayPrice}</span>
          <span className="pricing-card__note">{displayNote}</span>
        </div>

        {showYearly && (
          <div className="pricing-card__yearly-total">
            {plan.yearlyPrice.split("/")[0]}
          </div>
        )}

        {/* Payment clarity note — new */}
        {plan.priceNote2 && !showYearly && (
          <p className="pricing-card__price-note2">{plan.priceNote2}</p>
        )}

        {/* Positioning line — new */}
        {plan.positioning && (
          <p className="pricing-card__positioning">{plan.positioning}</p>
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

// ── Trust row — new ───────────────────────────────────────────────────────

function TrustRow() {
  return (
    <div className="billing-trust">
      <span className="billing-trust__item">
        <span className="billing-trust__tick">✔</span>
        No hidden fees
      </span>
      <span className="billing-trust__item">
        <span className="billing-trust__tick">✔</span>
        Cancel anytime
      </span>
      <span className="billing-trust__item">
        <span className="billing-trust__tick">✔</span>
        Instant access after upgrade
      </span>
    </div>
  );
}

// ── Comparison note — new ─────────────────────────────────────────────────

function ComparisonNote() {
  return (
    <div className="billing-compare">
      <p className="billing-compare__title">Not sure which to choose?</p>
      <p className="billing-compare__row">
        <span className="billing-compare__label">Career Pack</span>
        <span className="billing-compare__sep">=</span>
        <span className="billing-compare__desc">One-time plan — pay once, yours to keep</span>
      </p>
      <p className="billing-compare__row">
        <span className="billing-compare__label">Pro</span>
        <span className="billing-compare__sep">=</span>
        <span className="billing-compare__desc">Full tools + continuous support</span>
      </p>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────

function FAQItem({ q, a }) {
  return (
    <details className="billing-faq__item">
      <summary className="billing-faq__q">{q}</summary>
      <p className="billing-faq__a">{a}</p>
    </details>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Read localStorage only after mount — localStorage is not available during SSR
  useEffect(() => {
    setCurrentPlan(getCurrentPlan());
  }, []);

  const handleSelect = (planId) => {
    setPlan(planId);
    setCurrentPlan(planId);
  };

  return (
    <div className="billing-page">

      {/* Header — unchanged */}
      <div className="billing-page__header">
        <h1 className="billing-page__title">Plans &amp; Pricing</h1>
        <p className="billing-page__subtitle">
          Choose the plan that fits your career goals. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current plan + usage — unchanged */}
      <div className="billing-current">
        <div className="billing-current__info">
          <span className="billing-current__label">Current Plan</span>
          <PlanBadge plan={currentPlan} size="lg" showIcon />
        </div>
        <UsageMeter />
      </div>

      {/* Billing toggle — unchanged */}
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

      {/* Trust row — NEW: above cards */}
      <TrustRow />

      {/* Plan cards — unchanged structure, PricingCard renders new fields */}
      <div className="billing-grid">
        {PLAN_ORDER.map((planId) => (
          <PricingCard
            key={planId}
            plan={PLANS_CONFIG[planId]}
            isCurrentPlan={planId === currentPlan}
            onSelect={handleSelect}
            billingCycle={billingCycle}
          />
        ))}
      </div>

      {/* Comparison note — NEW: below cards */}
      <ComparisonNote />

      {/* FAQ — unchanged */}
      <div className="billing-faq">
        <h3 className="billing-faq__title">Frequently Asked Questions</h3>
        <div className="billing-faq__grid">
          <FAQItem q="Can I switch plans anytime?"           a="Yes. Upgrade instantly, downgrade at the end of your billing cycle. No lock-in." />
          <FAQItem q="What payment methods do you accept?"   a="All major credit/debit cards via Stripe. Apple Pay and Google Pay also supported." />
          <FAQItem q="Do limits reset daily?"                a="Yes. EDGEX messages and tool uses reset every day at midnight UTC." />
          <FAQItem q="Is the Career Pack a one-time purchase?" a="Yes. Pay once and keep full career pack access indefinitely." />
          <FAQItem q="What happens when I hit a limit?"      a="You'll see a clear upgrade prompt. Your data is never lost — just upgrade to continue." />
          <FAQItem q="Can I get a refund?"                   a="Yes, within 14 days of purchase if you're not satisfied." />
        </div>
      </div>

    </div>
  );
}
