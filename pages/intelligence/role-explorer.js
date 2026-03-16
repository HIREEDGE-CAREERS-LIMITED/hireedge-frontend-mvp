// ============================================================================
// pages/intelligence/role-explorer.js
// HireEdge Frontend — Role explorer detail page
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RoleSearch from "../../components/intelligence/RoleSearch";
import RoleOverviewCard from "../../components/intelligence/RoleOverviewCard";
import SalaryInsightsCard from "../../components/intelligence/SalaryInsightsCard";
import { fetchRoleProfile, fetchSalaryIntelligence } from "../../services/intelligenceService";

export default function RoleExplorerPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [role, setRole] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRole = async (s) => {
    if (!s) return;
    setLoading(true);
    setRole(null);
    setSalary(null);
    try {
      const [profileRes, salaryRes] = await Promise.all([
        fetchRoleProfile(s),
        fetchSalaryIntelligence(s).catch(() => null),
      ]);
      setRole(profileRes.data || null);
      setSalary(salaryRes?.data || null);
    } catch { setRole(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (slug) loadRole(slug); }, [slug]);

  const handleRoleSelect = (r) => {
    router.push(`/intelligence/role-explorer?slug=${r.slug}`, undefined, { shallow: true });
    loadRole(r.slug);
  };

  const handleRoleClick = (s) => {
    router.push(`/intelligence/role-explorer?slug=${s}`, undefined, { shallow: true });
    loadRole(s);
  };

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Role Explorer</h1>
      </div>

      <div className="intel-page__search">
        <RoleSearch onSelect={handleRoleSelect} placeholder="Search for a role..." initialValue={slug?.replace(/-/g, " ") || ""} />
      </div>

      {loading && !role && (
        <div className="intel-page__loading">
          <RoleOverviewCard role={null} />
        </div>
      )}

      {!loading && !role && !slug && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">🔍</div>
          <p className="dash-empty__text">Search for a role above to explore it</p>
          <p className="dash-empty__hint">View skills, salary, career paths, and progression options.</p>
        </div>
      )}

      {!loading && !role && slug && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">❌</div>
          <p className="dash-empty__text">Role not found: {slug}</p>
        </div>
      )}

      {role && (
        <div className="intel-page__detail">
          <RoleOverviewCard role={role} onRoleClick={handleRoleClick} />
          {salary && (
            <div style={{ marginTop: "var(--space-6)" }}>
              <SalaryInsightsCard salary={salary} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
