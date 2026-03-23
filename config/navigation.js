// ============================================================================
// config/navigation.js
// HireEdge Frontend — Navigation configuration
//
// Maps every product area to its route, icon, label, and required plan.
// The Sidebar and Topbar read from this single source of truth.
// ============================================================================
export const NAV_SECTIONS = [
  {
    id: "edgex",
    label: "EDGEX",
    icon: "spark",
    href: "/copilot",
    description: "AI career intelligence",
    plan: "free",
    primary: true,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "grid",
    href: "/dashboard",
    description: "Your career overview",
    plan: "free",
    children: [
      { id: "dashboard-home", label: "Overview",    href: "/dashboard",             icon: "grid"     },
      { id: "saved-roles",    label: "Saved Roles", href: "/dashboard/saved-roles", icon: "bookmark" },
      { id: "activity",       label: "Activity",    href: "/dashboard/activity",    icon: "clock"    },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: "brain",
    href: "/intelligence",
    description: "Career data & insights",
    plan: "free",
    children: [
      { id: "role-explorer", label: "Role Explorer", href: "/intelligence",              icon: "search"   },
      { id: "salary",        label: "Salary Intel",  href: "/intelligence/salary",       icon: "currency" },
      { id: "skills-gap",    label: "Skills Gap",    href: "/intelligence/skills-gap",   icon: "target"   },
      { id: "career-graph",  label: "Career Graph",  href: "/intelligence/graph",        icon: "network"  },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "wrench",
    href: "/tools",
    description: "Career preparation tools",
    plan: "free",
    children: [
      { id: "roadmap",   label: "Roadmap",   href: "/tools/roadmap",   icon: "map",       plan: "pro" },
      { id: "resume",    label: "Resume",    href: "/tools/resume",    icon: "file-text", plan: "pro" },
      { id: "linkedin",  label: "LinkedIn",  href: "/tools/linkedin",  icon: "linkedin",  plan: "pro" },
      { id: "interview", label: "Interview", href: "/tools/interview", icon: "mic",       plan: "pro" },
      { id: "visa",      label: "Visa",      href: "/tools/visa",      icon: "globe",     plan: "pro" },
    ],
  },
  {
    id: "career-pack",
    label: "Career Pack",
    icon: "package",
    href: "/career-pack",
    description: "Full career intelligence bundle",
    plan: "career_pack",
    badge: "PRO",
  },
];
export const ACCOUNT_NAV = [
  { id: "account", label: "Account", href: "/account", icon: "user"        },
  { id: "billing", label: "Billing", href: "/billing", icon: "credit-card" },
];
export const AUTH_NAV = [
  { id: "login",  label: "Log in",  href: "/login"  },
  { id: "signup", label: "Sign up", href: "/signup" },
];
/**
 * Flatten all navigable routes for search / command palette.
 */
export function getAllRoutes() {
  const routes = [];
  for (const section of NAV_SECTIONS) {
    routes.push({ id: section.id, label: section.label, href: section.href, plan: section.plan });
    if (section.children) {
      for (const child of section.children) {
        routes.push({ id: child.id, label: `${section.label} -> ${child.label}`, href: child.href, plan: child.plan || section.plan });
      }
    }
  }
  for (const item of ACCOUNT_NAV) {
    routes.push({ id: item.id, label: item.label, href: item.href, plan: "free" });
  }
  return routes;
}
