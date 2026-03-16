// ============================================================================
// pages/intelligence/index.js
// HireEdge Frontend — Career Intelligence hub
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RoleSearch from "../../components/intelligence/RoleSearch";
import { fetchCategories, fetchCategoryIntelligence } from "../../services/intelligenceService";

export default function IntelligenceIndexPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const handleRoleSelect = (role) => {
    router.push(`/intelligence/role-explorer?slug=${role.slug}`);
  };

  const handleCategoryClick = async (cat) => {
    setSelectedCat(cat);
    setLoading(true);
    try {
      const res = await fetchCategoryIntelligence(cat);
      setCatData(res.data);
    } catch { setCatData(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Career Intelligence</h1>
        <p className="intel-page__subtitle">Explore 1,228 roles across 27 categories. Search any role to see skills, salary, and career paths.</p>
      </div>

      {/* Search */}
      <div className="intel-page__search">
        <RoleSearch onSelect={handleRoleSelect} placeholder="Search any role — data analyst, product manager, UX designer..." />
      </div>

      {/* Quick links */}
      <div className="intel-page__nav">
        <a href="/intelligence/career-path" className="intel-nav-card">
          <span className="intel-nav-card__icon">🗺️</span>
          <span className="intel-nav-card__label">Career Paths</span>
          <span className="intel-nav-card__desc">Find routes between any two roles</span>
        </a>
        <a href="/intelligence/salary-insights" className="intel-nav-card">
          <span className="intel-nav-card__icon">💰</span>
          <span className="intel-nav-card__label">Salary Insights</span>
          <span className="intel-nav-card__desc">Benchmarks, ranges, and progression</span>
        </a>
        <a href="/intelligence/skills-gap" className="intel-nav-card">
          <span className="intel-nav-card__icon">🎯</span>
          <span className="intel-nav-card__label">Skills Gap</span>
          <span className="intel-nav-card__desc">Analyse what you need to learn</span>
        </a>
      </div>

      {/* Categories grid */}
      <div className="intel-page__categories">
        <h3 className="intel-label">Browse by Category</h3>
        <div className="intel-cat-grid">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`intel-cat-chip ${selectedCat === cat ? "intel-cat-chip--active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Category detail */}
      {selectedCat && (
        <div className="intel-page__cat-detail">
          {loading ? (
            <div className="intel-page__cat-loading">
              <span className="input-bar__spinner" style={{ width: 20, height: 20 }} />
            </div>
          ) : catData ? (
            <div className="intel-cat-detail">
              <div className="intel-cat-detail__header">
                <h3>{selectedCat}</h3>
                <span className="intel-badge">{catData.total_roles} roles</span>
                {catData.salary_stats?.mean && (
                  <span className="intel-cat-detail__salary">Avg £{catData.salary_stats.mean.toLocaleString()}</span>
                )}
              </div>
              {catData.top_skills?.length > 0 && (
                <div className="intel-cat-detail__skills">
                  <span className="intel-sub-label">Top skills</span>
                  <div className="intel-tag-row">
                    {catData.top_skills.slice(0, 10).map((s) => (
                      <span key={s.skill} className="intel-tag">{s.skill} <em>({s.pct}%)</em></span>
                    ))}
                  </div>
                </div>
              )}
              {catData.roles?.length > 0 && (
                <div className="intel-cat-detail__roles">
                  <span className="intel-sub-label">Roles</span>
                  <div className="intel-cat-roles-grid">
                    {catData.roles.slice(0, 12).map((r) => (
                      <button key={r.slug} className="intel-cat-role" onClick={() => router.push(`/intelligence/role-explorer?slug=${r.slug}`)}>
                        <span className="intel-cat-role__title">{r.title}</span>
                        <span className="intel-cat-role__meta">{r.seniority}{r.salary_mean ? ` · £${r.salary_mean.toLocaleString()}` : ""}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
