// ============================================================================
// pages/tools/linkedin-optimiser.js
// HireEdge Frontend — LinkedIn Optimiser tool
//
// CHANGED: reads router.query (role, skills, yearsExp, target) on mount,
// pre-populates ToolForm, and auto-submits when enough context is present.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import LinkedinOptimisationCard from "../../components/tools/LinkedinOptimisationCard";
import { fetchLinkedinOptimisation } from "../../services/toolsService";

const BASE_FIELDS = [
  { key: "role",     label: "Current Role",             type: "role",     placeholder: "Your current role..."     },
  { key: "skills",   label: "Your Skills",              type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "yearsExp", label: "Years of Experience",      type: "number",   placeholder: "3"                        },
  { key: "target",   label: "Target Role (optional)",   type: "role",     placeholder: "Aspirational role..."     },
  { key: "industry", label: "Industry (optional)",      type: "text",     placeholder: "technology"               },
];

export default function LinkedinOptimiserPage() {
  const router  = useRouter();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [fields,  setFields]  = useState(BASE_FIELDS);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { role, skills, yearsExp, target, industry } = router.query;

    const updated = BASE_FIELDS.map((f) => {
      if (f.key === "role"     && role)     return { ...f, defaultValue: role };
      if (f.key === "skills"   && skills)   return { ...f, defaultValue: skills };
      if (f.key === "yearsExp" && yearsExp) return { ...f, defaultValue: yearsExp };
      if (f.key === "target"   && target)   return { ...f, defaultValue: target };
      if (f.key === "industry" && industry) return { ...f, defaultValue: industry };
      return f;
    });
    setFields(updated);

    if (role && skills && !autoSubmitted) {
      setAutoSubmitted(true);
      _submit({ role, skills, yearsExp, target, industry });
    }
  }, [router.isReady, router.query]);

  const _submit = async (values) => {
    if (!values.role || !values.skills) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchLinkedinOptimisation({
        role:     values.role,
        skills:   typeof values.skills === "string"
          ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : values.skills,
        yearsExp: values.yearsExp || undefined,
        target:   values.target   || undefined,
        industry: values.industry || undefined,
      });
      setResult(res.data);
    } catch (e) {
      setError(
        e.reason === "tool_not_in_plan"
          ? `Upgrade to ${e.upgrade_to} to use this tool.`
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    if (!values.role || !values.skills) return;
    _submit(values);
  };

  return (
    <ToolShell
      title="LinkedIn Optimiser"
      description="Headlines, about section, skills strategy, and profile strength scoring."
      icon="💼"
      badge="PRO"
    >
      <ToolForm
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Optimise Profile"
      />
      {error  && <div className="tool-error">{error}</div>}
      <LinkedinOptimisationCard data={result} />
    </ToolShell>
  );
}
