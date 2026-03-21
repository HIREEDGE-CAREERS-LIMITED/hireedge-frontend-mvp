// ============================================================================
// components/tools/InterviewPrepCard.js
// HireEdge — Interview Preparation Card (Production v4)
//
// Section order:
//   1. Interview Strategy        — positioning, strengths, weaknesses, what they care about
//   2. Opening Pitch             — 30-45 sec answer with word count + copy
//   3. Readiness Dashboard       — score ring + breakdown + focus areas
//   4. Top Questions to Nail     — 3-5 must-nail with STAR, stakes badge
//   5. Transition Narratives     — why this role / why transition
//   6. Gap Handling              — per-gap copy-ready templates
//   7. Mock Interview            — timer + enhanced scoring (breakdown + strengths/improvements)
//   8. Red Flags to Avoid        — 4 personalised mistakes
//   9. Interview Intelligence    — format, rounds, wildcard
//  10. Question Bank             — engine questions, collapsed
//  11. Final Checklist           — day-before / morning-of / in-the-room
//  12. Salary                    — negotiation line + ranges
// ============================================================================

import { useState, useEffect, useRef } from "react";
import ToolResultCard, { InfoRow } from "./ToolResultCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

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
    <button className={`ip4-copy ip4-copy--${size} ${copied ? "ip4-copy--done" : ""}`} onClick={go}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

function StakesBadge({ stakes }) {
  return (
    <span className={`ip4-stakes ${stakes === "very high" ? "ip4-stakes--vh" : "ip4-stakes--h"}`}>
      {stakes === "very high" ? "🔥 Must nail" : "⚡ High stakes"}
    </span>
  );
}

function CatBadge({ cat }) {
  const map = { transition:"ip4-cat--trans", behavioural:"ip4-cat--beh", product:"ip4-cat--prod", stakeholder:"ip4-cat--stak", technical:"ip4-cat--tech", motivation:"ip4-cat--mot" };
  return <span className={`ip4-cat-badge ${map[cat]||""}`}>{cat}</span>;
}

function RiskBadge({ risk }) {
  const c = { low:"ip4-risk--low", medium:"ip4-risk--med", "medium-high":"ip4-risk--mh", high:"ip4-risk--high" }[risk]||"ip4-risk--med";
  return <span className={`ip4-risk-badge ${c}`}>{risk} risk</span>;
}

function AxisLabel({ label }) {
  const c = { strength:"ip4-axis-lbl--strength", developing:"ip4-axis-lbl--developing", gap:"ip4-axis-lbl--gap" }[label]||"ip4-axis-lbl--developing";
  return <span className={`ip4-axis-lbl ${c}`}>{label}</span>;
}

function DiffBadge({ label }) {
  const c = { standard:"badge--green", competitive:"badge--amber", "highly competitive":"badge--red" }[label]||"badge--mid";
  return <span className={`badge ${c}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Interview Strategy
// ─────────────────────────────────────────────────────────────────────────────

function StrategySection({ strategy }) {
  if (!strategy) return null;
  return (
    <ToolResultCard title="Your Interview Strategy" defaultOpen={true}>
      {strategy.positioning && (
        <div className="ip4-strategy-block ip4-strategy-block--positioning">
          <span className="ip4-strategy-label">Positioning angle</span>
          <p className="ip4-strategy-text">{strategy.positioning}</p>
        </div>
      )}
      <div className="ip4-strategy-cols">
        {strategy.strengths_to_lead_with?.length > 0 && (
          <div className="ip4-strategy-col ip4-strategy-col--strength">
            <span className="ip4-strategy-col-label">✓ Lead with these</span>
            {strategy.strengths_to_lead_with.map((s, i) => (
              <div key={i} className="ip4-strategy-item ip4-strategy-item--strength">
                <div className="ip4-strategy-item__dot" />
                <p className="ip4-strategy-item__text">{s}</p>
              </div>
            ))}
          </div>
        )}
        {strategy.weaknesses_to_manage?.length > 0 && (
          <div className="ip4-strategy-col ip4-strategy-col--weak">
            <span className="ip4-strategy-col-label">⚠ Manage these carefully</span>
            {strategy.weaknesses_to_manage.map((w, i) => (
              <div key={i} className="ip4-strategy-weak">
                <p className="ip4-strategy-weak__name">{w.weakness}</p>
                <p className="ip4-strategy-weak__how">{w.how_to_handle}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {strategy.what_they_care_about && (
        <div className="ip4-strategy-block ip4-strategy-block--care">
          <span className="ip4-strategy-label">What they really care about</span>
          <p className="ip4-strategy-text">{strategy.what_they_care_about}</p>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Opening Pitch
// ─────────────────────────────────────────────────────────────────────────────

function OpeningPitchSection({ pitch }) {
  if (!pitch?.text) return null;
  return (
    <ToolResultCard title='Opening Pitch — "Tell me about yourself"' defaultOpen={true}>
      <div className="ip4-pitch-meta">
        <span className="ip4-pitch-timing">⏱ {pitch.timing_cue || "~35 seconds"}</span>
        {pitch.word_count ? <span className="ip4-pitch-words">{pitch.word_count} words</span> : null}
        <CopyBtn text={pitch.text} label="Copy pitch" size="md" />
      </div>
      <div className="ip4-pitch-text">{pitch.text}</div>
      {pitch.coaching_note && (
        <div className="ip4-pitch-coaching">
          <span className="ip4-pitch-coaching__icon">💬</span>
          <span className="ip4-pitch-coaching__text">{pitch.coaching_note}</span>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Readiness Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const AXIS_META = [
  ["product_thinking",       "Product Thinking"],
  ["stakeholder_management", "Stakeholder Mgmt"],
  ["technical_knowledge",    "Technical"],
  ["execution_experience",   "Execution"],
  ["communication",          "Communication"],
];

function ReadinessDashboard({ score, targetRole }) {
  if (!score) return null;
  const overall = score.overall ?? 0;
  const colour  = overall >= 70 ? "#059669" : overall >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="ip4-dashboard">
      <div className="ip4-dashboard__left">
        <div className="ip4-dashboard__ring" style={{ "--ip4-colour": colour, "--ip4-pct": `${overall}%` }}>
          <div className="ip4-dashboard__ring-inner">
            <span className="ip4-dashboard__score" style={{ color: colour }}>{overall}</span>
            <span className="ip4-dashboard__score-sub">/100</span>
          </div>
        </div>
        <span className="ip4-dashboard__role">{targetRole?.title}</span>
        {score.hiring_risk && <RiskBadge risk={score.hiring_risk} />}
      </div>

      <div className="ip4-dashboard__right">
        {AXIS_META.map(([key, label]) => {
          const axis  = score.breakdown?.[key];
          const val   = typeof axis === "object" ? (axis.score ?? 0) : (axis ?? 0);
          const lbl   = typeof axis === "object" ? axis.label : null;
          const clr   = val >= 70 ? "#059669" : val >= 50 ? "#d97706" : "#dc2626";
          return (
            <div key={key} className="ip4-axis">
              <div className="ip4-axis__top">
                <span className="ip4-axis__label">{label}</span>
                <div className="ip4-axis__right">
                  {lbl && <AxisLabel label={lbl} />}
                  <span className="ip4-axis__val" style={{ color: clr }}>{val}</span>
                </div>
              </div>
              <div className="ip4-axis__track">
                <div className="ip4-axis__fill" style={{ width: `${val}%`, background: clr }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus areas + strengths + gaps */}
      {(score.focus_areas?.length || score.strengths?.length || score.critical_gaps?.length) > 0 && (
        <div className="ip4-dashboard__footer">
          {score.focus_areas?.length > 0 && (
            <div className="ip4-dashboard__col">
              <span className="ip4-dashboard__col-label ip4-dashboard__col-label--focus">▶ Prep in this order</span>
              {score.focus_areas.map((f, i) => (
                <p key={i} className="ip4-dashboard__item">
                  <span className="ip4-dashboard__item-num">{i + 1}</span> {f}
                </p>
              ))}
            </div>
          )}
          <div className="ip4-dashboard__col-pair">
            {score.strengths?.length > 0 && (
              <div className="ip4-dashboard__col">
                <span className="ip4-dashboard__col-label ip4-dashboard__col-label--strength">✓ Going in strong</span>
                {score.strengths.map((s, i) => <p key={i} className="ip4-dashboard__item">• {s}</p>)}
              </div>
            )}
            {score.critical_gaps?.length > 0 && (
              <div className="ip4-dashboard__col">
                <span className="ip4-dashboard__col-label ip4-dashboard__col-label--gap">⚠ Critical gaps</span>
                {score.critical_gaps.map((g, i) => <p key={i} className="ip4-dashboard__item">• {g}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Must-Nail Questions
// ─────────────────────────────────────────────────────────────────────────────

function StarAnswer({ answer, question }) {
  const full = [`SITUATION: ${answer.situation}`, `TASK: ${answer.task}`, `ACTION: ${answer.action}`, `RESULT: ${answer.result}`].join("\n\n");
  return (
    <div className="ip4-star">
      <div className="ip4-star__header">
        <span className="ip4-star__label">Sample STAR Answer</span>
        <CopyBtn text={full} label="Copy answer" />
      </div>
      {[["S","Situation",answer.situation],["T","Task",answer.task],["A","Action",answer.action],["R","Result",answer.result]].map(([k,l,t]) => (
        <div key={k} className="ip4-star__row">
          <div className="ip4-star__key">{k}</div>
          <div className="ip4-star__body">
            <span className="ip4-star__row-label">{l}</span>
            <p className="ip4-star__text">{t}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MustNailQuestion({ q, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`ip4-mpq ${open?"ip4-mpq--open":""} ${index===0?"ip4-mpq--first":""}`}>
      <button className="ip4-mpq__header" onClick={() => setOpen(v=>!v)}>
        <div className="ip4-mpq__header-left">
          <span className="ip4-mpq__num">#{q.priority}</span>
          {q.stakes && <StakesBadge stakes={q.stakes} />}
          {q.category && <CatBadge cat={q.category} />}
        </div>
        <span className="ip4-mpq__chevron">{open?"▲":"▼"}</span>
      </button>
      <p className="ip4-mpq__question">{q.question}</p>
      {open && (
        <div className="ip4-mpq__body">
          <div className="ip4-mpq__intel">
            {q.why_asked && (
              <div className="ip4-mpq__intel-row">
                <span className="ip4-mpq__intel-label">Why they ask this</span>
                <p className="ip4-mpq__intel-text">{q.why_asked}</p>
              </div>
            )}
            {q.evaluation_focus && (
              <div className="ip4-mpq__intel-row ip4-mpq__intel-row--eval">
                <span className="ip4-mpq__intel-label">They're scoring</span>
                <p className="ip4-mpq__intel-text ip4-mpq__intel-text--eval">{q.evaluation_focus}</p>
              </div>
            )}
          </div>
          {q.sample_answer && <StarAnswer answer={q.sample_answer} />}
          {q.strong_answer_upgrade && (
            <div className="ip4-upgrade-block">
              <span className="ip4-upgrade-block__label">⬆ Top 10% candidate adds this</span>
              <p className="ip4-upgrade-block__text">{q.strong_answer_upgrade}</p>
            </div>
          )}
          {q.mistakes?.length > 0 && (
            <div className="ip4-mistakes">
              <span className="ip4-mistakes__label">Mistakes to avoid</span>
              {q.mistakes.map((m,i) => <p key={i} className="ip4-mistakes__item">✗ {m}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MustNailSection({ questions }) {
  if (!questions?.length) return null;
  return (
    <ToolResultCard title="🔥 Top Questions You Must Nail" defaultOpen={true}>
      <p className="ip4-hint">These are the highest-probability, highest-stakes questions. Nail these and you're 80% of the way there.</p>
      <div className="ip4-mpq-list">
        {questions.map((q,i) => <MustNailQuestion key={i} q={q} index={i} />)}
      </div>
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Transition Narratives
// ─────────────────────────────────────────────────────────────────────────────

function NarrativeBlock({ title, answer, coachingNote }) {
  if (!answer) return null;
  return (
    <div className="ip4-narrative">
      <div className="ip4-narrative__header">
        <span className="ip4-narrative__title">{title}</span>
        <CopyBtn text={answer} label="Copy" />
      </div>
      <div className="ip4-narrative__text">{answer}</div>
      {coachingNote && (
        <div className="ip4-narrative__coaching">
          <span>💬</span>
          <span>{coachingNote}</span>
        </div>
      )}
    </div>
  );
}

function NarrativesSection({ narratives, currentRole }) {
  if (!narratives) return null;
  const { why_this_role, why_transition_from_current } = narratives;
  if (!why_this_role?.answer && !why_transition_from_current?.answer) return null;
  return (
    <ToolResultCard title="More Copy-Ready Answers" defaultOpen={false}>
      <NarrativeBlock
        title='"Why do you want this role?"'
        answer={why_this_role?.answer}
        coachingNote={why_this_role?.coaching_note}
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
// 6. Gap Handling
// ─────────────────────────────────────────────────────────────────────────────

function GapBlock({ gap }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ip4-gap ${open?"ip4-gap--open":""}`}>
      <button className="ip4-gap__header" onClick={() => setOpen(v=>!v)}>
        <span className="ip4-gap__name">⚠ {gap.gap}</span>
        <span className="ip4-gap__chevron">{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div className="ip4-gap__body">
          <div className="ip4-gap__section">
            <div className="ip4-gap__section-header">
              <span className="ip4-gap__section-label">What to say</span>
              <CopyBtn text={gap.honest_answer} label="Copy" />
            </div>
            <p className="ip4-gap__answer">{gap.honest_answer}</p>
          </div>
          {gap.learning_position && (
            <div className="ip4-gap__row">
              <span className="ip4-gap__row-label">Learning trajectory</span>
              <p className="ip4-gap__row-text">{gap.learning_position}</p>
            </div>
          )}
          {gap.confidence_frame && (
            <div className="ip4-gap__row ip4-gap__row--frame">
              <span className="ip4-gap__row-label">Confidence frame</span>
              <p className="ip4-gap__row-text">{gap.confidence_frame}</p>
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
    <ToolResultCard title="Handling Difficult Questions & Gaps" defaultOpen={false}>
      <p className="ip4-hint">These are the gaps interviewers will probe. Every block has a copy-ready answer that's honest without sounding defensive.</p>
      {gaps.map((g, i) => <GapBlock key={i} gap={g} />)}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Mock Interview — with timer + upgraded scoring
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_COLOURS = { "needs work":"#dc2626","developing":"#d97706","good":"#2563eb","strong":"#059669","excellent":"#059669" };

function MockTimer({ active, onTimeUp }) {
  const DURATION = 120; // 2 minutes
  const [seconds, setSeconds] = useState(DURATION);
  const [running, setRunning]  = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    if (!active) { clearInterval(interval.current); setSeconds(DURATION); setRunning(false); }
  }, [active]);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(interval.current); setRunning(false); onTimeUp?.(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [running]);

  const pct    = ((DURATION - seconds) / DURATION) * 100;
  const colour = seconds > 60 ? "#059669" : seconds > 30 ? "#d97706" : "#dc2626";
  const mins   = Math.floor(seconds / 60);
  const secs   = seconds % 60;

  if (!active) return null;

  return (
    <div className="ip4-timer">
      <div className="ip4-timer__ring" style={{ "--t-colour": colour, "--t-pct": `${pct}%` }}>
        <div className="ip4-timer__inner">
          <span className="ip4-timer__time" style={{ color: colour }}>
            {mins}:{secs.toString().padStart(2,"0")}
          </span>
        </div>
      </div>
      <div className="ip4-timer__controls">
        <p className="ip4-timer__label">Recommended: 2 minutes</p>
        <button className="ip4-timer__btn" onClick={() => setRunning(v=>!v)}>
          {running ? "⏸ Pause" : seconds === DURATION ? "▶ Start Timer" : "▶ Resume"}
        </button>
        <button className="ip4-timer__reset" onClick={() => { setSeconds(DURATION); setRunning(false); }}>Reset</button>
      </div>
    </div>
  );
}

function ScoreBreakdownBar({ label, value }) {
  const colour = value >= 8 ? "#059669" : value >= 5 ? "#d97706" : "#dc2626";
  return (
    <div className="ip4-score-bar">
      <div className="ip4-score-bar__top">
        <span className="ip4-score-bar__label">{label}</span>
        <span className="ip4-score-bar__val" style={{ color: colour }}>{value}/10</span>
      </div>
      <div className="ip4-score-bar__track">
        <div className="ip4-score-bar__fill" style={{ width: `${value*10}%`, background: colour }} />
      </div>
    </div>
  );
}

function MockInterviewSection({ targetRole, currentRole, skills }) {
  const [phase, setPhase]       = useState("idle");
  const [qData, setQData]       = useState(null);
  const [answer, setAnswer]     = useState("");
  const [feedback, setFeedback] = useState(null);
  const [qIndex, setQIndex]     = useState(0);
  const [error, setError]       = useState(null);
  const [timeUp, setTimeUp]     = useState(false);
  const plan = typeof window !== "undefined" ? (localStorage.getItem("hireedge_plan")||"free") : "free";

  async function startMock() {
    setPhase("loading"); setError(null); setTimeUp(false);
    try {
      const r = await fetch(`${API_BASE}/api/tools/interview-prep?mode=mock`, {
        method:"POST",
        headers:{"Content-Type":"application/json","X-HireEdge-Plan":plan},
        body: JSON.stringify({ targetRole:targetRole?.slug||"", currentRole:currentRole?.slug||"", skills:skills||"", questionIndex:qIndex }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error||"Failed");
      setQData(json); setAnswer(""); setPhase("answering");
    } catch(e) { setError(e.message); setPhase("idle"); }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setPhase("loading");
    try {
      const r = await fetch(`${API_BASE}/api/tools/interview-prep?mode=mock`, {
        method:"POST",
        headers:{"Content-Type":"application/json","X-HireEdge-Plan":plan},
        body: JSON.stringify({ targetRole:targetRole?.slug||"", currentRole:currentRole?.slug||"", skills:skills||"", question:qData.question, question_id:qData.question_id, answer }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(json.error||"Failed");
      setFeedback(json); setPhase("feedback");
    } catch(e) { setError(e.message); setPhase("answering"); }
  }

  function nextQuestion() {
    setQIndex(i=>i+1); setQData(null); setAnswer(""); setFeedback(null); setTimeUp(false); setPhase("idle");
  }

  const scoreColour = feedback ? (SCORE_COLOURS[feedback.score_label]||"#2563eb") : "#2563eb";

  return (
    <ToolResultCard title="Mock Interview Practice" defaultOpen={false}>
      <p className="ip4-hint">Practise answering out loud. Get scored and coached on every response. Aim for 2 minutes per answer.</p>

      {phase === "idle" && (
        <button className="ip4-mock-start" onClick={startMock}>
          {qIndex === 0 ? "▶  Start Mock Interview" : "▶  Next Question"}
        </button>
      )}

      {phase === "loading" && (
        <div className="ip4-mock-loading">
          <div className="ip4-mock-loading__spinner" />
          <span>Loading question…</span>
        </div>
      )}

      {phase === "answering" && qData && (
        <div className="ip4-mock-qa">
          <div className="ip4-mock-question">
            {qData.category && <CatBadge cat={qData.category} />}
            <p className="ip4-mock-question__text">"{qData.question}"</p>
            {qData.what_to_cover && <p className="ip4-mock-question__cover">Cover: {qData.what_to_cover}</p>}
            {qData.hint && <p className="ip4-mock-question__hint">💡 {qData.hint}</p>}
          </div>

          <MockTimer active={true} onTimeUp={() => setTimeUp(true)} />

          {timeUp && (
            <div className="ip4-mock-timeup">⏰ Time's up — wrap up your answer and submit</div>
          )}

          <textarea
            className="ip4-mock-textarea"
            placeholder="Type your answer here. Try to speak it aloud as you type — aim for 2 minutes of spoken content…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={6}
            autoComplete="off"
          />
          <div className="ip4-mock-qa__actions">
            <span className="ip4-mock-qa__words">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button className="ip4-mock-submit" onClick={submitAnswer} disabled={answer.trim().length < 30}>
              Submit for Scoring →
            </button>
          </div>
        </div>
      )}

      {phase === "feedback" && feedback && (
        <div className="ip4-mock-feedback">
          {/* Score header */}
          <div className="ip4-mock-feedback__score-row">
            <div className="ip4-mock-feedback__score" style={{ color: scoreColour }}>
              {feedback.score}<span className="ip4-mock-feedback__score-max">/10</span>
            </div>
            <div>
              <div className="ip4-mock-feedback__label" style={{ color: scoreColour }}>{feedback.score_label}</div>
              <p className="ip4-mock-feedback__verdict">{feedback.overall_verdict}</p>
            </div>
          </div>

          {/* Score breakdown bars */}
          {feedback.score_breakdown && (
            <div className="ip4-mock-feedback__breakdown">
              <ScoreBreakdownBar label="Structure"  value={feedback.score_breakdown.structure  ?? 0} />
              <ScoreBreakdownBar label="Content"    value={feedback.score_breakdown.content    ?? 0} />
              <ScoreBreakdownBar label="Relevance"  value={feedback.score_breakdown.relevance  ?? 0} />
            </div>
          )}

          {/* Strengths + improvements */}
          <div className="ip4-mock-feedback__cols">
            {feedback.strengths_shown?.length > 0 && (
              <div className="ip4-mock-feedback__col ip4-mock-feedback__col--strength">
                <span className="ip4-mock-feedback__col-label">✓ Strengths shown</span>
                {feedback.strengths_shown.map((s,i) => <p key={i} className="ip4-mock-feedback__col-item">• {s}</p>)}
              </div>
            )}
            {feedback.improvements_needed?.length > 0 && (
              <div className="ip4-mock-feedback__col ip4-mock-feedback__col--improve">
                <span className="ip4-mock-feedback__col-label">↑ Improvements needed</span>
                {feedback.improvements_needed.map((s,i) => <p key={i} className="ip4-mock-feedback__col-item">• {s}</p>)}
              </div>
            )}
          </div>

          {feedback.missing_element && (
            <div className="ip4-mock-feedback__miss">
              <span className="ip4-mock-feedback__miss-label">✗ Missing element</span>
              <p className="ip4-mock-feedback__miss-text">{feedback.missing_element}</p>
            </div>
          )}

          {feedback.improved_answer && (
            <div className="ip4-mock-feedback__improved">
              <div className="ip4-mock-feedback__improved-header">
                <span className="ip4-mock-feedback__improved-label">Model answer — how to say this</span>
                <CopyBtn text={feedback.improved_answer} label="Copy" />
              </div>
              <p className="ip4-mock-feedback__improved-text">{feedback.improved_answer}</p>
            </div>
          )}

          {feedback.what_to_keep && (
            <p className="ip4-mock-feedback__keep">🌟 Keep this: {feedback.what_to_keep}</p>
          )}

          <button className="ip4-mock-start" style={{ marginTop:"1.5rem" }} onClick={nextQuestion}>
            Next Question →
          </button>
        </div>
      )}

      {error && <p className="ip4-mock-error">Error: {error}</p>}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Red Flags to Avoid
// ─────────────────────────────────────────────────────────────────────────────

function RedFlagsSection({ flags }) {
  if (!flags?.length) return null;
  return (
    <ToolResultCard title="Red Flags to Avoid" defaultOpen={true}>
      <p className="ip4-hint">These are the specific mistakes that lose offers for candidates with your background. Know them before you walk in.</p>
      <div className="ip4-flags">
        {flags.map((f, i) => (
          <div key={i} className="ip4-flag">
            <div className="ip4-flag__header">
              <span className="ip4-flag__icon">🚩</span>
              <span className="ip4-flag__name">{f.mistake}</span>
            </div>
            <div className="ip4-flag__body">
              {f.why_it_happens && <p className="ip4-flag__why">{f.why_it_happens}</p>}
              {f.how_to_avoid && (
                <div className="ip4-flag__avoid">
                  <span className="ip4-flag__avoid-label">Instead →</span>
                  <p className="ip4-flag__avoid-text">{f.how_to_avoid}</p>
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
// 9. Interview Intelligence
// ─────────────────────────────────────────────────────────────────────────────

function IntelSection({ intel }) {
  if (!intel) return null;
  return (
    <ToolResultCard title="Interview Intelligence" defaultOpen={false}>
      <div className="ip4-intel-grid">
        <InfoRow label="Format"  value={intel.panel_type} />
        <InfoRow label="Level"   value={<DiffBadge label={intel.difficulty_label} />} />
        <InfoRow label="Rounds"  value={intel.interview_rounds} />
      </div>
      {intel.hardest_section && (
        <div className="ip4-intel-block">
          <span className="ip4-intel-label">Hardest section for this transition</span>
          <p className="ip4-intel-text">{intel.hardest_section}</p>
        </div>
      )}
      {intel.what_interviewers_really_want && (
        <div className="ip4-intel-block ip4-intel-block--insight">
          <span className="ip4-intel-label">What they really want</span>
          <p className="ip4-intel-text">{intel.what_interviewers_really_want}</p>
        </div>
      )}
      {intel.wild_card_question && (
        <div className="ip4-intel-block ip4-intel-block--wildcard">
          <span className="ip4-intel-label">⚡ Wild card to prepare</span>
          <div className="ip4-intel-wildcard">
            <p className="ip4-intel-wildcard__q">"{intel.wild_card_question}"</p>
            <CopyBtn text={intel.wild_card_question} label="Copy" />
          </div>
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Engine question bank
// ─────────────────────────────────────────────────────────────────────────────

function EngineQ({ q }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ip4-eq ${open?"ip4-eq--open":""}`} onClick={() => setOpen(v=>!v)}>
      <div className="ip4-eq__header">
        <div className="ip4-eq__meta">
          {q.category && <span className="ip4-eq__cat">{q.category.replace(/_/g," ")}</span>}
          {q.skill && <span className={`ip4-eq__skill ${q.you_have_this===false?"ip4-eq__skill--miss":q.you_have_this?"ip4-eq__skill--have":""}`}>{q.skill}{q.you_have_this===true?" ✓":q.you_have_this===false?" ✗":""}</span>}
        </div>
        <span className="ip4-eq__chevron">{open?"▲":"▼"}</span>
      </div>
      <p className="ip4-eq__question">{q.question}</p>
      {open && (
        <div className="ip4-eq__body">
          {q.why_asked       && <p className="ip4-eq__row"><strong>Why asked:</strong> {q.why_asked}</p>}
          {q.preparation_tip && <p className="ip4-eq__tip">💡 {q.preparation_tip}</p>}
        </div>
      )}
    </div>
  );
}

function QuestionBankSection({ competency=[], technical=[], behavioural=[] }) {
  const total = competency.length + technical.length + behavioural.length;
  if (!total) return null;
  return (
    <ToolResultCard title={`Question Bank (${total})`} defaultOpen={false}>
      {competency.length > 0 && (
        <div className="ip4-qgroup">
          <span className="ip4-qgroup__label">Competency ({competency.length})</span>
          {competency.map((q,i) => <EngineQ key={i} q={q} />)}
        </div>
      )}
      {technical.length > 0 && (
        <div className="ip4-qgroup">
          <span className="ip4-qgroup__label">Technical ({technical.length})</span>
          {technical.map((q,i) => <EngineQ key={i} q={q} />)}
        </div>
      )}
      {behavioural.length > 0 && (
        <div className="ip4-qgroup">
          <span className="ip4-qgroup__label">Behavioural ({behavioural.length})</span>
          {behavioural.map((q,i) => <EngineQ key={i} q={q} />)}
        </div>
      )}
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Final Checklist
// ─────────────────────────────────────────────────────────────────────────────

function ChecklistGroup({ title, items, colour }) {
  const [checked, setChecked] = useState({});
  if (!items?.length) return null;
  return (
    <div className="ip4-checklist-group">
      <span className="ip4-checklist-group__label" style={{ color: colour }}>{title}</span>
      {items.map((item, i) => (
        <label key={i} className={`ip4-checklist-item ${checked[i]?"ip4-checklist-item--done":""}`}>
          <input
            type="checkbox"
            className="ip4-checklist-item__check"
            checked={!!checked[i]}
            onChange={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
          />
          <span className="ip4-checklist-item__text">{item}</span>
        </label>
      ))}
    </div>
  );
}

function FinalChecklistSection({ checklist }) {
  if (!checklist) return null;
  return (
    <ToolResultCard title="Final Pre-Interview Checklist" defaultOpen={false}>
      <p className="ip4-hint">Work through this before your interview. Tick each item as you complete it.</p>
      <ChecklistGroup title="Day before" items={checklist.day_before}  colour="#2563eb" />
      <ChecklistGroup title="Morning of" items={checklist.morning_of}  colour="#d97706" />
      <ChecklistGroup title="In the room" items={checklist.in_the_room} colour="#059669" />
    </ToolResultCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Salary
// ─────────────────────────────────────────────────────────────────────────────

function SalarySection({ negotiation, salaryLine }) {
  if (!negotiation && !salaryLine) return null;
  return (
    <ToolResultCard title="Salary & Negotiation" defaultOpen={false}>
      {salaryLine && (
        <div className="ip4-salary-line">
          <p className="ip4-salary-line__text">"{salaryLine}"</p>
          <CopyBtn text={salaryLine} label="Copy line" size="md" />
        </div>
      )}
      {negotiation && (
        <div className="ip4-salary-grid">
          <InfoRow label="Market range"     value={`£${negotiation.target_range?.min?.toLocaleString()} – £${negotiation.target_range?.max?.toLocaleString()}`} />
          <InfoRow label="Mean"             value={`£${negotiation.target_range?.mean?.toLocaleString()}`} accent />
          <InfoRow label="Conservative ask" value={`£${negotiation.recommended_ask?.conservative?.toLocaleString()}`} />
          <InfoRow label="Target ask"       value={`£${negotiation.recommended_ask?.target?.toLocaleString()}`} accent />
        </div>
      )}
      {negotiation?.negotiation_tips?.length > 0 && (
        <div className="ip4-salary-tips">
          {negotiation.negotiation_tips.map((t,i) => <p key={i} className="ip4-salary-tips__item">• {t}</p>)}
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
    target_role, current_role,
    competency_questions=[], technical_questions=[], behavioural_questions=[],
    salary_negotiation,
    ai = {},
  } = data;

  const {
    interview_strategy,
    opening_pitch,
    readiness_score,
    must_prepare_questions=[],
    transition_narratives,
    gap_handling=[],
    red_flags=[],
    interview_intelligence,
    final_checklist,
    salary_line,
  } = ai;

  const skillsStr = data.star_preparation?.stories_to_prepare?.map(s=>s.skill).join(",") || "";

  return (
    <div className="tool-results">
      <StrategySection strategy={interview_strategy} />
      <OpeningPitchSection pitch={opening_pitch} />
      <ReadinessDashboard score={readiness_score} targetRole={target_role} />
      <MustNailSection questions={must_prepare_questions} />
      <NarrativesSection narratives={transition_narratives} currentRole={current_role} />
      <GapHandlingSection gaps={gap_handling} />
      <MockInterviewSection targetRole={target_role} currentRole={current_role} skills={skillsStr} />
      <RedFlagsSection flags={red_flags} />
      <IntelSection intel={interview_intelligence} />
      <QuestionBankSection competency={competency_questions} technical={technical_questions} behavioural={behavioural_questions} />
      <FinalChecklistSection checklist={final_checklist} />
      <SalarySection negotiation={salary_negotiation} salaryLine={salary_line} />
    </div>
  );
}
