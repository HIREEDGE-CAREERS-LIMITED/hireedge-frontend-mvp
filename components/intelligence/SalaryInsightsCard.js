// ============================================================================
// components/intelligence/SalaryInsightsCard.js
// HireEdge Frontend — Salary intelligence visualisation
// ============================================================================

export default function SalaryInsightsCard({ salary, loading }) {
  if (loading) return <SalarySkeleton />;
  if (!salary) return null;

  const { salary: sal, category_benchmark: bench, progression, best_salary_move: best } = salary;
  const maxProgression = Math.max(...(progression || []).map(p => p.target_salary_mean || 0), sal.mean || 0);

  return (
    <div className="intel-salary">
      {/* Header */}
      <div className="intel-salary__header">
        <div>
          <h3 className="intel-salary__title">{salary.title}</h3>
          <div className="intel-salary__meta">{salary.category} · {salary.seniority}</div>
        </div>
        <div className="intel-salary__mean">
          <span className="intel-salary__currency">£</span>
          <span className="intel-salary__amount">{sal.mean?.toLocaleString()}</span>
        </div>
      </div>

      {/* Range bar */}
      <div className="intel-salary__range">
        <div className="intel-salary__range-bar">
          <div
            className="intel-salary__range-fill"
            style={{ left: "0%", width: "100%" }}
          />
          <div
            className="intel-salary__range-marker"
            style={{ left: `${sal.mean && sal.max ? ((sal.mean - sal.min) / (sal.max - sal.min)) * 100 : 50}%` }}
            title={`Mean: £${sal.mean?.toLocaleString()}`}
          />
        </div>
        <div className="intel-salary__range-labels">
          <span>£{sal.min?.toLocaleString()}</span>
          <span>£{sal.max?.toLocaleString()}</span>
        </div>
      </div>

      {/* Benchmark */}
      {bench && (
        <div className="intel-salary__bench">
          <div className="intel-salary__bench-row">
            <span className="intel-salary__bench-label">Category average</span>
            <span className="intel-salary__bench-value">£{bench.category_mean?.toLocaleString()}</span>
          </div>
          <div className="intel-salary__bench-row">
            <span className="intel-salary__bench-label">vs. category</span>
            <span className={`intel-salary__bench-value ${bench.vs_category_pct >= 0 ? "intel-salary__bench-value--pos" : "intel-salary__bench-value--neg"}`}>
              {bench.vs_category_pct >= 0 ? "+" : ""}{bench.vs_category_pct}%
            </span>
          </div>
          <div className="intel-salary__bench-row">
            <span className="intel-salary__bench-label">Percentile</span>
            <div className="intel-salary__percentile">
              <div className="intel-salary__percentile-track">
                <div className="intel-salary__percentile-fill" style={{ width: `${bench.percentile_in_category}%` }} />
              </div>
              <span className="intel-salary__percentile-num">{bench.percentile_in_category}th</span>
            </div>
          </div>
        </div>
      )}

      {/* Progression chart */}
      {progression?.length > 0 && (
        <div className="intel-salary__progression">
          <h4 className="intel-label">Salary Progression</h4>
          <div className="intel-salary__bars">
            {progression.slice(0, 5).map((p) => {
              const pct = maxProgression > 0 ? ((p.target_salary_mean || 0) / maxProgression) * 100 : 0;
              return (
                <div key={p.slug} className="intel-salary__bar-row">
                  <div className="intel-salary__bar-label">
                    <span className="intel-salary__bar-title">{p.title}</span>
                    <span className="intel-salary__bar-growth">+{p.salary_growth_pct}%</span>
                  </div>
                  <div className="intel-salary__bar-track">
                    <div className="intel-salary__bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="intel-salary__bar-amount">£{p.target_salary_mean?.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best move callout */}
      {best && (
        <div className="intel-salary__best">
          Best salary move: <strong>{best.title}</strong> (+{best.salary_growth_pct}%, ~{best.estimated_years}yr)
        </div>
      )}
    </div>
  );
}

function SalarySkeleton() {
  return (
    <div className="intel-salary">
      <div className="intel-salary__header">
        <div><div className="skel skel--lg" /><div className="skel skel--sm" style={{ marginTop: 6 }} /></div>
        <div className="skel skel--lg" style={{ width: 100 }} />
      </div>
      <div className="skel" style={{ width: "100%", height: 8, marginTop: 16 }} />
      <div style={{ marginTop: 16 }}>{[1,2,3].map(i => <div key={i} className="skel skel--md" style={{ marginTop: 8 }} />)}</div>
    </div>
  );
}
