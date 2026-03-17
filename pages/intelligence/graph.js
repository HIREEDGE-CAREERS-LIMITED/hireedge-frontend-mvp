// ============================================================================
// pages/intelligence/graph.js
// HireEdge Frontend — Career Graph page
// ============================================================================

import { useState, useEffect } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import { fetchRoleGraph, fetchGraphStats } from "../../services/intelligenceService";

export default function CareerGraphPage() {
  const [stats, setStats] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGraphStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      const res = await fetchRoleGraph(role.slug, 2);
      setGraphData(res.data);
    } catch {
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Career Graph</h1>
        <p className="intel-page__subtitle">
          Explore the network of career transitions.
          {stats && ` ${stats.total_roles || 0} roles, ${stats.total_edges || 0} connections.`}
        </p>
      </div>

      <div className="intel-page__search">
        <RoleSearch
          onSelect={handleRoleSelect}
          placeholder="Search a role to explore its graph..."
        />
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
          <span className="input-bar__spinner" style={{ width: 20, height: 20, display: "inline-block" }} />
        </div>
      )}

      {!loading && graphData && selectedRole && (
        <div className="intel-page__result">
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
          }}>
            <h3 style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-4)",
            }}>
              {selectedRole.title || selectedRole.slug}
            </h3>

            {/* Connected roles */}
            {graphData.nodes && graphData.nodes.length > 0 && (
              <div>
                <span className="intel-label">Connected Roles ({graphData.nodes.length})</span>
                <div className="intel-tag-row" style={{ marginTop: "var(--space-2)" }}>
                  {graphData.nodes.map((node) => (
                    <button
                      key={node.slug || node.id}
                      className="intel-alt-path__node"
                      onClick={() => handleRoleSelect({ slug: node.slug || node.id, title: node.title })}
                    >
                      {node.title || node.slug || node.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Edges summary */}
            {graphData.edges && graphData.edges.length > 0 && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <span className="intel-label">Transitions ({graphData.edges.length})</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginTop: "var(--space-2)" }}>
                  {graphData.edges.slice(0, 10).map((edge, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-2) var(--space-3)",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-sm)",
                    }}>
                      <span style={{ color: "var(--text-primary)" }}>{edge.from_title || edge.from}</span>
                      <span style={{ color: "var(--text-muted)" }}>→</span>
                      <span style={{ color: "var(--accent-400)" }}>{edge.to_title || edge.to}</span>
                      {edge.difficulty_label && (
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "var(--text-xs)",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}>
                          {edge.difficulty_label} · ~{edge.estimated_years}yr
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && !graphData && !selectedRole && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">🕸️</div>
          <p className="dash-empty__text">Search for a role to explore its career graph</p>
          <p className="dash-empty__hint">See connected roles, transition paths, and the broader career network.</p>
        </div>
      )}
    </div>
  );
}
