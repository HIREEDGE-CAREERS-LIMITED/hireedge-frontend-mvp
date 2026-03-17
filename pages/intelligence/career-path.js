// ============================================================================
// pages/intelligence/career-path.js
// HireEdge Frontend — Career path finder
// ============================================================================

import { useState } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import CareerPathVisualizer from "../../components/intelligence/CareerPathVisualizer";
import { fetchShortestPath, fetchAllPaths } from "../../services/intelligenceService";
import { useRouter } from "next/router";

function slugifyRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getSlug(role) {
  if (!role) return null;

  if (typeof role === "string") {
    return slugifyRole(role);
  }

  if (role.slug) return role.slug;
  if (role.value) return slugifyRole(role.value);
  if (role.title) return slugifyRole(role.title);
  if (role.label) return slugifyRole(role.label);

  return null;
}

function getTitle(role) {
  if (!role) return "";

  if (typeof role === "string") return role;

  return role.title || role.label || role.slug || "";
}

export default function CareerPathPage() {
  const router = useRouter();
  const [fromRole, setFromRole] = useState(null);
  const [toRole, setToRole] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [altPaths, setAltPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPath = async () => {
    const fromSlug = getSlug(fromRole);
    const toSlug = getSlug(toRole);

    if (!fromSlug || !toSlug) {
      setError("Please select both a starting role and a target role.");
      return;
    }

    setLoading(true);
    setError(null);
    setPathData(null);
    setAltPaths([]);

    try {
      const [shortest, all] = await Promise.all([
        fetchShortestPath(fromSlug, toSlug),
        fetchAllPaths(fromSlug, toSlug, {
          maxDepth: 5,
          maxResults: 5,
        }).catch(() => null),
      ]);

      const shortestData = shortest?.data || shortest || null;
      const allData = all?.data || all || null;

      if (
        shortestData &&
        shortestData.path &&
        Array.isArray(shortestData.path) &&
        shortestData.path.length > 0
      ) {
        setPathData(shortestData);
      } else {
        setPathData(null);
        setError("No path found between these roles");
      }

      if (Array.isArray(allData)) {
        setAltPaths(allData.slice(1, 4));
      } else if (Array.isArray(allData?.paths)) {
        setAltPaths(allData.paths.slice(1, 4));
      } else {
        setAltPaths([]);
      }
    } catch (err) {
      console.error("[HireEdge] Career path error:", err);
      setError(err?.data?.error || err?.message || "No path found between these roles");
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (slug) => {
    router.push(`/intelligence/role-explorer?slug=${slug}`);
  };

  const canSubmit = !!getSlug(fromRole) && !!getSlug(toRole) && !loading;

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Career Path Finder</h1>
        <p className="intel-page__subtitle">
          Find the shortest route between any two roles.
        </p>
      </div>

      <div className="intel-path-inputs">
        <div className="intel-path-input">
          <label className="intel-label">From</label>
          <RoleSearch
            onSelect={(r) => setFromRole(r)}
            placeholder="Current role..."
          />
          {fromRole && (
            <span className="intel-path-selected">
              {getTitle(fromRole)}
            </span>
          )}
        </div>

        <div className="intel-path-arrow">→</div>

        <div className="intel-path-input">
          <label className="intel-label">To</label>
          <RoleSearch
            onSelect={(r) => setToRole(r)}
            placeholder="Target role..."
          />
          {toRole && (
            <span className="intel-path-selected">
              {getTitle(toRole)}
            </span>
          )}
        </div>

        <button
          className="intel-path-btn"
          onClick={findPath}
          disabled={!canSubmit}
        >
          {loading ? "Finding..." : "Find Path"}
        </button>
      </div>

      {error && <div className="intel-path-error">{error}</div>}

      {pathData && (
        <div className="intel-page__result">
          <h3
            className="intel-label"
            style={{ marginBottom: "var(--space-4)" }}
          >
            Shortest Path
          </h3>
          <CareerPathVisualizer
            pathData={pathData}
            onStepClick={handleStepClick}
          />
        </div>
      )}

      {altPaths.length > 0 && (
        <div
          className="intel-page__result"
          style={{ marginTop: "var(--space-6)" }}
        >
          <h3
            className="intel-label"
            style={{ marginBottom: "var(--space-4)" }}
          >
            Alternative Routes
          </h3>

          {altPaths.map((ap, i) => (
            <div key={i} className="intel-alt-path">
              <div className="intel-alt-path__header">
                <span>Route {i + 2}</span>
                <span className="intel-alt-path__meta">
                  {ap.steps || (ap.path?.length ? ap.path.length - 1 : 0)} steps
                  {ap.totalYears ? ` · ~${ap.totalYears}yr` : ""}
                  {ap.totalSalaryGrowthPct ? ` · +${ap.totalSalaryGrowthPct}%` : ""}
                </span>
              </div>

              <div className="intel-alt-path__chain">
                {(ap.path || []).map((slug, j) => (
                  <span key={`${slug}-${j}`}>
                    {j > 0 && (
                      <span className="intel-alt-path__arrow">→</span>
                    )}
                    <button
                      className="intel-alt-path__node"
                      onClick={() => handleStepClick(slug)}
                    >
                      {slug
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!pathData && !loading && !error && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">🗺️</div>
          <p className="dash-empty__text">
            Select a starting role and a target role
          </p>
          <p className="dash-empty__hint">
            We&apos;ll find every possible career path between them.
          </p>
        </div>
      )}
    </div>
  );
}
