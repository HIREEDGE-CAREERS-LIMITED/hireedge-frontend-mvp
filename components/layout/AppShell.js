// ============================================================================
// components/layout/AppShell.js
// HireEdge Frontend — App Shell
//
// CHANGES:
//   - Added useAuth integration
//   - Added protected route logic + redirect
//   - Passes user, plan, and onSignOut to Sidebar
//   - Passes plan to Topbar
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../contexts/AuthContext";

// Routes that render without the app shell
const NO_SHELL_ROUTES = ["/", "/login", "/signup"];

// Routes that require a session
const PROTECTED_ROUTES = [
  "/copilot",
  "/dashboard",
  "/account",
  "/billing",
  "/tools",
  "/intelligence",
  "/career-pack",
];

function isProtected(pathname) {
  return PROTECTED_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, plan, loading, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router]);

  // Load sidebar preference from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("hireedge_sidebar_collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("hireedge_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  // No shell for marketing + auth pages
  if (NO_SHELL_ROUTES.includes(router.pathname)) {
    return <>{children}</>;
  }

  // Suppress render while auth resolves on protected routes
  if (loading && isProtected(router.pathname)) {
    return null;
  }

  // Redirect unauthenticated users away from protected routes
  if (!loading && !user && isProtected(router.pathname)) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        user={user}
        plan={plan}
        onSignOut={handleSignOut}
      />
      <div className="app-shell__main">
        <Topbar
          onMobileMenuClick={() => setMobileOpen(true)}
          plan={plan}
        />
        <main
          className={`app-shell__content ${
            router.pathname === "/copilot" ? "app-shell__content--copilot" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
