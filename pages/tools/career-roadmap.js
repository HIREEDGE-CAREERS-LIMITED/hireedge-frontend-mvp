// ============================================================================
// pages/tools/career-roadmap.js
// HireEdge Frontend — Career Roadmap page (Production v2)
//
// FIX: Replaced useCopilot() with useEDGEXContext() — safe outside
// CopilotProvider during Next.js static pre-rendering.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AppShell from "../../components/layout/AppShell";
import RoadmapCard from "../../components/tools/RoadmapCard";
import { useEDGEXContext } from "../../context/CopilotContext";  // ← FIXED

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

const ROLE_OPTIONS = [
  { value: "", label: "Select role…" },
  { value: "product-manager", label: "Product Manager" },
  { value: "senior-product-manager", label: "Senior Product Manager" },
  { value: "director-of-product", label: "Director of Product" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "data-engineer", label: "Data Engineer" },
  { value: "analytics-manager", label: "Analytics Manager" },
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
  { value: "strategy-consultant", label: "Strategy Consultant" },
  { value: "chief-product-officer", label: "Chief Product Officer" },
];

const STRATEGIES = [
  { value: "fastest",      label: "Fastest — minimise time" },
  { value: "easiest",      label: "Easiest — minimise difficulty" },
  { value: "highest_paid", label: "Highest paid — maximise salary" },
];

export default function CareerRoadmapPage() {
  const router   = useRouter();
  const edgexCtx = useEDGEXContext() || {};   // ← FIXED: never throws
  const autoRan  = useRef(false);

  const [form, setForm] = useState({
    fromRole: "",
    toRole:   "",
    strategy: "fastest",
    skills:   "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── EDGEX prefill ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const prefill = {
      fromRole: q.from     || q.current || edgexCtx.role   || "",
      toRole:   q.to       || q.target  || edgexCtx.target || "",
      strategy: q.strategy || "fastest",
      skills:   q.skills   || (Array.isArray(edgexCtx.skills) ? edgexCtx.skills.join(", ") : edgexCtx.skills || ""),
    };
    setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)) }));
  }, [router.isReady, router.query]);

  // ── Auto-run ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !form.fromRole || !form.toRole) return;
    autoRan.current = true;
    _submit(form);
  }, [form.fromRole, form.toRole, router.isReady]);

  async function _submit(values) {
    if (!values.fromRole) { setError("Please select your current role."); return; }
    if (!values.toRole)   { setError("Please select your target role."); return; }
    if (values.fromRole === values.toRole) { setError("Current and target role must be different."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/career-roadmap`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromRole: values.fromRole,
          toRole:   values.toRole,
          strategy: values.strategy,
          skills:   values.skills,
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
      <Head><title>Career Roadmap — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Career Roadmap</h1>
          <p className="tool-page__sub">
            Step-by-step path, salary trajectory, top blockers, and your first 3 actions — including bridge routes when no direct path exists.
          </p>
        </div>

        <form className="tool-form" onSubmit={handleSubmit}>
          <div className="tool-form__grid">
            <div className="tool-form__field">
              <label className="tool-form__label">Current role <span className="tool-form__req">*</span></label>
              <select className="tool-form__select" value={form.fromRole} onChange={set("fromRole")} required>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Target role <span className="tool-form__req">*</span></label>
              <select className="tool-form__select" value={form.toRole} onChange={set("toRole")} required>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Strategy</label>
              <select className="tool-form__select" value={form.strategy} onChange={set("strategy")}>
                {STRATEGIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Your current skills <span className="tool-form__optional">(optional)</span></label>
              <input className="tool-form__input" type="text" placeholder="e.g. SQL, Python, Stakeholder Management"
                value={form.skills} onChange={set("skills")} />
              <span className="tool-form__hint">Comma-separated — improves blockers analysis</span>
            </div>
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button className="tool-form__submit" type="submit" disabled={loading}>
            {loading ? "Building roadmap…" : "Build My Roadmap"}
          </button>
        </form>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is mapping your career path…</p>
          </div>
        )}

        {result && <RoadmapCard data={result} />}
      </div>
    </AppShell>
  );
}
