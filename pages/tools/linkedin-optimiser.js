import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import LinkedinOptimisationCard from "../../components/tools/LinkedinOptimisationCard";
import { fetchLinkedinOptimisation } from "../../services/toolsService";

const FIELDS = [
  { key: "role", label: "Current Role", type: "role", placeholder: "Your current role..." },
  { key: "skills", label: "Your Skills", type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "yearsExp", label: "Years of Experience", type: "number", placeholder: "3" },
  { key: "target", label: "Target Role (optional)", type: "role", placeholder: "Aspirational role..." },
  { key: "industry", label: "Industry (optional)", type: "text", placeholder: "technology" },
];

export default function LinkedinOptimiserPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.role || !values.skills) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchLinkedinOptimisation({
        role: values.role,
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
        yearsExp: values.yearsExp || undefined,
        target: values.target || undefined,
        industry: values.industry || undefined,
      });
      setResult(res.data);
    } catch (e) { setError(e.reason === "tool_not_in_plan" ? `Upgrade to ${e.upgrade_to} to use this tool.` : e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="LinkedIn Optimiser" description="Headlines, about section, skills strategy, and profile strength scoring." icon="💼" badge="PRO">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Optimise Profile" />
      {error && <div className="tool-error">{error}</div>}
      <LinkedinOptimisationCard data={result} />
    </ToolShell>
  );
}
