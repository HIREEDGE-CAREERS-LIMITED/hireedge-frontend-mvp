import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import ResumeBlueprintCard from "../../components/tools/ResumeBlueprintCard";
import { fetchResumeBlueprint } from "../../services/toolsService";

const FIELDS = [
  { key: "target", label: "Target Role", type: "role", placeholder: "Role you're applying for..." },
  { key: "skills", label: "Your Skills", type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "current", label: "Current Role (optional)", type: "role", placeholder: "Your current role..." },
  { key: "yearsExp", label: "Years of Experience", type: "number", placeholder: "3" },
];

export default function ResumeOptimiserPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.target || !values.skills) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchResumeBlueprint({
        target: values.target,
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
        current: values.current || undefined,
        yearsExp: values.yearsExp || undefined,
      });
      setResult(res.data);
    } catch (e) { setError(e.reason === "tool_not_in_plan" ? `Upgrade to ${e.upgrade_to} to use this tool.` : e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="Resume Optimiser" description="Generate an ATS-optimised resume blueprint for your target role." icon="📄" badge="PRO">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Generate Blueprint" />
      {error && <div className="tool-error">{error}</div>}
      <ResumeBlueprintCard data={result} />
    </ToolShell>
  );
}
