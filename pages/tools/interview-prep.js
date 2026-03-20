// ============================================================================
// pages/tools/interview-prep.js
// HireEdge Frontend — Interview Prep page (Production v2)
//
// FIX: Replaced useCopilot() with useEDGEXContext().
//
// useCopilot() throws "must be used within a CopilotProvider" during
// Next.js static pre-rendering because tool pages are NOT wrapped in
// CopilotProvider. useCopilot?.() does NOT prevent this — optional
// chaining only skips the call if the function itself is null/undefined,
// not if the function throws. useEDGEXContext() is safe: it calls
// useContext() directly and returns null instead of throwing.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AppShell from "../../components/layout/AppShell";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { useEDGEXContext } from "../../context/CopilotContext";  // ← FIXED

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

const ROLE_OPTIONS = [
  { value: "", label: "Select target role…" },
  { value: "product-manager", label: "Product Manager" },
  { value: "senior-product-manager", label: "Senior Product Manager" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "data-engineer", label: "Data Engineer" },
  { value: "machine-learning-engineer", label: "Machine Learning Engineer" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "senior-software-engineer", label: "Senior Software Engineer" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "ux-designer", label: "UX Designer" },
  { value: "marketing-manager", label: "Marketing Manager" },
  { value: "sales-manager", label: "Sales Manager" },
  { value: "operations-manager", label: "Operations Manager" },
  { value: "finance-manager", label: "Finance Manager" },
  { value: "business-analyst", label: "Business Analyst" },
];

export default function InterviewPrepPage() {
  const router    = useRouter();
  const edgexCtx  = useEDGEXContext() || {};   // ← FIXED: never throws
  const autoRan   = useRef(false);

  const [form, setForm] = useState({
    targetRole:     "",
    currentRole:    "",
    skills:         "",
    yearsExp:       "",
    jobDescription: "",
    resumeText:     "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── EDGEX prefill ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const prefill = {
      targetRole:     q.target   || edgexCtx.target  || edgexCtx.role   || "",
      currentRole:    q.current  || edgexCtx.role    || "",
      skills:         q.skills   || (Array.isArray(edgexCtx.skills) ? edgexCtx.skills.join(", ") : edgexCtx.skills || ""),
      yearsExp:       q.yearsExp || edgexCtx.yearsExp || "",
      jobDescription: q.jd       || "",
      resumeText:     q.resume   || "",
    };
    setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)) }));
  }, [router.isReady, router.query]);

  // ── Auto-run when prefilled from EDGEX ─────────────────────────────────────
  useEffect(() => {
    if (autoRan.current) return;
    if (!router.isReady) return;
    if (router.query.autorun !== "1") return;
    if (!form.targetRole) return;
    autoRan.current = true;
    _submit(form);
  }, [form.targetRole, router.isReady]);

  async function _submit(values) {
    if (!values.targetRole) { setError("Please select a target role."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/interview-prep`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole:     values.targetRole,
          currentRole:    values.currentRole,
          skills:         values.skills,
          yearsExp:       values.yearsExp ? parseInt(values.yearsExp) : null,
          jobDescription: values.jobDescription,
          resumeText:     values.resumeText,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error || "Something went wrong");
      setResult(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) { e.preventDefault(); _submit(form); }
  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  return (
    <AppShell>
      <Head><title>Interview Prep — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Interview Preparation</h1>
          <p className="tool-page__sub">
            Role-specific questions, answer frameworks, opening pitch, and salary intelligence — tailored to your background.
          </p>
        </div>

        <form className="tool-form" onSubmit={handleSubmit}>
          <div className="tool-form__grid">
            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">Target role <span className="tool-form__req">*</span></label>
              <select className="tool-form__select" value={form.targetRole} onChange={set("targetRole")} required>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Current role</label>
              <select className="tool-form__select" value={form.currentRole} onChange={set("currentRole")}>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label || "None / not listed"}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Years of experience</label>
              <input className="tool-form__input" type="number" min="0" max="40" placeholder="e.g. 5"
                value={form.yearsExp} onChange={set("yearsExp")} />
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">Your skills</label>
              <input className="tool-form__input" type="text" placeholder="e.g. SQL, Python, Stakeholder Management, Product Strategy"
                value={form.skills} onChange={set("skills")} />
              <span className="tool-form__hint">Comma-separated</span>
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">Job description <span className="tool-form__optional">(optional — improves precision)</span></label>
              <textarea className="tool-form__textarea" rows={5} placeholder="Paste the full job description here…"
                value={form.jobDescription} onChange={set("jobDescription")} />
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">CV / Profile summary <span className="tool-form__optional">(optional)</span></label>
              <textarea className="tool-form__textarea" rows={4} placeholder="Paste a summary of your experience or CV…"
                value={form.resumeText} onChange={set("resumeText")} />
            </div>
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button className="tool-form__submit" type="submit" disabled={loading}>
            {loading ? "Preparing your pack…" : "Generate Interview Pack"}
          </button>
        </form>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is building your interview preparation pack…</p>
          </div>
        )}

        {result && <InterviewPrepCard data={result} />}
      </div>
    </AppShell>
  );
}
