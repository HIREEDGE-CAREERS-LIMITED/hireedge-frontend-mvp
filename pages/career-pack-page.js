// ============================================================================
// pages/career-pack.js
// HireEdge Frontend — Career Pack page
//
// CHANGED: reads router.query (role, target, skills, yearsExp) on mount
// and passes them as initialValues into CareerPackForm so the form is
// pre-populated when the user arrives from an EDGEX "Get full Career Pack"
// action chip.
//
// If role + target + skills are all present in the URL, auto-submits
// the form so the Career Pack builds immediately without requiring the
// user to re-enter what EDGEX already knows.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CareerPackForm from "../components/career-pack/CareerPackForm";
import CareerPackOverview from "../components/career-pack/CareerPackOverview";
import { buildCareerPack, downloadCareerPack } from "../services/careerPackService";

export default function CareerPackPage() {
  const router  = useRouter();
  const [pack,    setPack]    = useState(null);
  const [input,   setInput]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Pre-populate from EDGEX query params ─────────────────────────────────
  const [initialValues, setInitialValues] = useState(null);
  const [autoSubmitted,  setAutoSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { role, target, skills, yearsExp } = router.query;

    if (role || target || skills) {
      const vals = {
        role:     role     || null,
        target:   target   || null,
        skills:   skills   || null,
        yearsExp: yearsExp || null,
      };
      setInitialValues(vals);

      // Auto-submit if we have everything needed
      if (role && target && skills && !autoSubmitted) {
        setAutoSubmitted(true);
        handleSubmit({
          role,
          target,
          skills:   skills.split(",").map((s) => s.trim()).filter(Boolean),
          yearsExp: yearsExp ? parseInt(yearsExp, 10) : undefined,
        });
      }
    }
  }, [router.isReady, router.query]);

  // ── Form submission ───────────────────────────────────────────────────────

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setPack(null);
    setInput(values);
    try {
      const res = await buildCareerPack(values);
      if (res.ok) {
        setPack(res);
      } else {
        setError(res.errors?.join(", ") || "Failed to build career pack.");
      }
    } catch (e) {
      if (e.reason === "career_pack_required" || e.reason === "tool_not_in_plan") {
        setError(`Career Pack requires the ${e.upgrade_to || "Career Pack"} plan or higher.`);
      } else {
        setError(e.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!input) return;
    downloadCareerPack(input);
  };

  const handleReset = () => {
    setPack(null);
    setInput(null);
    setError(null);
  };

  return (
    <div className="pack-page">
      {/* Show form if no pack yet */}
      {!pack && (
        <>
          <CareerPackForm
            onSubmit={handleSubmit}
            loading={loading}
            initialValues={initialValues}
          />
          {error && (
            <div className="pack-error">
              <p>{error}</p>
              {error.includes("plan") && (
                <a href="/billing" className="pack-error__upgrade">View Plans</a>
              )}
            </div>
          )}
        </>
      )}

      {/* Show pack results */}
      {pack && (
        <>
          <div className="pack-page__toolbar">
            <button className="pack-page__back" onClick={handleReset}>
              ← Build another pack
            </button>
          </div>
          <CareerPackOverview pack={pack} onExport={handleExport} />
        </>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="pack-loading">
          <div className="pack-loading__inner">
            <div className="pack-loading__spinner" />
            <p className="pack-loading__text">Building your Career Pack...</p>
            <p className="pack-loading__sub">Running 7 intelligence engines</p>
          </div>
        </div>
      )}
    </div>
  );
}
