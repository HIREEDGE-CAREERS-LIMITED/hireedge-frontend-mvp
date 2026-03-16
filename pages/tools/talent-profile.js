import { useState } from "react";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import TalentProfileCard from "../../components/tools/TalentProfileCard";
import { fetchTalentProfile } from "../../services/toolsService";

const FIELDS = [
  { key: "role", label: "Current Role", type: "role", placeholder: "Your current role..." },
  { key: "skills", label: "Your Skills", type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "yearsExp", label: "Years of Experience", type: "number", placeholder: "3" },
  { key: "target", label: "Target Role (optional)", type: "role", placeholder: "Where you're heading..." },
];

export default function TalentProfilePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    if (!values.role || !values.skills) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetchTalentProfile({
        role: values.role,
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
        yearsExp: values.yearsExp || undefined,
        target: values.target || undefined,
      });
      setResult(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolShell title="Talent Profile" description="See your strengths, gaps, best-fit roles, and career mobility." icon="👤">
      <ToolForm fields={FIELDS} onSubmit={handleSubmit} loading={loading} submitLabel="Generate Profile" />
      {error && <div className="tool-error">{error}</div>}
      <TalentProfileCard data={result} />
    </ToolShell>
  );
}
