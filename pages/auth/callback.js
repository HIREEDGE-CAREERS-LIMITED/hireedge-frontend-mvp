// ============================================================================
// pages/auth/callback.js
// Handles Supabase OAuth and password recovery redirects
// ============================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

function HireEdgeLogo({ size = 22 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
        <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
      </svg>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
        HireEdge
      </span>
    </span>
  );
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let handled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (handled) return;

        if (event === "PASSWORD_RECOVERY") {
          handled = true;
          router.replace("/reset-password");
          return;
        }

        if (event === "SIGNED_IN" && session) {
          handled = true;
          router.replace("/copilot");
        }
      }
    );

    // Fallback for already-established session after redirect
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (handled) return;

      if (error) {
        setError("Something went wrong. Please try again.");
        return;
      }

      // If this callback URL is being used for password recovery, wait for the auth event
      const href = typeof window !== "undefined" ? window.location.href : "";
      const looksLikeRecovery =
        href.includes("type=recovery") ||
        href.includes("recovery_token") ||
        href.includes("access_token");

      if (!looksLikeRecovery && session) {
        handled = true;
        router.replace("/copilot");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <>
      <Head>
        <title>HireEdge</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <HireEdgeLogo />
          </div>

          {error ? (
            <>
              <p style={styles.errorText}>{error}</p>
              <Link href="/login" style={styles.link}>
                Back to login
              </Link>
            </>
          ) : (
            <>
              <div style={styles.spinner} />
              <p style={styles.hint}>Signing you in…</p>
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
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    background: "#0d0f10",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "44px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2.5px solid rgba(255,255,255,0.08)",
    borderTop: "2.5px solid #4f46e5",
    borderRadius: "50%",
  },
  hint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    margin: 0,
  },
  errorText: {
    fontSize: 14,
    color: "#f87171",
    textAlign: "center",
    margin: 0,
  },
  link: {
    fontSize: 13,
    color: "#818cf8",
    textDecoration: "none",
    fontWeight: 500,
  },
};
