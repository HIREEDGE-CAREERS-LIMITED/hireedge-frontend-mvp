// ============================================================================
// pages/edgex.js
// HireEdge -- EDGEX Career Intelligence (v2)
// Route: /edgex  (canonical)
// /copilot is kept as an alias via pages/copilot.js
// ============================================================================

import Head from "next/head";
import { CopilotProvider } from "../context/CopilotContext";
import EDGEXShell from "../components/copilot/EDGEXShell";

export default function EDGEXPage() {
  return (
    <>
      <Head>
        <title>EDGEX -- Career Intelligence -- HireEdge</title>
      </Head>
      <CopilotProvider>
        <EDGEXShell />
      </CopilotProvider>
    </>
  );
}
