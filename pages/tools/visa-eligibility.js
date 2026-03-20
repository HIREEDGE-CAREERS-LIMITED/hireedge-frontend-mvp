// ============================================================================
// pages/tools/visa-eligibility.js
// HireEdge Frontend — Visa Eligibility tool
//
// CHANGED: reads router.query (role, skills, salary, age, hasUkDegree) on
// mount, pre-populates ToolForm, and auto-submits when enough context is
// present.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import VisaEligibilityCard from "../../components/tools/VisaEligibilityCard";
import { fetchVisaEligibility } from "../../services/toolsService";

const BASE_FIELDS = [
  { key: "role",       label: "Target Role",             type: "role",    placeholder: "Role you want a visa for..." },
  { key: "skills",     label: "Your Skills (optional)",  type: "textarea", placeholder: "SQL, Python, Excel...", hint: "Comma-separated" },
  { key: "salary",     label: "Offered Salary £ (optional)", type: "number", placeholder: "55000" },
  { key: "age",        label: "Age (optional)",          type: "number",  placeholder: "28"                         },
  { key: "hasUkDegree", label: "UK Degree?",             type: "boolean"                                            },
];

export default function VisaEligibilityPage() {
  const router  = useRouter();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [fields,  setFields]  = useState(BASE_FIELDS);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { role, skills, salary, age, hasUkDegree } = router.query;

    // Use target as role if present (planner sends target for visa)
    const effectiveRole = router.query.target || role;

    const updated = BASE_FIELDS.map((f) => {
      if (f.key === "role"   && effectiveRole) return { ...f, defaultValue: effectiveRole };
      if (f.key === "skills" && skills)        return { ...f, defaultValue: skills };
      if (f.key === "salary" && salary)        return { ...f, defaultValue: salary };
      if (f.key === "age"    && age)           return { ...f, defaultValue: age };
      return f;
    });
    setFields(updated);

    if (effectiveRole && !autoSubmitted) {
      setAutoSubmitted(true);
      _submit({ role: effectiveRole, skills, salary, age, hasUkDegree });
    }
  }, [router.isReady, router.query]);

  const _submit = async (values) => {
    if (!values.role) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchVisaEligibility({
        role:       values.role,
        skills:     values.skills
          ? (typeof values.skills === "string"
              ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
              : values.skills)
          : undefined,
        salary:     values.salary     || undefined,
        age:        values.age        || undefined,
        hasUkDegree: values.hasUkDegree,
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
    if (!values.role) return;
    _submit(values);
  };

  return (
    <ToolShell
      title="Visa Eligibility"
      description="Assess your UK visa options for any role. Skilled Worker, Global Talent, Graduate, and HPI routes."
      icon="🌍"
      badge="PRO"
    >
      <ToolForm
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Assess Eligibility"
      />
      {error  && <div className="tool-error">{error}</div>}
      <VisaEligibilityCard data={result} />
    </ToolShell>
  );
}
