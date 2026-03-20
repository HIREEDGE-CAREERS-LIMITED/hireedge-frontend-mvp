// ============================================================================
// pages/dashboard/index.js
// HireEdge Frontend — Dashboard home page
// ============================================================================

import { useState, useEffect } from "react";
import {
  fetchProfile,
  fetchSavedRoles,
  fetchRecommendations,
  fetchActivity,
  loadCareerContext,
  getSavedRoleSlugs,
  getLocalActivity,
} from "../../services/dashboardService";
import ProfileSummary      from "../../components/dashboard/ProfileSummary";
import SavedRolesList      from "../../components/dashboard/SavedRolesList";
import RecommendationFeed  from "../../components/dashboard/RecommendationFeed";
import ActivityTimeline    from "../../components/dashboard/ActivityTimeline";
import QuickActionCard     from "../../components/dashboard/QuickActionCard";

export default function DashboardPage() {
  const [profile,         setProfile]         = useState(null);
  const [savedRoles,      setSavedRoles]      = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [activity,        setActivity]        = useState(null);
  const [loading, setLoading] = useState({ profile: true, saved: true, recs: true, activity: true });
  const [careerCtx, setCareerCtx] = useState(null);

  useEffect(() => {
    const ctx = loadCareerContext();

    if (!ctx || !ctx.role) {
      setLoading({ profile: false, saved: false, recs: false, activity: false });
      return;
    }

    setCareerCtx(ctx);
    const { role, skills, yearsExp, target } = ctx;

    fetchProfile({ role, skills, yearsExp, target })
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading((p) => ({ ...p, profile: false })));

    const slugs = getSavedRoleSlugs();
    if (slugs.length > 0) {
      fetchSavedRoles({ roles: slugs, current: role, skills })
        .then((res) => setSavedRoles(res.data?.roles || []))
        .catch(() => {})
        .finally(() => setLoading((p) => ({ ...p, saved: false })));
    } else {
      setSavedRoles([]);
      setLoading((p) => ({ ...p, saved: false }));
    }

    fetchRecommendations({ role, skills, target, yearsExp })
      .then((res) => setRecommendations(res.data))
      .catch(() => {})
      .finally(() => setLoading((p) => ({ ...p, recs: false })));

    const localActivity = getLocalActivity();
    fetchActivity(localActivity)
      .then((res) => setActivity(res.data))
      .catch(() => {})
      .finally(() => setLoading((p) => ({ ...p, activity: false })));
  }, []);

  // No career context → onboarding
  if (!careerCtx && !loading.profile) {
    return (
      <div className="dash">
        <div className="dash__header">
          <h1 className="dash__title">Dashboard</h1>
        </div>
        <div className="dash__onboarding">
          <div className="dash__onboarding-icon shimmer-text">✦</div>
          <h2 className="dash__onboarding-title">Welcome to HireEdge</h2>
          {/* CHANGED: "Copilot" → "EDGEX" in onboarding copy */}
          <p className="dash__onboarding-text">
            Start by telling EDGEX about your current role and skills.
            Your personalised dashboard will build itself as you explore.
          </p>
          {/* CHANGED: "Open Copilot" → "Open EDGEX" */}
          <a href="/copilot" className="dash__onboarding-cta">
            Open EDGEX
            <span>→</span>
          </a>
        </div>
        <QuickActionCard />
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash__header">
        <h1 className="dash__title">Dashboard</h1>
        {careerCtx?.role && (
          <span className="dash__subtitle">
            {careerCtx.role.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            {careerCtx.target && ` → ${careerCtx.target.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`}
          </span>
        )}
      </div>

      <ProfileSummary
        profile={profile?.profile_summary}
        salary={profile?.salary_snapshot}
        readiness={profile?.readiness}
      />

      <QuickActionCard />

      <div className="dash__grid">
        <div className="dash__col">
          <RecommendationFeed recommendations={recommendations} loading={loading.recs} />
        </div>
        <div className="dash__col dash__col--narrow">
          <SavedRolesList roles={savedRoles} loading={loading.saved} />
          <ActivityTimeline activity={activity} loading={loading.activity} />
        </div>
      </div>
    </div>
  );
}
