// ============================================================================
// pages/tools/index.js
// HireEdge -- Career Tools Index
// Styled to match /intelligence page: large header, nav cards, tool grid
// ============================================================================

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

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

const NAV_CARDS = [
  {
    icon: "🔍",
    label: "Gap Analyser",
    desc: "Find exactly what skills you're missing",
    href: "/tools/career-gap-explainer",
  },
  {
    icon: "🗺️",
    label: "Career Roadmap",
    desc: "Step-by-step plan to your target role",
    href: "/tools/career-roadmap",
  },
  {
    icon: "🧳",
    label: "Career Pack",
    desc: "Full transition plan in one report",
    href: "/career-pack",
  },
];

export default function ToolsIndexPage() {
  const [filter, setFilter] = useState("all");

  const filtered = TOOLS.filter(t => {
    if (filter === "free") return t.plan === "free";
    if (filter === "pro")  return t.plan === "pro";
    return true;
  });

  return (
    <>
      <Head>
        <title>Career Tools -- HireEdge</title>
      </Head>

      <div className="tl-page">

        {/* Header */}
        <div className="tl-header">
          <h1 className="tl-header__title">Career Tools</h1>
          <p className="tl-header__sub">
            Hands-on intelligence tools powered by real career data across 1,000+ roles.
          </p>
        </div>

        {/* Nav cards -- 3 col like Intelligence page */}
        <div className="tl-nav-grid">
          {NAV_CARDS.map(card => (
            <Link key={card.href} href={card.href} className="tl-nav-card">
              <span className="tl-nav-card__icon">{card.icon}</span>
              <span className="tl-nav-card__label">{card.label}</span>
              <span className="tl-nav-card__desc">{card.desc}</span>
            </Link>
          ))}
        </div>

        {/* Filter chips */}
        <div className="tl-filters">
          {["all","free","pro"].map(f => (
            <button
              key={f}
              className={"tl-chip" + (filter === f ? " tl-chip--active" : "")}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Tools" : f === "free" ? "Free" : "Pro"}
            </button>
          ))}
        </div>

        {/* Tool list */}
        <div className="tl-list">
          {filtered.map(tool => (
            <Link
              key={tool.id}
              href={tool.href}
              className="tl-tool-card"
              style={{ "--tc": tool.color }}
            >
              <div
                className="tl-tool-card__icon"
                style={{ background: tool.color + "18", color: tool.color }}
              >
                {tool.icon}
              </div>
              <div className="tl-tool-card__body">
                <div className="tl-tool-card__top">
                  <span className="tl-tool-card__sub">{tool.sub}</span>
                  {tool.plan === "pro" && <span className="tl-tool-badge">PRO</span>}
                </div>
                <h3 className="tl-tool-card__name">{tool.name}</h3>
                <p className="tl-tool-card__desc">{tool.desc}</p>
              </div>
              <svg className="tl-tool-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
