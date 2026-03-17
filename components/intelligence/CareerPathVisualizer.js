// ============================================================================
// components/intelligence/CareerPathVisualizer.js
// HireEdge Frontend — Styled career path renderer
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

  return null;
}

function normalizeRoles(pathData) {
  if (!pathData || typeof pathData !== "object") return [];

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
  const roles = normalizeRoles(pathData);

  if (!roles.length) {
    return null;
  }

  const steps =
    typeof pathData?.steps === "number"
      ? pathData.steps
      : Math.max(roles.length - 1, 0);

  return (
    <div>
      <div style={{ marginBottom: "16px", color: "var(--text-secondary)" }}>
        {steps} step{steps === 1 ? "" : "s"}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {roles.map((role, index) => {
          const salary = formatSalary(role.salary_uk);

          return (
            <div
              key={role.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => role.slug && onStepClick?.(role.slug)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  minWidth: "220px",
                  textAlign: "left",
                  color: "var(--text-primary)",
                  cursor: role.slug ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Step {index + 1}
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  {role.title}
                </div>

                {(role.category || role.seniority) && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginBottom: salary ? "6px" : "0",
                    }}
                  >
                    {role.category || ""}
                    {role.category && role.seniority ? " • " : ""}
                    {role.seniority || ""}
                  </div>
                )}

                {salary && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--accent-primary, #34d399)",
                    }}
                  >
                    {salary}
                  </div>
                )}
              </button>

              {index < roles.length - 1 && (
                <div
                  style={{
                    fontSize: "20px",
                    color: "var(--text-secondary)",
                    padding: "0 2px",
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
