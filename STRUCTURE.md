hireedge-frontend-mvp/
├── pages/
│   ├── _app.js
│   ├── copilot.js
│   ├── career-pack.js
│   ├── account.js
│   ├── billing.js
│   ├── login.js
│   ├── signup.js
│   ├── dashboard/
│   │   ├── index.js
│   │   ├── saved-roles.js
│   │   └── activity.js
│   ├── intelligence/
│   │   ├── index.js
│   │   ├── role/[slug].js
│   │   ├── salary.js
│   │   ├── skills-gap.js
│   │   └── graph.js
│   └── tools/
│       ├── index.js
│       ├── roadmap.js
│       ├── resume.js
│       ├── linkedin.js
│       ├── interview.js
│       └── visa.js
├── components/
│   ├── layout/
│   │   ├── AppShell.js
│   │   ├── Sidebar.js
│   │   └── Topbar.js
│   ├── copilot/
│   │   ├── ChatWindow.js
│   │   ├── MessageBubble.js
│   │   ├── InputBar.js
│   │   ├── InsightsPanel.js
│   │   └── ActionChips.js
│   ├── dashboard/
│   │   ├── ProfileCard.js
│   │   ├── ReadinessGauge.js
│   │   ├── NextRolesGrid.js
│   │   └── ActivityFeed.js
│   ├── intelligence/
│   │   ├── RoleCard.js
│   │   ├── SalaryChart.js
│   │   ├── SkillsRadar.js
│   │   └── CareerGraph.js
│   ├── tools/
│   │   ├── ToolShell.js
│   │   ├── RoadmapTimeline.js
│   │   ├── ResumeBlueprint.js
│   │   └── InterviewPrep.js
│   ├── billing/
│   │   ├── PricingTable.js
│   │   ├── PlanBadge.js
│   │   └── UpgradePrompt.js
│   └── shared/
│       ├── Button.js
│       ├── Card.js
│       ├── Badge.js
│       ├── Loader.js
│       ├── EmptyState.js
│       └── ErrorBoundary.js
├── services/
│   ├── copilotService.js
│   ├── intelligenceService.js
│   ├── toolsService.js
│   ├── dashboardService.js
│   ├── careerPackService.js
│   └── billingService.js
├── context/
│   ├── AuthContext.js
│   ├── CopilotContext.js
│   ├── CareerContext.js
│   ├── DashboardContext.js
│   └── BillingContext.js
├── config/
│   └── navigation.js
├── styles/
│   ├── globals.css
│   ├── app-shell.css
│   ├── copilot.css
│   ├── dashboard.css
│   ├── intelligence.css
│   ├── tools.css
│   ├── billing.css
│   └── graph.css
├── public/
│   └── favicon.ico
├── next.config.js
└── package.json
