// ============================================================================
// components/intelligence/RoleSearch.js
// HireEdge Frontend — Role search with debounced results
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { searchRoles } from "../../services/intelligenceService";

export default function RoleSearch({ onSelect, placeholder, initialValue }) {
  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchRoles(q, { limit: 8 });
      setResults(res.data || []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(v), 250);
  };

  const handleSelect = (role) => {
    setQuery(role.title || role.slug);
    setOpen(false);
    onSelect?.(role);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="role-search" ref={wrapRef}>
      <div className="role-search__input-wrap">
        <svg className="role-search__icon" width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="5.5"/><path d="M12 12l4 4"/>
        </svg>
        <input
          type="text"
          className="role-search__input"
          placeholder={placeholder || "Search roles..."}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="role-search__spinner" />}
      </div>

      {open && results.length > 0 && (
        <div className="role-search__dropdown">
          {results.map((role) => (
            <button
              key={role.slug}
              className="role-search__result"
              onClick={() => handleSelect(role)}
            >
              <div className="role-search__result-title">{role.title}</div>
              <div className="role-search__result-meta">
                <span>{role.category}</span>
                <span>{role.seniority}</span>
                {role.salary_mean && <span>£{role.salary_mean.toLocaleString()}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
