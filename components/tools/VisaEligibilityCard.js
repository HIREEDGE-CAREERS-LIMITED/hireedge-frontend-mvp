// ============================================================================
// components/tools/VisaEligibilityCard.js
// ============================================================================

import ToolResultCard, { InfoRow } from "./ToolResultCard";

const ROUTE_LABELS = {
  skilled_worker: "Skilled Worker",
  global_talent: "Global Talent",
  graduate: "Graduate",
  high_potential_individual: "High Potential Individual",
};

export default function VisaEligibilityCard({ data }) {
  if (!data) return null;
  const { disclaimer, target_role, salary_assessed, routes, recommended_route, eligible_routes_count, salary_gap, visa_friendly_alternatives } = data;

  return (
    <div className="tool-results">
      <div className="tool-disclaimer">{disclaimer}</div>

      <ToolResultCard title="Overview">
        <InfoRow label="Target Role" value={target_role.title} />
        <InfoRow label="SOC Code" value={target_role.soc_code || "N/A"} />
        <InfoRow label="Salary Assessed" value={`£${salary_assessed?.toLocaleString()}`} />
        <InfoRow label="Eligible Routes" value={eligible_routes_count} accent />
        {recommended_route && <InfoRow label="Recommended Route" value={recommended_route.replace(/_/g, " ")} accent />}
      </ToolResultCard>

      {salary_gap && (
        <ToolResultCard title="Salary Threshold">
          <p className={`tool-advice ${salary_gap.meets_threshold ? "" : "tool-advice--warn"}`}>
            {salary_gap.message}
          </p>
        </ToolResultCard>
      )}

      {Object.entries(routes).map(([key, route]) => (
        <ToolResultCard key={key} title={ROUTE_LABELS[key] || key} defaultOpen={route.eligible || route.potentially_eligible}>
          <div className="visa-route-status">
            {route.eligible ? (
              <span className="visa-status visa-status--eligible">Likely Eligible</span>
            ) : route.potentially_eligible ? (
              <span className="visa-status visa-status--potential">Potentially Eligible</span>
            ) : (
              <span className="visa-status visa-status--ineligible">Unlikely</span>
            )}
            <span className="visa-confidence">Confidence: {route.confidence_score}/100</span>
          </div>
          {route.requirements_met?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Requirements Met</span>
              {route.requirements_met.map((r, i) => <p key={i} className="tool-guidance-item tool-guidance-item--pass">✓ {r}</p>)}
            </div>
          )}
          {route.requirements_not_met?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Requirements Not Met</span>
              {route.requirements_not_met.map((r, i) => <p key={i} className="tool-guidance-item tool-guidance-item--fail">✗ {r}</p>)}
            </div>
          )}
          {route.notes?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Notes</span>
              {route.notes.map((n, i) => <p key={i} className="tool-guidance-item">• {n}</p>)}
            </div>
          )}
        </ToolResultCard>
      ))}

      {visa_friendly_alternatives?.length > 0 && (
        <ToolResultCard title="Visa-Friendly Alternatives" defaultOpen={false}>
          {visa_friendly_alternatives.map((alt, i) => (
            <div key={i} className="tool-next-move">
              <div className="tool-next-move__title">{alt.title}</div>
              <div className="tool-next-move__meta">
                £{alt.salary_mean?.toLocaleString()} · SOC {alt.soc_code} · +{alt.salary_growth_pct}%
              </div>
            </div>
          ))}
        </ToolResultCard>
      )}
    </div>
  );
}
