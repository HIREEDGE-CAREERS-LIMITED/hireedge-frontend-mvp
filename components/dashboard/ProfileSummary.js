// ============================================================================
// components/dashboard/ProfileSummary.js
// HireEdge Frontend — Dashboard profile hero card
// ============================================================================

export default function ProfileSummary({ profile, salary, readiness }) {
  if (!profile) return <ProfileSkeleton />;

  const fitnessColors = {
    strong_fit: "var(--accent-400)",
    good_fit: "var(--accent-500)",
    partial_fit: "var(--amber-400)",
    weak_fit: "var(--red-400)",
  };

  const readinessColors = {
    strong: "var(--accent-400)",
    good: "var(--accent-500)",
    developing: "var(--amber-400)",
    early: "var(--red-400)",
  };

  return (
    <div className="dash-profile">
      {/* Left: Role info */}
      <div className="dash-profile__info">
        <div className="dash-profile__category">{profile.category}</div>
        <h2 className="dash-profile__title">{profile.title}</h2>
        <div className="dash-profile__meta">
          <span className="dash-profile__badge">{profile.seniority}</span>
          {profile.years_exp && (
            <span className="dash-profile__detail">{profile.years_exp} yrs exp</span>
          )}
          <span className="dash-profile__detail">{profile.skills_count} skills</span>
        </div>
        {profile.target && (
          <div className="dash-profile__target">
            <span className="dash-profile__target-label">Targeting</span>
            <span className="dash-profile__target-value">
              {profile.target.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
        )}
      </div>

      {/* Center: Readiness gauge */}
      <div className="dash-profile__gauge">
        <div className="gauge">
          <svg viewBox="0 0 120 120" className="gauge__svg">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--ink-700)"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={readinessColors[readiness?.label] || "var(--ink-500)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(readiness?.overall || 0) * 3.267} 326.7`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </svg>
          <div className="gauge__value">
            <span className="gauge__number">{readiness?.overall ?? "—"}</span>
            <span className="gauge__label">readiness</span>
          </div>
        </div>
        {readiness?.target_analysis && (
          <div className="dash-profile__target-readiness">
            {readiness.target_analysis.readiness_pct}% ready for {readiness.target_analysis.title}
          </div>
        )}
      </div>

      {/* Right: Salary */}
      {salary && (
        <div className="dash-profile__salary">
          <div className="dash-profile__salary-label">Salary</div>
          <div className="dash-profile__salary-mean">£{salary.mean?.toLocaleString()}</div>
          <div className="dash-profile__salary-range">
            £{salary.min?.toLocaleString()} — £{salary.max?.toLocaleString()}
          </div>
          <div className="dash-profile__salary-percentile">
            <span
              className="dash-profile__percentile-bar"
              style={{ width: `${salary.percentile_in_category || 0}%` }}
            />
            <span className="dash-profile__percentile-text">
              {salary.percentile_in_category}th percentile
            </span>
          </div>
          {salary.best_salary_move && (
            <div className="dash-profile__salary-move">
              Best move: {salary.best_salary_move.title} (+{salary.best_salary_move.growth_pct}%)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="dash-profile dash-profile--skeleton">
      <div className="dash-profile__info">
        <div className="skel skel--sm" />
        <div className="skel skel--lg" />
        <div className="skel skel--md" />
      </div>
      <div className="dash-profile__gauge">
        <div className="gauge"><div className="skel skel--circle" /></div>
      </div>
      <div className="dash-profile__salary">
        <div className="skel skel--sm" />
        <div className="skel skel--lg" />
        <div className="skel skel--md" />
      </div>
    </div>
  );
}
