// pages/forgot-password.js
// Public route — no shell (added to NO_SHELL_ROUTES in AppShell).
// Sends a Supabase password reset email.
// redirectTo points to /auth/callback which handles PASSWORD_RECOVERY event.

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
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

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Reset password — HireEdge</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.card}>
          <HireEdgeLogo />

          {sent ? (
            // ── Success state ──────────────────────────────────────────────
            <>
              <div style={styles.successIcon}>✓</div>
              <h1 style={styles.heading}>Check your inbox</h1>
              <p style={styles.sub}>
                We sent a reset link to{" "}
                <span style={styles.emailHighlight}>{email}</span>.
                <br />
                It expires in 1 hour.
              </p>
              <p style={styles.sub}>
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  style={styles.textBtn}
                >
                  try again
                </button>
                .
              </p>
              <Link href="/login" style={styles.backLink}>
                ← Back to login
              </Link>
            </>
          ) : (
            // ── Form state ─────────────────────────────────────────────────
            <>
              <h1 style={styles.heading}>Reset your password</h1>
              <p style={styles.sub}>
                Enter your account email and we'll send you a secure reset link.
              </p>

              <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                  Email address
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <Link href="/login" style={styles.backLink}>
                ← Back to login
              </Link>
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
    margin: "0 0 12px",
  },
  emailHighlight: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: 500,
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
    color: "rgba(255,255,255,0.28)",
    textDecoration: "none",
    marginTop: 24,
    fontWeight: 400,
    transition: "color 0.15s",
  },
  textBtn: {
    background: "none",
    border: "none",
    color: "rgba(165,160,255,0.85)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    padding: 0,
    textDecoration: "underline",
  },
};
