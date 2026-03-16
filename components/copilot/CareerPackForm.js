// ============================================================================
// components/career-pack/CareerPackForm.js
// ============================================================================

import { useState } from "react";
import RoleSearch from "../intelligence/RoleSearch";

export default function CareerPackForm({ onSubmit, loading }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [skills, setSkills] = useState("");
  const [yearsExp, setYearsExp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !skills.trim()) return;
    onSubmit({
      role: from.slug || from,
      target: to.slug || to,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      yearsExp: yearsExp ? parseInt(yearsExp, 10) : undefined,
    });
  };

  return (
    <form className="pack-form" onSubmit={handleSubmit}>
      <div className="pack-form__hero">
        <div className="pack-form__icon shimmer-text">✦</div>
        <h2 className="pack-form__title">Build Your Career Pack</h2>
        <p className="pack-form__desc">
          One comprehensive report combining roadmap, skills gap, resume blueprint, LinkedIn optimisation, interview prep, salary intel, and visa assessment.
        </p>
      </div>

      <div className="pack-form__fields">
        <div className="pack-form__field">
          <label className="pack-form__label">Current Role</label>
          <RoleSearch placeholder="Where you are now..." onSelect={(r) => setFrom(r)} />
          {from && <span className="pack-form__selected">{from.title || from.slug || from}</span>}
        </div>

        <div className="pack-form__field">
          <label className="pack-form__label">Target Role</label>
          <RoleSearch placeholder="Where you want to go..." onSelect={(r) => setTo(r)} />
          {to && <span className="pack-form__selected">{to.title || to.slug || to}</span>}
        </div>

        <div className="pack-form__field pack-form__field--wide">
          <label className="pack-form__label">Your Skills</label>
          <textarea
            className="pack-form__textarea"
            placeholder="SQL, Python, Excel, Data Visualization, Statistics..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={2}
          />
          <span className="pack-form__hint">Comma-separated list of your current skills</span>
        </div>

        <div className="pack-form__field">
          <label className="pack-form__label">Years of Experience</label>
          <input
            className="pack-form__input"
            type="number"
            placeholder="3"
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value)}
          />
        </div>
      </div>

      <button
        className="pack-form__submit"
        type="submit"
        disabled={!from || !to || !skills.trim() || loading}
      >
        {loading ? (
          <>
            <span className="pack-form__spinner" />
            Building your pack...
          </>
        ) : (
          <>
            <span className="pack-form__submit-icon">✦</span>
            Generate Career Pack
          </>
        )}
      </button>
    </form>
  );
}
