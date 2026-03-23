// ============================================================================
// pages/tools/index.js
// HireEdge -- Career Tools Index
// Lists all available tools with name, description, CTA, and plan gate
// ============================================================================

import Head from "next/head";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";

const TOOLS = [
  {
    id:    "career-gap-explainer",
    name:  "Career Gap Explainer",
    sub:   "Gap Diagnostic",
    desc:  "Understand exactly why a transition is easy, medium, or hard -- what is missing, what matters most, and what to fix first.",
    icon:  "G",
    color: "#f59e0b",
    href:  "/tools/career-gap-explainer",
    plan:  "free",
  },
  {
    id:    "career-roadmap",
    name:  "Career Roadmap",
    sub:   "Transition Planner",
    desc:  "A phased, step-by-step action plan from where you are to where you want to be -- with timelines, milestones, and bridges.",
    icon:  "R",
    color: "#10b981",
    href:  "/tools/career-roadmap",
    plan:  "free",
  },
  {
    id:    "resume-optimiser",
    name:  "Resume Optimiser",
    sub:   "CV Builder",
    desc:  "ATS-ready CV blueprint tailored for your target role -- with scoring, section rewrites, and keyword analysis.",
    icon:  "C",
    color: "#6366f1",
    href:  "/tools/resume-optimiser",
    plan:  "pro",
  },
  {
    id:    "linkedin-optimiser",
    name:  "LinkedIn Optimiser",
    sub:   "Profile Strength",
    desc:  "Headlines, skills, and profile strength improvements that get you found by the right recruiters.",
    icon:  "L",
    color: "#0ea5e9",
    href:  "/tools/linkedin-optimiser",
    plan:  "pro",
  },
  {
    id:    "interview-prep",
    name:  "Interview Prep",
    sub:   "Interview Coach",
    desc:  "Role-specific questions, STAR method answers, and salary negotiation intel for your target position.",
    icon:  "I",
    color: "#8b5cf6",
    href:  "/tools/interview-prep",
    plan:  "pro",
  },
  {
    id:    "visa-intelligence",
    name:  "Visa Intelligence",
    sub:   "Visa Eligibility",
    desc:  "Check your UK and international visa eligibility -- routes, requirements, timelines, and employer sponsorship intel.",
    icon:  "V",
    color: "#3b82f6",
    href:  "/tools/visa-intelligence",
    plan:  "pro",
  },
];

function PlanBadge({ plan }) {
  if (plan === "free") return null;
  return <span className="ti-badge">PRO</span>;
}

function ToolCard({ tool }) {
  return (
    <Link href={tool.href} className="ti-card" style={{ "--tc": tool.color }}>
      <div className="ti-card__icon" style={{ background: tool.color + "18", color: tool.color }}>
        {tool.icon}
      </div>
      <div className="ti-card__body">
        <div className="ti-card__header">
          <span className="ti-card__sub">{tool.sub}</span>
          <PlanBadge plan={tool.plan} />
        </div>
        <h3 className="ti-card__name">{tool.name}</h3>
        <p className="ti-card__desc">{tool.desc}</p>
      </div>
      <div className="ti-card__arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
}

export default function ToolsIndexPage() {
  return (
    <AppShell title="Tools">
      <Head>
        <title>Career Tools -- HireEdge</title>
      </Head>
      <div className="ti-page">
        <div className="ti-hero">
          <span className="ti-hero__badge">TOOLS</span>
          <h1 className="ti-hero__title">Career Tools</h1>
          <p className="ti-hero__sub">Hands-on intelligence tools powered by real career data.</p>
        </div>

        <div className="ti-section">
          <p className="ti-section__label">Free Tools</p>
          <div className="ti-grid">
            {TOOLS.filter(t => t.plan === "free").map(t => <ToolCard key={t.id} tool={t} />)}
          </div>
        </div>

        <div className="ti-section">
          <p className="ti-section__label">Pro Tools</p>
          <div className="ti-grid">
            {TOOLS.filter(t => t.plan === "pro").map(t => <ToolCard key={t.id} tool={t} />)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
