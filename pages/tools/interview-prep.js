// ============================================================================
// pages/tools/interview-prep.js
// HireEdge Frontend — Interview Prep tool
//
// CHANGED: reads router.query (target, skills, current, yearsExp) on mount,
// pre-populates ToolForm, and auto-submits when enough context is present.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ToolShell from "../../components/tools/ToolShell";
import ToolForm from "../../components/tools/ToolForm";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { fetchInterviewPrep } from "../../services/toolsService";

const BASE_FIELDS = [
  { key: "target",   label: "Interviewing For",       type: "role",     placeholder: "Target role..."           },
  { key: "skills",   label: "Your Skills",             type: "textarea", placeholder: "SQL, Python, Excel...",   hint: "Comma-separated" },
  { key: "current",  label: "Current Role (optional)", type: "role",     placeholder: "Your current role..."     },
  { key: "yearsExp", label: "Years of Experience",     type: "number",   placeholder: "3"                        },
];

export default function InterviewPrepPage() {
  const router  = useRouter();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [fields,  setFields]  = useState(BASE_FIELDS);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { target, skills, current, yearsExp } = router.query;

    const updated = BASE_FIELDS.map((f) => {
      if (f.key === "target"   && target)   return { ...f, defaultValue: target };
      if (f.key === "skills"   && skills)   return { ...f, defaultValue: skills };
      if (f.key === "current"  && current)  return { ...f, defaultValue: current };
      if (f.key === "yearsExp" && yearsExp) return { ...f, defaultValue: yearsExp };
      return f;
    });
    setFields(updated);

    if (target && skills && !autoSubmitted) {
      setAutoSubmitted(true);
      _submit({
        target,
        skills,
        current:  current  || undefined,
        yearsExp: yearsExp || undefined,
      });
    }
  }, [router.isReady, router.query]);

  const _submit = async (values) => {
    if (!values.target || !values.skills) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchInterviewPrep({
        target:   values.target,
        skills:   typeof values.skills === "string"
          ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : values.skills,
        current:  values.current  || undefined,
        yearsExp: values.yearsExp || undefined,
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
    if (!values.target || !values.skills) return;
    _submit(values);
  };

  return (
    <ToolShell
      title="Interview Prep"
      description="Competency, technical, and behavioural questions with STAR framework and salary negotiation intel."
      icon="🎤"
      badge="PRO"
    >
      <ToolForm
        fields={fields}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Generate Prep Pack"
      />
      {error  && <div className="tool-error">{error}</div>}
      <InterviewPrepCard data={result} />
    </ToolShell>
  );
}
