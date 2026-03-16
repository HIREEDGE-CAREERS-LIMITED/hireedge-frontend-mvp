import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import GapExplainerCard from "../../components/tools/GapExplainerCard";
import { fetchGapExplainer } from "../../services/toolsService";

const FIELDS = [
  { key: "from", label: "Current Role", type: "role", placeholder: "Where you are..." },
  { key: "to", label: "Target Role", type: "role", placeholder: "Where you want to go..." },
];

export default function CareerGapExplainerPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.from || !values.to) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchGapExplainer({ from: values.from, to: values.to });
      setResult(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="Gap Explainer" description="Understand why a career transition is easy, moderate, or hard — with factor-by-factor breakdown." icon="🔍">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Explain Gap" />
      {error && <div className="tool-error">{error}</div>}
      <GapExplainerCard data={result} />
    </ToolShell>
  );
}
