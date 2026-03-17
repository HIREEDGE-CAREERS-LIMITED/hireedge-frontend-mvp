// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Career path step visualizer
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
          <span className="path-viz__stat-value">{steps || displaySteps.length}</span>
          <span className="path-viz__stat-label">
            step{(steps || displaySteps.length) !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">~{totalYears || "?"}yr</span>
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
    <div className="path-viz__enriched">
      {steps.map((step, i) => {
        const edge = edges && edges[i] ? edges[i] : null;
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.slug} className="path-enriched-wrap">
            {!isFirst && edge && <TransitionConnector edge={edge} />}

            <button
              className={`path-enriched-step ${
                isFirst ? "path-enriched-step--start" : ""
              } ${isLast ? "path-enriched-step--end" : ""}`}
              onClick={() => onStepClick?.(step.slug)}
            >
              <div
                className={`path-enriched-step__num ${
                  isFirst ? "path-enriched-step__num--start" : ""
                } ${isLast ? "path-enriched-step__num--end" : ""}`}
              >
                {i + 1}
              </div>

              <div className="path-enriched-step__info">
                <div className="path-enriched-step__title">{step.title}</div>
                <div className="path-enriched-step__meta">
                  {step.category && <span>{step.category}</span>}
                  {step.seniority && <span>{step.seniority}</span>}
                </div>
              </div>

              {step.salary != null && (
                <div className="path-enriched-step__salary">
                  <span className="path-enriched-step__salary-amount">
                    £{step.salary.toLocaleString()}
                  </span>
                  {step.salaryChange != null && step.salaryChange !== 0 && (
                    <span
                      className={`path-enriched-step__salary-change ${
                        step.salaryChange >= 0
                          ? "path-enriched-step__salary-change--up"
                          : "path-enriched-step__salary-change--down"
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
    <div className="path-connector-enriched">
      <div className="path-connector-enriched__line" />

      <div className="path-connector-enriched__card">
        <div className="path-connector-enriched__row">
          <span
            className="path-connector-enriched__diff"
            style={{ background: bg, color }}
          >
            {edge.difficulty_label || "unknown"}
          </span>
          {edge.estimated_years && (
            <span className="path-connector-enriched__years">
              ~{edge.estimated_years}yr
            </span>
          )}
          {edge.salary_growth_pct != null && (
            <span
              className="path-connector-enriched__growth"
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
          <div className="path-connector-enriched__skills">
            <span className="path-connector-enriched__skills-label">
              Skills to learn:
            </span>
            <div className="path-connector-enriched__skills-tags">
              {edge.missingSkills.slice(0, 5).map((skill, i) => (
                <span key={i} className="path-connector-enriched__skill-tag">
                  {skill}
                </span>
              ))}
              {edge.missingSkills.length > 5 && (
                <span className="path-connector-enriched__skill-more">
                  +{edge.missingSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="path-connector-enriched__line" />
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
              className={`path-step ${isFirst ? "path-step--start" : ""} ${
                isLast ? "path-step--end" : ""
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
