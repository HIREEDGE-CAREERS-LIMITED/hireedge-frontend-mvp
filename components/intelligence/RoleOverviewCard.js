// ============================================================================
// components/intelligence/RoleOverviewCard.js
// HireEdge Frontend — Detailed role overview card
// ============================================================================

export default function RoleOverviewCard({ role, onRoleClick }) {
  if (!role) return <RoleSkeleton />;

  const grouped = role.skills_grouped || {};

  return (
    <div className="intel-role">
      {/* Header */}
      <div className="intel-role__header">
        <div>
          <div className="intel-role__category">{role.category}</div>
          <h2 className="intel-role__title">{role.title}</h2>
          <div className="intel-role__meta">
            <span className="intel-badge">{role.seniority}</span>
            <span className="intel-badge intel-badge--outline">Level {role.seniority_level}</span>
            {role.experience_years && (
              <span className="intel-role__detail">{role.experience_years.min}–{role.experience_years.max} yrs</span>
            )}
          </div>
        </div>
        {role.salary_uk && (
          <div className="intel-role__salary">
            <div className="intel-role__salary-mean">£{role.salary_uk.mean?.toLocaleString()}</div>
            <div className="intel-role__salary-range">£{role.salary_uk.min?.toLocaleString()} – £{role.salary_uk.max?.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {role.ai_context?.summary && (
        <p className="intel-role__summary">{role.ai_context.summary}</p>
      )}

      {/* Skills */}
      <div className="intel-role__skills-section">
        <h4 className="intel-label">Skills Required</h4>
        <div className="intel-role__skills-grid">
          {grouped.core?.length > 0 && (
            <div className="intel-skill-group">
              <span className="intel-skill-group__label">Core</span>
              <div className="intel-skill-group__tags">
                {grouped.core.map((s) => <span key={s} className="intel-tag intel-tag--core">{s}</span>)}
              </div>
            </div>
          )}
          {grouped.technical?.length > 0 && (
            <div className="intel-skill-group">
              <span className="intel-skill-group__label">Technical</span>
              <div className="intel-skill-group__tags">
                {grouped.technical.map((s) => <span key={s} className="intel-tag intel-tag--tech">{s}</span>)}
              </div>
            </div>
          )}
          {grouped.soft?.length > 0 && (
            <div className="intel-skill-group">
              <span className="intel-skill-group__label">Soft</span>
              <div className="intel-skill-group__tags">
                {grouped.soft.map((s) => <span key={s} className="intel-tag intel-tag--soft">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Industries */}
      {role.industries?.length > 0 && (
        <div className="intel-role__industries">
          <h4 className="intel-label">Industries</h4>
          <div className="intel-tag-row">
            {role.industries.map((ind) => (
              <span key={ind} className="intel-tag">{ind}</span>
            ))}
          </div>
        </div>
      )}

      {/* Career Mobility */}
      {role.career_mobility && (
        <div className="intel-role__mobility">
          <h4 className="intel-label">Career Mobility</h4>
          <div className="intel-role__mobility-stats">
            <div className="intel-stat">
              <span className="intel-stat__value">{role.career_mobility.next_roles_count}</span>
              <span className="intel-stat__label">next roles</span>
            </div>
            <div className="intel-stat">
              <span className="intel-stat__value">{role.career_mobility.previous_roles_count}</span>
              <span className="intel-stat__label">entry routes</span>
            </div>
            <div className="intel-stat">
              <span className="intel-stat__value">{role.adjacent_roles?.length || 0}</span>
              <span className="intel-stat__label">adjacent</span>
            </div>
          </div>

          {role.career_mobility.next_roles?.length > 0 && (
            <div className="intel-role__next-roles">
              <span className="intel-sub-label">Progression Paths</span>
              <div className="intel-role__next-list">
                {role.career_mobility.next_roles.map((nr) => (
                  <button key={nr.slug} className="intel-next-role" onClick={() => onRoleClick?.(nr.slug)}>
                    <span className="intel-next-role__title">{nr.title}</span>
                    <span className="intel-next-role__meta">
                      {nr.difficulty_label} · ~{nr.estimated_years}yr · +{nr.salary_growth_pct}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoleSkeleton() {
  return (
    <div className="intel-role intel-role--skeleton">
      <div className="intel-role__header">
        <div><div className="skel skel--sm" /><div className="skel skel--lg" style={{ marginTop: 8 }} /><div className="skel skel--md" style={{ marginTop: 8 }} /></div>
      </div>
      <div className="skel skel--lg" style={{ width: "100%", marginTop: 16 }} />
      <div className="skel skel--lg" style={{ width: "80%", marginTop: 8 }} />
    </div>
  );
}
