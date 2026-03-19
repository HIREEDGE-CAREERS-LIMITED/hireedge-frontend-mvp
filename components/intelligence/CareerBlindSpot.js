import { useState, useEffect, useCallback } from "react";
import "../../styles/career-blind-spot.css";

const DIFFICULTY_CONFIG = {
  low: { label: "Low risk", cls: "he-blind-pill--green" },
  easy: { label: "Low risk", cls: "he-blind-pill--green" },
  simple: { label: "Low risk", cls: "he-blind-pill--green" },
  medium: { label: "Medium risk", cls: "he-blind-pill--amber" },
  moderate: { label: "Medium risk", cls: "he-blind-pill--amber" },
  hard: { label: "High risk", cls: "he-blind-pill--red" },
  difficult: { label: "High risk", cls: "he-blind-pill--red" },
  high: { label: "High risk", cls: "he-blind-pill--red" },
  stretch: { label: "Stretch", cls: "he-blind-pill--purple" },
  very_hard: { label: "Stretch", cls: "he-blind-pill--purple" },
};

const CRITICALITY_CONFIG = {
  critical: { label: "critical", cls: "he-blind-skill-tag--critical" },
  important: { label: "important", cls: "he-blind-skill-tag--important" },
  "nice-to-have": { label: "nice-to-have", cls: "he-blind-skill-tag--nice" },
};

function fmtGBP(n) {
  if (!n && n !== 0) return "—";
  return "£" + Math.round(n).toLocaleString("en-GB");
}

function pluralise(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function ScoreBar({ value, variant = "teal" }) {
  const pct = value > 1 ? Math.min(Math.round(value), 100) : Math.round(value * 100);
  return (
    <div className="he-blind-bar-bg">
      <div
        className={`he-blind-bar-fill he-blind-bar-fill--${variant}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SalaryTrajectory({ current, trajectory }) {
  if (!trajectory) return null;

  const cols = [
    { label: "Now", value: current, muted: true },
    { label: "Yr 1", value: trajectory.year_1, muted: false },
    { label: "Yr 2", value: trajectory.year_2, muted: false },
    { label: "Yr 3", value: trajectory.year_3, muted: false },
  ];

  return (
    <div className="he-blind-trajectory">
      {cols.map(({ label, value, muted }) => (
        <div
          key={label}
          className={`he-blind-trajectory-item${
            muted ? " he-blind-trajectory-item--muted" : ""
          }`}
        >
          <div className="he-blind-trajectory-label">{label}</div>
          <div className="he-blind-trajectory-value">{fmtGBP(value)}</div>
        </div>
      ))}
    </div>
  );
}

function TransitionEvidence({ evidence }) {
  if (!evidence || Object.keys(evidence).length === 0) return null;

  const items = [];
  if (evidence.known_transitions) {
    items.push(`${evidence.known_transitions} known transitions`);
  }
  if (evidence.estimated_years) {
    items.push(
      `~${evidence.estimated_years} yr${evidence.estimated_years === 1 ? "" : "s"} typical`
    );
  }
  if (evidence.salary_growth_pct) {
    items.push(`${evidence.salary_growth_pct}% avg salary growth`);
  }

  if (!items.length) return null;

  return <p className="he-blind-evidence">{items.join(" · ")}</p>;
}

function RoleCard({ role, isExpanded, onToggle, currentSlug, isFallback }) {
  const diffKey = (role.transition_difficulty || "medium").toLowerCase();
  const diff = DIFFICULTY_CONFIG[diffKey] || DIFFICULTY_CONFIG.medium;
  const isTop = role.rank === 1 && !isFallback;

  function go(e, path) {
    e.stopPropagation();
    window.location.href = path;
  }

  return (
    <article
      className={`he-blind-card${isTop ? " he-blind-card--featured" : ""}`}
      aria-label={`Career blind spot: ${role.role_title}`}
    >
      <div
        className="he-blind-card-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`he-blind-body-${role.role_slug}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {isTop && (
          <div className="he-blind-top-badge-row">
            <span className="he-blind-pill he-blind-pill--blue">
              EDGEX top blind spot
            </span>
          </div>
        )}

        <div className="he-blind-card-row">
          <div className="he-blind-card-meta">
            <div className="he-blind-title-row">
              <h3 className="he-blind-role-title">{role.role_title}</h3>
              <span className={`he-blind-pill ${diff.cls}`}>{diff.label}</span>
              {role.confidence_score < 0.25 && (
                <span className="he-blind-pill he-blind-pill--gray">Exploratory</span>
              )}
            </div>

            <p className="he-blind-role-subtitle">
              {role.category} {" · "} {pluralise(role.graph_distance, "hop")} away
            </p>

            <TransitionEvidence evidence={role.transition_evidence} />
          </div>

          <div className="he-blind-salary-col">
            <div className="he-blind-salary-target">
              {fmtGBP(role.salary_delta.target_mean)}
            </div>
            {role.salary_delta.delta > 0 && (
              <div className="he-blind-salary-delta">
                +{fmtGBP(role.salary_delta.delta)} / yr
              </div>
            )}
          </div>
        </div>

        <div className="he-blind-stats-grid">
          <div className="he-blind-stat">
            <span className="he-blind-stat-label">Skill match</span>
            <span className="he-blind-stat-value he-blind-stat-value--green">
              {Math.round(role.skill_overlap_score * 100)}%
            </span>
            <ScoreBar value={role.skill_overlap_score} variant="teal" />
          </div>

          <div className="he-blind-stat">
            <span className="he-blind-stat-label">EDGEX score</span>
            <span className="he-blind-stat-value he-blind-stat-value--blue">
              {role.edgex_score}
            </span>
            <ScoreBar value={role.edgex_score} variant="blue" />
          </div>

          <div className="he-blind-stat">
            <span className="he-blind-stat-label">Confidence</span>
            <span className="he-blind-stat-value he-blind-stat-value--gray">
              {Math.round(role.confidence_score * 100)}%
            </span>
            <ScoreBar value={role.confidence_score} variant="gray" />
          </div>
        </div>

        <div className="he-blind-shared-skills">
          {role.shared_skills.slice(0, 4).map((s) => (
            <span key={s} className="he-blind-skill-tag he-blind-skill-tag--shared">
              {s}
            </span>
          ))}
          {role.shared_skills.length > 4 && (
            <span className="he-blind-overflow-count">
              +{role.shared_skills.length - 4} more
            </span>
          )}
        </div>

        <div className="he-blind-toggle-row" aria-hidden="true">
          <span className="he-blind-toggle-label">
            {isExpanded ? "Hide details" : "See full breakdown"}
          </span>
          <span
            className={`he-blind-toggle-arrow${
              isExpanded ? " he-blind-toggle-arrow--open" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="he-blind-expanded" id={`he-blind-body-${role.role_slug}`}>
          <section className="he-blind-section">
            <h4 className="he-blind-section-label">Why EDGEX flagged this</h4>
            <p className="he-blind-section-body">{role.why_this_role}</p>
          </section>

          {role.missing_skills?.length > 0 && (
            <section className="he-blind-section">
              <h4 className="he-blind-section-label">Gaps to close</h4>
              <div className="he-blind-missing-skills">
                {role.missing_skills.map((ms) => {
                  const cfg =
                    CRITICALITY_CONFIG[ms.criticality] ||
                    CRITICALITY_CONFIG["nice-to-have"];
                  return (
                    <span key={ms.skill} className={`he-blind-skill-tag ${cfg.cls}`}>
                      {ms.skill}
                      <span className="he-blind-criticality-label">
                        {" "}
                        · {cfg.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {role.salary_trajectory && (
            <section className="he-blind-section">
              <h4 className="he-blind-section-label">Salary trajectory</h4>
              <SalaryTrajectory
                current={role.salary_delta.current_mean}
                trajectory={role.salary_trajectory}
              />
            </section>
          )}

          {role.recommended_next_step && (
            <div className="he-blind-next-step">
              <div className="he-blind-next-step-label">
                EDGEX recommended next step
              </div>
              <p className="he-blind-next-step-body">{role.recommended_next_step}</p>
            </div>
          )}

          <div className="he-blind-cta-row">
            <button
              className="he-blind-btn he-blind-btn--primary"
              onClick={(e) =>
                go(e, `/intelligence/role-intelligence?role=${role.role_slug}`)
              }
            >
              View role intelligence →
            </button>

            <button
              className="he-blind-btn he-blind-btn--secondary"
              onClick={(e) =>
                go(e, `/intelligence/career-path?from=${currentSlug}&to=${role.role_slug}`)
              }
            >
              Build path to this role →
            </button>

            <button
              className="he-blind-btn he-blind-btn--ghost"
              onClick={(e) =>
                go(e, `/intelligence/skills-gap?from=${currentSlug}&to=${role.role_slug}`)
              }
            >
              Full skills gap analysis
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="he-blind-loading"
      aria-live="polite"
      aria-label="EDGEX is scanning the career graph"
    >
      <div className="he-blind-loading-header">
        <div className="he-blind-skeleton he-blind-skeleton--title" />
        <div className="he-blind-skeleton he-blind-skeleton--badge" />
      </div>

      {[1, 2, 3].map((n) => (
        <div key={n} className="he-blind-skeleton-card">
          <div className="he-blind-skeleton he-blind-skeleton--heading" />
          <div className="he-blind-skeleton he-blind-skeleton--sub" />
          <div className="he-blind-skeleton-stats">
            <div className="he-blind-skeleton he-blind-skeleton--stat" />
            <div className="he-blind-skeleton he-blind-skeleton--stat" />
            <div className="he-blind-skeleton he-blind-skeleton--stat" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onRetry }) {
  return (
    <div className="he-blind-empty">
      <p className="he-blind-empty-title">No blind spots found</p>
      <p className="he-blind-empty-body">
        EDGEX couldn&apos;t find strong cross-category matches for this role.
        Try a different starting role or lower the overlap threshold.
      </p>
      {onRetry && (
        <button className="he-blind-btn he-blind-btn--ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="he-blind-error" role="alert">
      <p className="he-blind-error-title">EDGEX is temporarily unavailable</p>
      <p className="he-blind-error-body">
        {message || "The career graph could not be reached. Please try again in a moment."}
      </p>
      {onRetry && (
        <button className="he-blind-btn he-blind-btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default function CareerBlindSpot({
  roleSlug,
  limit = 3,
  minOverlap = 0.55,
  minSalaryDelta = 0,
  maxHops = 3,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (data?.blind_spot_roles?.length > 0 && expandedSlug === null) {
      setExpandedSlug(data.blind_spot_roles[0].role_slug);
    }
  }, [data, expandedSlug]);

  const fetchBlindSpots = useCallback(async () => {
    if (!roleSlug) return;

    setLoading(true);
    setError(null);
    setData(null);
    setExpandedSlug(null);

    try {
      const qs = new URLSearchParams({
        role: roleSlug,
        limit: String(limit),
        min_overlap: String(minOverlap),
        min_salary_delta: String(minSalaryDelta),
        max_hops: String(maxHops),
      });

      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://hireedge-backend-mvp.vercel.app";

      const res = await fetch(`${apiBase}/api/career-intelligence/blind-spot?${qs}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || `Error ${res.status}`);
        return;
      }

      setData(json);
    } catch {
      setError("Network error — could not reach the EDGEX career graph.");
    } finally {
      setLoading(false);
    }
  }, [roleSlug, limit, minOverlap, minSalaryDelta, maxHops]);

  useEffect(() => {
    fetchBlindSpots();
  }, [fetchBlindSpots]);

  function toggleCard(slug) {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  }

  if (!roleSlug) return null;
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchBlindSpots} />;
  if (!data) return null;

  const { blind_spot_roles, current_role, fallback, metadata } = data;

  if (!blind_spot_roles?.length) {
    return <EmptyState onRetry={fetchBlindSpots} />;
  }

  const sectionTitle = fallback
    ? "Roles you might not have considered"
    : "Career blind spots";

  return (
    <section
      className="he-blind-root"
      aria-label="Career Blind Spot results, powered by EDGEX"
    >
      <div className="he-blind-section-header">
        <div className="he-blind-section-header-left">
          <span className="he-blind-pulse" aria-hidden="true" />
          <span className="he-blind-section-title">{sectionTitle}</span>
          <span className="he-blind-powered-by">powered by EDGEX</span>
        </div>

        <div className="he-blind-section-header-right">
          <span
            className={`he-blind-pill ${
              fallback ? "he-blind-pill--gray" : "he-blind-pill--green"
            }`}
          >
            {pluralise(blind_spot_roles.length, fallback ? "suggestion" : "role")} found
          </span>

          <button
            className="he-blind-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Show blind spot results" : "Hide blind spot results"}
          >
            {collapsed ? "Show ▾" : "Hide ▴"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="he-blind-context-bar">
            {fallback ? (
              <>
                EDGEX scanned{" "}
                <strong>{metadata.total_roles_scanned.toLocaleString("en-GB")} roles</strong>{" "}
                from your position as <strong>{current_role.title}</strong>. Transition data is
                limited — suggestions are based on skill overlap.
              </>
            ) : (
              <>
                EDGEX scanned{" "}
                <strong>{metadata.total_roles_scanned.toLocaleString("en-GB")} roles</strong> and
                5,000+ transitions from your position as{" "}
                <strong>{current_role.title}</strong>. These roles sit outside your current
                category but share deep skill overlap with your profile. You would never search
                for them — that&apos;s the point.
              </>
            )}
          </div>

          <div className="he-blind-cards">
            {blind_spot_roles.map((role) => (
              <RoleCard
                key={role.role_slug}
                role={role}
                isExpanded={expandedSlug === role.role_slug}
                onToggle={() => toggleCard(role.role_slug)}
                currentSlug={current_role.slug}
                isFallback={!!fallback}
              />
            ))}
          </div>

          <div className="he-blind-footer">
            <span className="he-blind-footer-note">
              Scores derived from {metadata.total_roles_scanned.toLocaleString("en-GB")} roles
              {" · "}Recalculates when you update your profile
            </span>

            <button className="he-blind-footer-cta" onClick={fetchBlindSpots}>
              Recalculate →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
