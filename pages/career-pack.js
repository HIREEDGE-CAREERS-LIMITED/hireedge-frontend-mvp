// ============================================================================
// pages/career-pack.js
// HireEdge Frontend — Career Pack page
// ============================================================================

import { useState } from "react";
import CareerPackForm from "../components/career-pack/CareerPackForm";
import CareerPackOverview from "../components/career-pack/CareerPackOverview";
import { buildCareerPack, downloadCareerPack } from "../services/careerPackService";

export default function CareerPackPage() {
  const [pack, setPack] = useState(null);
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    }
    finally { setLoading(false); }
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
          <CareerPackForm onSubmit={handleSubmit} loading={loading} />
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
