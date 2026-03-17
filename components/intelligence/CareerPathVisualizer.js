// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Career path step visualizer
// All enriched classes scoped with he-path- prefix.
// Styled by styles/career-path.css (imported in career-path page).
// ============================================================================

export default function CareerPathVisualizer({ pathData, loading, onStepClick }) {
  if (loading) return <PathSkeleton />;
  if (!pathData) return null;

  const {
    path,
    edges,
    steps,
    totalYears,
    totalDifficulty,
    totalSalaryGrowthPct,
    enrichedSteps,
    enrichedEdges,
    salaryStart,
    salaryEnd,
  } = pathData;

  const hasEnriched = enrichedSteps && enrichedSteps.length > 0;
  const displaySteps = hasEnriched ? enrichedSteps : (path || []);

  return (
    <div className="path-viz">
      <div className="path-viz__summary">
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">
            {steps || displaySteps.length}
          </span>
          <span className="path-viz__stat-label">
            step{(steps || displaySteps.length) !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">
            ~{totalYears || "?"}yr
          </span>
          <span className="path-viz__stat-label">estimated</span>
        </div>
        {totalSalaryGrowthPct != null && (
          <div className="path-viz__stat">
            <span
              className="path-viz__stat-value"
              style={{
                color:
                  totalSalaryGrowthPct >= 0
                    ? "var(--accent-400)"
                    : "var(--red-400)",
              }}
            >
              {totalSalaryGrowthPct >= 0 ? "+" : ""}
              {totalSalaryGrowthPct}%
            </span>
            <span className="path-viz__stat-label">salary growth</span>
          </div>
        )}
        {salaryStart != null && salaryEnd != null && (
          <div className="path-viz__stat">
            <span
              className="path-viz__stat-value"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
              }}
            >
              £{salaryStart.toLocaleString()} → £{salaryEnd.toLocaleString()}
            </span>
            <span className="path-viz__stat-label">salary range</span>
          </div>
        )}
        {totalDifficulty != null && (
          <div className="path-viz__stat">
            <span className="path-viz__stat-value">{totalDifficulty}</span>
            <span className="path-viz__stat-label">difficulty</span>
          </div>
        )}
      </div>

      {hasEnriched ? (
        <EnrichedChain
          steps={enrichedSteps}
          edges={enrichedEdges}
          onStepClick={onStepClick}
        />
      ) : (
        <BasicChain path={path} edges={edges} onStepClick={onStepClick} />
      )}
    </div>
  );
}

function EnrichedChain({ steps, edges, onStepClick }) {
  return (
    <div className="he-path-enriched">
      {steps.map((step, i) => {
        const edge = edges && edges[i] ? edges[i] : null;
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.slug} className="he-path-wrap">
            {!isFirst && edge && <TransitionConnector edge={edge} />}

            <button
              className={`he-path-step${
                isFirst ? " he-path-step--start" : ""
              }${isLast ? " he-path-step--end" : ""}`}
              onClick={() => onStepClick?.(step.slug)}
            >
              <div
                className={`he-path-num${
                  isFirst ? " he-path-num--start" : ""
                }${isLast ? " he-path-num--end" : ""}`}
              >
                {i + 1}
              </div>

              <div className="he-path-info">
                <div className="he-path-title">{step.title}</div>
                <div className="he-path-meta">
                  {step.category && <span>{step.category}</span>}
                  {step.seniority && <span>{step.seniority}</span>}
                </div>
              </div>

              {step.salary != null && (
                <div className="he-path-salary">
                  <span className="he-path-salary-amount">
                    £{step.salary.toLocaleString()}
                  </span>
                  {step.salaryChange != null && step.salaryChange !== 0 && (
                    <span
                      className={`he-path-salary-delta${
                        step.salaryChange >= 0
                          ? " he-path-salary-delta--up"
                          : " he-path-salary-delta--down"
                      }`}
                    >
                      {step.salaryChange >= 0 ? "+" : ""}£
                      {step.salaryChange.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TransitionConnector({ edge }) {
  const diffColor = {
    easy: "var(--accent-400)",
    medium: "var(--amber-400)",
    hard: "var(--red-400)",
    very_hard: "var(--red-400)",
  };

  const diffBg = {
    easy: "rgba(16,185,129,0.1)",
    medium: "rgba(251,191,36,0.1)",
    hard: "rgba(239,68,68,0.08)",
    very_hard: "rgba(239,68,68,0.12)",
  };

  const color = diffColor[edge.difficulty_label] || "var(--text-muted)";
  const bg = diffBg[edge.difficulty_label] || "var(--bg-elevated)";

  return (
    <div className="he-path-connector">
      <div className="he-path-connector-line" />

      <div className="he-path-connector-card">
        <div className="he-path-connector-row">
          <span className="he-path-diff" style={{ background: bg, color }}>
            {edge.difficulty_label || "unknown"}
          </span>
          {edge.estimated_years && (
            <span className="he-path-years">
              ~{edge.estimated_years}yr
            </span>
          )}
          {edge.salary_growth_pct != null && (
            <span
              className="he-path-growth"
              style={{
                color:
                  edge.salary_growth_pct >= 0
                    ? "var(--accent-400)"
                    : "var(--red-400)",
              }}
            >
              {edge.salary_growth_pct >= 0 ? "+" : ""}
              {edge.salary_growth_pct}%
            </span>
          )}
        </div>

        {edge.missingSkills && edge.missingSkills.length > 0 && (
          <div className="he-path-skills">
            <span className="he-path-skills-label">Skills to learn:</span>
            <div className="he-path-skills-tags">
              {edge.missingSkills.slice(0, 5).map((skill, i) => (
                <span key={i} className="he-path-skill-tag">
                  {skill}
                </span>
              ))}
              {edge.missingSkills.length > 5 && (
                <span className="he-path-skill-more">
                  +{edge.missingSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="he-path-connector-line" />
    </div>
  );
}

function BasicChain({ path, edges, onStepClick }) {
  if (!path) return null;
  return (
    <div className="path-viz__chain">
      {path.map((slug, i) => {
        const edgeIn = i > 0 && edges ? edges[i - 1] : null;
        const isFirst = i === 0;
        const isLast = i === path.length - 1;

        return (
          <div key={slug} className="path-step-wrap">
            {!isFirst && edgeIn && (
              <div className="path-connector">
                <div className="path-connector__line" />
                <div className="path-connector__label">
                  <span
                    className={`path-connector__diff path-connector__diff--${edgeIn.difficulty_label}`}
                  >
                    {edgeIn.difficulty_label}
                  </span>
                  <span className="path-connector__years">
                    ~{edgeIn.estimated_years}yr
                  </span>
                  <span className="path-connector__growth">
                    +{edgeIn.salary_growth_pct}%
                  </span>
                </div>
              </div>
            )}
            <button
              className={`path-step${isFirst ? " path-step--start" : ""}${
                isLast ? " path-step--end" : ""
              }`}
              onClick={() => onStepClick?.(slug)}
            >
              <div className="path-step__dot" />
              <div className="path-step__title">{slugToTitle(slug)}</div>
              <div className="path-step__slug">{slug}</div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function slugToTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function PathSkeleton() {
  return (
    <div className="path-viz">
      <div className="path-viz__summary">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skel skel--sm" style={{ width: 60 }} />
        ))}
      </div>
      <div className="path-viz__chain">
        {[1, 2, 3].map((i) => (
          <div key={i} className="path-step-wrap">
            {i > 1 && (
              <div className="path-connector">
                <div className="path-connector__line" />
              </div>
            )}
            <div className="path-step">
              <div className="skel skel--md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
