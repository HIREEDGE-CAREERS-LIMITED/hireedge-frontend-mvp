// ============================================================================
// components/layout/AppShell.js
// HireEdge Frontend — App Shell
//
// Root layout component. Wraps every page with Sidebar + Topbar + Content.
// Handles sidebar collapse state and mobile responsive behaviour.
//
// CHANGE: Added "/" to NO_SHELL_ROUTES so the marketing landing page
// renders full-viewport without sidebar/topbar.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Routes that render without the app shell
// "/" = marketing landing page (full viewport, own nav/footer)
// "/login", "/signup" = auth pages
const NO_SHELL_ROUTES = ["/", "/login", "/signup"];

export default function AppShell({ children }) {
  const router = useRouter();
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

  // No shell for marketing + auth pages
  if (NO_SHELL_ROUTES.includes(router.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="app-shell__main">
        <Topbar
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <main className={`app-shell__content ${router.pathname === "/copilot" ? "app-shell__content--copilot" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
