// pages/login.js
// UPDATE — Phase 2: premium UI, Google OAuth, forgot password link.
// Auth logic unchanged. Supabase calls unchanged. Redirects unchanged.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);

  // Already logged in — skip straight to app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/copilot");
    });
  }, []);

  // Unchanged
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

  // Google OAuth — added in Phase 2
  async function handleGoogleLogin() {
    setError("");
    setGLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // Supabase redirects the browser — no further action needed here
  }

  return (
    <>
      <Head>
        <title>Log in — HireEdge</title>
      </Head>
      <div style={styles.page}>
        <div style={styles.card}>

          <HireEdgeLogo />

          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.sub}>Log in to your HireEdge account.</p>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={gLoading}
            style={{
              ...styles.googleBtn,
              opacity: gLoading ? 0.7 : 1,
              cursor: gLoading ? "not-allowed" : "pointer",
            }}
          >
            <GoogleIcon />
            {gLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* OR divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Email form — logic unchanged */}
          <form onSubmit={handleLogin} style={styles.form}>
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

            <label style={styles.label}>
              <span style={styles.passwordRow}>
                Password
                <Link href="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
    marginBottom: 28,
  },
  wordmark: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.4px",
    textAlign: "center",
    margin: "0 0 6px",
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.38)",
    textAlign: "center",
    margin: "0 0 24px",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    background: "#fff",
    color: "#111",
    border: "none",
    borderRadius: 10,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.07)",
  },
  dividerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.22)",
    letterSpacing: "0.05em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: "100%",
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
  passwordRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  forgotLink: {
    fontSize: 12,
    color: "rgba(165,160,255,0.7)",
    textDecoration: "none",
    fontWeight: 400,
    letterSpacing: 0,
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
  footer: {
    fontSize: 13,
    color: "rgba(255,255,255,0.28)",
    textAlign: "center",
    marginTop: 24,
  },
  link: {
    color: "rgba(165,160,255,0.85)",
    textDecoration: "none",
    fontWeight: 500,
  },
};
