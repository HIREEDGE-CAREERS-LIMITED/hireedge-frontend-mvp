// ============================================================================
// pages/_app.js
// HireEdge Frontend — Next.js Custom App
//
// Root wrapper. Loads global styles, wraps pages in the AppShell layout,
// and will eventually provide auth/billing/career context providers.
// ============================================================================

import AppShell from "../components/layout/AppShell";
import "../styles/marketing.css";
import "../styles/globals.css";
import "../styles/app-shell.css";
import "../styles/copilot.css";
import "../styles/dashboard.css";
import "../styles/intelligence.css";
import "../styles/tools.css";
import "../styles/career-pack.css";
import "../styles/billing.css";
import "../styles/career-path.css";
import "../styles/career-blind-spot.css";
import "../styles/resume-optimiser.css";

export default function HireEdgeApp({ Component, pageProps }) {
  // If the page exports a getLayout function, use it (for custom layouts)
  // Otherwise, wrap in the default AppShell
  const getLayout = Component.getLayout || ((page) => <AppShell>{page}</AppShell>);

  return getLayout(<Component {...pageProps} />);
}
