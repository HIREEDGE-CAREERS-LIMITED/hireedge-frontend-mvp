// ============================================================================
// pages/dashboard/saved-roles.js
// HireEdge Frontend — Saved Roles page
// ============================================================================

import { useState, useEffect } from "react";
import SavedRolesList from "../../components/dashboard/SavedRolesList";
import { getSavedRoleSlugs, fetchSavedRoles, loadCareerContext } from "../../services/dashboardService";

export default function SavedRolesPage() {
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctx = loadCareerContext();
    const slugs = getSavedRoleSlugs();

    if (slugs.length === 0) {
      setRoles([]);
      setLoading(false);
      return;
    }

    fetchSavedRoles({
      roles: slugs,
      current: ctx?.role,
      skills: ctx?.skills,
    })
      .then((res) => setRoles(res.data?.roles || []))
      .catch(() => setRoles([]))
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
          Saved Roles
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-tertiary)",
          marginTop: "var(--space-2)",
        }}>
          Roles you&apos;ve saved for tracking.
        </p>
      </div>
      <SavedRolesList roles={roles} loading={loading} />
    </div>
  );
}
