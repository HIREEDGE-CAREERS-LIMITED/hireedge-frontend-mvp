// ============================================================================
// components/tools/InterviewPrepCard.js
// HireEdge — Interview Preparation Card (Production v3)
//
// Sections (ordered by user value):
//   1. Readiness dashboard — score + 5-axis bars + hire risk + gaps
//   2. Must-prepare questions — top 5–7 with full STAR, collapsible
//   3. Transition narratives — 3 copy-ready spoken answers
//   4. Gap handling — per-gap answer templates
//   5. Mock interview mode — interactive AI questioning
//   6. Interview intelligence — format, difficulty, wildcard
//   7. All questions (engine data) — competency / technical / behavioural
//   8. Salary
// ============================================================================

import { useState, useRef } from "react";
import ToolResultCard, { InfoRow, TagList } from "./ToolResultCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function CopyBtn({ text, label = "Copy", size = "sm" }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }
  return (
    <button className={`ip-copy-btn ip-copy-btn--${size} ${copied ? "ip-copy-btn--copied" : ""}`} onClick={handleCopy}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

function HireRiskBadge({ risk }) {
  const map = { low: "ip-risk--low", medium: "ip-risk--medium", "medium-high": "ip-risk--mh", high: "ip-risk--high" };
  const labels = { low: "Low hiring risk", medium: "Medium hiring risk", "medium-high": "Medium-high risk", high: "High hiring risk" };
  return <span className={`ip-risk-badge ${map[risk] || "ip-risk--medium"}`}>{labels[risk] || risk}</span>;
}

function DiffBadge({ label }) {
  const map = { standard: "badge--green", competitive: "badge--amber", "highly competitive": "badge--red" };
  return <span className={`badge ${map[label] || "badge--mid"}`}>{label}</span>;
}

function CatBadge({ cat }) {
  const map = {
    transition:  "ip-cat--transition",
    behavioural: "ip-cat--behavioural",
    product:     "ip-cat--product",
    stakeholder: "ip-cat--stakeholder",
    technical:   "ip-cat--technical",
    motivation:  "ip-cat--motivation",
  };
  return <span className={`ip-cat-badge ${map[cat] || ""}`}>{cat}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Readiness dashboard
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }) {
  const colour = value >= 75 ? "#059669" : value >= 55 ? "#d97706" : "#dc2626";
  return (
    <div className="ip-score-bar">
      <div className="ip-score-bar__top">
        <span className="ip-score-bar__label">{label}</span>
        <span className="ip-score-bar__val" style={{ color: colour }}>{value}</span>
      </div>
      <div className="ip-score-bar__track">
        <div className="ip-score-bar__fill" style={{ width: `${value}%`, background: colour }} />
      </div>
    </div>
  );
}

const AXIS_LABELS = {
  product_thinking:        "Product Thinking",
  stakeholder_management:  "Stakeholder Management",
  technical_knowledge:     "Technical Knowledge",
  execution_experience:    "Execution Experience",
  communication:           "Communication",
};

function ReadinessDashboard({ score, targetRole }) {
  if (!score) return null;
  const overall = score.overall ?? 0;
  const colour  = overall >= 75 ? "#059669" : overall >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="ip-dashboard">
      {/* Score ring */}
      <div className="ip-dashboard__left">
        <div className="ip-dashboard__ring" style={{ "--ring-colour": colour, "--ring-pct": `${overall}%` }}>
          <div className="ip-dashboard__ring-inner">
            <span className="ip-dashboard__score" style={{ color: colour }}>{overall}</span>
            <span className="ip-dashboard__score-sub">/ 100</span>
          </div>
        </div>
        <span className="ip-dashboard__role-label">{targetRole?.title || "Interview Readiness"}</span>
        {score.hiring_risk && <HireRiskBadge risk={score.hiring_risk} />}
      </div>

      {/* Axes */}
      <div className="ip-dashboard__right">
        {Object.entries(AXIS_LABELS).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={score.breakdown?.[key] ?? 0} />
        ))}
      </div>

      {/* Strengths + gaps */}
      {(score.strengths?.length > 0 || score.critical_gaps?.length > 0) && (
        <div className="ip-dashboard__footer">
          {score.strengths?.length > 0 && (
            <div className="ip-dashboard__col">
              <span className="ip-dashboard__col-label ip-dashboard__col-label--strength">✓ Strengths going in</span>
              {score.strengths.map((s, i) => (
                <p key={i} className="ip-dashboard__item ip-dashboard__item--strength">• {s}</p>
              ))}
            </div>
          )}
          {score.critical_gaps?.length > 0 && (
            <div className="ip-dashboard__col">
              <span className="ip-dashboard__col-label ip-dashboard__col-label--gap">⚠ Critical gaps</span>
              {score.critical_gaps.map((g, i) => (
                <p key={i} className="ip-dashboard__item ip-dashboard__item--gap">• {g}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Must-prepare questions
// ─────────────────────────────────────────────────────────────────────────────

function StarAnswer({ answer, question }) {
  const fullText = [
    `SITUATION: ${answer.situation}`,
    `TASK: ${answer.task}`,
    `ACTION: ${answer.action}`,
    `RESULT: ${answer.result}`,
  ].join("\n\n");

  return (
    <div className="ip-star">
      <div className="ip-star__header">
        <span className="ip-star__label">Sample STAR Answer</span>
        <CopyBtn text={fullText} label="Copy answer" />
      </div>
      <div className="ip-star__grid">
        {[
          { key: "S", label: "Situation", text: answer.situation },
          { key: "T", label: "Task",      text: answer.task      },
          { key: "A", label: "Action",    text: answer.action    },
          { key: "R", label: "Result",    text: answer.result    },
        ].map((row) => (
          <div key={row.key} className="ip-star__row">
            <div className="ip-star__key">{row.key}</div>
            <div className="ip-star__body">
              <span className="ip-star__row-label">{row.label}</span>
              <p className="ip-star__text">{row.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MustPrepQuestion({ q, index }) {
  const [open, setOpen] = useState(index === 0);
  const isFirst = index === 0;

  return (
    <div className={`ip-mpq ${open ? "ip-mpq--open" : ""} ${isFirst ? "ip-mpq--priority" : ""}`}>
      <button className="ip-mpq__header" onClick={() => setOpen((v) => !v)}>
        <div className="ip-mpq__header-left">
          <span className="ip-mpq__num">#{q.priority}</span>
          {q.category && <CatBadge cat={q.category} />}
          {isFirst && <span className="ip-mpq__flag">🔥 Prepare first</span>}
        </div>
        <span className="ip-mpq__chevron">{open ? "▲" : "▼"}</span>
      </button>

      <p className="ip-mpq__question">{q.question}</p>

      {open && (
        <div className="ip-mpq__body">
          {/* Why asked + eval focus */}
          <div className="ip-mpq__intel">
            {q.why_asked && (
              <div className="ip-mpq__intel-row">
                <span className="ip-mpq__intel-label">Why they ask this</span>
                <p className="ip-mpq__intel-text">{q.why_asked}</p>
              </div>
            )}
            {q.evaluation_focus && (
              <div className="ip-mpq__intel-row ip-mpq__intel-row--eval">
                <span className="ip-mpq__intel-label">They're evaluating</span>
                <p className="ip-mpq__intel-text ip-mpq__intel-text--eval">{q.evaluation_focus}</p>
              </div>
            )}
          </div>

          {/* STAR answer */}
          {q.sample_answer && <StarAnswer answer={q.sample_answer} question={q.question} />}

          {/* Strong answer upgrade */}
          {q.strong_answer_upgrade && (
            <div className="ip-strong-upgrade">
              <span className="ip-strong-upgrade__label">⬆ Top 10% answer adds this</span>
              <p className="ip-strong-upgrade__text">{q.strong_answer_upgrade}</p>
            </div>
          )}

          {/* Mistakes */}
          {q.mistakes?.length > 0 && (
            <div className="ip-mistakes">
              <span className="ip-mistakes__label">Common mistakes to avoid</span>
              {q.mistakes.map((m, i) => (
                <p key={i} className="ip-mistakes__item">✗ {m}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MustPrepSection({ questions }) {
  if (!questions?.length) return null;
  return (
    <ToolResultCard title="🔥 Must-Prepare Questions" defaultOpen={true}>
      <p className="ip-hint">These are the highest-probability, highest-stakes questions for this role and transition. Prepare these before anything else.</p>
      <div className="ip-mpq-list">
        {questions.map((q, i) => <MustPrepQuestion key={i} q={q} index={i} />)}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Transition narratives
// ─────────────────────────────────────────────────────────────────────────────

function NarrativeBlock({ title, answer, coachingNote }) {
  if (!answer) return null;
  return (
    <div className="ip-narrative">
      <div className="ip-narrative__header">
        <span className="ip-narrative__title">{title}</span>
        <CopyBtn text={answer} label="Copy answer" size="sm" />
      </div>
      <div className="ip-narrative__answer">{answer}</div>
      {coachingNote && (
        <div className="ip-narrative__coaching">
          <span className="ip-narrative__coaching-icon">💬</span>
          <span className="ip-narrative__coaching-text">{coachingNote}</span>
        </div>
      )}
    </div>
  );
}

function NarrativesSection({ narratives, currentRole }) {
  if (!narratives) return null;
  const { tell_me_about_yourself, why_product_manager, why_transition_from_current } = narratives;
  return (
    <ToolResultCard title="Your Interview Answers — Copy Ready" defaultOpen={true}>
      <p className="ip-hint">These are full, spoken answers. Read them aloud 3 times before your interview.</p>
      <NarrativeBlock
        title='"Tell me about yourself"'
        answer={tell_me_about_yourself?.answer}
        coachingNote={tell_me_about_yourself?.coaching_note}
      />
      <NarrativeBlock
        title='"Why Product Manager?"'
        answer={why_product_manager?.answer}
        coachingNote={why_product_manager?.coaching_note}
      />
      {why_transition_from_current?.answer && (
        <NarrativeBlock
          title={`"Why are you leaving ${currentRole?.title || "your current role"}?"`}
          answer={why_transition_from_current?.answer}
          coachingNote={why_transition_from_current?.coaching_note}
        />
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Gap handling
// ─────────────────────────────────────────────────────────────────────────────

function GapBlock({ gap }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ip-gap ${open ? "ip-gap--open" : ""}`}>
      <button className="ip-gap__header" onClick={() => setOpen((v) => !v)}>
        <span className="ip-gap__name">⚠ {gap.gap}</span>
        <span className="ip-gap__chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="ip-gap__body">
          <div className="ip-gap__section">
            <div className="ip-gap__section-header">
              <span className="ip-gap__section-label">What to say</span>
              <CopyBtn text={gap.honest_answer} label="Copy answer" />
            </div>
            <div className="ip-gap__answer">{gap.honest_answer}</div>
          </div>
          {gap.learning_position && (
            <div className="ip-gap__row">
              <span className="ip-gap__row-label">Learning trajectory</span>
              <p className="ip-gap__row-text">{gap.learning_position}</p>
            </div>
          )}
          {gap.confidence_frame && (
            <div className="ip-gap__row ip-gap__row--frame">
              <span className="ip-gap__row-label">Confidence frame</span>
              <p className="ip-gap__row-text">{gap.confidence_frame}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapHandlingSection({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <ToolResultCard title="Handling Gaps & Difficult Questions" defaultOpen={true}>
      <p className="ip-hint">These are the gaps interviewers will probe. Every block has a copy-ready answer that's honest without being apologetic.</p>
      {gaps.map((g, i) => <GapBlock key={i} gap={g} />)}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Mock interview mode
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_COLOURS = {
  "needs work":  "#dc2626",
  "developing":  "#d97706",
  "good":        "#2563eb",
  "strong":      "#059669",
  "excellent":   "#059669",
};

function MockInterviewSection({ targetRole, currentRole, skills }) {
  const [phase, setPhase]       = useState("idle");   // idle | loading | question | answering | feedback
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer]     = useState("");
  const [feedback, setFeedback] = useState(null);
  const [qIndex, setQIndex]     = useState(0);
  const [error, setError]       = useState(null);
  const textRef                 = useRef(null);

  const plan = typeof window !== "undefined" ? (localStorage.getItem("hireedge_plan") || "free") : "free";

  async function startMock() {
    setPhase("loading"); setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/tools/interview-prep?mode=mock`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-HireEdge-Plan": plan },
        body:    JSON.stringify({
          targetRole:    targetRole?.slug || "",
          currentRole:   currentRole?.slug || "",
          skills:        skills || "",
          questionIndex: qIndex,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error || "Failed to load question");
      setQuestion(json); setPhase("answering");
    } catch (e) { setError(e.message); setPhase("idle"); }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setPhase("loading");
    try {
      const r = await fetch(`${API_BASE}/api/tools/interview-prep?mode=mock`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-HireEdge-Plan": plan },
        body:    JSON.stringify({
          targetRole:   targetRole?.slug || "",
          currentRole:  currentRole?.slug || "",
          skills:       skills || "",
          question:     question.question,
          question_id:  question.question_id,
          answer,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error || "Failed to score answer");
      setFeedback(json); setPhase("feedback");
    } catch (e) { setError(e.message); setPhase("answering"); }
  }

  function nextQuestion() {
    setQIndex((i) => i + 1);
    setQuestion(null); setAnswer(""); setFeedback(null);
    setPhase("idle");
  }

  const scoreColour = feedback ? (SCORE_COLOURS[feedback.score_label] || "#2563eb") : "#2563eb";

  return (
    <ToolResultCard title="Mock Interview Mode" defaultOpen={false}>
      <p className="ip-hint">Practise answering questions out loud. Get scored and coached on every response.</p>

      {/* Idle */}
      {phase === "idle" && (
        <button className="ip-mock-start" onClick={startMock}>
          {qIndex === 0 ? "▶  Start Mock Interview" : "▶  Next Question"}
        </button>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <div className="ip-mock-loading">
          <div className="ip-mock-loading__spinner" />
          <span>EDGEX is thinking...</span>
        </div>
      )}

      {/* Question + answer input */}
      {phase === "answering" && question && (
        <div className="ip-mock-qa">
          <div className="ip-mock-question">
            {question.category && <CatBadge cat={question.category} />}
            <p className="ip-mock-question__text">"{question.question}"</p>
            {question.hint && <p className="ip-mock-question__hint">💡 {question.hint}</p>}
          </div>
          <textarea
            ref={textRef}
            className="ip-mock-textarea"
            placeholder="Type your answer here. Aim for 2–4 minutes of spoken content..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
          />
          <div className="ip-mock-qa__actions">
            <span className="ip-mock-qa__words">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button
              className="ip-mock-submit"
              onClick={submitAnswer}
              disabled={answer.trim().length < 30}
            >
              Submit Answer →
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {phase === "feedback" && feedback && (
        <div className="ip-mock-feedback">
          <div className="ip-mock-feedback__score-row">
            <div className="ip-mock-feedback__score" style={{ color: scoreColour }}>
              {feedback.score}<span className="ip-mock-feedback__score-max">/10</span>
            </div>
            <div>
              <div className="ip-mock-feedback__label" style={{ color: scoreColour }}>
                {feedback.score_label}
              </div>
              <p className="ip-mock-feedback__verdict">{feedback.overall_verdict}</p>
            </div>
          </div>

          {feedback.feedback && (
            <div className="ip-mock-feedback__sections">
              {feedback.feedback.what_worked && (
                <div className="ip-mock-feedback__block ip-mock-feedback__block--good">
                  <span className="ip-mock-feedback__block-label">✓ What worked</span>
                  <p className="ip-mock-feedback__block-text">{feedback.feedback.what_worked}</p>
                </div>
              )}
              {feedback.feedback.what_to_improve && (
                <div className="ip-mock-feedback__block ip-mock-feedback__block--improve">
                  <span className="ip-mock-feedback__block-label">↑ What to improve</span>
                  <p className="ip-mock-feedback__block-text">{feedback.feedback.what_to_improve}</p>
                </div>
              )}
              {feedback.feedback.missing_element && (
                <div className="ip-mock-feedback__block ip-mock-feedback__block--miss">
                  <span className="ip-mock-feedback__block-label">✗ Missing element</span>
                  <p className="ip-mock-feedback__block-text">{feedback.feedback.missing_element}</p>
                </div>
              )}
            </div>
          )}

          {feedback.improved_answer && (
            <div className="ip-mock-feedback__improved">
              <div className="ip-mock-feedback__improved-header">
                <span className="ip-mock-feedback__improved-label">Model answer — how to say this</span>
                <CopyBtn text={feedback.improved_answer} label="Copy" />
              </div>
              <p className="ip-mock-feedback__improved-text">{feedback.improved_answer}</p>
            </div>
          )}

          {feedback.what_to_keep && (
            <p className="ip-mock-feedback__keep">🌟 Keep this: {feedback.what_to_keep}</p>
          )}

          <button className="ip-mock-start" style={{ marginTop: "1.5rem" }} onClick={nextQuestion}>
            Next Question →
          </button>
        </div>
      )}

      {error && <p className="ip-mock-error">Error: {error}</p>}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Interview intelligence
// ─────────────────────────────────────────────────────────────────────────────

function IntelSection({ intel }) {
  if (!intel) return null;
  return (
    <ToolResultCard title="Interview Intelligence" defaultOpen={false}>
      <div className="ip-intel-grid">
        <InfoRow label="Format"         value={intel.panel_type} />
        <InfoRow label="Difficulty"     value={<DiffBadge label={intel.difficulty_label} />} />
        <InfoRow label="Rounds"         value={intel.interview_rounds} />
      </div>
      {intel.hardest_section && (
        <div className="ip-intel-block">
          <span className="ip-intel-label">Prepare hardest for</span>
          <p className="ip-intel-text">{intel.hardest_section}</p>
        </div>
      )}
      {intel.what_interviewers_really_want && (
        <div className="ip-intel-block ip-intel-block--insight">
          <span className="ip-intel-label">What they really want</span>
          <p className="ip-intel-text">{intel.what_interviewers_really_want}</p>
        </div>
      )}
      {intel.wild_card_question && (
        <div className="ip-intel-block ip-intel-block--wildcard">
          <span className="ip-intel-label">⚡ Wild card question to prepare</span>
          <div className="ip-intel-wildcard">
            <p className="ip-intel-wildcard__q">"{intel.wild_card_question}"</p>
            <CopyBtn text={intel.wild_card_question} label="Copy" />
          </div>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Engine questions (competency / technical / behavioural)
// ─────────────────────────────────────────────────────────────────────────────

function EngineQuestion({ q }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ip-eq ${open ? "ip-eq--open" : ""}`} onClick={() => setOpen((v) => !v)}>
      <div className="ip-eq__header">
        <div className="ip-eq__meta">
          {q.category && <span className="ip-eq__cat">{q.category.replace(/_/g, " ")}</span>}
          {q.skill && (
            <span className={`ip-eq__skill ${q.you_have_this === false ? "ip-eq__skill--miss" : q.you_have_this ? "ip-eq__skill--have" : ""}`}>
              {q.skill}{q.you_have_this === true ? " ✓" : q.you_have_this === false ? " ✗" : ""}
            </span>
          )}
        </div>
        <span className="ip-eq__chevron">{open ? "▲" : "▼"}</span>
      </div>
      <p className="ip-eq__question">{q.question}</p>
      {open && (
        <div className="ip-eq__body">
          {q.why_asked         && <p className="ip-eq__row"><strong>Why asked:</strong> {q.why_asked}</p>}
          {q.preparation_tip   && <p className="ip-eq__tip">💡 {q.preparation_tip}</p>}
          {q.framework         && <p className="ip-eq__row"><strong>Framework:</strong> {q.framework}</p>}
        </div>
      )}
    </div>
  );
}

function EngineQuestionsSection({ competency = [], technical = [], behavioural = [] }) {
  const total = competency.length + technical.length + behavioural.length;
  if (!total) return null;
  return (
    <ToolResultCard title={`Question Bank (${total} questions)`} defaultOpen={false}>
      {competency.length > 0 && (
        <div className="ip-qgroup">
          <span className="ip-qgroup__label">Competency ({competency.length})</span>
          {competency.map((q, i) => <EngineQuestion key={i} q={q} />)}
        </div>
      )}
      {technical.length > 0 && (
        <div className="ip-qgroup">
          <span className="ip-qgroup__label">Technical ({technical.length})</span>
          {technical.map((q, i) => <EngineQuestion key={i} q={q} />)}
        </div>
      )}
      {behavioural.length > 0 && (
        <div className="ip-qgroup">
          <span className="ip-qgroup__label">Behavioural ({behavioural.length})</span>
          {behavioural.map((q, i) => <EngineQuestion key={i} q={q} />)}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Salary
// ─────────────────────────────────────────────────────────────────────────────

function SalarySection({ negotiation, salaryLine }) {
  if (!negotiation && !salaryLine) return null;
  return (
    <ToolResultCard title="Salary & Negotiation" defaultOpen={false}>
      {salaryLine && (
        <div className="ip-salary-line">
          <p className="ip-salary-line__text">"{salaryLine}"</p>
          <CopyBtn text={salaryLine} label="Copy line" size="md" />
        </div>
      )}
      {negotiation && (
        <div className="ip-salary-grid">
          <InfoRow label="Market range"     value={`£${negotiation.target_range?.min?.toLocaleString()} – £${negotiation.target_range?.max?.toLocaleString()}`} />
          <InfoRow label="Market mean"      value={`£${negotiation.target_range?.mean?.toLocaleString()}`} accent />
          <InfoRow label="Conservative ask" value={`£${negotiation.recommended_ask?.conservative?.toLocaleString()}`} />
          <InfoRow label="Target ask"       value={`£${negotiation.recommended_ask?.target?.toLocaleString()}`} accent />
          <InfoRow label="Ambitious ask"    value={`£${negotiation.recommended_ask?.ambitious?.toLocaleString()}`} />
        </div>
      )}
      {negotiation?.negotiation_tips?.length > 0 && (
        <div className="ip-salary-tips">
          {negotiation.negotiation_tips.map((t, i) => <p key={i} className="ip-salary-tips__item">• {t}</p>)}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function InterviewPrepCard({ data }) {
  if (!data) return null;

  const {
    target_role,
    current_role,
    competency_questions  = [],
    technical_questions   = [],
    behavioural_questions = [],
    salary_negotiation,
    ai = {},
  } = data;

  const {
    readiness_score,
    must_prepare_questions = [],
    transition_narratives,
    gap_handling           = [],
    interview_intelligence,
    salary_line,
  } = ai;

  const skillsStr = data.star_preparation?.stories_to_prepare
    ?.map((s) => s.skill).join(",") || "";

  return (
    <div className="tool-results">

      {/* 1. Readiness dashboard */}
      <ReadinessDashboard score={readiness_score} targetRole={target_role} />

      {/* 2. Must-prepare questions */}
      <MustPrepSection questions={must_prepare_questions} />

      {/* 3. Transition narratives */}
      <NarrativesSection narratives={transition_narratives} currentRole={current_role} />

      {/* 4. Gap handling */}
      <GapHandlingSection gaps={gap_handling} />

      {/* 5. Mock interview */}
      <MockInterviewSection
        targetRole={target_role}
        currentRole={current_role}
        skills={skillsStr}
      />

      {/* 6. Interview intelligence */}
      <IntelSection intel={interview_intelligence} />

      {/* 7. Question bank (engine) */}
      <EngineQuestionsSection
        competency={competency_questions}
        technical={technical_questions}
        behavioural={behavioural_questions}
      />

      {/* 8. Salary */}
      <SalarySection negotiation={salary_negotiation} salaryLine={salary_line} />

    </div>
  );
}
