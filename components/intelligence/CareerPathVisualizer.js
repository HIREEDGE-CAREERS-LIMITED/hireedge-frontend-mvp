// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Career path visualizer
// Matches pathData from pages/intelligence/career-path.js
// ============================================================================

function formatMoney(value) {
  if (typeof value !== "number") return null;
  return `£${value.toLocaleString()}`;
}

function getSalaryMean(salary) {
  if (!salary || typeof salary !== "object") return null;
  if (typeof salary.mean === "number") return salary.mean;
  if (typeof salary.min === "number" && typeof salary.max === "number") {
    return Math.round((salary.min + salary.max) / 2);
  }
  return typeof salary.min === "number" ? salary.min : null;
}

function formatSalaryRange(salary) {
  if (!salary || typeof salary !== "object") return null;

  const min = typeof salary.min === "number" ? salary.min : null;
  const max = typeof salary.max === "number" ? salary.max : null;
  const mean = typeof salary.mean === "number" ? salary.mean : null;

  if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()}`;
  if (mean) return `£${mean.toLocaleString()}`;
  if (min) return `From £${min.toLocaleString()}`;
  if (max) return `Up to £${max.toLocaleString()}`;
  return null;
}

export default function CareerPathVisualizer({ pathData, onStepClick }) {
  if (!pathData) return null;

  const roles = Array.isArray(pathData.roles) ? pathData.roles : [];
  const transitions = Array.isArray(pathData.transitions) ? pathData.transitions : [];

  if (!roles.length) return null;

  const steps =
    typeof pathData.steps === "number"
      ? pathData.steps
      : Math.max(roles.length - 1, 0);

  return (
    <div className="he-path-enriched">
      <div className="path-viz__summary">
        <div className="path-viz__stat">
          <span className="path-viz__stat-value">{steps}</span>
          <span className="path-viz__stat-label">
            step{steps !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="path-viz__stat">
          <span className="path-viz__stat-value">
            {pathData.totalYears ? `~${pathData.totalYears}yr` : "—"}
          </span>
          <span className="path-viz__stat-label">estimated</span>
        </div>

        <div className="path-viz__stat">
          <span
            className="path-viz__stat-value"
            style={{
              color:
                typeof pathData.totalSalaryGrowthPct === "number" &&
                pathData.totalSalaryGrowthPct >= 0
                  ? "var(--accent-400)"
                  : "var(--red-400)",
            }}
          >
            {typeof pathData.totalSalaryGrowthPct === "number"
              ? `${pathData.totalSalaryGrowthPct >= 0 ? "+" : ""}${pathData.totalSalaryGrowthPct}%`
              : "—"}
          </span>
          <span className="path-viz__stat-label">salary growth</span>
        </div>

        <div className="path-viz__stat">
          <span
            className="path-viz__stat-value"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
            }}
          >
            {typeof pathData.startSalary === "number" &&
            typeof pathData.endSalary === "number"
              ? `${formatMoney(pathData.startSalary)} → ${formatMoney(pathData.endSalary)}`
              : "—"}
          </span>
          <span className="path-viz__stat-label">salary range</span>
        </div>

        <div className="path-viz__stat">
          <span className="path-viz__stat-value">
            {typeof pathData.averageDifficulty === "number"
              ? pathData.averageDifficulty
              : "—"}
          </span>
          <span className="path-viz__stat-label">difficulty</span>
        </div>
      </div>

      {roles.map((role, i) => {
        const isFirst = i === 0;
        const isLast = i === roles.length - 1;
        const transition = i > 0 ? transitions[i - 1] : null;

        const currentSalary = getSalaryMean(role.salary_uk);
        const prevSalary = i > 0 ? getSalaryMean(roles[i - 1]?.salary_uk) : null;
        const salaryChange =
          typeof currentSalary === "number" && typeof prevSalary === "number"
            ? currentSalary - prevSalary
            : null;

        return (
          <div key={role.slug || i} className="he-path-wrap">
            {!isFirst && transition && (
              <TransitionConnector transition={transition} />
            )}

            <button
              type="button"
              className={`he-path-step${isFirst ? " he-path-step--start" : ""}${
                isLast ? " he-path-step--end" : ""
              }`}
              onClick={() => role.slug && onStepClick?.(role.slug)}
            >
              <div
                className={`he-path-num${isFirst ? " he-path-num--start" : ""}${
                  isLast ? " he-path-num--end" : ""
                }`}
              >
                {i + 1}
              </div>

              <div className="he-path-info">
                <div className="he-path-title">{role.title || role.slug}</div>
                <div className="he-path-meta">
                  {role.category ? <span>{role.category}</span> : null}
                  {role.seniority ? <span>{role.seniority}</span> : null}
                </div>
              </div>

              <div className="he-path-salary">
                <span className="he-path-salary-amount">
                  {formatSalaryRange(role.salary_uk) || "—"}
                </span>

                {typeof salaryChange === "number" && salaryChange !== 0 && (
                  <span
                    className={`he-path-salary-delta ${
                      salaryChange >= 0
                        ? "he-path-salary-delta--up"
                        : "he-path-salary-delta--down"
                    }`}
                  >
                    {salaryChange >= 0 ? "+" : "-"}£
                    {Math.abs(salaryChange).toLocaleString()}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TransitionConnector({ transition }) {
  const difficulty = transition?.difficultyLabel || "moderate";
  const growth = transition?.salaryGrowthPct;
  const years = transition?.estimatedYears;
  const missingSkills = Array.isArray(transition?.missingSkills)
    ? transition.missingSkills
    : [];

  return (
    <div className="he-path-connector">
      <div className="he-path-connector-line" />

      <div className="he-path-connector-card">
        <div className="he-path-connector-row">
          <span className="he-path-diff">{difficulty}</span>

          {typeof years === "number" ? (
            <span className="he-path-years">~{years}yr</span>
          ) : null}

          {typeof growth === "number" ? (
            <span className="he-path-growth">
              {growth >= 0 ? "+" : ""}
              {growth}%
            </span>
          ) : null}
        </div>

        <div className="he-path-skills">
          <span className="he-path-skills-label">Skills to learn</span>

          <div className="he-path-skills-tags">
            {missingSkills.length > 0 ? (
              <>
                {missingSkills.slice(0, 5).map((skill) => (
                  <span key={skill} className="he-path-skill-tag">
                    {skill}
                  </span>
                ))}
                {missingSkills.length > 5 ? (
                  <span className="he-path-skill-more">
                    +{missingSkills.length - 5}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="he-path-skill-more">No major skill gaps</span>
            )}
          </div>
        </div>
      </div>

      <div className="he-path-connector-line" />
    </div>
  );
}
