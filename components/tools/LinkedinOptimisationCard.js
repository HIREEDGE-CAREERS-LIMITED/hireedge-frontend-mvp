// ============================================================================
// components/tools/LinkedinOptimisationCard.js
// HireEdge — LinkedIn Profile Audit Card (Production v4)
//
// Section order:
//   1. Profile Score Dashboard   — score ring + 5-axis breakdown + grade
//   2. Biggest Issues            — 3 personalised critical problems
//   3. Before / After            — transformation comparison
//   4. Headlines                 — cards with why + when_to_use
//   5. About Section             — structured breakdown tabs + full copy
//   6. Experience Rewrites       — per-role bullets with copy
//   7. Keywords                  — high-demand + missing with explanations
//   8. Skills                    — core / supporting / missing grouped
//   9. Positioning Strategy      — angle + credibility signal
// ============================================================================

import { useState } from "react";
import ToolResultCard, { InfoRow } from "./ToolResultCard";

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function CopyBtn({ text, label = "Copy", size = "sm" }) {
  const [copied, setCopied] = useState(false);
  async function go() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }
  return (
    <button className={`la-copy la-copy--${size} ${copied ? "la-copy--done" : ""}`} onClick={go}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

function CharCount({ count, max = 220 }) {
  const cls = count > max ? "la-chars--over" : count > max * 0.9 ? "la-chars--close" : "la-chars--ok";
  return <span className={`la-chars ${cls}`}>{count}/{max}</span>;
}

function GradePill({ grade }) {
  const map = { "Needs Work":"la-grade--low","Developing":"la-grade--low","Good":"la-grade--mid","Strong":"la-grade--high","Excellent":"la-grade--high" };
  return <span className={`la-grade ${map[grade]||"la-grade--mid"}`}>{grade}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Profile Score Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const AXES = [
  ["headline",      "Headline"],
  ["about_section", "About Section"],
  ["keywords",      "Keywords"],
  ["positioning",   "Positioning"],
  ["completeness",  "Completeness"],
];

function ScoreAxis({ label, score, note }) {
  const colour = score >= 70 ? "#059669" : score >= 45 ? "#d97706" : "#dc2626";
  return (
    <div className="la-axis">
      <div className="la-axis__top">
        <span className="la-axis__label">{label}</span>
        <span className="la-axis__val" style={{ color: colour }}>{score}</span>
      </div>
      <div className="la-axis__track">
        <div className="la-axis__fill" style={{ width: `${score}%`, background: colour }} />
      </div>
      {note && <p className="la-axis__note">{note}</p>}
    </div>
  );
}

function ProfileScoreDashboard({ audit, currentRole, targetRole }) {
  if (!audit) return null;
  const score   = audit.overall_score ?? 0;
  const colour  = score >= 70 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  const pct     = `${score}%`;

  return (
    <div className="la-dashboard">
      {/* Left: ring + grade */}
      <div className="la-dashboard__left">
        <div className="la-dashboard__ring" style={{ "--lad-colour": colour, "--lad-pct": pct }}>
          <div className="la-dashboard__ring-inner">
            <span className="la-dashboard__score" style={{ color: colour }}>{score}</span>
            <span className="la-dashboard__score-sub">/100</span>
          </div>
        </div>
        {audit.grade && <GradePill grade={audit.grade} />}
        <div className="la-dashboard__roles">
          <span className="la-dashboard__role">{currentRole?.title}</span>
          {targetRole && <><span className="la-dashboard__arrow">→</span><span className="la-dashboard__role la-dashboard__role--target">{targetRole.title}</span></>}
        </div>
      </div>

      {/* Right: axis breakdown */}
      <div className="la-dashboard__right">
        {AXES.map(([key, label]) => {
          const axis = audit.breakdown?.[key];
          return (
            <ScoreAxis
              key={key}
              label={label}
              score={axis?.score ?? 0}
              note={axis?.note}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Biggest Issues
// ─────────────────────────────────────────────────────────────────────────────

function BiggestIssues({ issues }) {
  if (!issues?.length) return null;
  return (
    <ToolResultCard title="Biggest Issues on Your Profile" defaultOpen={true}>
      <p className="la-hint">Fix these three things before anything else. Each one is costing you visibility or credibility.</p>
      <div className="la-issues">
        {issues.map((iss, i) => (
          <div key={i} className="la-issue">
            <div className="la-issue__header">
              <span className="la-issue__num">{i + 1}</span>
              <span className="la-issue__name">{iss.issue}</span>
            </div>
            <div className="la-issue__body">
              <p className="la-issue__why">{iss.why_it_hurts}</p>
              {iss.fix && (
                <div className="la-issue__fix">
                  <span className="la-issue__fix-label">Fix →</span>
                  <span className="la-issue__fix-text">{iss.fix}</span>
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
// 3. Before / After
// ─────────────────────────────────────────────────────────────────────────────

function BeforeAfterRow({ label, before, after }) {
  if (!before && !after) return null;
  return (
    <div className="la-ba-row">
      <span className="la-ba-row__label">{label}</span>
      <div className="la-ba-pair">
        <div className="la-ba-side la-ba-side--before">
          <span className="la-ba-side__tag">Before</span>
          <p className="la-ba-side__text">{before}</p>
        </div>
        <div className="la-ba-divider">→</div>
        <div className="la-ba-side la-ba-side--after">
          <span className="la-ba-side__tag">After</span>
          <p className="la-ba-side__text">{after}</p>
          <CopyBtn text={after} label="Copy" />
        </div>
      </div>
    </div>
  );
}

function BeforeAfterSection({ ba }) {
  if (!ba) return null;
  return (
    <ToolResultCard title="Before → After" defaultOpen={true}>
      <p className="la-hint">The transformation your profile makes with this audit applied.</p>
      <BeforeAfterRow label="Headline"            before={ba.headline?.before}        after={ba.headline?.after} />
      <BeforeAfterRow label="About opening"       before={ba.about_opening?.before}   after={ba.about_opening?.after} />
      <BeforeAfterRow label="Experience bullet"   before={ba.experience_bullet?.before} after={ba.experience_bullet?.after} />
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Headlines
// ─────────────────────────────────────────────────────────────────────────────

function HeadlineCard({ h, isRec }) {
  return (
    <div className={`la-headline ${isRec ? "la-headline--rec" : "la-headline--alt"}`}>
      <div className="la-headline__top">
        <div className="la-headline__badges">
          {isRec && <span className="la-headline__badge la-headline__badge--rec">⭐ Recommended</span>}
          {!isRec && h.label && <span className="la-headline__badge">{h.label}</span>}
        </div>
        <div className="la-headline__actions">
          <CharCount count={h.char_count || h.text?.length || 0} max={220} />
          <CopyBtn text={h.text} label="Copy" />
        </div>
      </div>
      <p className="la-headline__text">{h.text}</p>
      <div className="la-headline__meta">
        {h.why && (
          <div className="la-headline__meta-row">
            <span className="la-headline__meta-label">Why it works</span>
            <span className="la-headline__meta-text">{h.why}</span>
          </div>
        )}
        {h.when_to_use && (
          <div className="la-headline__meta-row la-headline__meta-row--when">
            <span className="la-headline__meta-label">When to use</span>
            <span className="la-headline__meta-text">{h.when_to_use}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function HeadlinesSection({ headlines }) {
  if (!headlines) return null;
  const { recommended, alternatives = [] } = headlines;
  return (
    <ToolResultCard title="Headlines" defaultOpen={true}>
      <p className="la-hint">Max 220 characters. Use the recommended version or swap to an alternative depending on your goal.</p>
      {recommended && <HeadlineCard h={recommended} isRec={true} />}
      {alternatives.length > 0 && (
        <>
          <p className="la-alts-label">Alternative options</p>
          {alternatives.map((h, i) => <HeadlineCard key={i} h={h} isRec={false} />)}
        </>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. About Section
// ─────────────────────────────────────────────────────────────────────────────

const ABOUT_TABS = [
  ["full",       "Full Copy"],
  ["hook",       "Hook"],
  ["value_prop", "Value Prop"],
  ["transition", "Transition"],
  ["cta",        "CTA"],
];

function AboutSection({ about }) {
  const [tab, setTab] = useState("full");
  if (!about?.text) return null;

  const charCount  = about.char_count || about.text.length;
  const paragraphs = about.text.split(/\n\n|\n/).filter(p => p.trim());
  const bd         = about.structured_breakdown || {};

  const tabContent = {
    full:       { text: about.text, label: "Copy full About section" },
    hook:       { text: bd.hook,       label: "Copy hook" },
    value_prop: { text: bd.value_prop, label: "Copy value proposition" },
    transition: { text: bd.transition, label: "Copy transition line" },
    cta:        { text: bd.cta,        label: "Copy CTA" },
  };

  const active = tabContent[tab];

  return (
    <ToolResultCard title="About Section" defaultOpen={true}>
      {/* Tab row */}
      <div className="la-about-tabs">
        {ABOUT_TABS.map(([key, label]) => (
          <button
            key={key}
            className={`la-about-tab ${tab === key ? "la-about-tab--active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Char count row (only for full) */}
      {tab === "full" && (
        <div className="la-about-meta">
          <CharCount count={charCount} max={2000} />
          <span className="la-about-hint">Ideal: 1,500–1,900 chars</span>
          <CopyBtn text={about.text} label="Copy About section" size="md" />
        </div>
      )}

      {/* Content */}
      <div className="la-about-content">
        {tab === "full" ? (
          <>
            {paragraphs.map((p, i) => <p key={i} className="la-about-para">{p}</p>)}
          </>
        ) : (
          <div className="la-about-fragment">
            <p className="la-about-fragment__text">{active.text || "—"}</p>
            {active.text && (
              <div className="la-about-fragment__actions">
                <CopyBtn text={active.text} label={active.label} size="md" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hashtags */}
      {about.hashtags?.length > 0 && tab === "full" && (
        <div className="la-hashtags">
          <span className="la-hashtags__label">Hashtags to add at the end:</span>
          <div className="la-hashtags__tags">
            {about.hashtags.map((h, i) => <span key={i} className="la-hashtag">{h}</span>)}
          </div>
          <CopyBtn text={about.hashtags.join(" ")} label="Copy all" />
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Experience Rewrites
// ─────────────────────────────────────────────────────────────────────────────

function ExperienceSection({ rewrites }) {
  if (!rewrites?.length) return null;
  return (
    <ToolResultCard title="Experience Section Rewrites" defaultOpen={true}>
      <p className="la-hint">Copy-ready bullets per role. Replace any approximate phrasing with your real numbers and specifics.</p>
      {rewrites.map((role, i) => (
        <div key={i} className="la-exp-role">
          <div className="la-exp-role__header">
            <div>
              <span className="la-exp-role__title">{role.role_title}</span>
              {role.company && <span className="la-exp-role__co"> · {role.company}</span>}
            </div>
            <CopyBtn text={role.bullets.map(b => "• " + b).join("\n")} label="Copy all" />
          </div>
          <ul className="la-exp-bullets">
            {role.bullets.map((b, j) => (
              <li key={j} className="la-exp-bullet">
                <span className="la-exp-bullet__text">• {b}</span>
                <CopyBtn text={"• " + b} label="Copy" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Keywords (upgraded)
// ─────────────────────────────────────────────────────────────────────────────

function ImpactPip({ level }) {
  return (
    <span className={`la-impact la-impact--${level === "High" ? "high" : "med"}`}>{level} impact</span>
  );
}

function KeywordsSection({ keywords }) {
  if (!keywords) return null;
  const { high_demand = [], missing_critical = [], currently_strong = [] } = keywords;

  return (
    <ToolResultCard title="Keyword Strategy" defaultOpen={true}>

      {/* High demand */}
      {high_demand.length > 0 && (
        <div className="la-kw-group">
          <div className="la-kw-group__header">
            <span className="la-kw-group__label">🔥 High-demand keywords to use</span>
            <span className="la-kw-group__hint">These drive recruiter search visibility</span>
          </div>
          {high_demand.map((kw, i) => (
            <div key={i} className="la-kw-card la-kw-card--demand">
              <div className="la-kw-card__top">
                <span className="la-kw-card__word">{kw.keyword}</span>
                {kw.where_to_use && <span className="la-kw-card__placement">{kw.where_to_use}</span>}
              </div>
              {kw.why_it_matters && <p className="la-kw-card__why">{kw.why_it_matters}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Missing critical */}
      {missing_critical.length > 0 && (
        <div className="la-kw-group la-kw-group--missing">
          <div className="la-kw-group__header">
            <span className="la-kw-group__label">⚠ Missing keywords — add these</span>
          </div>
          {missing_critical.map((kw, i) => (
            <div key={i} className="la-kw-card la-kw-card--missing">
              <div className="la-kw-card__top">
                <span className="la-kw-card__word">{kw.keyword}</span>
                {kw.impact && <ImpactPip level={kw.impact} />}
              </div>
              {kw.why_it_matters && <p className="la-kw-card__why">{kw.why_it_matters}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Currently strong */}
      {currently_strong.length > 0 && (
        <div className="la-kw-group la-kw-group--strong">
          <span className="la-kw-group__label la-kw-group__label--strong">✓ Already strong in your profile</span>
          <div className="la-kw-chips">
            {currently_strong.map((kw, i) => <span key={i} className="la-kw-chip">{kw}</span>)}
          </div>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Skills
// ─────────────────────────────────────────────────────────────────────────────

function SkillsSection({ skills, skillsStrategy }) {
  if (!skills && !skillsStrategy) return null;
  const pin3 = skillsStrategy?.top_3 || [];

  return (
    <ToolResultCard title="Skills to Add to LinkedIn" defaultOpen={false}>
      <p className="la-hint">LinkedIn shows your top 3 pinned skills prominently. Get endorsements for all three.</p>

      {pin3.length > 0 && (
        <div className="la-skills-group la-skills-group--pin">
          <span className="la-skills-group__label">📌 Pin these 3 skills</span>
          <div className="la-skill-chips">
            {pin3.map((s, i) => <span key={i} className="la-skill-chip la-skill-chip--pin">{s}</span>)}
          </div>
        </div>
      )}
      {skills?.core?.length > 0 && (
        <div className="la-skills-group">
          <span className="la-skills-group__label">✅ Core — add these first</span>
          <div className="la-skill-chips">
            {skills.core.map((s, i) => <span key={i} className="la-skill-chip la-skill-chip--core">{s}</span>)}
          </div>
        </div>
      )}
      {skills?.supporting?.length > 0 && (
        <div className="la-skills-group">
          <span className="la-skills-group__label">➕ Supporting — round out the profile</span>
          <div className="la-skill-chips">
            {skills.supporting.map((s, i) => <span key={i} className="la-skill-chip la-skill-chip--sup">{s}</span>)}
          </div>
        </div>
      )}
      {skills?.missing?.length > 0 && (
        <div className="la-skills-group">
          <span className="la-skills-group__label">⚠ Missing — gaps to close</span>
          <div className="la-skill-chips">
            {skills.missing.map((s, i) => <span key={i} className="la-skill-chip la-skill-chip--miss">{s}</span>)}
          </div>
        </div>
      )}
      {skillsStrategy?.advice && <p className="la-skills-advice">{skillsStrategy.advice}</p>}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Positioning Strategy
// ─────────────────────────────────────────────────────────────────────────────

function PositioningSection({ strategy }) {
  if (!strategy) return null;
  return (
    <ToolResultCard title="Positioning Strategy" defaultOpen={false}>
      {strategy.angle && (
        <div className="la-pos-block">
          <span className="la-pos-label">Your angle</span>
          <p className="la-pos-text">{strategy.angle}</p>
        </div>
      )}
      {strategy.bridge_message && (
        <div className="la-pos-block">
          <span className="la-pos-label">How to frame the transition</span>
          <p className="la-pos-text">{strategy.bridge_message}</p>
        </div>
      )}
      {strategy.credibility_signal && (
        <div className="la-pos-block la-pos-block--highlight">
          <span className="la-pos-label">Strongest credibility signal</span>
          <p className="la-pos-text">{strategy.credibility_signal}</p>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function LinkedinOptimisationCard({ data }) {
  if (!data) return null;

  const {
    current_role,
    target_role,
    keyword_strategy,
    skills_strategy,
    ai = {},
  } = data;

  const {
    profile_audit,
    before_after,
    headlines,
    about_section,
    experience_rewrites = [],
    keywords,
    skills,
    positioning_strategy,
  } = ai;

  return (
    <div className="tool-results">

      {/* 1. Score dashboard */}
      <ProfileScoreDashboard
        audit={profile_audit}
        currentRole={current_role}
        targetRole={target_role}
      />

      {/* 2. Biggest issues */}
      <BiggestIssues issues={profile_audit?.biggest_issues} />

      {/* 3. Before / After */}
      <BeforeAfterSection ba={before_after} />

      {/* 4. Headlines */}
      <HeadlinesSection headlines={headlines} />

      {/* 5. About section */}
      <AboutSection about={about_section} />

      {/* 6. Experience rewrites */}
      <ExperienceSection rewrites={experience_rewrites} />

      {/* 7. Keywords */}
      <KeywordsSection keywords={keywords} />

      {/* 8. Skills */}
      <SkillsSection skills={skills} skillsStrategy={skills_strategy} />

      {/* 9. Positioning */}
      <PositioningSection strategy={positioning_strategy} />

    </div>
  );
}
