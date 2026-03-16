import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import RoadmapCard from "../../components/tools/RoadmapCard";
import { fetchCareerRoadmap } from "../../services/toolsService";

const FIELDS = [
  { key: "from", label: "Current Role", type: "role", placeholder: "Where you are..." },
  { key: "to", label: "Target Role", type: "role", placeholder: "Where you want to go..." },
  { key: "strategy", label: "Strategy", type: "select", defaultValue: "fastest", options: [
    { value: "fastest", label: "Fastest" },
    { value: "easiest", label: "Easiest" },
    { value: "highest_paid", label: "Highest Paid" },
  ]},
];

export default function CareerRoadmapPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.from || !values.to) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchCareerRoadmap({ from: values.from, to: values.to, strategy: values.strategy });
      setResult(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="Career Roadmap" description="Build a step-by-step path from your current role to your target." icon="🗺️">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Build Roadmap" />
      {error && <div className="tool-error">{error}</div>}
      <RoadmapCard data={result} />
    </ToolShell>
  );
}
