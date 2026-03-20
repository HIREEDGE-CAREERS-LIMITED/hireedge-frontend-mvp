// ============================================================================
// pages/tools/linkedin-optimiser.js
// HireEdge Frontend — LinkedIn Optimiser page (Production v2)
//
// FIX: Replaced useCopilot() with useEDGEXContext() — safe outside
// CopilotProvider during Next.js static pre-rendering.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AppShell from "../../components/layout/AppShell";
import LinkedinOptimisationCard from "../../components/tools/LinkedinOptimisationCard";
import { useEDGEXContext } from "../../context/CopilotContext";  // ← FIXED

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

const ROLE_OPTIONS = [
  { value: "", label: "Select role…" },
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

export default function LinkedinOptimiserPage() {
  const router   = useRouter();
  const edgexCtx = useEDGEXContext() || {};   // ← FIXED: never throws
  const autoRan  = useRef(false);

  const [form, setForm] = useState({
    currentRole:    "",
    targetRole:     "",
    skills:         "",
    yearsExp:       "",
    industry:       "",
    resumeText:     "",
    jobDescription: "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── EDGEX prefill ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const prefill = {
      currentRole:    q.role     || q.current || edgexCtx.role   || "",
      targetRole:     q.target              || edgexCtx.target  || "",
      skills:         q.skills              || (Array.isArray(edgexCtx.skills) ? edgexCtx.skills.join(", ") : edgexCtx.skills || ""),
      yearsExp:       q.yearsExp            || edgexCtx.yearsExp || "",
      resumeText:     q.resume              || "",
      industry:       q.industry            || "",
      jobDescription: q.jd                  || "",
    };
    setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)) }));
  }, [router.isReady, router.query]);

  // ── Auto-run ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !form.currentRole) return;
    autoRan.current = true;
    _submit(form);
  }, [form.currentRole, router.isReady]);

  async function _submit(values) {
    if (!values.currentRole) { setError("Please select your current role."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/linkedin-optimiser`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole:    values.currentRole,
          targetRole:     values.targetRole     || undefined,
          skills:         values.skills,
          yearsExp:       values.yearsExp ? parseInt(values.yearsExp) : null,
          industry:       values.industry       || undefined,
          resumeText:     values.resumeText     || undefined,
          jobDescription: values.jobDescription || undefined,
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
      <Head><title>LinkedIn Optimiser — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">LinkedIn Optimiser</h1>
          <p className="tool-page__sub">
            Copy-ready headline options, a written About section, experience bullets, and keyword strategy — tailored to your target role.
          </p>
        </div>

        <form className="tool-form" onSubmit={handleSubmit}>
          <div className="tool-form__grid">
            <div className="tool-form__field">
              <label className="tool-form__label">Current role <span className="tool-form__req">*</span></label>
              <select className="tool-form__select" value={form.currentRole} onChange={set("currentRole")} required>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Target role <span className="tool-form__optional">(optional — for transition)</span></label>
              <select className="tool-form__select" value={form.targetRole} onChange={set("targetRole")}>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label || "None"}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Years of experience</label>
              <input className="tool-form__input" type="number" min="0" max="40" placeholder="e.g. 7"
                value={form.yearsExp} onChange={set("yearsExp")} />
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Industry</label>
              <input className="tool-form__input" type="text" placeholder="e.g. Technology, Financial Services"
                value={form.industry} onChange={set("industry")} />
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">Your skills</label>
              <input className="tool-form__input" type="text" placeholder="e.g. SQL, Python, Product Strategy, Stakeholder Management"
                value={form.skills} onChange={set("skills")} />
              <span className="tool-form__hint">Comma-separated</span>
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">CV / Profile summary <span className="tool-form__optional">(recommended — enables written About section)</span></label>
              <textarea className="tool-form__textarea" rows={5} placeholder="Paste a summary of your experience or CV text…"
                value={form.resumeText} onChange={set("resumeText")} />
            </div>

            <div className="tool-form__field tool-form__field--full">
              <label className="tool-form__label">Target job description <span className="tool-form__optional">(optional)</span></label>
              <textarea className="tool-form__textarea" rows={4} placeholder="Paste the JD for the role you're targeting…"
                value={form.jobDescription} onChange={set("jobDescription")} />
            </div>
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button className="tool-form__submit" type="submit" disabled={loading}>
            {loading ? "Optimising your profile…" : "Optimise LinkedIn Profile"}
          </button>
        </form>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is writing your LinkedIn content…</p>
          </div>
        )}

        {result && <LinkedinOptimisationCard data={result} />}
      </div>
    </AppShell>
  );
}
