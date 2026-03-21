// ============================================================================
// components/tools/LinkedinOptimisationCard.js
// HireEdge — LinkedIn Optimiser Result Card (Production v3)
//
// Upgrades:
//   - Recommended headline + alternatives (no raw style labels)
//   - About section with real char count + paragraph rendering
//   - Per-role experience rewrites with copy-all button
//   - Skills grouped: Core / Supporting / Missing
//   - Copy buttons on every copyable block
//   - Positioning strategy clean UI
// ============================================================================

import { useState } from "react";
import ToolResultCard, { TagList, InfoRow } from "./ToolResultCard";

// ── Reusable copy button ──────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy", size = "sm" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <button
      className={`li-copy-btn li-copy-btn--${size} ${copied ? "li-copy-btn--copied" : ""}`}
      onClick={handleCopy}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ── Character count pill ──────────────────────────────────────────────────────
function CharCount({ count, max = 220 }) {
  const over  = count > max;
  const close = count > max * 0.9;
  return (
    <span className={`li-char-count ${over ? "li-char-count--over" : close ? "li-char-count--close" : "li-char-count--ok"}`}>
      {count} / {max}
    </span>
  );
}

// ── Headline section ──────────────────────────────────────────────────────────
function HeadlinesSection({ headlines }) {
  if (!headlines) return null;
  const { recommended, alternatives = [] } = headlines;

  return (
    <ToolResultCard title="Headlines" defaultOpen={true}>
      <p className="li-section-hint">LinkedIn headline limit is 220 characters. Use the recommended option or pick an alternative.</p>

      {/* Recommended */}
      {recommended && (
        <div className="li-headline li-headline--recommended">
          <div className="li-headline__top">
            <span className="li-headline__badge li-headline__badge--rec">⭐ Recommended</span>
            <div className="li-headline__actions">
              <CharCount count={recommended.char_count || recommended.text?.length || 0} />
              <CopyBtn text={recommended.text} label="Copy headline" />
            </div>
          </div>
          <p className="li-headline__text">{recommended.text}</p>
          {recommended.why && <p className="li-headline__why">{recommended.why}</p>}
        </div>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="li-alternatives">
          <span className="li-alternatives__label">Alternative options</span>
          {alternatives.map((h, i) => (
            <div key={i} className="li-headline li-headline--alt">
              <div className="li-headline__top">
                {h.label && <span className="li-headline__badge">{h.label}</span>}
                <div className="li-headline__actions">
                  <CharCount count={h.char_count || h.text?.length || 0} />
                  <CopyBtn text={h.text} label="Copy" />
                </div>
              </div>
              <p className="li-headline__text">{h.text}</p>
              {h.why && <p className="li-headline__why">{h.why}</p>}
            </div>
          ))}
        </div>
      )}
    </ToolResultCard>
  );
}

// ── About section ─────────────────────────────────────────────────────────────
function AboutSection({ about }) {
  if (!about?.text) return null;
  const charCount = about.char_count || about.text.length;
  const paragraphs = about.text.split(/\n\n|\n/).filter((p) => p.trim());

  return (
    <ToolResultCard title="About Section" defaultOpen={true}>
      <div className="li-about-header">
        <div className="li-about-meta">
          <CharCount count={charCount} max={2000} />
          <span className="li-about-hint">Ideal: 1,500–1,900 chars</span>
        </div>
        <CopyBtn text={about.text} label="Copy About section" size="md" />
      </div>

      <div className="li-about-body">
        {paragraphs.map((p, i) => (
          <p key={i} className="li-about-para">{p}</p>
        ))}
      </div>

      {about.hashtags?.length > 0 && (
        <div className="li-about-hashtags">
          <span className="li-about-hashtags__label">Add these hashtags at the end:</span>
          <div className="li-about-hashtags__tags">
            {about.hashtags.map((h, i) => (
              <span key={i} className="li-hashtag">{h}</span>
            ))}
          </div>
          <CopyBtn text={about.hashtags.join(" ")} label="Copy hashtags" />
        </div>
      )}
    </ToolResultCard>
  );
}

// ── Experience rewrites ───────────────────────────────────────────────────────
function ExperienceSection({ rewrites }) {
  if (!rewrites?.length) return null;

  return (
    <ToolResultCard title="Experience Section Rewrites" defaultOpen={true}>
      <p className="li-section-hint">
        Copy-ready bullets for each role. If exact metrics aren't in your CV, personalise the placeholders with your real numbers.
      </p>
      {rewrites.map((role, i) => (
        <div key={i} className="li-exp-role">
          <div className="li-exp-role__header">
            <div>
              <span className="li-exp-role__title">{role.role_title}</span>
              {role.company && <span className="li-exp-role__company"> · {role.company}</span>}
            </div>
            <CopyBtn
              text={role.bullets.map((b) => "• " + b).join("\n")}
              label="Copy all bullets"
            />
          </div>
          <ul className="li-exp-bullets">
            {role.bullets.map((b, j) => (
              <li key={j} className="li-exp-bullet">
                <span className="li-exp-bullet__text">• {b}</span>
                <CopyBtn text={"• " + b} label="Copy" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </ToolResultCard>
  );
}

// ── Skills section ────────────────────────────────────────────────────────────
function SkillsSection({ skills, skillsStrategy }) {
  if (!skills && !skillsStrategy) return null;

  const pin3 = skillsStrategy?.top_3 || [];

  return (
    <ToolResultCard title="Skills to Add" defaultOpen={true}>
      <p className="li-section-hint">
        LinkedIn allows up to 50 skills. Pin your top 3 — they appear prominently on your profile.
      </p>

      {pin3.length > 0 && (
        <div className="li-skills-group li-skills-group--pin">
          <div className="li-skills-group__header">
            <span className="li-skills-group__label">📌 Pin these top 3</span>
            <span className="li-skills-group__hint">Get endorsements for all three</span>
          </div>
          <div className="li-skills-tags">
            {pin3.map((s, i) => <span key={i} className="li-skill-tag li-skill-tag--pin">{s}</span>)}
          </div>
        </div>
      )}

      {skills?.core?.length > 0 && (
        <div className="li-skills-group">
          <div className="li-skills-group__header">
            <span className="li-skills-group__label">✅ Core skills — add these first</span>
          </div>
          <div className="li-skills-tags">
            {skills.core.map((s, i) => <span key={i} className="li-skill-tag li-skill-tag--core">{s}</span>)}
          </div>
        </div>
      )}

      {skills?.supporting?.length > 0 && (
        <div className="li-skills-group">
          <div className="li-skills-group__header">
            <span className="li-skills-group__label">➕ Supporting skills — strengthens your profile</span>
          </div>
          <div className="li-skills-tags">
            {skills.supporting.map((s, i) => <span key={i} className="li-skill-tag li-skill-tag--supporting">{s}</span>)}
          </div>
        </div>
      )}

      {skills?.missing?.length > 0 && (
        <div className="li-skills-group">
          <div className="li-skills-group__header">
            <span className="li-skills-group__label">⚠ Missing skills — gaps to close for your target role</span>
          </div>
          <div className="li-skills-tags">
            {skills.missing.map((s, i) => <span key={i} className="li-skill-tag li-skill-tag--missing">{s}</span>)}
          </div>
        </div>
      )}

      {skillsStrategy && (
        <p className="li-skills-advice">{skillsStrategy.advice}</p>
      )}
    </ToolResultCard>
  );
}

// ── Positioning strategy ──────────────────────────────────────────────────────
function PositioningSection({ strategy }) {
  if (!strategy) return null;

  return (
    <ToolResultCard title="Positioning Strategy" defaultOpen={false}>
      {strategy.angle && (
        <div className="li-strategy-block">
          <span className="li-strategy-label">Your angle</span>
          <p className="li-strategy-text">{strategy.angle}</p>
        </div>
      )}
      {strategy.bridge_message && (
        <div className="li-strategy-block">
          <span className="li-strategy-label">How to frame the transition</span>
          <p className="li-strategy-text">{strategy.bridge_message}</p>
        </div>
      )}
      {strategy.credibility_signal && (
        <div className="li-strategy-block li-strategy-block--highlight">
          <span className="li-strategy-label">Your strongest credibility signal</span>
          <p className="li-strategy-text">{strategy.credibility_signal}</p>
        </div>
      )}
    </ToolResultCard>
  );
}

// ── Keyword strategy (from engine) ────────────────────────────────────────────
function KeywordSection({ keywordStrategy }) {
  if (!keywordStrategy) return null;

  return (
    <ToolResultCard title="Keyword Strategy" defaultOpen={false}>
      {keywordStrategy.primary?.length > 0 && (
        <div className="tool-subsection">
          <span className="tool-subsection__label">Primary — use in headline and About</span>
          <TagList items={keywordStrategy.primary} variant="match" />
        </div>
      )}
      {keywordStrategy.aspirational?.length > 0 && (
        <div className="tool-subsection">
          <span className="tool-subsection__label">Target role keywords — weave into About</span>
          <TagList items={keywordStrategy.aspirational} variant="warn" />
        </div>
      )}
      {keywordStrategy.industry?.length > 0 && (
        <div className="tool-subsection">
          <span className="tool-subsection__label">Industry keywords</span>
          <TagList items={keywordStrategy.industry} />
        </div>
      )}
    </ToolResultCard>
  );
}

// ── Profile strength strip ────────────────────────────────────────────────────
function StrengthStrip({ score, currentRole, targetRole }) {
  if (!score) return null;
  const colour = score.score >= 70 ? "#059669" : score.score >= 45 ? "#d97706" : "#dc2626";
  const label  = score.label?.replace(/_/g, " ") || "";

  return (
    <div className="li-strength-strip">
      <div className="li-strength-strip__score" style={{ color: colour }}>
        {score.score}
        <span className="li-strength-strip__max">/100</span>
      </div>
      <div className="li-strength-strip__info">
        <span className="li-strength-strip__label" style={{ color: colour }}>{label}</span>
        <span className="li-strength-strip__roles">
          {currentRole?.title}
          {targetRole && <> → <strong>{targetRole.title}</strong></>}
        </span>
      </div>
      <div className="li-strength-strip__bar">
        <div className="li-strength-strip__fill" style={{ width: `${score.score}%`, background: colour }} />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LinkedinOptimisationCard({ data }) {
  if (!data) return null;

  const {
    current_role,
    target_role,
    strength_score,
    keyword_strategy,
    skills_strategy,
    ai = {},
  } = data;

  const {
    headlines,
    about_section,
    experience_rewrites = [],
    skills,
    positioning_strategy,
  } = ai;

  const hasContent = headlines || about_section || experience_rewrites.length > 0;

  if (!hasContent) {
    return (
      <div className="tool-results">
        <StrengthStrip score={strength_score} currentRole={current_role} targetRole={target_role} />
        <div className="li-empty">
          <p>Profile analysis complete. Add your CV text for full content generation.</p>
        </div>
        <KeywordSection keywordStrategy={keyword_strategy} />
      </div>
    );
  }

  return (
    <div className="tool-results">

      {/* Profile strength */}
      <StrengthStrip score={strength_score} currentRole={current_role} targetRole={target_role} />

      {/* 1. Headlines */}
      <HeadlinesSection headlines={headlines} />

      {/* 2. About section */}
      <AboutSection about={about_section} />

      {/* 3. Experience rewrites */}
      <ExperienceSection rewrites={experience_rewrites} />

      {/* 4. Skills */}
      <SkillsSection skills={skills} skillsStrategy={skills_strategy} />

      {/* 5. Positioning strategy */}
      <PositioningSection strategy={positioning_strategy} />

      {/* 6. Keyword strategy */}
      <KeywordSection keywordStrategy={keyword_strategy} />

    </div>
  );
}
