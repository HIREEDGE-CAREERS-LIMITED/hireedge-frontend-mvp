// ============================================================================
// components/intelligence/SkillsGapPanel.js
// HireEdge Frontend — Skills gap analysis panel
// ============================================================================

export default function SkillsGapPanel({ gap, loading }) {
  if (loading) return <GapSkeleton />;
  if (!gap) return null;

  const { target, analysis, missing_by_group, prioritised_learning_path } = gap;
  const readiness = analysis.readiness_pct;

  const readinessColor = readiness >= 70 ? "var(--accent-400)"
    : readiness >= 40 ? "var(--amber-400)"
    : "var(--red-400)";

  return (
    <div className="intel-gap">
      {/* Header with readiness ring */}
      <div className="intel-gap__header">
        <div>
          <h3 className="intel-gap__title">Skills Gap for {target.title}</h3>
          <div className="intel-gap__meta">{target.category} · {target.seniority}</div>
        </div>
        <div className="intel-gap__ring">
          <svg viewBox="0 0 80 80" width="72" height="72">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--ink-700)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={readinessColor}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${readiness * 2.136} 213.6`}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dasharray 0.6s var(--ease-out)" }}
            />
          </svg>
          <div className="intel-gap__ring-value">
            <span className="intel-gap__ring-num">{readiness}%</span>
            <span className="intel-gap__ring-label">ready</span>
          </div>
        </div>
      </div>

      {/* Counts */}
      <div className="intel-gap__counts">
        <div className="intel-gap__count">
          <span className="intel-gap__count-num intel-gap__count-num--match">{analysis.matched_count}</span>
          <span className="intel-gap__count-label">matched</span>
        </div>
        <div className="intel-gap__count">
          <span className="intel-gap__count-num intel-gap__count-num--miss">{analysis.missing_count}</span>
          <span className="intel-gap__count-label">missing</span>
        </div>
        <div className="intel-gap__count">
          <span className="intel-gap__count-num">{target.total_skills_required}</span>
          <span className="intel-gap__count-label">total req.</span>
        </div>
      </div>

      {/* Matched skills */}
      {analysis.matched.length > 0 && (
        <div className="intel-gap__section">
          <h4 className="intel-label">Skills You Have</h4>
          <div className="intel-tag-row">
            {analysis.matched.map((s) => <span key={s} className="intel-tag intel-tag--match">{s}</span>)}
          </div>
        </div>
      )}

      {/* Missing by group */}
      <div className="intel-gap__section">
        <h4 className="intel-label">Skills to Learn</h4>
        {missing_by_group.core?.length > 0 && (
          <div className="intel-gap__group">
            <span className="intel-gap__group-label intel-gap__group-label--high">Core (critical)</span>
            <div className="intel-tag-row">
              {missing_by_group.core.map((s) => <span key={s} className="intel-tag intel-tag--miss-core">{s}</span>)}
            </div>
          </div>
        )}
        {missing_by_group.technical?.length > 0 && (
          <div className="intel-gap__group">
            <span className="intel-gap__group-label intel-gap__group-label--med">Technical</span>
            <div className="intel-tag-row">
              {missing_by_group.technical.map((s) => <span key={s} className="intel-tag intel-tag--miss-tech">{s}</span>)}
            </div>
          </div>
        )}
        {missing_by_group.soft?.length > 0 && (
          <div className="intel-gap__group">
            <span className="intel-gap__group-label intel-gap__group-label--low">Soft</span>
            <div className="intel-tag-row">
              {missing_by_group.soft.map((s) => <span key={s} className="intel-tag intel-tag--miss-soft">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Learning path */}
      {prioritised_learning_path?.length > 0 && (
        <div className="intel-gap__section">
          <h4 className="intel-label">Prioritised Learning Path</h4>
          <div className="intel-gap__path">
            {prioritised_learning_path.map((item, i) => (
              <div key={i} className="intel-gap__path-item">
                <span className="intel-gap__path-num">{i + 1}</span>
                <span className="intel-gap__path-skill">{item.skill}</span>
                <span className={`intel-gap__path-priority intel-gap__path-priority--${item.priority}`}>
                  {item.priority}
                </span>
                <span className="intel-gap__path-group">{item.group}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GapSkeleton() {
  return (
    <div className="intel-gap">
      <div className="intel-gap__header">
        <div><div className="skel skel--lg" /><div className="skel skel--sm" style={{ marginTop: 6 }} /></div>
        <div className="skel skel--circle-sm" style={{ width: 72, height: 72 }} />
      </div>
      <div className="intel-gap__counts">
        {[1,2,3].map(i => <div key={i} className="skel skel--sm" style={{ width: 50, height: 40 }} />)}
      </div>
    </div>
  );
}
