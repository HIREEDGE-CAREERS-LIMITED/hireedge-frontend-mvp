// ============================================================================
// components/tools/ToolForm.js
// HireEdge Frontend — Reusable tool input form
// ============================================================================

import { useState } from "react";
import RoleSearch from "../intelligence/RoleSearch";

export default function ToolForm({ fields, onSubmit, loading, submitLabel }) {
  const [values, setValues] = useState({});

  const set = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="tool-form__fields">
        {fields.map((field) => (
          <div key={field.key} className="tool-form__field">
            <label className="tool-form__label">{field.label}</label>
            {field.type === "role" && (
              <RoleSearch
                placeholder={field.placeholder}
                onSelect={(r) => set(field.key, r.slug || r)}
              />
            )}
            {field.type === "text" && (
              <input
                className="tool-form__input"
                type="text"
                placeholder={field.placeholder}
                value={values[field.key] || field.defaultValue || ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
            {field.type === "textarea" && (
              <textarea
                className="tool-form__textarea"
                placeholder={field.placeholder}
                rows={field.rows || 2}
                value={values[field.key] || field.defaultValue || ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
            {field.type === "number" && (
              <input
                className="tool-form__input tool-form__input--short"
                type="number"
                placeholder={field.placeholder}
                value={values[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => set(field.key, e.target.value ? Number(e.target.value) : null)}
              />
            )}
            {field.type === "select" && (
              <select
                className="tool-form__select"
                value={values[field.key] || field.defaultValue || ""}
                onChange={(e) => set(field.key, e.target.value)}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {field.type === "boolean" && (
              <div className="tool-form__toggle-row">
                <button
                  type="button"
                  className={`tool-form__toggle ${values[field.key] === true ? "tool-form__toggle--active" : ""}`}
                  onClick={() => set(field.key, true)}
                >Yes</button>
                <button
                  type="button"
                  className={`tool-form__toggle ${values[field.key] === false ? "tool-form__toggle--active" : ""}`}
                  onClick={() => set(field.key, false)}
                >No</button>
              </div>
            )}
            {field.hint && <span className="tool-form__hint">{field.hint}</span>}
          </div>
        ))}
      </div>
      <button className="tool-form__submit" type="submit" disabled={loading}>
        {loading ? "Processing..." : (submitLabel || "Run")}
      </button>
    </form>
  );
}
