// ============================================================================
// pages/tools/index.js
// HireEdge -- Career Tools Index
// Clean grid of all 7 tools matching Intelligence page nav card style
// ============================================================================

import Head from "next/head";
import Link from "next/link";

const TOOLS = [
  {
    id:    "career-gap-explainer",
    name:  "Career Gap Explainer",
    sub:   "Gap Diagnostic",
    desc:  "Find exactly what skills and experiences are missing for your target role.",
    icon:  "🔍",
    href:  "/tools/career-gap-explainer",
    plan:  "free",
  },
  {
    id:    "career-roadmap",
    name:  "Career Roadmap",
    sub:   "Transition Planner",
    desc:  "Get a phased action plan from where you are to where you want to be.",
    icon:  "🗺️",
    href:  "/tools/career-roadmap",
    plan:  "free",
  },
  {
    id:    "resume-optimiser",
    name:  "Resume Optimiser",
    sub:   "CV Builder",
    desc:  "ATS-ready CV blueprint tailored for your target role -- with scoring and rewrites.",
    icon:  "📄",
    href:  "/tools/resume-optimiser",
    plan:  "pro",
  },
  {
    id:    "linkedin-optimiser",
    name:  "LinkedIn Optimiser",
    sub:   "Profile Strength",
    desc:  "Headlines, skills, and profile improvements that get you found by recruiters.",
    icon:  "💼",
    href:  "/tools/linkedin-optimiser",
    plan:  "pro",
  },
  {
    id:    "interview-prep",
    name:  "Interview Prep",
    sub:   "Interview Coach",
    desc:  "Role-specific questions, STAR answers, and salary negotiation intel.",
    icon:  "🎯",
    href:  "/tools/interview-prep",
    plan:  "pro",
  },
  {
    id:    "visa-intelligence",
    name:  "Visa Intelligence",
    sub:   "Visa Eligibility",
    desc:  "Check your UK and international visa routes, requirements, and timelines.",
    icon:  "🛂",
    href:  "/tools/visa-intelligence",
    plan:  "pro",
  },
  {
    id:    "career-pack",
    name:  "Career Pack",
    sub:   "Full Report",
    desc:  "A unified transition plan combining all tools into one complete report.",
    icon:  "📦",
    href:  "/career-pack",
    plan:  "pro",
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <Head>
        <title>Career Tools -- HireEdge</title>
      </Head>

      <div className="tl-page">

        {/* Header -- same style as Intelligence page */}
        <div className="tl-header">
          <h1 className="tl-header__title">Career Tools</h1>
          <p className="tl-header__sub">
            Hands-on intelligence tools powered by real career data across 1,000+ roles.
          </p>
        </div>

        {/* 7 tool cards in a responsive grid -- same as Intelligence nav cards */}
        <div className="tl-grid">
          {TOOLS.map(tool => (
            <Link key={tool.id} href={tool.href} className="tl-card">
              <span className="tl-card__icon">{tool.icon}</span>
              <div className="tl-card__body">
                <div className="tl-card__top">
                  <span className="tl-card__label">{tool.name}</span>
                  {tool.plan === "pro" && <span className="tl-card__pro">PRO</span>}
                </div>
                <span className="tl-card__desc">{tool.desc}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
