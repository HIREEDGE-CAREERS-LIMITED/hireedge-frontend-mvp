// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Career path step visualizer
// ============================================================================

export default function CareerPathVisualizer({ pathData, loading, onStepClick }) {
  if (loading) return <PathSkeleton />;
  if (!pathData) return null;

  const { path, edges, steps, totalYears, totalDifficulty, totalSalaryGrowthPct } = pathData;

  return (
    <div className="path-viz">
      {/* Summary strip */}
      <div className="path-viz__summary">
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">{steps}</span>
          <span className="path-viz__stat-label">step{steps !== 1 ? "s" : ""}</span>
        </div>
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">~{totalYears}yr</span>
          <span className="path-viz__stat-label">estimated</span>
        </div>
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">+{totalSalaryGrowthPct}%</span>
          <span className="path-viz__stat-label">salary growth</span>
        </div>
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">{totalDifficulty}</span>
          <span className="path-viz__stat-label">difficulty</span>
        </div>
      </div>

      {/* Step chain */}
      <div className="path-viz__chain">
        {path.map((slug, i) => {
          const edge = edges[i] || null;       // edge leading INTO this step (index offset)
          const edgeIn = i > 0 ? edges[i - 1] : null;
          const isFirst = i === 0;
          const isLast = i === path.length - 1;
          const title = isFirst
            ? edges[0]?.from ? _slugToTitle(edges[0].from) : _slugToTitle(slug)
            : (edgeIn?.title || _slugToTitle(slug));

          return (
            <div key={slug} className="path-step-wrap">
              {/* Connector line + edge label */}
              {!isFirst && edgeIn && (
                <div className="path-connector">
                  <div className="path-connector__line" />
                  <div className="path-connector__label">
                    <span className={`path-connector__diff path-connector__diff--${edgeIn.difficulty_label}`}>
                      {edgeIn.difficulty_label}
                    </span>
                    <span className="path-connector__years">~{edgeIn.estimated_years}yr</span>
                    <span className="path-connector__growth">+{edgeIn.salary_growth_pct}%</span>
                  </div>
                </div>
              )}

              {/* Step node */}
              <button
                className={`path-step ${isFirst ? "path-step--start" : ""} ${isLast ? "path-step--end" : ""}`}
                onClick={() => onStepClick?.(slug)}
              >
                <div className="path-step__dot" />
                <div className="path-step__title">
                  {isFirst ? _slugToTitle(slug) : title}
                </div>
                <div className="path-step__slug">{slug}</div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function _slugToTitle(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function PathSkeleton() {
  return (
    <div className="path-viz">
      <div className="path-viz__summary">
        {[1, 2, 3, 4].map(i => <div key={i} className="skel skel--sm" style={{ width: 60 }} />)}
      </div>
      <div className="path-viz__chain">
        {[1, 2, 3].map(i => (
          <div key={i} className="path-step-wrap">
            {i > 1 && <div className="path-connector"><div className="path-connector__line" /></div>}
            <div className="path-step"><div className="skel skel--md" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
