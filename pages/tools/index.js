// ============================================================================
// pages/tools/index.js
// HireEdge Frontend — Tools hub
// ============================================================================

import Link from "next/link";

const TOOLS = [
  { id: "talent-profile", title: "Talent Profile", icon: "👤", desc: "Strengths, gaps, fitness, and career mobility", href: "/tools/talent-profile" },
  { id: "career-roadmap", title: "Career Roadmap", icon: "🗺️", desc: "Step-by-step path between any two roles", href: "/tools/career-roadmap" },
  { id: "career-gap-explainer", title: "Gap Explainer", icon: "🔍", desc: "Why a transition is easy or hard", href: "/tools/career-gap-explainer" },
  { id: "resume-optimiser", title: "Resume Optimiser", icon: "📄", desc: "ATS-ready resume blueprint", href: "/tools/resume-optimiser", badge: "PRO" },
  { id: "linkedin-optimiser", title: "LinkedIn Optimiser", icon: "💼", desc: "Headlines, skills, and profile strength", href: "/tools/linkedin-optimiser", badge: "PRO" },
  { id: "interview-prep", title: "Interview Prep", icon: "🎤", desc: "Questions, STAR prep, salary intel", href: "/tools/interview-prep", badge: "PRO" },
  { id: "visa-eligibility", title: "Visa Eligibility", icon: "🌍", desc: "UK visa route assessment", href: "/tools/visa-eligibility", badge: "PRO" },
];

export default function ToolsIndexPage() {
  return (
    <div className="tool-shell" style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}>
      <div className="tool-shell__header">
        <span className="tool-shell__icon">🧰</span>
        <div>
          <h1 className="tool-shell__title">Career Tools</h1>
          <p className="tool-shell__desc">Hands-on tools powered by HireEdge intelligence.</p>
        </div>
      </div>
      <div className="tools-grid">
        {TOOLS.map((tool) => (
          <Link key={tool.id} href={tool.href} className="tools-grid__card">
            <span className="tools-grid__icon">{tool.icon}</span>
            <div className="tools-grid__text">
              <div className="tools-grid__title">
                {tool.title}
                {tool.badge && <span className="tool-shell__badge">{tool.badge}</span>}
              </div>
              <div className="tools-grid__desc">{tool.desc}</div>
            </div>
            <span className="tools-grid__arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
