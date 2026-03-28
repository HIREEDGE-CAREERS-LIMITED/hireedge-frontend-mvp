// ============================================================================
// pages/account.js
// HireEdge Frontend — Account settings page
//
// CHANGES from previous version:
//   1. Removed billingService import — replaced with useAuth
//   2. Real email and display name derived from auth user
//   3. Real plan from AuthContext
//   4. Added Security section with change password form
// ============================================================================

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const PLAN_LABELS = {
  free: "Free",
  career_pack: "Career Pack",
  pro: "Pro",
  elite: "Elite",
};

const PLAN_DETAILS = {
  free: { copilot_per_day: 10, tools_per_day: 3, premium_tools: false, career_pack: false },
  career_pack: { copilot_per_day: 10, tools_per_day: 10, premium_tools: false, career_pack: true },
  pro: { copilot_per_day: 100, tools_per_day: Infinity, premium_tools: true, career_pack: true },
  elite: { copilot_per_day: Infinity, tools_per_day: Infinity, premium_tools: true, career_pack: true },
};

export default function AccountPage() {
  const { user, plan } = useAuth();

  const email = user?.email || "—";
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "—";
  const planLabel = PLAN_LABELS[plan] || "Free";
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;

  return (
    <div style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Account
        </h1>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-tertiary)",
            marginTop: "var(--space-2)",
          }}
        >
          Manage your profile, plan, and preferences.
        </p>
      </div>

      <AccountSection title="Profile" icon="👤">
        <AccountRow label="Name" value={displayName} />
        <AccountRow label="Email" value={email} />
        <AccountRow label="Current Role" value="—" hint="Used by Copilot and tools" />
        <AccountRow label="Skills" value="—" hint="Comma-separated list" />
        <AccountRow label="Years of Experience" value="—" />
      </AccountSection>

      <AccountSection title="Plan" icon="✦">
        <AccountRow label="Current Plan" value={planLabel} accent />
        <AccountRow
          label="Copilot Limit"
          value={planInfo.copilot_per_day === Infinity ? "Unlimited" : `${planInfo.copilot_per_day} / day`}
        />
        <AccountRow
          label="Tools Limit"
          value={planInfo.tools_per_day === Infinity ? "Unlimited" : `${planInfo.tools_per_day} / day`}
        />
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
              textDecoration: "none",
            }}
          >
            {plan === "free" ? "Upgrade Plan" : "Manage Plan"}
          </a>
        </div>
      </AccountSection>

      <AccountSection title="Security" icon="🔒">
        <AccountRow label="Password" value="••••••••" />
        <ChangePasswordForm />
      </AccountSection>

      <AccountSection title="Preferences" icon="⚙️">
        <AccountRow label="Theme" value="Dark" hint="Only dark mode available in MVP" />
        <AccountRow label="Sidebar" value="Expanded" hint="Toggle via sidebar chevron" />
        <AccountRow label="Notifications" value="Off" hint="Coming soon" />
      </AccountSection>

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

function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess(false);
    setLoading(false);
  }

  function handleOpen() {
    reset();
    setOpen(true);
  }

  function handleCancel() {
    reset();
    setOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setPassword("");
      setConfirm("");
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    }
  }

  if (!open) {
    return (
      <div style={{ marginTop: "var(--space-3)" }}>
        <button
          onClick={handleOpen}
          style={{
            padding: "var(--space-2) var(--space-5)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-secondary)",
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-sm)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            cursor: "pointer",
          }}
        >
          Change password
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "var(--space-3)",
        padding: "var(--space-4)",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {success ? (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "#34d399",
            margin: 0,
          }}
        >
          ✓ Password updated successfully.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-tertiary)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              New password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-tertiary)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              Confirm new password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "#f87171",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "var(--space-2) var(--space-4)",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: "var(--weight-semibold)",
                fontSize: "var(--text-sm)",
                borderRadius: "var(--radius-lg)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Updating…" : "Update password"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "var(--space-2) var(--space-4)",
                background: "transparent",
                color: "var(--text-tertiary)",
                fontWeight: "var(--weight-medium)",
                fontSize: "var(--text-sm)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function AccountSection({ title, icon, children }) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-5)",
        marginBottom: "var(--space-4)",
      }}
    >
      <h3
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--text-primary)",
          marginBottom: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>{children}</div>
    </div>
  );
}

function AccountRow({ label, value, hint, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-2) 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>{label}</span>
        {hint && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              marginLeft: "var(--space-2)",
            }}
          >
            {hint}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-medium)",
          color: accent ? "var(--accent-400)" : "var(--text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
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
