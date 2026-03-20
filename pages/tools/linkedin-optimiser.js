// ============================================================================
// pages/tools/linkedin-optimiser.js
// HireEdge Frontend — LinkedIn Optimiser
// autoComplete="off" prevents Chrome autofill bleeding into fields.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import RoleSearch from "../../components/intelligence/RoleSearch";
import LinkedinOptimisationCard from "../../components/tools/LinkedinOptimisationCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

export default function LinkedinOptimiserPage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  const [currentRole,    setCurrentRole]    = useState(null);
  const [targetRole,     setTargetRole]     = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");
  const [industry,       setIndustry]       = useState("");
  const [resumeText,     setResumeText]     = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.role || q.current) setCurrentRole({ slug: q.role || q.current, title: _slugToTitle(q.role || q.current) });
    if (q.target)            setTargetRole({ slug: q.target, title: _slugToTitle(q.target) });
    if (q.skills)            setSkills(_cleanSkills(q.skills));
    if (q.yearsExp)          setYearsExp(q.yearsExp);
    if (q.industry)          setIndustry(q.industry);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !currentRole) return;
    autoRan.current = true;
    _submit();
  }, [currentRole, router.isReady]);

  async function _submit() {
    if (!currentRole) { setError("Please select your current role."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/linkedin-optimiser`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole:    currentRole.slug,
          targetRole:     targetRole?.slug  || undefined,
          skills,
          yearsExp:       yearsExp ? parseInt(yearsExp) : null,
          industry:       industry       || undefined,
          resumeText:     resumeText     || undefined,
          jobDescription: jobDescription || undefined,
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
      <Head><title>LinkedIn Optimiser — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">LinkedIn Optimiser</h1>
          <p className="tool-page__sub">
            Copy-ready headline options, a written About section, experience bullets, and keyword strategy — tailored to your target role.
          </p>
        </div>

        <div className="tool-form" autoComplete="off">

          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Your current role..."
                onSelect={(r) => setCurrentRole(r)}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">✓ {currentRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__optional">(optional)</span></label>
              <RoleSearch
                placeholder="Role you're moving toward..."
                onSelect={(r) => setTargetRole(r)}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">✓ {targetRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                className="tool-form__input"
                type="number" min="0" max="40" placeholder="e.g. 7"
                autoComplete="off"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
              />
            </div>
          </div>

          <div className="tool-form__row tool-form__row--2">
            <div className="tool-form__field">
              <label className="tool-form__label">Your Skills</label>
              <input
                className="tool-form__input"
                type="text"
                placeholder="e.g. SQL, Python, Product Strategy, Stakeholder Management"
                autoComplete="off"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <span className="tool-form__hint">Comma-separated</span>
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Industry <span className="tool-form__optional">(optional)</span></label>
              <input
                className="tool-form__input"
                type="text" placeholder="e.g. Technology, Financial Services"
                autoComplete="off"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">
              CV / Profile Summary <span className="tool-form__optional">(recommended — enables written About section)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={5}
              placeholder="Paste a summary of your experience or CV text…"
              autoComplete="off"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">
              Target Job Description <span className="tool-form__optional">(optional)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={4}
              placeholder="Paste the JD for the role you're targeting…"
              autoComplete="off"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && <div className="tool-form__error">{error}</div>}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !currentRole}
          >
            {loading ? "Optimising your profile…" : "Optimise LinkedIn Profile"}
          </button>
        </div>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is writing your LinkedIn content…</p>
          </div>
        )}

        {result && <LinkedinOptimisationCard data={result} />}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function _cleanSkills(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  return raw.replace(/[•\-\*]\s*/g, "").replace(/\s{2,}/g, " ").trim();
}
