// ============================================================================
// components/layout/Topbar.js
// HireEdge Frontend — Top navigation bar
// ============================================================================

import { useRouter } from "next/router";
import { NAV_SECTIONS } from "../../config/navigation";

// Map route paths to readable breadcrumb labels
function getBreadcrumbs(pathname) {
  // Find matching section
  for (const section of NAV_SECTIONS) {
    if (pathname === section.href) {
      return [{ label: section.label, current: true }];
    }
    if (section.children) {
      for (const child of section.children) {
        if (pathname === child.href) {
          return [
            { label: section.label, href: section.href },
            { label: child.label, current: true },
          ];
        }
      }
    }
  }

  // Fallback: derive from path
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    current: i === segments.length - 1,
    href: i < segments.length - 1 ? "/" + segments.slice(0, i + 1).join("/") : undefined,
  }));
}

export default function Topbar({ onMobileMenuClick, plan }) {
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(router.pathname);

  const planLabels = {
    free: "Free",
    career_pack: "Career Pack",
    pro: "Pro",
    elite: "Elite",
  };

  return (
    <header className="topbar">
      {/* Mobile menu button */}
      <button className="topbar__action-btn topbar__mobile-menu" onClick={onMobileMenuClick} aria-label="Open menu">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 5h12M3 9h12M3 13h12"/>
        </svg>
      </button>

      {/* Breadcrumbs */}
      <div className="topbar__breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            {i > 0 && <span className="topbar__breadcrumb-sep">/</span>}
            {crumb.current ? (
              <span className="topbar__breadcrumb-current">{crumb.label}</span>
            ) : (
              <a href={crumb.href} style={{ color: "var(--text-tertiary)" }}>{crumb.label}</a>
            )}
          </span>
        ))}
      </div>

      <div className="topbar__spacer" />

      {/* Actions */}
      <div className="topbar__actions">
        {/* Plan badge */}
        <span className="topbar__plan-badge">
          {planLabels[plan] || "Free"}
        </span>

        {/* Command palette trigger (placeholder) */}
        <button className="topbar__action-btn" aria-label="Search" title="Search (⌘K)">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="5.5"/><path d="M12 12l4 4"/>
          </svg>
        </button>

        {/* Notifications placeholder */}
        <button className="topbar__action-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 7a4.5 4.5 0 019 0c0 5 2 6.5 2 6.5H2.5S4.5 12 4.5 7z"/>
            <path d="M7 13.5a2 2 0 004 0"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
