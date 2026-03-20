// ============================================================================
// components/dashboard/ActivityTimeline.js
// HireEdge Frontend — Recent activity timeline
// ============================================================================

const TYPE_META = {
  role_view:  { icon: "👁️", label: "Viewed role"   },
  tool_use:   { icon: "🔧", label: "Used tool"     },
  query:      { icon: "💬", label: "Asked EDGEX"   }, // was: "Asked Copilot"
  pack_build: { icon: "📦", label: "Built pack"    },
};

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ActivityTimeline({ activity, loading }) {
  if (loading) return <ActivitySkeleton />;

  const timeline = activity?.timeline || [];

  if (timeline.length === 0) {
    return (
      <div className="dash-section">
        <div className="dash-section__header">
          <h3 className="dash-section__title">Recent Activity</h3>
        </div>
        <div className="dash-empty dash-empty--compact">
          <p className="dash-empty__text">No activity yet</p>
          <p className="dash-empty__hint">Start exploring and your activity will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section">
      <div className="dash-section__header">
        <h3 className="dash-section__title">Recent Activity</h3>
      </div>
      <div className="activity">
        {timeline.slice(0, 8).map((item, i) => {
          const meta = TYPE_META[item.type] || { icon: "📋", label: "Activity" };
          return (
            <div key={item.id || i} className="activity__item">
              <div className="activity__icon">{meta.icon}</div>
              <div className="activity__content">
                <div className="activity__label">
                  <span className="activity__type">{meta.label}</span>
                  <span className="activity__title">
                    {item.title || item.label || item.query || item.tool || item.id}
                  </span>
                </div>
                {item.category && (
                  <span className="activity__category">{item.category}</span>
                )}
              </div>
              <div className="activity__time">{relativeTime(item.timestamp)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="dash-section">
      <div className="dash-section__header"><div className="skel skel--md" /></div>
      <div className="activity">
        {[1, 2, 3].map((i) => (
          <div key={i} className="activity__item" style={{ opacity: 0.3 }}>
            <div className="skel skel--circle-sm" />
            <div style={{ flex: 1 }}>
              <div className="skel skel--lg" />
              <div className="skel skel--sm" style={{ marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
