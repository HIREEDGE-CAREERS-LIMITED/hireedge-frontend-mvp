// ============================================================================
// components/career-pack/CareerPackSection.js
// ============================================================================

import { useState } from "react";

const SECTION_META = {
  roadmap: { icon: "🗺️", title: "Career Roadmap", color: "var(--accent-400)" },
  skills_gap: { icon: "🎯", title: "Skills Gap Analysis", color: "var(--amber-400)" },
  resume_blueprint: { icon: "📄", title: "Resume Blueprint", color: "var(--accent-500)" },
  linkedin_optimisation: { icon: "💼", title: "LinkedIn Optimisation", color: "var(--accent-300)" },
  interview_prep: { icon: "🎤", title: "Interview Prep", color: "var(--red-400)" },
  salary_insight: { icon: "💰", title: "Salary Insight", color: "var(--amber-400)" },
  visa_assessment: { icon: "🌍", title: "Visa Assessment", color: "var(--accent-400)" },
};

export default function CareerPackSection({ sectionKey, data, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const meta = SECTION_META[sectionKey] || { icon: "📋", title: sectionKey, color: "var(--text-muted)" };

  if (!data || data._error) {
    return (
      <div className="pack-section pack-section--empty">
        <div className="pack-section__header" onClick={() => setOpen(!open)}>
          <span className="pack-section__icon">{meta.icon}</span>
          <span className="pack-section__title">{meta.title}</span>
          <span className="pack-section__status pack-section__status--unavailable">Unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`pack-section ${open ? "pack-section--open" : ""}`}>
      <button className="pack-section__header" onClick={() => setOpen(!open)}>
        <span className="pack-section__icon">{meta.icon}</span>
        <span className="pack-section__title">{meta.title}</span>
        <span className="pack-section__badge" style={{ background: `${meta.color}15`, color: meta.color }}>
          {_sectionStat(sectionKey, data)}
        </span>
        <span className="pack-section__chevron">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="pack-section__body">
          <SectionContent sectionKey={sectionKey} data={data} />
        </div>
      )}
    </div>
  );
}

function _sectionStat(key, data) {
  switch (key) {
    case "roadmap": return data.reachable ? `${data.summary?.total_steps} steps` : "Unreachable";
    case "skills_gap": return `${data.analysis?.readiness_pct ?? 0}% ready`;
    case "resume_blueprint": return `ATS ${data.ats_score?.score ?? 0}/100`;
    case "linkedin_optimisation": return `${data.strength_score?.score ?? 0}/100`;
    case "interview_prep": return `${data.readiness?.score ?? 0}/100`;
    case "salary_insight": return data.current_role?.mean ? `£${data.current_role.mean.toLocaleString()}` : "—";
    case "visa_assessment": return `${data.eligible_routes_count ?? 0} routes`;
    default: return "";
  }
}

function SectionContent({ sectionKey, data }) {
  switch (sectionKey) {
    case "roadmap": return <RoadmapSummary data={data} />;
    case "skills_gap": return <SkillsSummary data={data} />;
    case "resume_blueprint": return <ResumeSummary data={data} />;
    case "linkedin_optimisation": return <LinkedinSummary data={data} />;
    case "interview_prep": return <InterviewSummary data={data} />;
    case "salary_insight": return <SalarySummary data={data} />;
    case "visa_assessment": return <VisaSummary data={data} />;
    default: return <pre className="pack-section__raw">{JSON.stringify(data, null, 2)}</pre>;
  }
}

// ── Inline section renderers (compact for pack view) ───────────────────────

function RoadmapSummary({ data }) {
  if (!data.reachable) return <p className="pack-text--muted">No path found.</p>;
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="Steps" value={data.summary.total_steps} />
        <Stat label="Est. Time" value={`~${data.summary.total_estimated_years}yr`} />
        <Stat label="Salary Growth" value={`+${data.summary.salary_growth_pct}%`} accent />
        <Stat label="Difficulty" value={data.summary.avg_difficulty_per_step} />
      </div>
      <div className="pack-path-chain">
        {data.steps?.map((step, i) => (
          <span key={step.slug} className={`pack-path-node ${step.is_current ? "pack-path-node--start" : ""} ${step.is_target ? "pack-path-node--end" : ""}`}>
            {i > 0 && <span className="pack-path-arrow">→</span>}
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}

function SkillsSummary({ data }) {
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="Readiness" value={`${data.analysis.readiness_pct}%`} accent />
        <Stat label="Matched" value={data.analysis.matched_count} />
        <Stat label="Missing" value={data.analysis.missing_count} />
      </div>
      {data.analysis.matched?.length > 0 && <Tags label="You Have" items={data.analysis.matched} variant="match" />}
      {data.analysis.missing?.length > 0 && <Tags label="Need to Learn" items={data.analysis.missing} variant="danger" />}
    </div>
  );
}

function ResumeSummary({ data }) {
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="ATS Score" value={`${data.ats_score.score}/100`} accent />
        <Stat label="Keywords Matched" value={data.keywords?.matched?.length ?? 0} />
        <Stat label="Critical Missing" value={data.keywords?.missing_critical?.length ?? 0} />
      </div>
      {data.keywords?.missing_critical?.length > 0 && <Tags label="Critical Keywords" items={data.keywords.missing_critical} variant="danger" />}
      {data.summary_guidance?.elements?.length > 0 && (
        <div className="pack-list">
          <span className="pack-list__label">Summary Guidance</span>
          {data.summary_guidance.elements.slice(0, 4).map((el, i) => <p key={i} className="pack-list__item">• {el}</p>)}
        </div>
      )}
    </div>
  );
}

function LinkedinSummary({ data }) {
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="Profile Strength" value={`${data.strength_score.score}/100`} accent />
        <Stat label="Headlines" value={data.headlines?.length ?? 0} />
      </div>
      {data.headlines?.slice(0, 3).map((h, i) => (
        <div key={i} className="pack-headline">
          <span className="pack-headline__style">{h.style}</span>
          <p className="pack-headline__text">{h.headline}</p>
        </div>
      ))}
      {data.skills_strategy?.top_3?.length > 0 && <Tags label="Pin These Top 3" items={data.skills_strategy.top_3} variant="match" />}
    </div>
  );
}

function InterviewSummary({ data }) {
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="Readiness" value={`${data.readiness.score}/100`} accent />
        <Stat label="Competency Qs" value={data.competency_questions?.length ?? 0} />
        <Stat label="Technical Qs" value={data.technical_questions?.length ?? 0} />
        <Stat label="Behavioural Qs" value={data.behavioural_questions?.length ?? 0} />
      </div>
      {data.salary_negotiation && (
        <div className="pack-salary-range">
          Negotiate: £{data.salary_negotiation.recommended_ask?.conservative?.toLocaleString()} – £{data.salary_negotiation.recommended_ask?.ambitious?.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function SalarySummary({ data }) {
  return (
    <div className="pack-content">
      <div className="pack-stats">
        <Stat label="Current" value={data.current_role?.mean ? `£${data.current_role.mean.toLocaleString()}` : "—"} />
        <Stat label="Target" value={data.target_role?.mean ? `£${data.target_role.mean.toLocaleString()}` : "—"} />
        <Stat label="Growth" value={data.comparison?.spread ? `£${data.comparison.spread.toLocaleString()}` : "—"} accent />
      </div>
    </div>
  );
}

function VisaSummary({ data }) {
  return (
    <div className="pack-content">
      <p className="pack-text--disclaimer">{data.disclaimer}</p>
      <div className="pack-stats">
        <Stat label="Eligible Routes" value={data.eligible_routes_count} accent />
        <Stat label="Recommended" value={data.recommended_route?.replace(/_/g, " ") || "—"} />
        <Stat label="Salary vs Threshold" value={data.salary_gap?.meets_threshold ? "✓ Met" : `£${data.salary_gap?.shortfall?.toLocaleString()} short`} />
      </div>
    </div>
  );
}

// ── Shared tiny components ─────────────────────────────────────────────────

function Stat({ label, value, accent }) {
  return (
    <div className="pack-stat">
      <span className="pack-stat__label">{label}</span>
      <span className={`pack-stat__value ${accent ? "pack-stat__value--accent" : ""}`}>{value}</span>
    </div>
  );
}

function Tags({ label, items, variant }) {
  return (
    <div className="pack-tags-group">
      <span className="pack-tags-group__label">{label}</span>
      <div className="pack-tags">
        {items.map((item, i) => (
          <span key={i} className={`pack-tag pack-tag--${variant || "default"}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
