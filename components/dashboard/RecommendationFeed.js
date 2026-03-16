// ============================================================================
// components/dashboard/RecommendationFeed.js
// HireEdge Frontend — Personalised recommendation feed
// ============================================================================

import Link from "next/link";

const PRIORITY_DOT = {
  high: "var(--red-400)",
  medium: "var(--amber-400)",
  low: "var(--accent-400)",
};

export default function RecommendationFeed({ recommendations, loading }) {
  if (loading) return <RecSkeleton />;

  const { recommended_roles, recommended_tools, recommended_next_actions, recommended_skill_focus } = recommendations || {};

  const hasContent = [recommended_roles, recommended_tools, recommended_next_actions, recommended_skill_focus]
    .some((arr) => arr?.length > 0);

  if (!hasContent) {
    return (
      <div className="dash-section">
        <div className="dash-section__header">
          <h3 className="dash-section__title">Recommendations</h3>
        </div>
        <div className="dash-empty">
          <div className="dash-empty__icon">💡</div>
          <p className="dash-empty__text">Add your role and skills to get personalised recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section">
      <div className="dash-section__header">
        <h3 className="dash-section__title">For You</h3>
      </div>

      <div className="rec-feed">
        {/* Next Actions */}
        {recommended_next_actions?.length > 0 && (
          <div className="rec-group">
            <div className="rec-group__label">Next Steps</div>
            {recommended_next_actions.slice(0, 3).map((action, i) => (
              <div key={i} className="rec-action">
                <span className="rec-action__dot" style={{ background: PRIORITY_DOT[action.priority] }} />
                <div className="rec-action__content">
                  <div className="rec-action__label">{action.label}</div>
                  {action.description && (
                    <div className="rec-action__desc">{action.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skill Focus */}
        {recommended_skill_focus?.length > 0 && (
          <div className="rec-group">
            <div className="rec-group__label">Skill Focus</div>
            <div className="rec-skills">
              {recommended_skill_focus.slice(0, 8).map((item, i) => (
                <div key={i} className={`rec-skill rec-skill--${item.priority}`}>
                  <span className="rec-skill__name">{item.skill}</span>
                  <span className="rec-skill__source">{item.source?.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Roles */}
        {recommended_roles?.length > 0 && (
          <div className="rec-group">
            <div className="rec-group__label">Explore These Roles</div>
            <div className="rec-roles">
              {recommended_roles.slice(0, 4).map((role, i) => (
                <div key={i} className="rec-role">
                  <div className="rec-role__top">
                    <div className="rec-role__title">{role.title}</div>
                    {role.salary_growth_pct != null && (
                      <span className="rec-role__growth">+{role.salary_growth_pct}%</span>
                    )}
                  </div>
                  <div className="rec-role__reason">{role.reason}</div>
                  <div className="rec-role__meta">
                    {role.difficulty_label && (
                      <span className="rec-role__tag">{role.difficulty_label}</span>
                    )}
                    {role.estimated_years && (
                      <span className="rec-role__tag">~{role.estimated_years}yr</span>
                    )}
                    {role.readiness_pct != null && (
                      <span className="rec-role__tag">{role.readiness_pct}% ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Tools */}
        {recommended_tools?.length > 0 && (
          <div className="rec-group">
            <div className="rec-group__label">Tools for You</div>
            <div className="rec-tools">
              {recommended_tools.slice(0, 4).map((tool, i) => (
                <Link key={i} href={`/tools/${tool.tool?.replace("-optimiser", "").replace("-prep", "")}`} className="rec-tool">
                  <div className="rec-tool__label">{tool.label}</div>
                  <div className="rec-tool__reason">{tool.reason}</div>
                  <div className={`rec-tool__priority rec-tool__priority--${tool.priority}`}>
                    {tool.priority}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecSkeleton() {
  return (
    <div className="dash-section">
      <div className="dash-section__header"><div className="skel skel--md" /></div>
      <div className="rec-feed">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rec-action" style={{ opacity: 0.4 }}>
            <div className="skel skel--sm" />
            <div className="skel skel--lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
