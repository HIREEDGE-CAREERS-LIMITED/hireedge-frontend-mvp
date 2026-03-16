// ============================================================================
// components/career-pack/PackReadinessCard.js
// ============================================================================

export default function PackReadinessCard({ summary }) {
  if (!summary) return null;

  const readiness = summary.overall_readiness ?? 0;
  const color = readiness >= 70 ? "var(--accent-400)"
    : readiness >= 40 ? "var(--amber-400)"
    : "var(--red-400)";

  const metrics = [
    { label: "Roadmap", value: summary.roadmap?.reachable ? `${summary.roadmap.total_steps} steps · ~${summary.roadmap.estimated_years}yr` : "Unreachable", ok: summary.roadmap?.reachable },
    { label: "Skills", value: `${summary.skills?.readiness_pct ?? 0}% ready`, sub: `${summary.skills?.missing_count ?? 0} missing`, ok: (summary.skills?.readiness_pct ?? 0) >= 50 },
    { label: "Resume ATS", value: `${summary.resume?.ats_score ?? 0}/100`, sub: summary.resume?.ats_label, ok: (summary.resume?.ats_score ?? 0) >= 60 },
    { label: "Interview", value: `${summary.interview?.readiness_score ?? 0}/100`, ok: (summary.interview?.readiness_score ?? 0) >= 60 },
    { label: "Salary", value: summary.salary?.growth_pct != null ? `+${summary.salary.growth_pct}%` : "N/A", sub: summary.salary?.growth ? `+£${summary.salary.growth.toLocaleString()}` : null, ok: (summary.salary?.growth_pct ?? 0) > 0 },
    { label: "Visa", value: `${summary.visa?.eligible_routes ?? 0} routes`, sub: summary.visa?.recommended_route?.replace(/_/g, " "), ok: (summary.visa?.eligible_routes ?? 0) > 0 },
  ];

  return (
    <div className="pack-readiness">
      {/* Header */}
      <div className="pack-readiness__header">
        <div className="pack-readiness__from-to">
          <span className="pack-readiness__role">{summary.from?.title}</span>
          <span className="pack-readiness__arrow">→</span>
          <span className="pack-readiness__role pack-readiness__role--target">{summary.to?.title}</span>
        </div>
      </div>

      {/* Gauge */}
      <div className="pack-readiness__gauge">
        <svg viewBox="0 0 140 140" className="pack-readiness__svg">
          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--ink-700)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="60" fill="none"
            stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${readiness * 3.77} 377`}
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>
        <div className="pack-readiness__gauge-value">
          <span className="pack-readiness__gauge-num" style={{ color }}>{readiness}</span>
          <span className="pack-readiness__gauge-label">overall<br/>readiness</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="pack-readiness__metrics">
        {metrics.map((m, i) => (
          <div key={i} className="pack-metric">
            <div className={`pack-metric__indicator ${m.ok ? "pack-metric__indicator--ok" : "pack-metric__indicator--warn"}`} />
            <div className="pack-metric__content">
              <div className="pack-metric__label">{m.label}</div>
              <div className="pack-metric__value">{m.value}</div>
              {m.sub && <div className="pack-metric__sub">{m.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
