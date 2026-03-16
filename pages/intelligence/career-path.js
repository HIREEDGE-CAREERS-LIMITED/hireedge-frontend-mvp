// ============================================================================
// pages/intelligence/career-path.js
// HireEdge Frontend — Career path finder
// ============================================================================

import { useState } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import CareerPathVisualizer from "../../components/intelligence/CareerPathVisualizer";
import { fetchShortestPath, fetchAllPaths } from "../../services/intelligenceService";
import { useRouter } from "next/router";

export default function CareerPathPage() {
  const router = useRouter();
  const [fromRole, setFromRole] = useState(null);
  const [toRole, setToRole] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [altPaths, setAltPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPath = async () => {
    if (!fromRole || !toRole) return;
    setLoading(true);
    setError(null);
    setPathData(null);
    setAltPaths([]);
    try {
      const [shortest, all] = await Promise.all([
        fetchShortestPath(fromRole.slug, toRole.slug),
        fetchAllPaths(fromRole.slug, toRole.slug, { maxDepth: 5, maxResults: 5 }).catch(() => null),
      ]);
      setPathData(shortest.data || null);
      setAltPaths((all?.data || []).slice(1, 4));
      if (!shortest.data) setError("No path found between these roles.");
    } catch (err) {
      setError(err.data?.error || "No path found between these roles.");
    }
    finally { setLoading(false); }
  };

  const handleStepClick = (slug) => {
    router.push(`/intelligence/role-explorer?slug=${slug}`);
  };

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Career Path Finder</h1>
        <p className="intel-page__subtitle">Find the shortest route between any two roles.</p>
      </div>

      {/* From / To inputs */}
      <div className="intel-path-inputs">
        <div className="intel-path-input">
          <label className="intel-label">From</label>
          <RoleSearch
            onSelect={(r) => setFromRole(r)}
            placeholder="Current role..."
          />
          {fromRole && <span className="intel-path-selected">{fromRole.title || fromRole.slug}</span>}
        </div>

        <div className="intel-path-arrow">→</div>

        <div className="intel-path-input">
          <label className="intel-label">To</label>
          <RoleSearch
            onSelect={(r) => setToRole(r)}
            placeholder="Target role..."
          />
          {toRole && <span className="intel-path-selected">{toRole.title || toRole.slug}</span>}
        </div>

        <button
          className="intel-path-btn"
          onClick={findPath}
          disabled={!fromRole || !toRole || loading}
        >
          {loading ? "Finding..." : "Find Path"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="intel-path-error">{error}</div>
      )}

      {/* Primary path */}
      {pathData && (
        <div className="intel-page__result">
          <h3 className="intel-label" style={{ marginBottom: "var(--space-4)" }}>Shortest Path</h3>
          <CareerPathVisualizer pathData={pathData} onStepClick={handleStepClick} />
        </div>
      )}

      {/* Alternative paths */}
      {altPaths.length > 0 && (
        <div className="intel-page__result" style={{ marginTop: "var(--space-6)" }}>
          <h3 className="intel-label" style={{ marginBottom: "var(--space-4)" }}>Alternative Routes</h3>
          {altPaths.map((ap, i) => (
            <div key={i} className="intel-alt-path">
              <div className="intel-alt-path__header">
                <span>Route {i + 2}</span>
                <span className="intel-alt-path__meta">{ap.steps} steps · ~{ap.totalYears}yr · +{ap.totalSalaryGrowthPct}%</span>
              </div>
              <div className="intel-alt-path__chain">
                {ap.path.map((slug, j) => (
                  <span key={slug}>
                    {j > 0 && <span className="intel-alt-path__arrow">→</span>}
                    <button className="intel-alt-path__node" onClick={() => handleStepClick(slug)}>
                      {slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!pathData && !loading && !error && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">🗺️</div>
          <p className="dash-empty__text">Select a starting role and a target role</p>
          <p className="dash-empty__hint">We'll find every possible career path between them.</p>
        </div>
      )}
    </div>
  );
}
