// ============================================================================
// pages/tools/index.js
// HireEdge -- Career Tools Index
// Free: Gap Explainer, Talent Profile
// Pro: Career Roadmap, Resume Optimiser, LinkedIn Optimiser, Interview Prep, Visa Intelligence
// ============================================================================

import Head from "next/head";
import Link from "next/link";

const FREE_TOOLS = [
  {
    id:   "career-gap-explainer",
    name: "Career Gap Explainer",
    sub:  "Gap Diagnostic",
    desc: "Find exactly what skills and experiences are missing for your target role.",
    icon: "🔍",
    href: "/tools/career-gap-explainer",
  },
  {
    id:   "talent-profile",
    name: "Talent Profile",
    sub:  "Profile Intelligence",
    desc: "Build a data-driven profile showing your market position and unique strengths.",
    icon: "⭐",
    href: "/tools/talent-profile",
  },
];

const PRO_TOOLS = [
  {
    id:   "career-roadmap",
    name: "Career Roadmap",
    sub:  "Transition Planner",
    desc: "Get a phased action plan from where you are to where you want to be.",
    icon: "🗺️",
    href: "/tools/career-roadmap",
  },
  {
    id:   "resume-optimiser",
    name: "Resume Optimiser",
    sub:  "CV Builder",
    desc: "ATS-ready CV blueprint tailored for your target role with scoring and rewrites.",
    icon: "📄",
    href: "/tools/resume-optimiser",
  },
  {
    id:   "linkedin-optimiser",
    name: "LinkedIn Optimiser",
    sub:  "Profile Strength",
    desc: "Headlines and profile improvements that get you found by recruiters.",
    icon: "💼",
    href: "/tools/linkedin-optimiser",
  },
  {
    id:   "interview-prep",
    name: "Interview Prep",
    sub:  "Interview Coach",
    desc: "Role-specific questions, STAR answers, and salary negotiation intel.",
    icon: "🎯",
    href: "/tools/interview-prep",
  },
  {
    id:   "visa-intelligence",
    name: "Visa Intelligence",
    sub:  "Visa Eligibility",
    desc: "Check your UK and international visa routes, requirements, and timelines.",
    icon: "🛂",
    href: "/tools/visa-intelligence",
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <Head><title>Career Tools -- HireEdge</title></Head>
      <div className="tl-page">

        <div className="tl-header">
          <h1 className="tl-header__title">Career Tools</h1>
          <p className="tl-header__sub">Hands-on intelligence tools powered by real career data across 1,000+ roles.</p>
        </div>

        {/* Row 1: 2 Free tools */}
        <div className="tl-section">
          <p className="tl-section__label">Free Tools</p>
          <div className="tl-grid tl-grid--2">
            {FREE_TOOLS.map(t => (
              <Link key={t.id} href={t.href} className="tl-card">
                <span className="tl-card__icon">{t.icon}</span>
                <div className="tl-card__body">
                  <span className="tl-card__sub">{t.sub}</span>
                  <span className="tl-card__name">{t.name}</span>
                  <span className="tl-card__desc">{t.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2: 5 Pro tools */}
        <div className="tl-section">
          <p className="tl-section__label">Pro Tools</p>
          <div className="tl-grid tl-grid--5">
            {PRO_TOOLS.map(t => (
              <Link key={t.id} href={t.href} className="tl-card tl-card--pro">
                <span className="tl-card__icon">{t.icon}</span>
                <div className="tl-card__body">
                  <div className="tl-card__top">
                    <span className="tl-card__sub">{t.sub}</span>
                    <span className="tl-card__pro-badge">PRO</span>
                  </div>
                  <span className="tl-card__name">{t.name}</span>
                  <span className="tl-card__desc">{t.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
