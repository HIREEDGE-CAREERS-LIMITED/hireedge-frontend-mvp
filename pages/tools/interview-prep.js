// ============================================================================
// pages/tools/interview-prep.js
// HireEdge Frontend — Interview Prep
//
// FIX: Send X-HireEdge-Plan header. Map billing errors to upgrade prompt.
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import RoleSearch from "../../components/intelligence/RoleSearch";
import InterviewPrepCard from "../../components/tools/InterviewPrepCard";
import { useEDGEXContext } from "../../context/CopilotContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://hireedge-backend-mvp.vercel.app";

function getPlan() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem("hireedge_plan") || "free";
}

function _friendlyError(json) {
  const reason = json?.reason || "";
  const plan   = json?.upgrade_to || "pro";
  if (reason === "access_denied" || reason === "tool_not_in_plan") {
    return { type: "upgrade", plan, message: `Interview Prep requires the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.` };
  }
  if (reason === "daily_limit_reached") {
    return { type: "limit", message: "You've reached your daily limit. Upgrade for more." };
  }
  return { type: "error", message: json?.error || json?.message || "Something went wrong. Please try again." };
}

export default function InterviewPrepPage() {
  const router  = useRouter();
  const autoRan = useRef(false);

  const [targetRole,  setTargetRole]  = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [skills,         setSkills]         = useState("");
  const [yearsExp,       setYearsExp]       = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText,     setResumeText]     = useState("");

  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.target)  setTargetRole({ slug: q.target,  title: _slugToTitle(q.target) });
    if (q.current) setCurrentRole({ slug: q.current, title: _slugToTitle(q.current) });
    if (q.yearsExp && !isNaN(parseInt(q.yearsExp))) setYearsExp(q.yearsExp);
  }, [router.isReady]);

  useEffect(() => {
    if (autoRan.current || !router.isReady || router.query.autorun !== "1" || !targetRole) return;
    autoRan.current = true;
    _submit();
  }, [targetRole, router.isReady]);

  async function _submit() {
    if (!targetRole) { setErrorInfo({ type: "error", message: "Please select a target role." }); return; }
    setLoading(true); setErrorInfo(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/tools/interview-prep`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-HireEdge-Plan": getPlan(),
        },
        body: JSON.stringify({
          targetRole:     targetRole.slug,
          currentRole:    currentRole?.slug || "",
          skills,
          yearsExp:       yearsExp ? parseInt(yearsExp) : null,
          jobDescription,
          resumeText,
        }),
      });
      const json = await r.json();
      if (!json.ok) { setErrorInfo(_friendlyError(json)); return; }
      setResult(json.data);
    } catch (e) {
      setErrorInfo({ type: "error", message: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Interview Prep — HireEdge</title></Head>

      <div className="tool-page">
        <div className="tool-page__header">
          <div className="tool-page__badge">EDGEX</div>
          <h1 className="tool-page__title">Interview Preparation</h1>
          <p className="tool-page__sub">
            Role-specific questions, answer frameworks, opening pitch, and salary intelligence — tailored to your background.
          </p>
        </div>

        <div className="tool-form">
          <div className="tool-form__row tool-form__row--3">
            <div className="tool-form__field">
              <label className="tool-form__label">Target Role <span className="tool-form__req">*</span></label>
              <RoleSearch
                placeholder="Role you're interviewing for..."
                onSelect={(r) => setTargetRole(r)}
                initialValue={targetRole?.title || ""}
              />
              {targetRole && <span className="tool-form__selected">✓ {targetRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Current Role <span className="tool-form__optional">(optional)</span></label>
              <RoleSearch
                placeholder="Your current role..."
                onSelect={(r) => setCurrentRole(r)}
                initialValue={currentRole?.title || ""}
              />
              {currentRole && <span className="tool-form__selected">✓ {currentRole.title}</span>}
            </div>

            <div className="tool-form__field">
              <label className="tool-form__label">Years of Experience</label>
              <input
                className="tool-form__input"
                type="number" min="0" max="40" placeholder="e.g. 5"
                autoComplete="off"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
              />
            </div>
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">Your Skills</label>
            <input
              className="tool-form__input"
              type="text"
              placeholder="e.g. SQL, Python, Stakeholder Management, Product Strategy"
              autoComplete="off"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span className="tool-form__hint">Comma-separated</span>
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">
              Job Description <span className="tool-form__optional">(optional — greatly improves output)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={5}
              placeholder="Paste the full job description here…"
              autoComplete="off"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="tool-form__field">
            <label className="tool-form__label">
              CV / Profile Summary <span className="tool-form__optional">(optional)</span>
            </label>
            <textarea
              className="tool-form__textarea" rows={4}
              placeholder="Paste a summary of your experience or CV…"
              autoComplete="off"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {errorInfo?.type === "upgrade" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">🔒</span>
              <div>
                <p className="tool-upgrade-prompt__title">{errorInfo.message}</p>
                <p className="tool-upgrade-prompt__sub">Upgrade your plan to access Interview Prep and all premium tools.</p>
              </div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">View Plans →</Link>
            </div>
          )}
          {errorInfo?.type === "limit" && (
            <div className="tool-upgrade-prompt">
              <span className="tool-upgrade-prompt__icon">⏱</span>
              <div><p className="tool-upgrade-prompt__title">{errorInfo.message}</p></div>
              <Link href="/billing" className="tool-upgrade-prompt__btn">Upgrade →</Link>
            </div>
          )}
          {errorInfo?.type === "error" && (
            <div className="tool-form__error">{errorInfo.message}</div>
          )}

          <button
            className="tool-form__submit"
            onClick={_submit}
            disabled={loading || !targetRole}
          >
            {loading ? "Preparing your pack…" : "Generate Interview Pack"}
          </button>
        </div>

        {loading && (
          <div className="tool-loading">
            <div className="tool-loading__spinner" />
            <p>EDGEX is building your interview preparation pack…</p>
          </div>
        )}

        {result && <InterviewPrepCard data={result} />}
      </div>
    </>
  );
}

function _slugToTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
