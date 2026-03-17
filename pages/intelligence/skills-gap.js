// ============================================================================
// pages/intelligence/skills-gap.js
// HireEdge Frontend — Skills gap analysis page
// ============================================================================

import { useState } from "react";
import RoleSearch from "../../components/intelligence/RoleSearch";
import SkillsGapPanel from "../../components/intelligence/SkillsGapPanel";
import { analyseSkillsGap } from "../../services/intelligenceService";
import { loadCareerContext } from "../../services/dashboardService";

function getSlug(role) {
  if (!role) return null;
  if (typeof role === "string") return role;
  return role.slug || null;
}

function getTitle(role) {
  if (!role) return "";
  if (typeof role === "string")
    return role
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  return role.title || role.slug || "";
}

export default function SkillsGapPage() {
  const ctx = typeof window !== "undefined" ? loadCareerContext() : null;

  const [targetRole, setTargetRole] = useState(null);
  const [skillsInput, setSkillsInput] = useState(
    ctx?.skills?.join(", ") || ""
  );
  const [gap, setGap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyse = async () => {
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const slug = getSlug(targetRole);

    if (!slug || skills.length === 0) {
      setError("Please enter your skills and select a target role.");
      return;
    }

    setLoading(true);
    setError(null);
    setGap(null);
    try {
      const res = await analyseSkillsGap(skills, slug);
      setGap(res.data || res || null);
    } catch (err) {
      console.error("[HireEdge] Skills gap error:", err);
      setError(err.data?.error || err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = getSlug(targetRole) && skillsInput.trim() && !loading;

  return (
    <div className="intel-page">
      <div className="intel-page__header">
        <h1 className="intel-page__title">Skills Gap Analysis</h1>
        <p className="intel-page__subtitle">
          Enter your skills and target role to see exactly what you need to
          learn.
        </p>
      </div>

      {/* Input form */}
      <div className="intel-gap-form">
        <div className="intel-gap-form__field">
          <label className="intel-label">Your Skills</label>
          <textarea
            className="intel-gap-form__textarea"
            placeholder="SQL, Python, Excel, Data Visualization..."
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            rows={3}
          />
          <span className="intel-gap-form__hint">
            Comma-separated list of your current skills
          </span>
        </div>

        <div className="intel-gap-form__field">
          <label className="intel-label">Target Role</label>
          <RoleSearch
            onSelect={(r) => setTargetRole(r)}
            placeholder="Search target role..."
          />
          {targetRole && (
            <span
              className="intel-path-selected"
              style={{ marginTop: "var(--space-2)" }}
            >
              {getTitle(targetRole)}
            </span>
          )}
        </div>

        <button
          className="intel-path-btn"
          onClick={handleAnalyse}
          disabled={!canSubmit}
        >
          {loading ? "Analysing..." : "Analyse Gap"}
        </button>
      </div>

      {error && <div className="intel-path-error">{error}</div>}

      {(gap || loading) && (
        <div style={{ marginTop: "var(--space-6)" }}>
          <SkillsGapPanel gap={gap} loading={loading} />
        </div>
      )}

      {!gap && !loading && !error && (
        <div className="dash-empty" style={{ marginTop: "var(--space-8)" }}>
          <div className="dash-empty__icon">🎯</div>
          <p className="dash-empty__text">
            Enter your skills and pick a target role
          </p>
          <p className="dash-empty__hint">
            We&apos;ll show exactly which skills you have, which you&apos;re
            missing, and a prioritised learning path.
          </p>
        </div>
      )}
    </div>
  );
}
