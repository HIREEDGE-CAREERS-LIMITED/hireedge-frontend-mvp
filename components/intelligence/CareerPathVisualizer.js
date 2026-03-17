// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Safe career path renderer
// ============================================================================

function formatTitle(slugOrTitle) {
  if (!slugOrTitle) return "Unknown Role";
  return String(slugOrTitle)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSalary(salary) {
  if (!salary || typeof salary !== "object") return null;

  const min = salary.min ?? null;
  const max = salary.max ?? null;
  const mean = salary.mean ?? null;

  if (min && max) {
    return `£${Number(min).toLocaleString()} – £${Number(max).toLocaleString()}`;
  }

  if (mean) {
    return `£${Number(mean).toLocaleString()}`;
  }

  if (min) {
    return `From £${Number(min).toLocaleString()}`;
  }

  if (max) {
    return `Up to £${Number(max).toLocaleString()}`;
  }

  return null;
}

function normalizePathData(pathData) {
  if (!pathData || typeof pathData !== "object") {
    return [];
  }

  // Preferred: roles array from backend
  if (Array.isArray(pathData.roles) && pathData.roles.length > 0) {
    return pathData.roles.map((role, index) => ({
      key: role.slug || `role-${index}`,
      slug: role.slug || "",
      title: role.title || formatTitle(role.slug),
      category: role.category || null,
      seniority: role.seniority || null,
      salary_uk: role.salary_uk || null,
    }));
  }

  // Fallback: plain slug path array
  if (Array.isArray(pathData.path) && pathData.path.length > 0) {
    return pathData.path.map((slug, index) => ({
      key: slug || `step-${index}`,
      slug: slug || "",
      title: formatTitle(slug),
      category: null,
      seniority: null,
      salary_uk: null,
    }));
  }

  return [];
}

export default function CareerPathVisualizer({ pathData, onStepClick }) {
  const roles = normalizePathData(pathData);

  if (!roles.length) {
    return (
      <div className="dash-empty">
        <div className="dash-empty__icon">🗺️</div>
        <p className="dash-empty__text">No path data available</p>
      </div>
    );
  }

  return (
    <div className="intel-path-vis">
      <div className="intel-path-vis__meta">
        <span className="intel-path-vis__badge">
          {typeof pathData?.steps === "number"
            ? `${pathData.steps} step${pathData.steps === 1 ? "" : "s"}`
            : `${Math.max(roles.length - 1, 0)} step${roles.length - 1 === 1 ? "" : "s"}`}
        </span>

        {pathData?.totalYears ? (
          <span className="intel-path-vis__badge">
            ~{pathData.totalYears} years
          </span>
        ) : null}

        {pathData?.totalSalaryGrowthPct ? (
          <span className="intel-path-vis__badge">
            +{pathData.totalSalaryGrowthPct}% salary growth
          </span>
        ) : null}
      </div>

      <div className="intel-path-vis__chain">
        {roles.map((role, index) => {
          const salaryText = formatSalary(role.salary_uk);

          return (
            <div key={role.key} className="intel-path-step">
              <button
                type="button"
                className="intel-path-step__card"
                onClick={() => role.slug && onStepClick?.(role.slug)}
              >
                <div className="intel-path-step__index">{index + 1}</div>

                <div className="intel-path-step__body">
                  <div className="intel-path-step__title">{role.title}</div>

                  {(role.category || role.seniority) && (
                    <div className="intel-path-step__meta">
                      {role.category ? <span>{role.category}</span> : null}
                      {role.category && role.seniority ? <span>•</span> : null}
                      {role.seniority ? <span>{role.seniority}</span> : null}
                    </div>
                  )}

                  {salaryText && (
                    <div className="intel-path-step__salary">{salaryText}</div>
                  )}
                </div>
              </button>

              {index < roles.length - 1 && (
                <div className="intel-path-step__arrow">→</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
