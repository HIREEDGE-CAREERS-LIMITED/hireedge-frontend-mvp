// pages/login.js
// CREATE if it doesn't exist yet, UPDATE if it does.
// HireEdge branded login page — public route, escapes AppShell via NO_SHELL_ROUTES.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../lib/supabase";

function HireEdgeLogo({ size = 28 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
        <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
      </svg>
      <span style={{ fontSize: size * 0.55, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
        HireEdge
      </span>
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — skip straight to app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/copilot");
    });
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace("/copilot");
    }
  }

  return (
    <>
      <Head>
        <title>Log in — HireEdge</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <HireEdgeLogo size={32} />
          </div>

          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.sub}>Log in to your HireEdge account.</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link href="/signup" style={styles.link}>Sign up free</Link>
          </p>
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
    maxWidth: 400,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "40px 36px",
  },
  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 28,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.4px",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    margin: "0 0 28px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    fontSize: 13,
    color: "#f87171",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: 7,
    padding: "9px 12px",
    margin: 0,
  },
  btn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "12px 0",
    fontSize: 15,
    fontWeight: 600,
    width: "100%",
    transition: "background 0.15s",
    marginTop: 4,
  },
  footer: {
    fontSize: 13,
    color: "rgba(255,255,255,0.38)",
    textAlign: "center",
    marginTop: 24,
  },
  link: {
    color: "#818cf8",
    textDecoration: "none",
    fontWeight: 500,
  },
};
