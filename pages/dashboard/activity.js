// ============================================================================
// pages/dashboard/activity.js
// HireEdge Frontend — Activity page
// ============================================================================

import { useState, useEffect } from "react";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import { fetchActivity, getLocalActivity } from "../../services/dashboardService";

export default function ActivityPage() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localActivity = getLocalActivity();
    fetchActivity(localActivity)
      .then((res) => setActivity(res.data))
      .catch(() => setActivity({ timeline: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--weight-bold)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          Activity
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-tertiary)",
          marginTop: "var(--space-2)",
        }}>
          Your recent activity across HireEdge.
        </p>
      </div>
      <ActivityTimeline activity={activity} loading={loading} />
    </div>
  );
}
