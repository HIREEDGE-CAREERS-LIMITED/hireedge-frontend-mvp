// ============================================================================
// components/career-pack/PackExportBar.js
// ============================================================================

export default function PackExportBar({ packId, generatedAt, onExport }) {
  const time = generatedAt
    ? new Date(generatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="pack-export-bar">
      <div className="pack-export-bar__info">
        <span className="pack-export-bar__label">Career Pack</span>
        {packId && <span className="pack-export-bar__id">{packId}</span>}
        {time && <span className="pack-export-bar__time">Generated {time}</span>}
      </div>
      <div className="pack-export-bar__actions">
        <button className="pack-export-bar__btn pack-export-bar__btn--primary" onClick={onExport}>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12v2a2 2 0 002 2h8a2 2 0 002-2v-2M9 3v9M6 9l3 3 3-3"/>
          </svg>
          Download JSON
        </button>
      </div>
    </div>
  );
}
