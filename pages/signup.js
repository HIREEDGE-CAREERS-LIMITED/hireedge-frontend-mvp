// ============================================================================
// pages/signup.js
// HireEdge — Signup Page (Supabase)
// Public route — no AppShell
// ============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../lib/supabase";

function HireEdgeLogo({ size = 28 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
        <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
      </svg>
      <span style={{ fontSize: size * 0.55, fontWeight: 700, color: "#fff" }}>
        HireEdge
      </span>
    </span>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/copilot");
    });
  }, [router]);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { plan: "free" },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Email confirm OFF → session available immediately
    if (data.session) {
      router.replace("/copilot");
    } else {
      setError("Signup succeeded. Please log in.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Create account — HireEdge</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <HireEdgeLogo size={32} />
          </div>

          <h1 style={styles.heading}>Create your account</h1>
          <p style={styles.sub}>
            Start using EDGEX — free, no credit card.
          </p>

          <form onSubmit={handleSignup} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                required
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
                minLength={6}
                placeholder="Minimum 6 characters"
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
                ...styles.button,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>
              Log in
            </Link>
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
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 36,
  },
  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 24,
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  sub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  label: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },
  input: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  button: {
    marginTop: 6,
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    fontSize: 13,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  link: {
    color: "#818cf8",
    textDecoration: "none",
  },
};
