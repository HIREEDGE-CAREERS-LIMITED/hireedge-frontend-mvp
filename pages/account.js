// ============================================================================
// pages/account.js
// HireEdge Frontend — Account settings page
// ============================================================================

import { useState, useEffect } from "react";
import { getCurrentPlan, getPlanDetails } from "../services/billingService";

export default function AccountPage() {
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    setPlan(getCurrentPlan());
  }, []);

  const planInfo = getPlanDetails(plan);

  return (
    <div style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--weight-bold)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          Account
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-tertiary)",
          marginTop: "var(--space-2)",
        }}>
          Manage your profile, plan, and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <AccountSection title="Profile" icon="👤">
        <AccountRow label="Name" value="—" hint="Set your display name" />
        <AccountRow label="Email" value="—" hint="Your login email" />
        <AccountRow label="Current Role" value="—" hint="Used by Copilot and tools" />
        <AccountRow label="Skills" value="—" hint="Comma-separated list" />
        <AccountRow label="Years of Experience" value="—" />
      </AccountSection>

      {/* Plan Section */}
      <AccountSection title="Plan" icon="✦">
        <AccountRow label="Current Plan" value={planInfo.name} accent />
        <AccountRow label="Copilot Limit" value={`${planInfo.copilot_per_day === Infinity ? "Unlimited" : planInfo.copilot_per_day} / day`} />
        <AccountRow label="Tools Limit" value={`${planInfo.tools_per_day === Infinity ? "Unlimited" : planInfo.tools_per_day} / day`} />
        <AccountRow label="Premium Tools" value={planInfo.premium_tools ? "Included" : "Not included"} />
        <AccountRow label="Career Pack" value={planInfo.career_pack ? "Included" : "Not included"} />
        <div style={{ marginTop: "var(--space-4)" }}>
          <a
            href="/billing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-5)",
              background: "var(--accent-500)",
              color: "var(--ink-900)",
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-sm)",
              borderRadius: "var(--radius-lg)",
              transition: "all var(--duration-fast)",
            }}
          >
            {plan === "free" ? "Upgrade Plan" : "Manage Plan"}
          </a>
        </div>
      </AccountSection>

      {/* Preferences Section */}
      <AccountSection title="Preferences" icon="⚙️">
        <AccountRow label="Theme" value="Dark" hint="Only dark mode available in MVP" />
        <AccountRow label="Sidebar" value="Expanded" hint="Toggle via sidebar chevron" />
        <AccountRow label="Notifications" value="Off" hint="Coming soon" />
      </AccountSection>

      {/* Data Section */}
      <AccountSection title="Data" icon="📦">
        <AccountRow label="Saved Roles" value={_getSavedCount()} />
        <AccountRow label="Conversation Context" value="Stored in session" />
        <div style={{ marginTop: "var(--space-4)" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && confirm("Clear all local data? This cannot be undone.")) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }
            }}
            style={{
              padding: "var(--space-2) var(--space-5)",
              background: "rgba(239,68,68,0.08)",
              color: "var(--red-400)",
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-sm)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(239,68,68,0.15)",
              cursor: "pointer",
            }}
          >
            Clear All Local Data
          </button>
        </div>
      </AccountSection>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────

function AccountSection({ title, icon, children }) {
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-5)",
      marginBottom: "var(--space-4)",
    }}>
      <h3 style={{
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-semibold)",
        color: "var(--text-primary)",
        marginBottom: "var(--space-4)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
      }}>
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {children}
      </div>
    </div>
  );
}

function AccountRow({ label, value, hint, accent }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "var(--space-2) 0",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>{label}</span>
        {hint && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
            {hint}
          </span>
        )}
      </div>
      <span style={{
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        color: accent ? "var(--accent-400)" : "var(--text-primary)",
        fontFamily: "var(--font-mono)",
      }}>
        {value}
      </span>
    </div>
  );
}

function _getSavedCount() {
  if (typeof window === "undefined") return "0";
  try {
    const raw = localStorage.getItem("hireedge_saved_roles");
    return raw ? String(JSON.parse(raw).length) : "0";
  } catch {
    return "0";
  }
}
