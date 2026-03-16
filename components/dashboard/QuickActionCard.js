// ============================================================================
// components/dashboard/QuickActionCard.js
// HireEdge Frontend — Quick action cards
// ============================================================================

import Link from "next/link";

const ACTIONS = [
  {
    id: "copilot",
    title: "Ask Copilot",
    description: "Get career advice in seconds",
    href: "/copilot",
    icon: "✦",
    accent: true,
  },
  {
    id: "roadmap",
    title: "Build Roadmap",
    description: "Step-by-step career plan",
    href: "/tools/roadmap",
    icon: "🗺️",
  },
  {
    id: "resume",
    title: "Optimise Resume",
    description: "ATS-ready for your target role",
    href: "/tools/resume",
    icon: "📄",
  },
  {
    id: "interview",
    title: "Interview Prep",
    description: "Questions, STAR, salary intel",
    href: "/tools/interview",
    icon: "🎤",
  },
];

export default function QuickActionCard() {
  return (
    <div className="quick-actions">
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={`quick-action ${action.accent ? "quick-action--accent" : ""}`}
        >
          <span className="quick-action__icon">{action.icon}</span>
          <div className="quick-action__text">
            <div className="quick-action__title">{action.title}</div>
            <div className="quick-action__desc">{action.description}</div>
          </div>
          <span className="quick-action__arrow">→</span>
        </Link>
      ))}
    </div>
  );
}
