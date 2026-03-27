// ============================================================================
// pages/reset-password.js
// HireEdge — Reset Password Page (Supabase)
// Public route — no AppShell
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";

function HireEdgeLogo() {
  return (
    <div style={styles.logoRow}>
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
        <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
      </svg>
      <span style={styles.wordmark}>HireEdge</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setError("");
        }

        if (event === "SIGNED_IN" && session) {
          setReady(true);
          setError("");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
        setError("");
      } else {
        timeoutId = setTimeout(() => {
          setError("This reset link is invalid or expired. Please request a new one.");
        }, 2500);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  async function handleReset(e) {
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
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => {
      router.replace("/copilot");
    }, 1800);
  }

  return (
    <>
      <Head>
        <title>Set new password — HireEdge</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <HireEdgeLogo />

          {done ? (
            <>
              <div style={styles.successIcon}>✓</div>
              <h1 style={styles.heading}>Password updated</h1>
              <p style={styles.sub}>
                Your password has been changed. Redirecting you in…
              </p>
            </>
          ) : !ready && !error ? (
            <>
              <div style={styles.spinner} />
              <p style={styles.hint}>Verifying reset link…</p>
            </>
          ) : error && !ready ? (
            <>
              <p style={styles.error}>{error}</p>
              <Link href="/forgot-password" style={styles.backLink}>
                Request a new reset link
              </Link>
            </>
          ) : (
            <>
              <h1 style={styles.heading}>Set a new password</h1>
              <p style={styles.sub}>
                Choose a strong password for your HireEdge account.
              </p>

              <form onSubmit={handleReset} style={styles.form}>
                <label style={styles.label}>
                  New password
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Confirm new password
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    style={styles.input}
                  />
                </label>

                {error && <p style={styles.error}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#08090a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#0d0f10",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "44px 40px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 32,
  },
  wordmark: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2.5px solid rgba(255,255,255,0.08)",
    borderTop: "2.5px solid #4f46e5",
    borderRadius: "50%",
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    margin: 0,
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(15,110,86,0.12)",
    border: "1px solid rgba(15,110,86,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#0F6E56",
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.4px",
    textAlign: "center",
    margin: "0 0 8px",
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.38)",
    textAlign: "center",
    lineHeight: 1.6,
    margin: "0 0 8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
    marginTop: 8,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.03em",
    width: "100%",
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    fontSize: 13,
    color: "#f87171",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.15)",
    borderRadius: 8,
    padding: "9px 12px",
    margin: 0,
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
  },
  btn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 0",
    fontSize: 14,
    fontWeight: 600,
    width: "100%",
    letterSpacing: "0.01em",
    marginTop: 4,
  },
  backLink: {
    fontSize: 13,
    color: "#818cf8",
    textDecoration: "none",
    marginTop: 20,
    fontWeight: 500,
  },
};
