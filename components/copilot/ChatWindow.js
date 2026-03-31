// ============================================================================
// api/copilot/chat.js
// EDGEX chat endpoint — CORS + standalone query + strict salary benchmark mode
// ============================================================================

import OpenAI from "openai";
import { getRoleBySlug } from "../../lib/dataset/roleIndex.js";
import { detectIntent, routeTool, callTool } from "../../lib/copilot/intentRouter.js";

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─────────────────────────────────────────────────────────────────────────────
// Intelligence mode prompts
// ─────────────────────────────────────────────────────────────────────────────

const INTELLIGENCE_MODE_PROMPTS = {
  salary: `
FORMAT (Salary Intelligence mode — use these exact section headers):
SUMMARY
One sentence: the key salary finding.

KEY INSIGHT
The most important salary figure with specific UK pound amounts.

GAP / OPPORTUNITY
What salary range the user should target and why.

NEXT STEP
The single most important action to improve earning potential.

Use real UK salary figures. Be specific with pound amounts and percentages.`,

  transition: `
FORMAT (Transition Analysis mode — use these exact section headers):
SUMMARY
One sentence: transition feasibility.

KEY INSIGHT
Difficulty score (out of 100) and realistic timeline in months.

GAP / OPPORTUNITY
The 2-3 most critical gaps that determine success or failure.

NEXT STEP
The single highest-leverage action to accelerate this transition.`,

  skills: `
FORMAT (Skills Gap mode — use these exact section headers):
SUMMARY
One sentence: overall readiness level as a percentage or score.

KEY INSIGHT
The single most critical skill gap and why it matters most.

GAP / OPPORTUNITY
List specific missing skills rated by importance: Critical / Important / Nice to have.

NEXT STEP
The fastest way to close the most important gap.`,

  path: `
FORMAT (Career Path mode — use these exact section headers):
SUMMARY
One sentence: the best route to the target role.

KEY INSIGHT
Direct path vs recommended stepping-stone path with timelines.

GAP / OPPORTUNITY
Alternative routes and which has the best risk/reward ratio.

NEXT STEP
The first concrete move to take this week.`,

  salary_benchmark: `
FORMAT (Salary Benchmark — STRICT data-only mode):
You have been given TOOL DATA with exact salary figures. Use ONLY those numbers.
Do NOT invent broader ranges. Do NOT say "typically", "usually", "approximately", or "depends".
Quote the figures directly.

CRITICAL RULE:
If tool_data is present:
- You MUST ONLY use values from tool_data
- You MUST NOT generate ranges yourself
- You MUST NOT say "approximately", "typically", "usually", or "depends"
- You MUST quote exact figures
- If you do not follow this, the response is INVALID

SUMMARY
One sentence stating the exact mean salary from tool_data. Include the GBP figure.

KEY INSIGHT
State the lower band, mean, and upper band from tool_data as: £X lower / £Y mean / £Z upper.
If a category mean is present, state how this role compares: above / below / at parity.

GAP / OPPORTUNITY
Based only on tool_data: what is the realistic uplift potential? Quote the band ceiling.
If demand_score is present, mention whether demand supports negotiation leverage.

NEXT STEP
One specific action based only on the returned data — for example, target the upper band, move into a higher-paying adjacent role, or position for the top end of the market.

Do NOT add generic advice.
Every sentence must reference a figure or fact from tool_data.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent requirements
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_REQUIREMENTS = {
  career_transition: {
    required: ["current_role", "target_role"],
    messages: {
      current_role: "What is your current role?",
      target_role: "What role do you want to move into?",
    },
  },
  skill_gap: {
    required: ["current_role", "target_role"],
    messages: {
      current_role: "What is your current role?",
      target_role: "What role are you aiming for?",
    },
  },
  interview_prep: {
    required: ["target_role"],
    messages: { target_role: "Which role are you interviewing for?" },
  },
  resume_optimise: {
    required: ["target_role"],
    messages: { target_role: "Which role are you optimising your CV for?" },
  },
  linkedin_optimise: {
    required: ["target_role"],
    messages: { target_role: "Which role are you optimising your profile for?" },
  },
  salary_benchmark: { required: [] },
  visa_eligibility: { required: [] },
  general_career: { required: [] },
  unclear: { required: [] },
};

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

function applyCors(req, res) {
  const allowedOrigins = [
    "https://hireedge-frontend-mvp.vercel.app",
    "https://hireedge-frontend-mvp-git-main-srinath-senthilkumar-projects.vercel.app",
    "http://localhost:3000",
  ];

  const requestOrigin = req.headers.origin;
  const allowOrigin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0];

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-HireEdge-Plan, X-HireEdge-User-Id"
  );
}

function sendJson(req, res, status, payload) {
  applyCors(req, res);
  return res.status(status).json(payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateRequest(intent, resolved) {
  const spec = INTENT_REQUIREMENTS[intent] || { required: [] };
  const missing = spec.required.filter((f) =>
    f === "current_role" ? !resolved.role : !resolved.target
  );

  if (missing.length === 0) return null;

  const labels = missing.map((f) =>
    f === "current_role" ? "your current role" : "your target role"
  );

  const actions = missing.map((f) => ({
    type: "question",
    label: spec.messages[f],
    prompt: spec.messages[f],
  }));

  const intentLabel =
    {
      career_transition: "a career transition plan",
      skill_gap: "a skill gap analysis",
      resume_optimise: "CV optimisation",
      linkedin_optimise: "LinkedIn optimisation",
      interview_prep: "interview preparation",
    }[intent] || "this";

  return {
    ok: true,
    data: {
      type: "clarification",
      reply:
        "To build " +
        intentLabel +
        ", I need " +
        labels.join(" and ") +
        " first.",
      intent: { name: intent, confidence: 0.9 },
      tool_used: null,
      missing_fields: missing,
      next_actions: actions,
      recommendations: [],
      context: resolved,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Context resolution
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_RE = [
  [/(?<![a-zA-Z])from\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)\s+(?:to|into)\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=[,.]|$|\?|\s+(?:role|as)\b)/i, "both"],
  [/\bi\s+(?:work|worked)\s+as\s+(?:a |an )?([a-z][a-z -]{1,24}?)\s+and\s+(?:want|need|hope|plan|look)/i, "role"],
  [/\bi\s+am\s+(?:currently\s+)?(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=\s+(?:and|looking|wanting|hoping|trying|aiming|moving|planning|who)\b|[,.]|$)/i, "role"],
  [/\bcurrently\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=[,.]|\s+(?:and|looking|aiming)\b|$)/i, "role"],
  [/want(?:ing)?\s+to\s+(?:be|become|transition\s+(?:to|into)|move\s+into)\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=[,.]|$|\?|\s+role\b)/i, "target"],
  [/(?<![a-z])(?:become|move\s+into|transition\s+(?:to|into)|moving\s+(?:to|into))\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=[,.]|$|\?|\s+role\b)/i, "target"],
  [/aim(?:ing)?\s+(?:for|to\s+become)\s+(?:a |an )?([A-Za-z][A-Za-z -]{2,28}?)(?=[,.]|$|\s+role\b)/i, "target"],
];

const SHORT_X_TO_Y = /^([A-Za-z][A-Za-z -]{2,25}?)\s+to\s+([A-Za-z][A-Za-z -]{2,25})$/i;

function extractRoles(message) {
  let role = null;
  let target = null;
  const t = (message || "").toLowerCase().trim();

  if (t.split(/\s+/).length <= 6) {
    const m = SHORT_X_TO_Y.exec(t);
    if (m) {
      role = m[1].trim();
      target = m[2].trim();
    }
  }

  for (const [re, kind] of ROLE_RE) {
    const m = re.exec(t);
    if (!m) continue;
    if (kind === "both") {
      if (!role) role = m[1].trim();
      if (!target && m[2]) target = m[2].trim();
    } else if (kind === "role" && !role) {
      role = m[1].trim();
    } else if (kind === "target" && !target) {
      target = m[1].trim();
    }
    if (role && target) break;
  }

  return { role, target };
}

const PERSONAL_RE =
  /\b(my\s+(salary|role|transition|skill|cv|resume|profile|current|target)|for\s+me|my\s+background|from\s+my|i\s+(am|work|want|need)|i'm\s+a)\b/i;

const GREETING_RE =
  /^(hi|hello|hey|helo|hello there|good morning|good afternoon|good evening)\b[!. ]*$/i;

const STANDALONE_RE =
  /\b(salary\s+of\s+(?:a\s+|an\s+)?[a-z]|how\s+much\s+(?:do|does)\s+(?:a\s+|an\s+)?[a-z]|what\s+(?:is|are)\s+the\s+salary\s+of\s+(?:a\s+|an\s+)?[a-z]|what\s+(?:is|are|does)\s+(?:a\s+|an\s+)?[a-z].{0,40}(earn|paid|salary|role)|what\s+do\s+[a-z].{2,30}\s+(do|earn)|market\s+rate\s+for\s+(?:a\s+|an\s+)?[a-z])\b/i;

function isStandaloneQuery(message) {
  if (!message) return false;
  if (GREETING_RE.test(message.trim())) return true;
  if (PERSONAL_RE.test(message)) return false;
  return STANDALONE_RE.test(message);
}

function resolveContext(context, message) {
  const extracted = extractRoles(message);
  const standalone = isStandaloneQuery(message);

  if (standalone) {
    return {
      role: extracted.role || null,
      target: extracted.target || null,
      yearsExp: null,
      country: context?.country || null,
    };
  }

  return {
    role: extracted.role || context?.role || null,
    target: extracted.target || context?.target || null,
    yearsExp: context?.yearsExp || null,
    country: context?.country || null,
  };
}

function safeContext(ctx) {
  if (!ctx) return {};
  const out = {};
  for (const k of ["role", "target", "yearsExp", "country", "lastIntent"]) {
    if (ctx[k] != null) out[k] = ctx[k];
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Career graph
// ─────────────────────────────────────────────────────────────────────────────

const SEN_RANK = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  head: 5,
  director: 6,
  vp: 7,
  c_suite: 8,
};

function findRole(title) {
  if (!title) return null;
  try {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return getRoleBySlug(slug) || null;
  } catch {
    return null;
  }
}

function buildCareerGraph(fromTitle, toTitle) {
  const from = findRole(fromTitle);
  const to = findRole(toTitle);
  if (!from && !to) return "";

  const lines = ["[CAREER GRAPH DATA -- use these numbers in your response]"];

  if (from) {
    const skills = [
      ...(from.skills_grouped?.core || []),
      ...(from.skills_grouped?.technical || []),
    ];
    lines.push(
      "FROM: " + from.title,
      "  Salary: GBP" + (from.salary_uk?.mean?.toLocaleString("en-GB") || "n/a"),
      "  Skills: " + skills.slice(0, 6).join(", ")
    );
  }

  if (to) {
    const skills = [
      ...(to.skills_grouped?.core || []),
      ...(to.skills_grouped?.technical || []),
    ];
    lines.push(
      "TO: " + to.title,
      "  Salary: GBP" + (to.salary_uk?.mean?.toLocaleString("en-GB") || "n/a"),
      "  Demand: " + (to.demand_score || 50) + "/100",
      "  Skills: " + skills.slice(0, 6).join(", ")
    );
  }

  if (from && to) {
    const fromSet = new Set(
      [
        ...(from.skills_grouped?.core || []),
        ...(from.skills_grouped?.technical || []),
      ].map((s) => s.toLowerCase())
    );

    const toSkills = [
      ...(to.skills_grouped?.core || []),
      ...(to.skills_grouped?.technical || []),
    ].map((s) => s.toLowerCase());

    const overlap = toSkills.filter((s) => fromSet.has(s));
    const missing = toSkills.filter((s) => !fromSet.has(s));
    const matchPct = toSkills.length
      ? Math.round((overlap.length / toSkills.length) * 100)
      : 50;

    const senDelta = Math.max(
      0,
      (SEN_RANK[to.seniority] || 3) - (SEN_RANK[from.seniority] || 3)
    );

    const diff = Math.min(
      100,
      Math.round(
        (to.difficulty_to_enter || 50) * 0.5 +
          (100 - matchPct) * 0.35 +
          senDelta * 5
      )
    );

    const rate = Math.max(
      15,
      Math.min(
        90,
        Math.round(
          matchPct * 0.5 +
            (100 - diff) * 0.35 +
            (from.demand_score || 50) * 0.15
        )
      )
    );

    const tMin = Math.max(
      2,
      Math.round(missing.length * 0.8 + senDelta * 2 + (to.time_to_hire || 3)) - 2
    );

    const fromSal = from.salary_uk?.mean || 0;
    const toSal = to.salary_uk?.mean || 0;
    const salD =
      fromSal > 0 && toSal > 0
        ? (((toSal - fromSal) / fromSal) * 100).toFixed(0)
        : null;

    lines.push(
      "METRICS: Difficulty=" +
        diff +
        "/100 | Success=" +
        rate +
        "% | Timeline=" +
        tMin +
        "-" +
        (tMin + 4) +
        "m",
      salD != null
        ? "  Salary: " +
            (salD >= 0 ? "+" : "") +
            salD +
            "% (GBP" +
            fromSal.toLocaleString("en-GB") +
            " -> GBP" +
            toSal.toLocaleString("en-GB") +
            ")"
        : "  Salary: n/a",
      "  Skill match: " + matchPct + "% | Missing: " + missing.slice(0, 5).join(", "),
      "  Transferable: " + overlap.slice(0, 4).join(", ")
    );
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Document context
// ─────────────────────────────────────────────────────────────────────────────

function buildDocumentContext(fileType, fileName, documentText) {
  if (!documentText) return "";
  const TYPE_LABELS = {
    cv: "CV / Resume",
    jd: "Job Description",
    cover: "Cover Letter",
    document: "Document",
  };
  const label = TYPE_LABELS[fileType] || "Document";
  return [
    "[UPLOADED DOCUMENT -- " + label + (fileName ? ' "' + fileName + '"' : "") + "]",
    "The user has uploaded this document. Base your response on its actual content.",
    "Reference specific details, skills, experience, or requirements found in it.",
    "Do not assume content that is not present.",
    "",
    documentText.slice(0, 10000),
    "[END DOCUMENT]",
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

const BASE_SYSTEM = `You are EDGEX -- HireEdge's Career Intelligence Engine.

ROLE: Format tool data into clear, structured career intelligence. You do NOT generate plans from scratch -- you format real data from tools.

RULES:
1. When tool_data is provided, format ONLY that data. Do not add invented content.
2. NEVER invent or assume a role name.
3. Answer general questions (salary, market, skills, visa) directly even when context has roles.
4. If the user states new roles, use those immediately.
5. UK English throughout. No filler. No hedging.
6. NEVER say "I can only provide information about your current transition".
7. When a document is provided, reference its actual content specifically.
8. When CAREER GRAPH DATA is provided, treat those numbers as source-of-truth. Use the Difficulty score, Success rate, Timeline, and Salary figures directly in your response sections -- even when no tool_data is present.

FORMAT when tool_data provided:
Use the exact numbers from tool_data. Structure with sections:
TRANSITION SNAPSHOT / SKILL GAP BREAKDOWN / MARKET EXPECTATION (UK) / STRATEGIC POSITIONING / NEXT BEST ACTION

FORMAT for general questions (no tool data):
Use structured sections. If no intelligence mode is active, use:

SUMMARY
One sentence direct answer.

KEY INSIGHT
The single most important number, fact, or finding. Be specific.

GAP / OPPORTUNITY
The main blocker, gap, or upside opportunity. Be specific, not generic.

NEXT STEP
The one concrete action to take now.

Keep each section to 1-3 sentences. No padding. No filler.

NEXT ACTIONS (mandatory at end -- always include):
[ACTIONS]
[{"type":"question","label":"Short label","prompt":"Full question"},{"type":"tool","label":"Open tool","endpoint":"/api/tools/career-gap-explainer","prompt":""}]
[/ACTIONS]`;

function buildSystemPrompt(intelligenceMode, intent) {
  const effectiveMode =
    intelligenceMode || (intent === "salary_benchmark" ? "salary_benchmark" : null);

  if (!effectiveMode) return BASE_SYSTEM;

  const modePrompt = INTELLIGENCE_MODE_PROMPTS[effectiveMode];
  if (!modePrompt) return BASE_SYSTEM;

  return BASE_SYSTEM + "\n\n" + modePrompt;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM formatting
// ─────────────────────────────────────────────────────────────────────────────

async function formatWithLLM(
  message,
  resolved,
  intent,
  toolData,
  graphData,
  intelligenceMode,
  documentContext
) {
  const parts = [];

  if (resolved.role || resolved.target) {
    const ctx = [];
    if (resolved.role) ctx.push("Current role: " + resolved.role);
    if (resolved.target) ctx.push("Target role: " + resolved.target);
    if (resolved.country) ctx.push("Country: " + resolved.country);
    parts.push("[SESSION MEMORY]\n" + ctx.join("\n"));
  } else {
    parts.push(
      "[SESSION MEMORY]\nNone. This is a standalone query. Answer only about the role or topic explicitly mentioned in the user message. Do not reference any previous session context."
    );
  }

  if (intelligenceMode) {
    parts.push(
      "[INTELLIGENCE MODE: " +
        intelligenceMode.toUpperCase() +
        "]\nUse the structured FORMAT for this mode as specified in your instructions."
    );
  }

  if (graphData) parts.push(graphData);

  if (toolData) {
    parts.push(
      "[TOOL DATA — SOURCE OF TRUTH]\n" +
        "You MUST use ONLY the numbers from this data. Do NOT estimate, generalise, or expand ranges.\n" +
        "If a value is present, you MUST quote it exactly.\n\n" +
        JSON.stringify(toolData, null, 2).slice(0, 2000)
    );
  }

  if (documentContext) {
    parts.push(documentContext);
  }

  parts.push("[USER MESSAGE]\n" + message);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: buildSystemPrompt(intelligenceMode, intent) },
      { role: "user", content: parts.join("\n\n") },
    ],
    temperature: 0.2,
    max_tokens: 1400,
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || "";
  return parseActions(raw);
}

function parseActions(raw) {
  if (!raw) return { reply: "", nextActions: [] };

  let nextActions = [];
  const match = raw.match(/\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/);

  if (match) {
    try {
      nextActions = JSON.parse(match[1].trim());
    } catch {
      nextActions = [];
    }
    if (!Array.isArray(nextActions)) nextActions = [];
  }

  const reply = raw
    .replace(/\[ACTIONS\][\s\S]*?\[\/ACTIONS\]/g, "")
    .replace(/\[ACTIONS\][\s\S]*/g, "")
    .replace(/\[\/ACTIONS\]/g, "")
    .trim();

  return { reply, nextActions };
}

function updateCtx(resolved, intent) {
  return { ...safeContext(resolved), lastIntent: intent };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return sendJson(req, res, 405, { error: "Method not allowed." });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return sendJson(req, res, 400, { error: "Invalid JSON." });
  }

  const {
    message,
    context,
    intelligence_mode,
    fileName,
    fileType,
    documentText,
  } = body;

  if (!message?.trim()) {
    return sendJson(req, res, 400, { error: "message is required." });
  }

  const msg = message.trim();
  const resolved = resolveContext(context, msg);

  const { intent, confidence, slots } = detectIntent(msg, resolved);

  console.log(
    "[chat] intent=" +
      intent +
      " confidence=" +
      confidence.toFixed(2) +
      " role=" +
      resolved.role +
      " target=" +
      resolved.target +
      " mode=" +
      (intelligence_mode || "none") +
      " hasDoc=" +
      !!documentText
  );

  if (slots.role && !resolved.role) resolved.role = slots.role;
  if (slots.target && !resolved.target) resolved.target = slots.target;
  if (slots.country && !resolved.country) resolved.country = slots.country;

  const clarification = validateRequest(intent, resolved);
  if (clarification) {
    console.log("[chat] clarification required:", clarification.data.missing_fields);
    return sendJson(req, res, 200, clarification);
  }

  const route = routeTool(intent, { ...resolved, ...slots });
  const documentContext = buildDocumentContext(fileType, fileName, documentText);

  try {
    let toolData = null;
    let toolUsed = null;
    let toolError = null;

    if (route?.canRoute) {
      console.log("[chat] routing to tool:", route.endpoint);
      const toolResult = await callTool(route);
      if (toolResult.ok) {
        toolData = toolResult.data;
        toolUsed = route.endpoint;
        console.log("[chat] tool succeeded:", route.endpoint);
        console.log("[chat] TOOL DATA:", JSON.stringify(toolData).slice(0, 1200));
      } else {
        toolError = toolResult.error;
        console.warn("[chat] tool failed:", route.endpoint, toolResult.error);
      }
    }

    if (!openai) {
      return sendJson(req, res, 200, {
        ok: true,
        data: {
          intent: { name: intent, confidence },
          tool_used: toolUsed,
          reply: toolData
            ? JSON.stringify(toolData).slice(0, 300)
            : "EDGEX is initialising.",
          next_actions: [],
          context: updateCtx(resolved, intent),
        },
      });
    }

    const graphData = buildCareerGraph(resolved.role, resolved.target);

    const { reply, nextActions } = await formatWithLLM(
      msg,
      resolved,
      intent,
      toolData,
      graphData,
      intelligence_mode,
      documentContext
    );

    return sendJson(req, res, 200, {
      ok: true,
      data: {
        intent: { name: intent, confidence },
        tool_used: toolUsed,
        tool_error: toolError || undefined,
        reply,
        next_actions: nextActions,
        context: updateCtx(resolved, intent),
        recommendations: [],
        insights: null,
      },
    });
  } catch (err) {
    console.error("[chat] handler error:", err);
    return sendJson(req, res, 500, {
      ok: false,
      error: "EDGEX is temporarily unavailable.",
      message: err.message,
    });
  }
}
