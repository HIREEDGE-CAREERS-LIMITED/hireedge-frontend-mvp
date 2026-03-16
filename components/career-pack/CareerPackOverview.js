// ============================================================================
// components/career-pack/CareerPackOverview.js
// ============================================================================

import PackReadinessCard from "./PackReadinessCard";
import CareerPackSection from "./CareerPackSection";
import PackExportBar from "./PackExportBar";

const SECTION_ORDER = [
  "roadmap",
  "skills_gap",
  "resume_blueprint",
  "linkedin_optimisation",
  "interview_prep",
  "salary_insight",
  "visa_assessment",
];

export default function CareerPackOverview({ pack, onExport }) {
  if (!pack) return null;

  const { summary, data, pack_id, generated_at, input } = pack;

  return (
    <div className="pack-overview">
      {/* Export bar */}
      <PackExportBar
        packId={pack_id}
        generatedAt={generated_at}
        onExport={onExport}
      />

      {/* Readiness hero */}
      <PackReadinessCard summary={summary} />

      {/* Sections */}
      <div className="pack-overview__sections">
        <h3 className="pack-overview__sections-title">Full Report</h3>
        {SECTION_ORDER.map((key, i) => (
          <CareerPackSection
            key={key}
            sectionKey={key}
            data={data[key]}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
