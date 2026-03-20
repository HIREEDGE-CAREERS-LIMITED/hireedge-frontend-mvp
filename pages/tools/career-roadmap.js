// ============================================================================
// pages/tools/career-roadmap.js
// HireEdge Frontend — Career Roadmap tool
//
// CHANGED: reads router.query params (from, to, strategy) on mount and
// passes them as defaultValues into ToolForm so EDGEX action chips
// pre-populate the form when navigating from the chat.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import RoadmapCard from "../../components/tools/RoadmapCard";
import { fetchCareerRoadmap } from "../../services/toolsService";

const BASE_FIELDS = [
  { key: "from",     label: "Current Role", type: "role",   placeholder: "Where you are..."        },
  { key: "to",       label: "Target Role",  type: "role",   placeholder: "Where you want to go..."  },
  { key: "strategy", label: "Strategy",     type: "select", defaultValue: "fastest", options: [
    { value: "fastest",     label: "Fastest"     },
    { value: "easiest",     label: "Easiest"     },
    { value: "highest_paid", label: "Highest Paid" },
  ]},
];

export default function CareerRoadmapPage() {
  const router  = useRouter();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Pre-populate from EDGEX query params ──────────────────────────────
  // When EDGEX routes here, it appends ?from=X&to=Y to the URL.
  // We auto-submit if both from and to are present.
  const [fields, setFields] = useState(BASE_FIELDS);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { from, to, strategy } = router.query;

    // Inject defaultValues from query params
    const updated = BASE_FIELDS.map((f) => {
      if (f.key === "from"     && from)     return { ...f, defaultValue: from };
      if (f.key === "to"       && to)       return { ...f, defaultValue: to };
      if (f.key === "strategy" && strategy) return { ...f, defaultValue: strategy };
      return f;
    });
    setFields(updated);

    // Auto-submit if we have enough context to run immediately
    if (from && to && !autoSubmitted) {
      setAutoSubmitted(true);
      _submit({ from, to, strategy: strategy || "fastest" });
    }
  }, [router.isReady, router.query]);

  const _submit = async (values) => {
    if (!values.from || !values.to) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchCareerRoadmap({
        from:     values.from,
        to:       values.to,
        strategy: values.strategy || "fastest",
      });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    if (!values.from || !values.to) return;
    _submit(values);
  };

  return (
    <ToolShell
      title="Career Roadmap"
      description="Build a step-by-step path from your current role to your target."
      icon="🗺️"
    >
      <ToolForm
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Build Roadmap"
      />
      {error  && <div className="tool-error">{error}</div>}
      <RoadmapCard data={result} />
    </ToolShell>
  );
}
