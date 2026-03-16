// ============================================================================
// pages/index.js
// HireEdge Frontend — Root redirect to Copilot
// ============================================================================

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/copilot"); }, [router]);
  return null;
}
