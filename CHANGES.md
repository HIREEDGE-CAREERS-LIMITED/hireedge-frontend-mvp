# HireEdge Frontend — Wiring Fixes

## Commit Message
fix: wire up Copilot chat UI, add missing pages, fix route mismatches, load all CSS

## Files Changed (12 total)

### Modified (2 files)
| File | What Changed |
|------|-------------|
| `pages/copilot.js` | Replaced placeholder with real chat UI: imports CopilotProvider + ChatWindow |
| `pages/_app.js` | Added 6 missing CSS imports (copilot, dashboard, intelligence, tools, career-pack, billing) |

### Created (10 files)
| File | Purpose |
|------|---------|
| `pages/account.js` | New Account page (was 404). Shows Profile, Plan, Preferences, Data sections |
| `pages/dashboard/saved-roles.js` | New page for /dashboard/saved-roles sidebar link |
| `pages/dashboard/activity.js` | New page for /dashboard/activity sidebar link |
| `pages/intelligence/salary.js` | Route alias → re-exports salary-insights.js (nav links to /intelligence/salary) |
| `pages/intelligence/graph.js` | New Career Graph page for /intelligence/graph sidebar link |
| `pages/tools/roadmap.js` | Route alias → re-exports career-roadmap.js |
| `pages/tools/resume.js` | Route alias → re-exports resume-optimiser.js |
| `pages/tools/linkedin.js` | Route alias → re-exports linkedin-optimiser.js |
| `pages/tools/interview.js` | Route alias → re-exports interview-prep.js |
| `pages/tools/visa.js` | Route alias → re-exports visa-eligibility.js |

## What Was Fixed

1. **Copilot chat UI** — pages/copilot.js was a static placeholder. Now renders CopilotProvider → ChatWindow with full chat experience.

2. **Missing CSS** — _app.js only loaded globals.css + app-shell.css. Dashboard, intelligence, tools, copilot, billing, and career-pack styles were never loaded. Now all 8 CSS files are imported.

3. **Account 404** — No pages/account.js existed despite sidebar linking to /account. Created working page.

4. **5 tool route mismatches** — Sidebar links to /tools/roadmap, /tools/resume, /tools/linkedin, /tools/interview, /tools/visa. Actual files are career-roadmap.js, resume-optimiser.js, etc. Created thin re-export aliases.

5. **Salary route mismatch** — Nav links to /intelligence/salary but file is salary-insights.js. Created alias.

6. **3 missing dashboard/intelligence pages** — /dashboard/saved-roles, /dashboard/activity, /intelligence/graph had no page files. Created minimal working pages using existing components.

## What Was NOT Changed
- No visual design changes
- No architecture changes  
- No component rewrites
- No navigation config changes
- No service/API changes
- All existing files left untouched
