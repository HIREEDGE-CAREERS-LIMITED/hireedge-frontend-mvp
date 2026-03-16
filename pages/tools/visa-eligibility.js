import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import VisaEligibilityCard from "../../components/tools/VisaEligibilityCard";
import { fetchVisaEligibility } from "../../services/toolsService";

const FIELDS = [
  { key: "role", label: "Target Role", type: "role", placeholder: "Role you want a visa for..." },
  { key: "skills", label: "Your Skills (optional)", type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "salary", label: "Offered Salary £ (optional)", type: "number", placeholder: "55000" },
  { key: "age", label: "Age (optional)", type: "number", placeholder: "28" },
  { key: "hasUkDegree", label: "UK Degree?", type: "boolean" },
];

export default function VisaEligibilityPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.role) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchVisaEligibility({
        role: values.role,
        skills: values.skills ? values.skills.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        salary: values.salary || undefined,
        age: values.age || undefined,
        hasUkDegree: values.hasUkDegree,
      });
      setResult(res.data);
    } catch (e) { setError(e.reason === "tool_not_in_plan" ? `Upgrade to ${e.upgrade_to} to use this tool.` : e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="Visa Eligibility" description="Assess your UK visa options for any role. Skilled Worker, Global Talent, Graduate, and HPI routes." icon="🌍" badge="PRO">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Assess Eligibility" />
      {error && <div className="tool-error">{error}</div>}
      <VisaEligibilityCard data={result} />
    </ToolShell>
  );
}
