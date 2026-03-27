// ============================================================================
// components/layout/Sidebar.js
// HireEdge Frontend — Sidebar navigation
// ============================================================================

import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { NAV_SECTIONS, ACCOUNT_NAV } from "../../config/navigation";
import EDGEXIcon from "../brand/EDGEXIcon";
import HireEdgeLogo from "../brand/HireEdgeLogo";

const PLAN_LABELS = {
  free: "Free",
  career_pack: "Career Pack",
  pro: "Pro",
  elite: "Elite",
};

const ICONS = {
  spark: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5"/><rect x="10.5" y="1.5" width="6" height="6" rx="1.5"/>
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5"/><rect x="10.5" y="10.5" width="6" height="6" rx="1.5"/>
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 16V9M9 9C9 6 7 4.5 5 4.5S1.5 6 1.5 8c0 1.5 1 2.8 2.5 3.2M9 9c0-3 2-4.5 4-4.5s3.5 1.5 3.5 3.5c0 1.5-1 2.8-2.5 3.2"/>
      <path d="M5 4.5C5 3 6 1.5 7.5 1.5S9 2 9 3M13 4.5c0-1.5-1-3-2.5-3S9 2 9 3"/>
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z"/>
    </svg>
  ),
  package: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5.5L9 2l7 3.5M2 5.5v7L9 16l7-3.5v-7M2 5.5L9 9m0 7V9m0 0l7-3.5"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3.5"/><path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>
    </svg>
  ),
  "credit-card": (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="15" height="11" rx="2"/><path d="M1.5 7.5h15"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l5 5-5 5"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9h9M12 5.5l3.5 3.5L12 12.5"/>
      <path d="M10 3H3.5A1.5 1.5 0 002 4.5v9A1.5 1.5 0 003.5 15H10"/>
    </svg>
  ),
};

function getIcon(name) {
  return ICONS[name] || ICONS.grid;
}

function EDGEXNavIcon() {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18 }}>
      <EDGEXIcon size={16} state="header" color="currentColor" />
    </span>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  user,
  plan,
  onSignOut,
}) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({});

  const rawName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const displayName = rawName;
  const avatarLetter = rawName?.[0]?.toUpperCase() || "U";
  const planLabel = PLAN_LABELS[plan] || "Free";

  const isActive = (href) => router.pathname === href || router.asPath === href;
  const isParentActive = (section) => {
    if (isActive(section.href)) return true;
    return section.children?.some((c) => isActive(c.href));
  };

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNavIcon = (section) => {
    if (section.id === "edgex") {
      return <EDGEXNavIcon />;
    }
    return <span className="sidebar__icon">{getIcon(section.icon)}</span>;
  };

  const sidebarClass = [
    "sidebar",
    collapsed && "sidebar--collapsed",
    mobileOpen && "sidebar--open",
  ].filter(Boolean).join(" ");

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay--visible" : ""}`}
        onClick={onMobileClose}
      />

      <aside className={sidebarClass}>
        <div className="sidebar__header">
          <Link href="/copilot" className="sidebar__logo">
            <HireEdgeLogo size={collapsed ? 24 : 28} interactive />
            {!collapsed && <span>HireEdge</span>}
          </Link>
          {!collapsed && (
            <button className="sidebar__toggle" onClick={onToggle} aria-label="Collapse sidebar">
              <span className="sidebar__icon">{getIcon("chevron")}</span>
            </button>
          )}
          {collapsed && (
            <button className="sidebar__toggle" onClick={onToggle} aria-label="Expand sidebar" style={{ marginLeft: 0 }}>
              <span className="sidebar__icon" style={{ transform: "rotate(180deg)" }}>{getIcon("chevron")}</span>
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="sidebar__section">
              <Link
                href={section.href}
                className={[
                  "sidebar__link",
                  section.primary && "sidebar__link--primary",
                  isParentActive(section) && !section.primary && "sidebar__link--active",
                ].filter(Boolean).join(" ")}
                title={collapsed ? section.label : undefined}
              >
                {renderNavIcon(section)}
                {!collapsed && <span>{section.label}</span>}
                {!collapsed && section.badge && (
                  <span className="sidebar__badge">{section.badge}</span>
                )}
                {!collapsed && section.children && (
                  <button
                    className="sidebar__toggle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSection(section.id);
                    }}
                    style={{
                      transform: expandedSections[section.id] ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 150ms",
                    }}
                  >
                    <span className="sidebar__icon">{getIcon("chevron")}</span>
                  </button>
                )}
              </Link>

              {!collapsed && section.children && (isParentActive(section) || expandedSections[section.id]) && (
                <div className="sidebar__children">
                  {section.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={[
                        "sidebar__child-link",
                        isActive(child.href) && "sidebar__child-link--active",
                      ].filter(Boolean).join(" ")}
                    >
                      <span>{child.label}</span>
                      {child.plan === "pro" && (
                        <span className="sidebar__badge">PRO</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!collapsed && <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "var(--space-3) 0" }} />}

          {ACCOUNT_NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "sidebar__link",
                isActive(item.href) && "sidebar__link--active",
              ].filter(Boolean).join(" ")}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__icon">{getIcon(item.icon)}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="sidebar__footer">
            <div className="sidebar__user">
              <div className="sidebar__avatar">{avatarLetter}</div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{displayName}</div>
                <div className="sidebar__user-plan">{planLabel} plan</div>
              </div>
            </div>
            <button
              onClick={() => onSignOut?.()}
              title="Log out"
              className="sidebar__link"
              style={{
                width: "100%",
                marginTop: "var(--space-1)",
                opacity: 0.6,
                fontSize: "var(--text-xs)",
              }}
            >
              <span className="sidebar__icon">{getIcon("logout")}</span>
              <span>Log out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
