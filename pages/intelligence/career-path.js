// ============================================================================
// pages/intelligence/career-path.js
// HireEdge Frontend — Career path finder
// ============================================================================

import "../../styles/career-path.css";

import { useState } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import CareerPathVisualizer from "../../components/intelligence/CareerPathVisualizer";
import {
  fetchShortestPath,
  fetchAllPaths,
  fetchRoleProfile,
} from "../../services/intelligenceService";
import { useRouter } from "next/router";

function getSlug(role) {
  if (!role) return null;
  if (typeof role === "string") return role;
  return role.slug || null;
}

function getTitle(role) {
  if (!role) return "";
  if (typeof role === "string")
    return role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return role.title || role.slug || "";
}

function slugToTitle(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function findTransitionMeta(fromProfile, toSlug) {
  if (!fromProfile?.transitions?.next) return null;
  const arr = Array.isArray(fromProfile.transitions.next)
    ? fromProfile.transitions.next
    : [];
  return arr.find((t) => t.to === toSlug) || null;
}

function inferDifficulty(fromProfile, toProfile, missingSkills) {
  let score = 0;

  if (
    fromProfile?.category &&
    toProfile?.category &&
    fromProfile.category !== toProfile.category
  ) {
    score += 25;
  }

  const fromLevel = fromProfile?.seniority_level || 3;
  const toLevel = toProfile?.seniority_level || 3;
  const levelDiff = toLevel - fromLevel;
  if (levelDiff > 1) score += 20;
  else if (levelDiff === 1) score += 10;
  else if (levelDiff < 0) score += 5;

  const total = Math.max(toProfile?.skills?.length || 1, 1);
  const missingRatio = missingSkills.length / total;
  score += Math.round(missingRatio * 40);

  score = Math.min(Math.max(score, 10), 90);

  let label;
  if (score <= 30) label = "easy";
  else if (score <= 50) label = "medium";
  else if (score <= 70) label = "hard";
  else label = "very_hard";

  return { score, label };
}

function inferYears(fromProfile, toProfile) {
  const fromLevel = fromProfile?.seniority_level || 3;
  const toLevel = toProfile?.seniority_level || 3;
  const diff = toLevel - fromLevel;
  if (diff <= 0) return 1;
  if (diff === 1) return 2;
  return Math.min(diff * 2, 8);
}

function enrichPath(pathSlugs, roleProfiles) {
  const enrichedSteps = [];
  const enrichedEdges = [null];

  let prevProfile = null;

  for (let i = 0; i < pathSlugs.length; i++) {
    const slug = pathSlugs[i];
    const profile = roleProfiles.get(slug);

    const salary = profile?.salary_uk?.mean || null;
    const prevSalary = prevProfile?.salary_uk?.mean || null;
    const salaryChange =
      salary != null && prevSalary != null && i > 0
        ? salary - prevSalary
        : null;

    enrichedSteps.push({
      slug,
      title: profile?.title || slugToTitle(slug),
      category: profile?.category || null,
      seniority: profile?.seniority || null,
      seniorityLevel: profile?.seniority_level || null,
      salary,
      salaryChange,
      skillsCount: profile?.skills?.length || 0,
    });

    if (i > 0) {
      const prevSlug = pathSlugs[i - 1];
      const prevProf = roleProfiles.get(prevSlug);
      const currProf = profile;

      const transitionMeta = findTransitionMeta(prevProf, slug);

      const prevSkills = new Set(prevProf?.skills || []);
      const currSkills = currProf?.skills || [];
      const missingSkills = currSkills.filter((s) => !prevSkills.has(s));

      let difficultyLabel = transitionMeta?.difficulty_label || null;
      let difficultyScore = transitionMeta?.difficulty_score || null;
      let estimatedYears = transitionMeta?.estimated_years || null;
      let salaryGrowthPct = transitionMeta?.salary_growth_pct || null;

      if (!difficultyLabel) {
        const inferred = inferDifficulty(prevProf, currProf, missingSkills);
        difficultyLabel = inferred.label;
        difficultyScore = inferred.score;
      }

      if (estimatedYears == null) {
        estimatedYears = inferYears(prevProf, currProf);
      }

      if (salaryGrowthPct == null && prevSalary && salary) {
        salaryGrowthPct = Math.round(
          ((salary - prevSalary) / prevSalary) * 100
        );
      }

      enrichedEdges.push({
        from: prevSlug,
        to: slug,
        difficulty_label: difficultyLabel,
        difficulty_score: difficultyScore,
        estimated_years: estimatedYears,
        salary_growth_pct: salaryGrowthPct,
        missingSkills,
        missingCount: missingSkills.length,
      });
    }

    prevProfile = profile;
  }

  return { enrichedSteps, enrichedEdges };
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

      const shortestData = shortest?.data || shortest;
      const allData = all?.data || all;

      if (
        !shortestData ||
        !shortestData.path ||
        shortestData.path.length === 0
      ) {
        setError(
          `No path found between "${getTitle(fromRole)}" and "${getTitle(
            toRole
          )}".`
        );
        setLoading(false);
        return;
      }

      const pathSlugs = shortestData.path;
      const roleProfiles = new Map();

      const profilePromises = pathSlugs.map(async (slug) => {
        try {
          const res = await fetchRoleProfile(slug);
          const profile = res?.data || res;
          if (profile) roleProfiles.set(slug, profile);
        } catch {
          // Continue without this profile
        }
      });

      await Promise.all(profilePromises);

      const { enrichedSteps, enrichedEdges } = enrichPath(
        pathSlugs,
        roleProfiles
      );

      const salaryStart = enrichedSteps[0]?.salary;
      const salaryEnd = enrichedSteps[enrichedSteps.length - 1]?.salary;
      const totalSalaryGrowthPct =
        salaryStart && salaryEnd
          ? Math.round(((salaryEnd - salaryStart) / salaryStart) * 100)
          : shortestData.totalSalaryGrowthPct;

      const totalYears =
        enrichedEdges
          .filter(Boolean)
          .reduce((sum, e) => sum + (e.estimated_years || 0), 0) ||
        shortestData.totalYears;

      const totalDifficulty =
        enrichedEdges
          .filter(Boolean)
          .reduce((sum, e) => sum + (e.difficulty_score || 0), 0) ||
        shortestData.totalDifficulty;

      setPathData({
        ...shortestData,
        enrichedSteps,
        enrichedEdges,
        salaryStart,
        salaryEnd,
        totalSalaryGrowthPct,
        totalYears,
        totalDifficulty,
        steps: pathSlugs.length - 1,
      });

      setAltPaths(Array.isArray(allData) ? allData.slice(1, 4) : []);
    } catch (err) {
      console.error("[HireEdge] Career path error:", err);
      setError(
        err.data?.error ||
          err.message ||
          "No path found between these roles."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (slug) => {
    router.push(`/intelligence/role-explorer?slug=${slug}`);
  };

  const canSubmit = getSlug(fromRole) && getSlug(toRole) && !loading;

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Career Path Finder</h1>
        <p className="intel-page__subtitle">
          Find the shortest route between any two roles with salary,
          difficulty, and skills analysis.
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
                  {ap.steps} steps · ~{ap.totalYears}yr · +
                  {ap.totalSalaryGrowthPct}%
                </span>
              </div>
              <div className="intel-alt-path__chain">
                {(ap.path || []).map((slug, j) => (
                  <span key={slug}>
                    {j > 0 && (
                      <span className="intel-alt-path__arrow">→</span>
                    )}
                    <button
                      className="intel-alt-path__node"
                      onClick={() => handleStepClick(slug)}
                    >
                      {slugToTitle(slug)}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!pathData && !loading && !error && (
        <div
          className="dash-empty"
          style={{ marginTop: "var(--space-8)" }}
        >
          <div className="dash-empty__icon">🗺️</div>
          <p className="dash-empty__text">
            Select a starting role and a target role
          </p>
          <p className="dash-empty__hint">
            We&apos;ll find every possible career path with salary
            progression, difficulty ratings, and skills gaps.
          </p>
        </div>
      )}
    </div>
  );
}
