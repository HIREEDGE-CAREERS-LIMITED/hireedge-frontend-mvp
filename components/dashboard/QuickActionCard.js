// ============================================================================
// components/dashboard/QuickActionCard.js
// HireEdge Frontend -- Quick Action Card
// ============================================================================

import Link from "next/link";
import EDGEXIcon from "../brand/EDGEXIcon";

const ACTIONS = [
  {
    id: "edgex",
    title: "Ask EDGEX",
    description: "AI career intelligence",
    href: "/copilot",
    accent: true,
  },
  {
    id: "roadmap",
    title: "Build Roadmap",
    description: "Step-by-step career plan",
    href: "/tools/career-roadmap",
    icon: "\uD83D\uDDFA\uFE0F",
  },
  {
    id: "resume",
    title: "Optimise Resume",
    description: "ATS-ready for your target role",
    href: "/tools/resume-optimiser",
    icon: "\uD83D\uDCC4",
  },
  {
    id: "interview",
    title: "Interview Prep",
    description: "Questions and answers for your role",
    href: "/tools/interview-prep",
    icon: "\uD83C\uDFAF",
  },
];

// Render icon: canonical EDGEXIcon for the EDGEX action, emoji for all others
function ActionIcon({ action }) {
  if (action.id === "edgex") {
    return (
      <span className="quick-action__icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <EDGEXIcon size={20} state="header" color="currentColor" />
      </span>
    );
  }
  return <span className="quick-action__icon">{action.icon}</span>;
}

export default function QuickActionCard() {
  return (
    <div className="quick-actions">
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={`quick-action ${action.accent ? "quick-action--accent" : ""}`}
        >
          <ActionIcon action={action} />
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
