import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { fetchInterviewPrep } from "../../services/toolsService";

const FIELDS = [
  { key: "target", label: "Interviewing For", type: "role", placeholder: "Target role..." },
  { key: "skills", label: "Your Skills", type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "current", label: "Current Role (optional)", type: "role", placeholder: "Your current role..." },
  { key: "yearsExp", label: "Years of Experience", type: "number", placeholder: "3" },
];

export default function InterviewPrepPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.target || !values.skills) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchInterviewPrep({
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
    <ToolShell title="Interview Prep" description="Competency, technical, and behavioural questions with STAR framework and salary negotiation intel." icon="🎤" badge="PRO">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Generate Prep Pack" />
      {error && <div className="tool-error">{error}</div>}
      <InterviewPrepCard data={result} />
    </ToolShell>
  );
}
