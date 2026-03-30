// ============================================================================
// pages/edgex.js
// HireEdge — EDGEX Career Intelligence
// Route: /edgex
// /copilot is kept as an alias via pages/copilot.js
// ============================================================================

import Head from "next/head";
import EDGEXShell from "../components/copilot/EDGEXShell";

export default function EDGEXPage() {
  return (
    <>
      <Head>
        <title>EDGEX — Career Intelligence — HireEdge</title>
      </Head>
      <EDGEXShell />
    </>
  );
}
