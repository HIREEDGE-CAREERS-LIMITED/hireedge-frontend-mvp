// ============================================================================
// components/layout/Topbar.js
// HireEdge Frontend — Top navigation bar
//
// CHANGES — Phase 3A:
//   Removed non-functional search and notifications buttons.
// ============================================================================

import { useRouter } from "next/router";
import { NAV_SECTIONS } from "../../config/navigation";

function getBreadcrumbs(pathname) {
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
      <button
        className="topbar__action-btn topbar__mobile-menu"
        onClick={onMobileMenuClick}
        aria-label="Open menu"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M3 5h12M3 9h12M3 13h12" />
        </svg>
      </button>

      <div className="topbar__breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            {i > 0 && <span className="topbar__breadcrumb-sep">/</span>}
            {crumb.current ? (
              <span className="topbar__breadcrumb-current">{crumb.label}</span>
            ) : (
              <a href={crumb.href} style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__actions">
        <span className="topbar__plan-badge">
          {planLabels[plan] || "Free"}
        </span>
      </div>
    </header>
  );
}
