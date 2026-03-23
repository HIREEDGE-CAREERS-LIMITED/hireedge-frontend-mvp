// ============================================================================
// pages/tools/index.js
// HireEdge -- Career Tools Index
// 7 tools in 3-col grid, FREE/PRO badge prominent top-right
// ============================================================================

import Head from "next/head";
import Link from "next/link";
import EDGEXBadge from "../../components/brand/EDGEXBadge";

const TOOLS = [
  { id: "career-gap-explainer", name: "Career Gap Explainer", sub: "Gap Diagnostic",       desc: "Find exactly what skills and experiences are holding you back from your target role.", icon: "🔍", href: "/tools/career-gap-explainer", plan: "free" },
  { id: "talent-profile",       name: "Talent Profile",       sub: "Career Intelligence",  desc: "Your complete career health dashboard — skills, salary, and market positioning.", icon: "👤", href: "/tools/talent-profile", plan: "free" },
  { id: "career-roadmap",       name: "Career Roadmap",       sub: "Transition Planner",   desc: "Get a phased action plan from where you are to where you want to be.", icon: "🗺️", href: "/tools/career-roadmap", plan: "pro" },
  { id: "resume-optimiser",     name: "Resume Optimiser",     sub: "CV Builder",           desc: "ATS-ready CV blueprint tailored for your target role with scoring and rewrites.", icon: "📄", href: "/tools/resume-optimiser", plan: "pro" },
  { id: "linkedin-optimiser",   name: "LinkedIn Optimiser",   sub: "Profile Strength",     desc: "Headlines and profile improvements that get you found by recruiters.", icon: "💼", href: "/tools/linkedin-optimiser", plan: "pro" },
  { id: "interview-prep",       name: "Interview Prep",       sub: "Interview Coach",      desc: "Role-specific questions, STAR answers, and salary negotiation intel.", icon: "🎯", href: "/tools/interview-prep", plan: "pro" },
  { id: "visa-intelligence",    name: "Visa Intelligence",    sub: "Visa Eligibility",     desc: "Check your UK and international visa routes, requirements, and timelines.", icon: "🛂", href: "/tools/visa-intelligence", plan: "pro" },
];

export default function ToolsIndexPage() {
  return (
    <>
      <Head><title>Career Tools -- HireEdge</title></Head>
      <div className="tl-page">
        <div className="tl-header">
          <h1 className="tl-header__title">Career Tools</h1>
          <p className="tl-header__sub">Hands-on intelligence tools powered by real career data across 1,000+ roles.</p>
          {/* Subtle EDGEX attribution — tools are AI-powered by EDGEX engine */}
          <div className="tl-header__powered">
            <EDGEXBadge />
          </div>
        </div>
        <div className="tl-grid">
          {TOOLS.map(t => (
            <Link key={t.id} href={t.href} className="tl-card">
              {/* Badge row -- top of card, prominently visible */}
              <div className="tl-card__badge-row">
                <span className="tl-card__sub">{t.sub}</span>
                {t.plan === "free"
                  ? <span className="tl-card__free-badge">FREE</span>
                  : <span className="tl-card__pro-badge">PRO</span>
                }
              </div>
              {/* Icon + Name */}
              <div className="tl-card__main">
                <span className="tl-card__icon">{t.icon}</span>
                <span className="tl-card__name">{t.name}</span>
              </div>
              {/* Description */}
              <span className="tl-card__desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
