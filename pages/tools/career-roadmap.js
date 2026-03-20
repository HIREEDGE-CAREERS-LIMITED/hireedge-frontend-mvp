// ============================================================================
// pages/tools/career-roadmap.js
// HireEdge Frontend — Career Roadmap
// NO AppShell — _app.js handles the shell. Double-import caused double sidebar.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import RoleSearch from "../../components/intelligence/RoleSearch";
import RoadmapCard from "../../components/tools/RoadmapCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

const STRATEGIES = [
  { value: "fastest",      label: "⚡ Fastest" },
  { value: "easiest",      label: "🟢 Easiest" },
  { value: "highest_paid", label: "💰 Highest Paid" },
];

export default function CareerRoadmapPage() {
  const router   = useRouter();
  const edgexCtx = useEDGEXContext() || {};
  const autoRan  = useRef(false);

  const [fromRole, setFromRole] = useState(null);
  const [toRole,   setToRole]   = useState(null);
  const [skills,   setSkills]   = useState("");
  const [strategy, setStrategy] = useState("fastest");

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;

    if ((q.from || q.current || edgexCtx.role) && !fromRole) {
      const slug = q.from || q.current || edgexCtx.role;
      setFromRole({ slug, title: _slugToTitle(slug) });
    }
    if ((q.to || q.target || edgexCtx.target) && !toRole) {
      const slug = q.to || q.target || edgexCtx.target;
      setToRole({ slug, title: _slugToTitle(slug) });
    }
    if (q.skills || edgexCtx.skills) {
      setSkills(q.skills || (Array.isArray(edgexCtx.skills) ? edgexCtx.skills.join(", ") : edgexCtx.skills || ""));
    }
    if (q.strategy) setStrategy(q.strategy);
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !fromRole || !toRole) return;
    autoRan.current = true;
    _submit();
  }, [fromRole, toRole, router.isReady]);

  async function _submit() {
    if (!fromRole) { setError("Please select your current role."); return; }
    if (!toRole)   { setError("Please select your target role."); return; }
    if (fromRole.slug === toRole.slug) { setError("Current and target role must be different."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/career-roadmap`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromRole: fromRole.slug,
          toRole:   toRole.slug,
          strategy,
          skills,
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

  return (
    <>
      <Head><title>Career Roadmap — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Career Roadmap</h1>
          <p className="tool-page__sub">
            Step-by-step path, salary trajectory, top blockers, and your first 3 actions — including bridge routes when no direct path exists.
          </p>
        </div>

        <div className="tool-form">
          {/* Row 1 — Current + Target + Strategy */}
          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you are now..."
                onSelect={(r) => setFromRole(r)}
                initialValue={fromRole?.title || ""}
              />
              {fromRole && <span className="tool-form__selected">✓ {fromRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Where you want to go..."
                onSelect={(r) => setToRole(r)}
                initialValue={toRole?.title || ""}
              />
              {toRole && <span className="tool-form__selected">✓ {toRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Optimise For</label>
              <div className="tool-form__toggle-row">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`tool-form__toggle ${strategy === s.value ? "tool-form__toggle--active" : ""}`}
                    onClick={() => setStrategy(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="tool-form__field">
            <label className="tool-form__label">Your Current Skills <span className="tool-form__optional">(optional)</span></label>
            <input
              className="tool-form__input"
              type="text" placeholder="e.g. SQL, Python, Stakeholder Management"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span className="tool-form__hint">Comma-separated — improves blockers analysis</span>
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !fromRole || !toRole}
          >
            {loading ? (
              <><span className="tool-form__spinner" /> Building roadmap…</>
            ) : (
              "Build My Roadmap"
            )}
          </button>
        </div>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is mapping your career path…</p>
          </div>
        )}

        {result && <RoadmapCard data={result} />}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
