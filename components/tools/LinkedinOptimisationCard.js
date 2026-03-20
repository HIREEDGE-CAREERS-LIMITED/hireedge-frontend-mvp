// ============================================================================
// components/tools/LinkedinOptimisationCard.js
// HireEdge Frontend — LinkedIn Optimiser (Production v2)
// ============================================================================

import { useState } from "react";
import ToolResultCard, { ScoreBadge, InfoRow, TagList } from "./ToolResultCard";

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };
  return (
    <button className="copy-btn" onClick={copy} title="Copy to clipboard">
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ── Score label pill ─────────────────────────────────────────────────────────
function StrengthBadge({ label }) {
  const map = { all_star: "badge--green", strong: "badge--green", intermediate: "badge--amber", needs_work: "badge--red" };
  return <span className={`badge ${map[label] || "badge--mid"}`}>{label.replace(/_/g, " ")}</span>;
}

// ── Headline card ─────────────────────────────────────────────────────────────
function HeadlineCard({ h }) {
  return (
    <div className="li-headline">
      <div className="li-headline__top">
        <span className="li-headline__style">{h.style.replace(/_/g, " ")}</span>
        <CopyBtn text={h.text || h.headline} label="Copy" />
      </div>
      <p className="li-headline__text">{h.text || h.headline}</p>
      <p className="li-headline__why">{h.why || h.rationale}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LinkedinOptimisationCard({ data }) {
  if (!data) return null;

  const {
    current_role,
    target_role,
    strength_score,
    headlines          = [],
    about_section,
    skills_strategy,
    keyword_strategy,
    experience_tips    = [],
    featured_section   = [],
    ai = {},
  } = data;

  const {
    written_about,
    positioning_strategy,
    copy_ready_headlines = [],
    written_experience_bullets = [],
    keyword_map,
  } = ai;

  // Prefer AI headlines if available, fall back to engine headlines
  const displayHeadlines = copy_ready_headlines.length > 0 ? copy_ready_headlines : headlines;

  return (
    <div className="tool-results">

      {/* ── EDGEX Summary strip ─────────────────────────────────────────── */}
      <div className="edgex-strip">
        <div className="edgex-strip__left">
          <div className={`edgex-strip__score ${(strength_score?.score || 0) >= 70 ? "score--green" : (strength_score?.score || 0) >= 45 ? "score--amber" : "score--red"}`}>
            {strength_score?.score ?? "—"}
          </div>
          <div className="edgex-strip__score-label">Profile Strength</div>
        </div>
        <div className="edgex-strip__right">
          <div className="edgex-strip__meta">{current_role?.title}</div>
          {target_role && <div className="edgex-strip__sub">Targeting: {target_role.title}</div>}
          {strength_score && <StrengthBadge label={strength_score.label} />}
        </div>
      </div>

      {/* ── Positioning strategy ───────────────────────────────────────── */}
      {positioning_strategy && (
        <ToolResultCard title="EDGEX Positioning Strategy" defaultOpen>
          <div className="tool-guidance-block">
            <span className="tool-guidance-block__label">Best angle</span>
            <p className="tool-guidance-block__text">{positioning_strategy.angle}</p>
          </div>
          {positioning_strategy.how_to_balance && (
            <div className="tool-guidance-block">
              <span className="tool-guidance-block__label">Balancing identity vs target</span>
              <p className="tool-guidance-block__text">{positioning_strategy.how_to_balance}</p>
            </div>
          )}
          {positioning_strategy.credibility_signal && (
            <div className="tool-guidance-block tool-guidance-block--highlight">
              <span className="tool-guidance-block__label">Your credibility signal</span>
              <p className="tool-guidance-block__text">{positioning_strategy.credibility_signal}</p>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* ── Written About section ──────────────────────────────────────── */}
      {written_about ? (
        <ToolResultCard title="About Section — Copy Ready" defaultOpen>
          <div className="copy-block copy-block--about">
            <div className="copy-block__text copy-block__text--pre">
              {written_about.split("\\n\\n").map((para, i) => (
                <p key={i} style={{ marginBottom: "0.75rem" }}>{para}</p>
              ))}
            </div>
            <CopyBtn text={written_about.replace(/\\n\\n/g, "\n\n")} label="Copy About section" />
          </div>
        </ToolResultCard>
      ) : about_section && (
        <ToolResultCard title="About Section Blueprint" defaultOpen>
          <p className="tool-advice">{about_section.recommended_length}</p>
          {about_section.paragraphs?.map((para, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{para.label} ({para.length})</span>
              <p className="tool-guidance-block__text">{para.guidance}</p>
            </div>
          ))}
          <div className="tool-subsection">
            <span className="tool-subsection__label">Formatting tips</span>
            {about_section.formatting_tips?.map((t, i) => <p key={i} className="tool-guidance-item">• {t}</p>)}
          </div>
        </ToolResultCard>
      )}

      {/* ── Headline options ───────────────────────────────────────────── */}
      {displayHeadlines.length > 0 && (
        <ToolResultCard title="Headline Options" defaultOpen>
          <p className="tool-advice" style={{ marginBottom: "1rem" }}>
            Pick one. Click copy to paste directly into LinkedIn. Max 220 characters.
          </p>
          {displayHeadlines.map((h, i) => <HeadlineCard key={i} h={h} />)}
        </ToolResultCard>
      )}

      {/* ── Experience bullets ──────────────────────────────────────────── */}
      {written_experience_bullets.length > 0 && (
        <ToolResultCard title="Experience Bullet Templates">
          <p className="tool-advice" style={{ marginBottom: "1rem" }}>
            Use these as a starting template — replace bracketed text with your real metrics and specifics.
          </p>
          {written_experience_bullets.map((b, i) => (
            <div key={i} className="li-bullet">
              <span className="li-bullet__text">• {b}</span>
              <CopyBtn text={`• ${b}`} label="Copy" />
            </div>
          ))}
        </ToolResultCard>
      )}

      {/* ── Keyword map ─────────────────────────────────────────────────── */}
      {keyword_map ? (
        <ToolResultCard title="Keyword Strategy">
          {keyword_map.headline_keywords?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">In your headline</span>
              <TagList items={keyword_map.headline_keywords} variant="match" />
            </div>
          )}
          {keyword_map.about_keywords?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">In your About section</span>
              <TagList items={keyword_map.about_keywords} />
            </div>
          )}
          {keyword_map.skills_to_add?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Add to Skills section</span>
              <TagList items={keyword_map.skills_to_add} variant="warn" />
            </div>
          )}
          {keyword_map.missing_from_profile?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Missing from profile</span>
              <TagList items={keyword_map.missing_from_profile} variant="danger" />
            </div>
          )}
          {keyword_strategy && (
            <div className="tool-subsection" style={{ marginTop: "0.5rem" }}>
              <span className="tool-subsection__label">Placement guide</span>
              {Object.entries(keyword_strategy.placement_guide || {}).map(([k, v]) => (
                <p key={k} className="tool-guidance-item">
                  <strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong> {v}
                </p>
              ))}
            </div>
          )}
        </ToolResultCard>
      ) : keyword_strategy && (
        <ToolResultCard title="Keyword Strategy">
          <div className="tool-subsection">
            <span className="tool-subsection__label">Primary keywords</span>
            <TagList items={keyword_strategy.primary} />
          </div>
          {keyword_strategy.industry?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Industry</span>
              <TagList items={keyword_strategy.industry} />
            </div>
          )}
          {keyword_strategy.aspirational?.length > 0 && (
            <div className="tool-subsection">
              <span className="tool-subsection__label">Target role keywords</span>
              <TagList items={keyword_strategy.aspirational} variant="warn" />
            </div>
          )}
        </ToolResultCard>
      )}

      {/* ── Skills strategy ─────────────────────────────────────────────── */}
      {skills_strategy && (
        <ToolResultCard title="Skills Section" defaultOpen={false}>
          <div className="tool-subsection">
            <span className="tool-subsection__label">Pin these top 3 (LinkedIn features them prominently)</span>
            <TagList items={skills_strategy.top_3} variant="match" />
          </div>
          <InfoRow label="Skills slots used" value={`${skills_strategy.used_slots}/50`} />
          <p className="tool-advice" style={{ marginTop: "0.75rem" }}>{skills_strategy.advice}</p>
        </ToolResultCard>
      )}

      {/* ── Experience tips ─────────────────────────────────────────────── */}
      {experience_tips.length > 0 && (
        <ToolResultCard title="Experience Section Tips" defaultOpen={false}>
          {experience_tips.map((tip, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{tip.area.replace(/_/g, " ")}</span>
              <p className="tool-guidance-block__text">{tip.advice}</p>
            </div>
          ))}
        </ToolResultCard>
      )}

      {/* ── Featured section ────────────────────────────────────────────── */}
      {featured_section.length > 0 && (
        <ToolResultCard title="Featured Section Recommendations" defaultOpen={false}>
          {featured_section.map((rec, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{rec.type.replace(/_/g, " ")}</span>
              <p className="tool-guidance-block__text">{rec.advice}</p>
            </div>
          ))}
        </ToolResultCard>
      )}

    </div>
  );
}
