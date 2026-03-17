// ============================================================================
// pages/intelligence/salary-insights.js
// HireEdge Frontend — Salary insights page
// ============================================================================

import { useState, useEffect } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import SalaryInsightsCard from "../../components/intelligence/SalaryInsightsCard";
import {
  fetchSalaryIntelligence,
  fetchTopPaying,
  fetchCategories,
} from "../../services/intelligenceService";

export default function SalaryInsightsPage() {
  const [salary, setSalary] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  const [topPaying, setTopPaying] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState("");
  const [topLoading, setTopLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((res) => {
        const data = res.data || res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    loadTopPaying("");
  }, []);

  const loadTopPaying = async (cat) => {
    setTopLoading(true);
    try {
      const res = await fetchTopPaying({
        category: cat || undefined,
        limit: 15,
      });
      const data = res.data || res;
      setTopPaying(Array.isArray(data) ? data : []);
    } catch {
      setTopPaying([]);
    } finally {
      setTopLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    if (!role) return;
    const slug =
      typeof role === "string" ? role : role.slug || null;
    if (!slug) return;

    setSalaryLoading(true);
    setSalaryError(null);
    setSalary(null);
    try {
      const res = await fetchSalaryIntelligence(slug);

      // Normalize response shape.
      // Backend may return:
      //   { ok: true, data: { title, salary: {...}, ... } }
      //   { title, salary: {...}, ... }
      //   { data: { title, salary: {...}, ... } }
      let salaryData = null;
      if (res.data && (res.data.salary || res.data.title)) {
        salaryData = res.data;
      } else if (res.salary || res.title) {
        salaryData = res;
      } else if (res.data?.data) {
        salaryData = res.data.data;
      }

      if (salaryData) {
        setSalary(salaryData);
      } else {
        console.warn(
          "[HireEdge] Unexpected salary response shape:",
          res
        );
        setSalaryError("Salary data not available for this role.");
      }
    } catch (err) {
      console.error("[HireEdge] Salary fetch error:", err);
      setSalaryError(
        err.data?.error ||
          err.message ||
          "Failed to load salary data."
      );
      setSalary(null);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleCatFilter = (cat) => {
    setFilterCat(cat);
    loadTopPaying(cat);
  };

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Salary Insights</h1>
        <p className="intel-page__subtitle">
          UK salary benchmarks, ranges, and career progression data.
        </p>
      </div>

      {/* Search for specific role */}
      <div className="intel-page__search">
        <RoleSearch
          onSelect={handleRoleSelect}
          placeholder="Search a role for salary details..."
        />
      </div>

      {/* Error for searched role */}
      {salaryError && (
        <div
          className="intel-path-error"
          style={{ marginTop: "var(--space-4)" }}
        >
          {salaryError}
        </div>
      )}

      {/* Salary card for searched role */}
      {(salary || salaryLoading) && (
        <div style={{ marginTop: "var(--space-6)" }}>
          <SalaryInsightsCard salary={salary} loading={salaryLoading} />
        </div>
      )}

      {/* Top paying table */}
      <div
        className="intel-page__result"
        style={{ marginTop: "var(--space-8)" }}
      >
        <div className="intel-top-header">
          <h3 className="intel-label">Top Paying Roles</h3>
          <div className="intel-top-filters">
            <button
              className={`intel-filter-chip ${
                !filterCat ? "intel-filter-chip--active" : ""
              }`}
              onClick={() => handleCatFilter("")}
            >
              All
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                className={`intel-filter-chip ${
                  filterCat === cat
                    ? "intel-filter-chip--active"
                    : ""
                }`}
                onClick={() => handleCatFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {topLoading ? (
          <div className="intel-table-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skel skel--lg"
                style={{
                  width: "100%",
                  height: 40,
                  marginTop: 4,
                }}
              />
            ))}
          </div>
        ) : topPaying.length > 0 ? (
          <div className="intel-table">
            <div className="intel-table__head">
              <span className="intel-table__th intel-table__th--wide">
                Role
              </span>
              <span className="intel-table__th">Category</span>
              <span className="intel-table__th">Seniority</span>
              <span className="intel-table__th intel-table__th--right">
                Avg Salary
              </span>
              <span className="intel-table__th intel-table__th--right">
                Range
              </span>
            </div>
            {topPaying.map((role, i) => (
              <button
                key={role.slug || i}
                className="intel-table__row"
                onClick={() => handleRoleSelect(role)}
              >
                <span className="intel-table__td intel-table__td--wide">
                  <span className="intel-table__rank">{i + 1}</span>
                  {role.title}
                </span>
                <span className="intel-table__td">
                  {role.category}
                </span>
                <span className="intel-table__td">
                  {role.seniority}
                </span>
                <span className="intel-table__td intel-table__td--right intel-table__td--mono">
                  £{role.salary_mean?.toLocaleString()}
                </span>
                <span className="intel-table__td intel-table__td--right intel-table__td--dim">
                  £{((role.salary_min || 0) / 1000).toFixed(0)}k–
                  {((role.salary_max || 0) / 1000).toFixed(0)}k
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="dash-empty dash-empty--compact">
            <p className="dash-empty__text">
              No roles found for this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
