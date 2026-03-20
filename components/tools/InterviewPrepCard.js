// ============================================================================
// components/tools/InterviewPrepCard.js
// HireEdge Frontend — Interview Prep (Production v2)
// ============================================================================

import { useState } from "react";
import ToolResultCard, { ScoreBadge, InfoRow, TagList } from "./ToolResultCard";

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className="copy-btn" onClick={copy} title="Copy to clipboard">
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ label }) {
  const map = {
    "standard":          "badge--green",
    "competitive":       "badge--amber",
    "highly competitive":"badge--red",
  };
  return <span className={`badge ${map[label] || "badge--mid"}`}>{label}</span>;
}

// ── Question block ────────────────────────────────────────────────────────────
function QuestionBlock({ q, showFramework }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="qblock" onClick={() => setOpen((v) => !v)}>
      <div className="qblock__header">
        {q.category && <span className="qblock__cat">{q.category.replace(/_/g, " ")}</span>}
        {q.skill && (
          <span className={`qblock__skill ${q.you_have_this === false ? "qblock__skill--miss" : q.you_have_this ? "qblock__skill--have" : ""}`}>
            {q.skill}{q.you_have_this === true ? " ✓" : q.you_have_this === false ? " ✗" : ""}
          </span>
        )}
        <span className="qblock__chevron">{open ? "▲" : "▼"}</span>
      </div>
      <p className="qblock__question">{q.question}</p>
      {open && (
        <div className="qblock__body">
          {q.preparation_tip  && <p className="qblock__tip">💡 {q.preparation_tip}</p>}
          {q.why_asked        && <p className="qblock__why"><strong>Why asked:</strong> {q.why_asked}</p>}
          {showFramework && q.framework && <p className="qblock__meta"><strong>Framework:</strong> {q.framework}</p>}
          {q.rationale        && <p className="qblock__meta">{q.rationale}</p>}
        </div>
      )}
    </div>
  );
}

// ── Talking point block ───────────────────────────────────────────────────────
function TalkingPointBlock({ tp }) {
  return (
    <div className="tp-block">
      <div className="tp-block__header">
        <span className="qblock__cat">{tp.category.replace(/_/g, " ")}</span>
        <span className="tp-block__theme">{tp.question_theme}</span>
      </div>
      <ul className="tp-block__points">
        {(tp.key_points || []).map((p, i) => <li key={i}>• {p}</li>)}
      </ul>
      {tp.what_they_really_want && (
        <p className="tp-block__insight"><strong>What they're really assessing:</strong> {tp.what_they_really_want}</p>
      )}
      {tp.common_mistake && (
        <p className="tp-block__warning">⚠ Common mistake: {tp.common_mistake}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InterviewPrepCard({ data }) {
  if (!data) return null;

  const {
    target_role,
    readiness,
    competency_questions   = [],
    technical_questions    = [],
    behavioural_questions  = [],
    star_preparation,
    questions_to_ask       = [],
    salary_negotiation,
    weakness_strategy      = [],
    ai = {},
  } = data;

  const {
    opening_pitch,
    transition_narrative,
    answer_talking_points = [],
    difficulty_assessment,
    salary_line,
  } = ai;

  const readinessColor = readiness?.score >= 75 ? "score--green" : readiness?.score >= 50 ? "score--amber" : "score--red";

  return (
    <div className="tool-results">

      {/* ── EDGEX Summary strip ─────────────────────────────────────────── */}
      <div className="edgex-strip">
        <div className="edgex-strip__left">
          <div className={`edgex-strip__score ${readinessColor}`}>
            {readiness?.score ?? "—"}
          </div>
          <div className="edgex-strip__score-label">Interview Readiness</div>
        </div>
        <div className="edgex-strip__right">
          <div className="edgex-strip__meta">{target_role?.title}</div>
          <div className="edgex-strip__sub">{target_role?.seniority} · {target_role?.category}</div>
          {difficulty_assessment && (
            <div className="edgex-strip__tags">
              <DiffBadge label={difficulty_assessment.difficulty_label} />
              <span className="badge badge--mid">{difficulty_assessment.panel_type}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Opening pitch ──────────────────────────────────────────────── */}
      {opening_pitch && (
        <ToolResultCard title="Opening Pitch — Tell Me About Yourself" defaultOpen>
          <div className="copy-block">
            <p className="copy-block__text">{opening_pitch}</p>
            <CopyBtn text={opening_pitch} label="Copy pitch" />
          </div>
        </ToolResultCard>
      )}

      {/* ── Transition narrative ───────────────────────────────────────── */}
      {transition_narrative && (
        <ToolResultCard title="Your Career Narrative" defaultOpen>
          <div className="tool-guidance-block">
            <span className="tool-guidance-block__label">How to tell your story</span>
            <p className="tool-guidance-block__text">{transition_narrative.story}</p>
          </div>
          {transition_narrative.transferable_angle && (
            <div className="tool-guidance-block">
              <span className="tool-guidance-block__label">Strongest transferable argument</span>
              <p className="tool-guidance-block__text">{transition_narrative.transferable_angle}</p>
            </div>
          )}
          {transition_narrative.how_to_handle_gaps && (
            <div className="tool-guidance-block">
              <span className="tool-guidance-block__label">Handling gaps</span>
              <p className="tool-guidance-block__text">{transition_narrative.how_to_handle_gaps}</p>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* ── Difficulty & wild card ─────────────────────────────────────── */}
      {difficulty_assessment && (
        <ToolResultCard title="Interview Intelligence" defaultOpen>
          <div className="tool-results__grid">
            <InfoRow label="Panel format"    value={difficulty_assessment.panel_type} />
            <InfoRow label="Difficulty"      value={<DiffBadge label={difficulty_assessment.difficulty_label} />} />
            <InfoRow label="Typical rounds"  value={difficulty_assessment.interview_rounds} />
          </div>
          {difficulty_assessment.hardest_section && (
            <div className="tool-guidance-block" style={{ marginTop: "1rem" }}>
              <span className="tool-guidance-block__label">Prepare hardest for</span>
              <p className="tool-guidance-block__text">{difficulty_assessment.hardest_section}</p>
            </div>
          )}
          {difficulty_assessment.wild_card_question && (
            <div className="tool-guidance-block tool-guidance-block--warn">
              <span className="tool-guidance-block__label">⚡ Wild card question</span>
              <p className="tool-guidance-block__text">&ldquo;{difficulty_assessment.wild_card_question}&rdquo;</p>
            </div>
          )}
        </ToolResultCard>
      )}

      {/* ── Answer talking points (AI) ─────────────────────────────────── */}
      {answer_talking_points.length > 0 && (
        <ToolResultCard title="Answer Talking Points" defaultOpen>
          <p className="tool-advice" style={{ marginBottom: "1rem" }}>
            Key points to anchor your answers — adapted for this role and your background.
          </p>
          {answer_talking_points.map((tp, i) => <TalkingPointBlock key={i} tp={tp} />)}
        </ToolResultCard>
      )}

      {/* ── Competency questions ───────────────────────────────────────── */}
      {competency_questions.length > 0 && (
        <ToolResultCard title={`Competency Questions (${competency_questions.length})`} defaultOpen>
          {competency_questions.map((q, i) => <QuestionBlock key={i} q={q} />)}
        </ToolResultCard>
      )}

      {/* ── Technical questions ────────────────────────────────────────── */}
      {technical_questions.length > 0 && (
        <ToolResultCard title={`Technical Questions (${technical_questions.length})`}>
          {technical_questions.map((q, i) => <QuestionBlock key={i} q={q} />)}
        </ToolResultCard>
      )}

      {/* ── Behavioural questions ──────────────────────────────────────── */}
      {behavioural_questions.length > 0 && (
        <ToolResultCard title={`Behavioural Questions (${behavioural_questions.length})`}>
          {behavioural_questions.map((q, i) => <QuestionBlock key={i} q={q} showFramework />)}
        </ToolResultCard>
      )}

      {/* ── STAR prep ──────────────────────────────────────────────────── */}
      {star_preparation && (
        <ToolResultCard title="STAR Story Preparation">
          <p className="tool-advice">{star_preparation.framework_summary}</p>
          <p className="tool-advice" style={{ marginBottom: "1rem" }}>{star_preparation.recommended_story_count}</p>
          {star_preparation.stories_to_prepare.map((s, i) => (
            <div key={i} className="star-block">
              <div className="star-block__header">
                <span className="qblock__skill">{s.skill}</span>
                <span className={s.you_have_this ? "badge badge--green" : "badge badge--red"}>
                  {s.you_have_this ? "You have this" : "Gap — prepare carefully"}
                </span>
              </div>
              <div className="star-block__grid">
                <div><strong>S</strong> {s.situation}</div>
                <div><strong>T</strong> {s.task}</div>
                <div><strong>A</strong> {s.action}</div>
                <div><strong>R</strong> {s.result}</div>
              </div>
              <p className="qblock__tip">💡 {s.preparation_note}</p>
            </div>
          ))}
          {star_preparation.universal_stories?.length > 0 && (
            <div className="tool-subsection" style={{ marginTop: "1rem" }}>
              <span className="tool-subsection__label">Universal stories to always have ready</span>
              {star_preparation.universal_stories.map((u, i) => (
                <div key={i} className="tool-guidance-block">
                  <span className="tool-guidance-block__label">{u.theme}</span>
                  <p className="tool-guidance-block__text">{u.note}</p>
                </div>
              ))}
            </div>
          )}
        </ToolResultCard>
      )}

      {/* ── Weakness strategy ──────────────────────────────────────────── */}
      {weakness_strategy.length > 0 && (
        <ToolResultCard title="Handling Weaknesses & Gaps">
          {weakness_strategy.map((w, i) => (
            <div key={i} className="tool-guidance-block">
              <span className="tool-guidance-block__label">{w.weakness}</span>
              <p className="tool-guidance-block__text">{w.reframe}</p>
              <p className="qblock__meta tool-guidance-block__principle">{w.principle}</p>
            </div>
          ))}
        </ToolResultCard>
      )}

      {/* ── Questions to ask ───────────────────────────────────────────── */}
      {questions_to_ask.length > 0 && (
        <ToolResultCard title={`Questions to Ask the Panel (${questions_to_ask.length})`} defaultOpen={false}>
          {questions_to_ask.map((q, i) => <QuestionBlock key={i} q={q} />)}
        </ToolResultCard>
      )}

      {/* ── Salary ─────────────────────────────────────────────────────── */}
      {(salary_negotiation || salary_line) && (
        <ToolResultCard title="Salary & Negotiation" defaultOpen={false}>
          {salary_line && (
            <div className="copy-block" style={{ marginBottom: "1.25rem" }}>
              <p className="copy-block__text copy-block__text--em">&ldquo;{salary_line}&rdquo;</p>
              <CopyBtn text={salary_line} label="Copy line" />
            </div>
          )}
          {salary_negotiation && (
            <>
              <div className="tool-results__grid">
                <InfoRow label="Market range"     value={`£${salary_negotiation.target_range.min.toLocaleString()} – £${salary_negotiation.target_range.max.toLocaleString()}`} />
                <InfoRow label="Market mean"      value={`£${salary_negotiation.target_range.mean.toLocaleString()}`} accent />
                <InfoRow label="Conservative ask" value={`£${salary_negotiation.recommended_ask.conservative.toLocaleString()}`} />
                <InfoRow label="Target ask"       value={`£${salary_negotiation.recommended_ask.target.toLocaleString()}`} accent />
                <InfoRow label="Ambitious ask"    value={`£${salary_negotiation.recommended_ask.ambitious.toLocaleString()}`} />
              </div>
              <div className="tool-subsection" style={{ marginTop: "1rem" }}>
                {salary_negotiation.negotiation_tips.map((t, i) => (
                  <p key={i} className="tool-guidance-item">• {t}</p>
                ))}
              </div>
            </>
          )}
        </ToolResultCard>
      )}

    </div>
  );
}
