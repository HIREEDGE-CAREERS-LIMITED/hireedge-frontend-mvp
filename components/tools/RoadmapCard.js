// ============================================================================
// components/tools/RoadmapCard.js
// HireEdge — Career Roadmap Card (Production v4)
//
// Section order:
//   1. Strategic header — journey + personalisation hook
//   2. Probability dashboard — 3 scores + decision layer
//   3. This week — actions with why/outcome
//   4. Recommended path — phased, actions with why/outcome
//   5. Risks — what can go wrong + mitigations
//   6. Bridge strategy — always actionable
//   7. Gaps — with severity + time-to-close
//   8. Strengths — with competitive advantage
//   9. Alternative paths
//  10. Graph steps (collapsed)
//  11. Salary
// ============================================================================

import { useState } from "react";
import ToolResultCard, { TagList, InfoRow } from "./ToolResultCard";

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function FeasBadge({ label }) {
  const c = { "very achievable":"badge--green","achievable":"badge--green","challenging":"badge--amber","ambitious":"badge--amber","unconventional":"badge--red" }[label] || "badge--mid";
  return <span className={`badge ${c}`}>{label}</span>;
}

function DiffBadge({ label }) {
  const c = { easy:"badge--green", moderate:"badge--amber", hard:"badge--red", very_hard:"badge--red" }[label] || "badge--mid";
  return <span className={`badge ${c}`}>{label}</span>;
}

function RiskBadge({ level }) {
  const c = { low:"rd-risk--low", medium:"rd-risk--med", high:"rd-risk--high", "very high":"rd-risk--vhigh" }[level] || "rd-risk--med";
  return <span className={`rd-risk-badge ${c}`}>{level} risk</span>;
}

function ProbBadge({ level }) {
  const c = { low:"rd-prob--low", medium:"rd-prob--med", high:"rd-prob--high" }[level] || "rd-prob--med";
  return <span className={`rd-prob-badge ${c}`}>{level}</span>;
}

function SeverityPip({ s }) {
  const c = { critical:"rd-sev--critical", significant:"rd-sev--significant", minor:"rd-sev--minor" }[s] || "rd-sev--minor";
  return <span className={`rd-sev ${c}`}>{s}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Strategic header
// ─────────────────────────────────────────────────────────────────────────────

function StrategicHeader({ from, to, feasibility, hook, recommendedPath }) {
  return (
    <div className="rd-header">
      <div className="rd-header__route">
        <span className="rd-header__role rd-header__role--from">{from?.title}</span>
        <div className="rd-header__arrow">
          <svg viewBox="0 0 100 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="6" x2="86" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3"/>
            <polyline points="78,1 90,6 78,11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="rd-header__role rd-header__role--to">{to?.title}</span>
      </div>

      <div className="rd-header__badges">
        {feasibility?.label   && <FeasBadge label={feasibility.label} />}
        {recommendedPath?.total_timeline && (
          <span className="rd-header__time">⏱ {recommendedPath.total_timeline}</span>
        )}
      </div>

      {feasibility?.headline && (
        <p className="rd-header__verdict">{feasibility.headline}</p>
      )}

      {hook && <p className="rd-header__hook">{hook}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Probability dashboard + decision layer
// ─────────────────────────────────────────────────────────────────────────────

function ProbGauge({ label, value, rationale }) {
  const colour = value >= 70 ? "#059669" : value >= 45 ? "#d97706" : "#dc2626";
  const arc    = Math.min(value, 100);
  // SVG semicircle arc
  const r   = 36, cx = 44, cy = 44;
  const deg = (arc / 100) * 180;
  const rad = (deg - 180) * (Math.PI / 180);
  const x   = cx + r * Math.cos(rad);
  const y   = cy + r * Math.sin(rad);
  const large = deg > 180 ? 1 : 0;
  return (
    <div className="rd-gauge">
      <svg viewBox="0 0 88 52" className="rd-gauge__svg">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--bg-elevated)" strokeWidth="7" strokeLinecap="round"/>
        {value > 0 && (
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${x} ${y}`} fill="none" stroke={colour} strokeWidth="7" strokeLinecap="round"/>
        )}
      </svg>
      <div className="rd-gauge__val" style={{ color: colour }}>{value}<span className="rd-gauge__pct">%</span></div>
      <div className="rd-gauge__label">{label}</div>
      {rationale && <p className="rd-gauge__rationale">{rationale}</p>}
    </div>
  );
}

function ConfidencePill({ confidence }) {
  if (!confidence) return null;
  const c = confidence.startsWith("High") ? "rd-conf--high" : confidence.startsWith("Moderate") ? "rd-conf--mod" : "rd-conf--low";
  return <span className={`rd-conf-pill ${c}`}>{confidence}</span>;
}

function ProbabilitySection({ scores, decision }) {
  if (!scores && !decision) return null;
  return (
    <ToolResultCard title="Transition Intelligence" defaultOpen={true}>

      {/* 3 probability gauges */}
      {scores && (
        <div className="rd-gauges">
          <ProbGauge
            label="Transition Confidence"
            value={scores.transition_confidence ?? 0}
            rationale={scores.transition_confidence_rationale}
          />
          <ProbGauge
            label="Skills Readiness"
            value={scores.skills_readiness ?? 0}
            rationale={scores.skills_readiness_rationale}
          />
          <ProbGauge
            label="Market Demand"
            value={scores.market_demand ?? 0}
            rationale={scores.market_demand_rationale}
          />
        </div>
      )}

      {/* Decision layer */}
      {decision && (
        <div className="rd-decision">
          <div className="rd-decision__header">
            <span className="rd-decision__path-label">{decision.recommended_path_label}</span>
            <div className="rd-decision__meta">
              {decision.risk_level && <RiskBadge level={decision.risk_level} />}
              {decision.decision_confidence && <ConfidencePill confidence={decision.decision_confidence} />}
            </div>
          </div>
          {decision.why_this_path_wins && (
            <p className="rd-decision__rationale">{decision.why_this_path_wins}</p>
          )}
          {decision.risk_level_rationale && (
            <p className="rd-decision__risk-note">{decision.risk_level_rationale}</p>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. This week
// ─────────────────────────────────────────────────────────────────────────────

function ThisWeekSection({ actions }) {
  if (!actions?.length) return null;
  return (
    <ToolResultCard title="What to do this week" defaultOpen={true}>
      <p className="rd-hint">Three completable actions. Each has a clear outcome. Do these before anything else.</p>
      <div className="rd-week-list">
        {actions.map((a, i) => (
          <div key={i} className="rd-week-item">
            <div className="rd-week-item__num">{i + 1}</div>
            <div className="rd-week-item__body">
              <div className="rd-week-item__action">{a.action}</div>
              {a.detail && <p className="rd-week-item__detail">{a.detail}</p>}
              <div className="rd-week-item__meta">
                {a.why_it_matters && (
                  <div className="rd-week-item__meta-row">
                    <span className="rd-week-item__meta-label">Why this first</span>
                    <span className="rd-week-item__meta-text">{a.why_it_matters}</span>
                  </div>
                )}
                {a.expected_outcome && (
                  <div className="rd-week-item__meta-row rd-week-item__meta-row--outcome">
                    <span className="rd-week-item__meta-label">Outcome</span>
                    <span className="rd-week-item__meta-text">{a.expected_outcome}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recommended path — phased
// ─────────────────────────────────────────────────────────────────────────────

function PhaseAction({ action }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rd-phase-action">
      <div className="rd-phase-action__main">
        <div className="rd-phase-action__dot" />
        <div className="rd-phase-action__content">
          <div className="rd-phase-action__text">{action.action}</div>
          {action.detail && <p className="rd-phase-action__detail">{action.detail}</p>}
        </div>
        {(action.why_it_matters || action.expected_outcome) && (
          <button className="rd-phase-action__toggle" onClick={() => setOpen(v => !v)}>
            {open ? "▲" : "why"}
          </button>
        )}
      </div>
      {open && (
        <div className="rd-phase-action__extra">
          {action.why_it_matters && (
            <div className="rd-phase-action__extra-row">
              <span className="rd-phase-action__extra-label">Why it matters</span>
              <span className="rd-phase-action__extra-text">{action.why_it_matters}</span>
            </div>
          )}
          {action.expected_outcome && (
            <div className="rd-phase-action__extra-row rd-phase-action__extra-row--outcome">
              <span className="rd-phase-action__extra-label">Expected outcome</span>
              <span className="rd-phase-action__extra-text">{action.expected_outcome}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ phase, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`rd-phase ${open ? "rd-phase--open" : ""}`}>
      <button className="rd-phase__header" onClick={() => setOpen(v => !v)}>
        <div className="rd-phase__header-left">
          <span className="rd-phase__label">{phase.label}</span>
          <span className="rd-phase__title">{phase.title}</span>
        </div>
        <div className="rd-phase__header-right">
          <span className="rd-phase__goal-preview">{phase.goal}</span>
          <span className="rd-phase__chevron">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="rd-phase__body">
          <p className="rd-phase__goal">{phase.goal}</p>
          {phase.actions?.length > 0 && (
            <div className="rd-phase__actions">
              {phase.actions.map((a, i) => <PhaseAction key={i} action={a} />)}
            </div>
          )}
          {phase.skills_focus?.length > 0 && (
            <div className="rd-phase__skills">
              <span className="rd-phase__skills-label">Focus skills</span>
              <div className="rd-phase__skills-tags">
                {phase.skills_focus.map((s, i) => <span key={i} className="rd-skill-tag">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="rd-phase__connector" />
    </div>
  );
}

function RecommendedPathSection({ path }) {
  if (!path?.phases?.length) return null;
  return (
    <ToolResultCard title="Recommended Path" defaultOpen={true}>
      <div className="rd-path-header">
        <div>
          <span className="rd-path-label">{path.label}</span>
          <p className="rd-path-headline">{path.headline}</p>
        </div>
        <div className="rd-path-meta">
          {path.total_timeline && <span className="rd-path-time">{path.total_timeline}</span>}
          {path.difficulty     && <FeasBadge label={path.difficulty} />}
        </div>
      </div>
      <div className="rd-phases">
        {path.phases.map((p, i) => <PhaseBlock key={i} phase={p} index={i} />)}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Risks
// ─────────────────────────────────────────────────────────────────────────────

function RisksSection({ risks, failureReasons }) {
  if (!risks?.length && !failureReasons?.length) return null;
  return (
    <ToolResultCard title="Risks & Failure Modes" defaultOpen={true}>
      <p className="rd-hint">The reasons this transition fails. Know them before you start.</p>

      {risks?.length > 0 && (
        <div className="rd-risks">
          {risks.map((r, i) => (
            <div key={i} className="rd-risk">
              <div className="rd-risk__header">
                <div className="rd-risk__left">
                  <ProbBadge level={r.probability} />
                  <span className="rd-risk__name">{r.risk}</span>
                </div>
              </div>
              <div className="rd-risk__body">
                {r.why_it_happens && (
                  <p className="rd-risk__why">{r.why_it_happens}</p>
                )}
                {r.mitigation && (
                  <div className="rd-risk__mitigation">
                    <span className="rd-risk__mit-label">Mitigation</span>
                    <p className="rd-risk__mit-text">{r.mitigation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {failureReasons?.length > 0 && (
        <div className="rd-failure-reasons">
          <span className="rd-failure-reasons__label">Why candidates with this background typically fail this transition</span>
          {failureReasons.map((f, i) => (
            <div key={i} className="rd-failure-reasons__item">
              <span className="rd-failure-reasons__num">{i + 1}</span>
              <span className="rd-failure-reasons__text">{f}</span>
            </div>
          ))}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Bridge strategy
// ─────────────────────────────────────────────────────────────────────────────

function BridgeStrategySection({ bridge, from, to, adjacent_from, adjacent_to }) {
  const hasAI = bridge?.bridge_steps?.length > 0;
  const hasGraph = adjacent_from?.length > 0 || adjacent_to?.length > 0;
  if (!hasAI && !hasGraph) return null;

  return (
    <ToolResultCard title="Bridge Strategy" defaultOpen={true}>
      {bridge?.headline && <p className="rd-bridge-headline">{bridge.headline}</p>}
      {bridge?.why_direct_is_blocked && (
        <p className="rd-bridge-why">{bridge.why_direct_is_blocked}</p>
      )}

      {hasAI && (
        <div className="rd-bridge-steps">
          {bridge.bridge_steps.map((s, i) => (
            <div key={i} className="rd-bridge-step">
              <div className="rd-bridge-step__num">{s.step}</div>
              <div className="rd-bridge-step__body">
                <div className="rd-bridge-step__header">
                  <span className="rd-bridge-step__title">{s.title}</span>
                  {s.duration && <span className="rd-bridge-step__dur">{s.duration}</span>}
                </div>
                {s.what_to_do && <p className="rd-bridge-step__do">{s.what_to_do}</p>}
                {s.what_it_unlocks && (
                  <div className="rd-bridge-step__unlock">
                    <span className="rd-bridge-step__unlock-label">Unlocks →</span>
                    <span className="rd-bridge-step__unlock-text">{s.what_it_unlocks}</span>
                  </div>
                )}
              </div>
              {i < bridge.bridge_steps.length - 1 && <div className="rd-bridge-step__connector" />}
            </div>
          ))}
        </div>
      )}

      {!hasAI && hasGraph && (
        <div className="rd-bridge-graph">
          {adjacent_from?.length > 0 && (
            <div className="rd-bridge-graph__section">
              <span className="rd-bridge-graph__label">Reachable from {from?.title}</span>
              <div className="rd-bridge-graph__nodes">
                {adjacent_from.map(r => <span key={r.slug} className="rd-adj-node">{r.title}</span>)}
              </div>
            </div>
          )}
          {adjacent_to?.length > 0 && (
            <div className="rd-bridge-graph__section">
              <span className="rd-bridge-graph__label">Routes into {to?.title}</span>
              <div className="rd-bridge-graph__nodes">
                {adjacent_to.map(r => <span key={r.slug} className="rd-adj-node">{r.title}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Gaps
// ─────────────────────────────────────────────────────────────────────────────

function GapsSection({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <ToolResultCard title="Gaps to Close" defaultOpen={true}>
      <div className="rd-gaps">
        {gaps.map((g, i) => (
          <div key={i} className="rd-gap">
            <div className="rd-gap__header">
              <span className="rd-gap__name">{g.gap}</span>
              <div className="rd-gap__tags">
                {g.severity    && <SeverityPip s={g.severity} />}
                {g.time_to_close && <span className="rd-gap__time">{g.time_to_close}</span>}
              </div>
            </div>
            <div className="rd-gap__body">
              {g.why_it_matters && (
                <div className="rd-gap__row">
                  <span className="rd-gap__field">Why it matters</span>
                  <span className="rd-gap__val">{g.why_it_matters}</span>
                </div>
              )}
              {g.how_to_close && (
                <div className="rd-gap__row rd-gap__row--action">
                  <span className="rd-gap__field">How to close it</span>
                  <span className="rd-gap__val">{g.how_to_close}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Strengths
// ─────────────────────────────────────────────────────────────────────────────

function StrengthsSection({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <ToolResultCard title="Strengths to Leverage" defaultOpen={true}>
      <div className="rd-strengths">
        {strengths.map((s, i) => (
          <div key={i} className="rd-strength">
            <div className="rd-strength__icon">✓</div>
            <div className="rd-strength__body">
              <div className="rd-strength__name">{s.strength}</div>
              {s.how_to_use && <p className="rd-strength__how">{s.how_to_use}</p>}
              {s.competitive_advantage && (
                <div className="rd-strength__edge">
                  <span className="rd-strength__edge-label">Competitive edge</span>
                  <span className="rd-strength__edge-text">{s.competitive_advantage}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Alternative paths
// ─────────────────────────────────────────────────────────────────────────────

function AltPathsSection({ aiPaths, graphAlts, fromTitle, toTitle }) {
  const paths = aiPaths?.length > 0 ? aiPaths : _formatGraphAlts(graphAlts, fromTitle, toTitle);
  if (!paths?.length) return null;
  return (
    <ToolResultCard title="Alternative Paths" defaultOpen={false}>
      <div className="rd-alt-paths">
        {paths.map((p, i) => (
          <div key={i} className="rd-alt-path">
            <div className="rd-alt-path__header">
              <span className="rd-alt-path__label">{p.label}</span>
              {p.timeline && <span className="rd-alt-path__time">⏱ {p.timeline}</span>}
            </div>
            {p.headline && <p className="rd-alt-path__headline">{p.headline}</p>}
            {p.route?.length > 0 && (
              <div className="rd-alt-path__route">
                {p.route.map((r, j) => (
                  <span key={j} className="rd-alt-path__route-item">
                    {j > 0 && <span className="rd-alt-path__arrow">→</span>}
                    <span className={`rd-alt-path__node ${j===0?"--from":j===p.route.length-1?"--to":"--mid"}`}>{r}</span>
                  </span>
                ))}
              </div>
            )}
            {(p.trade_off || p.best_for) && (
              <div className="rd-alt-path__detail">
                {p.trade_off && (
                  <div className="rd-alt-path__row">
                    <span className="rd-alt-path__field">Trade-off</span>
                    <span className="rd-alt-path__val">{p.trade_off}</span>
                  </div>
                )}
                {p.best_for && (
                  <div className="rd-alt-path__row">
                    <span className="rd-alt-path__field">Best for</span>
                    <span className="rd-alt-path__val">{p.best_for}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

function _formatGraphAlts(alts, fromTitle, toTitle) {
  return (alts || []).map((a, i) => ({
    label: `Alternative route ${i + 1}`,
    headline: `${a.title || toTitle} — ${a.total_steps} steps (~${a.total_years}yr)`,
    route: [fromTitle, a.title].filter(Boolean),
    timeline: `~${a.total_years}yr`,
    trade_off: null, best_for: null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Graph steps
// ─────────────────────────────────────────────────────────────────────────────

function GraphStep({ step }) {
  return (
    <div className={`rd-gstep ${step.is_current?"rd-gstep--current":""} ${step.is_target?"rd-gstep--target":""}`}>
      <div className="rd-gstep__num">{step.step}</div>
      <div className="rd-gstep__body">
        <div className="rd-gstep__title">
          {step.title}
          {step.is_current && <span className="rd-gstep__tag rd-gstep__tag--you">You are here</span>}
          {step.is_target  && <span className="rd-gstep__tag rd-gstep__tag--target">Target</span>}
        </div>
        <div className="rd-gstep__meta">
          {step.category} · {step.seniority}
          {step.salary?.mean ? ` · £${step.salary.mean.toLocaleString()}` : ""}
        </div>
        {step.transition_in && (
          <div className="rd-gstep__trans">
            <DiffBadge label={step.transition_in.difficulty_label} />
            <span>~{step.transition_in.estimated_years}yr</span>
            {step.transition_in.salary_growth_pct != null && (
              <span className={step.transition_in.salary_growth_pct >= 0 ? "rd-gstep__growth--up" : "rd-gstep__growth--dn"}>
                {step.transition_in.salary_growth_pct >= 0 ? "+" : ""}{step.transition_in.salary_growth_pct}%
              </span>
            )}
          </div>
        )}
        {step.skills_gap_to_next?.new_skills_needed?.length > 0 && (
          <TagList items={step.skills_gap_to_next.new_skills_needed.slice(0, 5)} variant="warn" />
        )}
      </div>
    </div>
  );
}

function GraphStepsSection({ steps, summary, bridgeRole }) {
  if (!steps?.length) return null;
  return (
    <ToolResultCard title="Step-by-Step Graph Path" defaultOpen={false}>
      {summary && (
        <div className="rd-summary-grid">
          <InfoRow label="Steps"      value={summary.total_steps} />
          <InfoRow label="Est. time"  value={`~${summary.total_estimated_years}yr`} />
          {summary.salary_growth_pct != null && <InfoRow label="Salary Δ" value={`${summary.salary_growth_pct>=0?"+":""}${summary.salary_growth_pct}%`} accent />}
        </div>
      )}
      {bridgeRole && (
        <p className="rd-bridge-note">Path runs via <strong>{bridgeRole.title}</strong>.</p>
      )}
      <div className="rd-gsteps">
        {steps.map((s, i) => (
          <div key={s.slug || i}>
            {i > 0 && <div className="rd-gstep__connector" />}
            <GraphStep step={s} />
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Salary
// ─────────────────────────────────────────────────────────────────────────────

function SalarySection({ trajectory, feasibility }) {
  if (!trajectory && !feasibility?.why) return null;
  return (
    <ToolResultCard title="Salary & Timeline" defaultOpen={false}>
      {trajectory && (
        <div className="rd-salary-row">
          <div className="rd-salary-band">
            <span className="rd-salary-band__label">Current</span>
            <span className="rd-salary-band__val">{trajectory.current}</span>
          </div>
          <span className="rd-salary-arrow">→</span>
          <div className="rd-salary-band rd-salary-band--target">
            <span className="rd-salary-band__label">Target</span>
            <span className="rd-salary-band__val">{trajectory.target}</span>
          </div>
        </div>
      )}
      {trajectory?.note && <p className="rd-salary-note">{trajectory.note}</p>}
      {feasibility?.why && (
        <div className="rd-feas-detail">
          <span className="rd-feas-detail__label">Transition analysis</span>
          <p className="rd-feas-detail__text">{feasibility.why}</p>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function RoadmapCard({ data }) {
  if (!data) return null;

  const {
    from, to,
    reachable, bridge_mode, bridge_role,
    steps = [], summary, alternatives = [],
    adjacent_from = [], adjacent_to = [],
    ai = {},
  } = data;

  const {
    personalisation_hook,
    probability_scores,
    decision_layer,
    feasibility,
    recommended_path,
    risks                  = [],
    common_failure_reasons = [],
    bridge_strategy,
    strengths_to_leverage  = [],
    gaps_to_close          = [],
    alternative_paths      = [],
    this_week              = [],
    salary_trajectory,
  } = ai;

  return (
    <div className="tool-results">

      {/* 1. Strategic header */}
      <StrategicHeader
        from={from} to={to}
        feasibility={feasibility}
        hook={personalisation_hook}
        recommendedPath={recommended_path}
      />

      {/* 2. Probability dashboard + decision layer */}
      <ProbabilitySection scores={probability_scores} decision={decision_layer} />

      {/* 3. This week */}
      <ThisWeekSection actions={this_week} />

      {/* 4. Recommended path */}
      <RecommendedPathSection path={recommended_path} />

      {/* 5. Risks */}
      <RisksSection risks={risks} failureReasons={common_failure_reasons} />

      {/* 6. Bridge strategy */}
      <BridgeStrategySection
        bridge={bridge_strategy}
        from={from} to={to}
        adjacent_from={adjacent_from}
        adjacent_to={adjacent_to}
      />

      {/* 7. Gaps */}
      <GapsSection gaps={gaps_to_close} />

      {/* 8. Strengths */}
      <StrengthsSection strengths={strengths_to_leverage} />

      {/* 9. Alternative paths */}
      <AltPathsSection
        aiPaths={alternative_paths}
        graphAlts={alternatives}
        fromTitle={from?.title}
        toTitle={to?.title}
      />

      {/* 10. Graph steps */}
      <GraphStepsSection steps={steps} summary={summary} bridgeRole={bridge_role} />

      {/* 11. Salary */}
      <SalarySection trajectory={salary_trajectory} feasibility={feasibility} />

    </div>
  );
}
