// ============================================================================
// components/dashboard/SavedRolesList.js
// HireEdge Frontend — Saved roles list
// ============================================================================

import Link from "next/link";

const FIT_STYLES = {
  strong_fit: { bg: "rgba(16,185,129,0.12)", color: "var(--accent-400)", label: "Strong fit" },
  good_fit: { bg: "rgba(16,185,129,0.08)", color: "var(--accent-500)", label: "Good fit" },
  partial_fit: { bg: "rgba(251,191,36,0.1)", color: "var(--amber-400)", label: "Partial fit" },
  stretch: { bg: "rgba(239,68,68,0.08)", color: "var(--red-400)", label: "Stretch" },
};

export default function SavedRolesList({ roles, loading }) {
  if (loading) return <SavedSkeleton />;

  if (!roles || roles.length === 0) {
    return (
      <div className="dash-section">
        <div className="dash-section__header">
          <h3 className="dash-section__title">Saved Roles</h3>
        </div>
        <div className="dash-empty">
          <div className="dash-empty__icon">📌</div>
          <p className="dash-empty__text">No saved roles yet</p>
          <p className="dash-empty__hint">Explore roles in Career Intelligence and save the ones you're interested in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section">
      <div className="dash-section__header">
        <h3 className="dash-section__title">Saved Roles</h3>
        <Link href="/dashboard/saved-roles" className="dash-section__link">View all</Link>
      </div>
      <div className="saved-roles__scroll">
        {roles.map((role) => {
          const fit = FIT_STYLES[role.fit_label] || FIT_STYLES.stretch;
          return (
            <div key={role.slug} className="saved-card">
              <div className="saved-card__top">
                <div className="saved-card__title">{role.title}</div>
                <div className="saved-card__category">{role.category}</div>
              </div>

              {role.estimated_fit !== null && (
                <div className="saved-card__fit" style={{ background: fit.bg, color: fit.color }}>
                  {fit.label} · {role.estimated_fit}%
                </div>
              )}

              {role.salary && (
                <div className="saved-card__salary">
                  £{role.salary.mean?.toLocaleString()}
                  <span className="saved-card__salary-range">
                    ({`£${(role.salary.min / 1000).toFixed(0)}k–${(role.salary.max / 1000).toFixed(0)}k`})
                  </span>
                </div>
              )}

              {role.top_missing_skills?.length > 0 && (
                <div className="saved-card__missing">
                  <span className="saved-card__missing-label">Missing:</span>
                  {role.top_missing_skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="saved-card__skill-tag">{s}</span>
                  ))}
                  {role.missing_count > 3 && (
                    <span className="saved-card__skill-more">+{role.missing_count - 3}</span>
                  )}
                </div>
              )}

              {role.suggested_action && (
                <div className="saved-card__action">
                  {role.suggested_action.label}
                </div>
              )}

              {role.path_years && (
                <div className="saved-card__path">
                  {role.path_steps} step{role.path_steps !== 1 ? "s" : ""} · ~{role.path_years} yr{role.path_years !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavedSkeleton() {
  return (
    <div className="dash-section">
      <div className="dash-section__header">
        <div className="skel skel--md" />
      </div>
      <div className="saved-roles__scroll">
        {[1, 2, 3].map((i) => (
          <div key={i} className="saved-card saved-card--skeleton">
            <div className="skel skel--lg" />
            <div className="skel skel--sm" />
            <div className="skel skel--md" />
          </div>
        ))}
      </div>
    </div>
  );
}
