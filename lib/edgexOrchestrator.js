// ============================================================================
// lib/edgexOrchestrator.js  —  EDGEX Orchestration Engine
//
// Single source of truth for:
//   • Tool catalogue (free / paid, canonical names and routes)
//   • Intelligence modes (all free, run in-chat)
//   • Upload type detection and contextual action generation
//   • Client-side intent classification
//   • API payload construction (including documentText)
//   • Response section parser
//   • Plan helpers
//
// CANONICAL FREE / PAID DEFINITION
//   FREE  (2): Skills Gap Explainer, Career Intelligence (4 in-chat modes)
//   PAID  (5): Resume Optimiser, LinkedIn Optimiser, Interview Prep,
//              Career Roadmap, Visa Intelligence
//
// UPGRADE TIERS
//   career_pack  £6.99 one-time  — all 5 paid tools
//   pro          £14.99/mo       — all 5 paid tools, unlimited
//   elite        £29.99/mo       — pro + priority
// ============================================================================

// ─── Plan helpers ──────────────────────────────────────────────────────────────

export function getPlan() {
  if (typeof window === "undefined") return "free";
  try { return localStorage.getItem("hireedge_plan") || "free"; } catch { return "free"; }
}

export function isPaid() {
  return ["career_pack", "pro", "elite"].includes(getPlan());
}

export function canAccessTool(toolKey) {
  const plan = getPlan();
  const tool = TOOLS.find(t => t.key === toolKey);
  if (!tool) return false;
  if (!tool.paid) return true;
  return ["career_pack", "pro", "elite"].includes(plan);
}

// ─── Canonical tool catalogue ──────────────────────────────────────────────────

export const TOOLS = [
  {
    key:      "gap",
    label:    "Skills Gap Explainer",
    tagline:  "See exactly which skills you're missing for your target role",
    color:    "#f59e0b",
    route:    "/tools/career-gap-explainer",
    paid:     false,
    triggers: ["skill", "gap", "missing", "lacking", "need to learn", "qualify"],
  },
  {
    key:      "roadmap",
    label:    "Career Roadmap",
    tagline:  "Phased action plan from where you are to where you want to be",
    color:    "#10b981",
    route:    "/tools/career-roadmap",
    paid:     true,
    triggers: ["roadmap", "plan", "steps", "phase", "timeline", "how long"],
  },
  {
    key:      "resume",
    label:    "Resume Optimiser",
    tagline:  "Fix CV gaps, reframe experience, and pass ATS screens",
    color:    "#f87171",
    route:    "/tools/resume-optimiser",
    paid:     true,
    triggers: ["cv", "resume", "ats", "application"],
  },
  {
    key:      "linkedin",
    label:    "LinkedIn Optimiser",
    tagline:  "Rewrite your profile to attract the right recruiters",
    color:    "#0ea5e9",
    route:    "/tools/linkedin-optimiser",
    paid:     true,
    triggers: ["linkedin", "profile", "recruiter", "headhunter"],
  },
  {
    key:      "interview",
    label:    "Interview Prep",
    tagline:  "Role-specific questions, STAR answers, and gap-handling scripts",
    color:    "#a78bfa",
    route:    "/tools/interview-prep",
    paid:     true,
    triggers: ["interview", "question", "prepare", "prep", "star"],
  },
  {
    key:      "visa",
    label:    "Visa Intelligence",
    tagline:  "Check your eligibility for UK work visa routes",
    color:    "#818cf8",
    route:    "/tools/visa-intelligence",
    paid:     true,
    triggers: ["visa", "immigrat", "work permit", "skilled worker", "tier 2", "relocat"],
  },
];

// ─── Intelligence modes (all FREE) ────────────────────────────────────────────

export const INTELLIGENCE_MODES = [
  {
    key:      "salary",
    label:    "Salary Insights",
    tagline:  "UK market rates, bands, and negotiation benchmarks",
    color:    "#10b981",
    icon:     "£",
    thinking: ["Querying UK salary data...", "Benchmarking your role...", "Checking market rates...", "Crunching compensation data..."],
  },
  {
    key:      "transition",
    label:    "Transition Analysis",
    tagline:  "Difficulty score, timeline, and success factors for your move",
    color:    "#6366f1",
    icon:     "T",
    thinking: ["Scoring transition difficulty...", "Checking demand signals...", "Mapping your move...", "Calculating success factors..."],
  },
  {
    key:      "skills",
    label:    "Skills Gap",
    tagline:  "Exact gaps between your current role and target",
    color:    "#f59e0b",
    icon:     "G",
    thinking: ["Mapping skill requirements...", "Comparing role profiles...", "Identifying gaps...", "Scoring your readiness..."],
  },
  {
    key:      "path",
    label:    "Career Path",
    tagline:  "All routes and stepping-stone roles to your goal",
    color:    "#8b5cf6",
    icon:     "P",
    thinking: ["Charting career routes...", "Finding stepping-stone roles...", "Mapping alternatives...", "Calculating best path..."],
  },
];

// ─── Upload helpers ────────────────────────────────────────────────────────────

export function detectUploadType(fileName) {
  const name = (fileName || "").toLowerCase();
  if (/\b(cv|resume|curriculum[\s._-]?vitae)\b/.test(name)) return "cv";
  if (/\b(job[\s._-]?desc|jd|posting|vacancy|role)\b/.test(name))  return "jd";
  if (/\b(cover[\s._-]?letter|coverletter)\b/.test(name))           return "cover";
  return "document";
}

export function getUploadActions(uploadType, context) {
  const target = context?.target || "your target role";
  const role   = context?.role   || "your current role";

  const MAP = {
    cv: [
      { label: "Analyse my CV",          prompt: "Analyse the CV I just uploaded. Identify strengths, gaps, and how well it positions me for " + target + "." },
      { label: "Find CV gaps",            prompt: "What is missing from my uploaded CV that a hiring manager for " + target + " would expect to see?" },
      { label: "ATS fit score",           prompt: "How well would my uploaded CV pass ATS screening for a " + target + " role? What must change?" },
      { label: "Suggest rewrites",        prompt: "Give me specific rewrite suggestions for my uploaded CV to better target " + target + " roles in the UK." },
    ],
    jd: [
      { label: "Match my profile",        prompt: "Compare this job description against my background as a " + role + ". Where do I match and where are the gaps?" },
      { label: "Extract requirements",    prompt: "List all key requirements from this job description, ranked by how critical they appear." },
      { label: "Fit score",               prompt: "Give me a fit score between my profile as a " + role + " and this job description. Be specific about each gap." },
    ],
    cover: [
      { label: "Review my letter",        prompt: "Review the cover letter I uploaded. Rate its impact and tell me what to improve for a " + target + " role." },
      { label: "Strengthen the opening",  prompt: "How can I make the opening of my cover letter more compelling for a " + target + " role?" },
      { label: "Check tone and fit",      prompt: "Is the tone of my cover letter right for a " + target + " position? What would make it stronger?" },
    ],
    document: [
      { label: "Analyse document",        prompt: "Analyse the document I uploaded and tell me how it relates to my career goals targeting " + target + "." },
    ],
  };

  return MAP[uploadType] || MAP.document;
}

// ─── Intent classifier ─────────────────────────────────────────────────────────

export function classifyIntent(message, context) {
  const msg = (message || "").toLowerCase();

  if (/\b(salary|earn|pay|wage|income|compensation|benchmark|market rate|worth)\b/.test(msg))
    return { type: "intelligence", mode: "salary" };

  if (/\b(transition|move (to|into)|switch (to|into)|change (to|into)|become a|get into|break into)\b/.test(msg))
    return { type: "intelligence", mode: "transition", suggestTool: "gap" };

  if (/\b(skill|gap|missing|lacking|need to learn|upskill|reskill|qualify for)\b/.test(msg))
    return { type: "intelligence", mode: "skills", suggestTool: "gap" };

  if (/\b(career path|path to|route to|steps? to|how do i become|progression|roadmap)\b/.test(msg))
    return { type: "intelligence", mode: "path", suggestTool: "roadmap" };

  if (/\b(interview|prepare for|prep for|star method|interview question)\b/.test(msg))
    return { type: "tool_suggest", toolKey: "interview" };

  if (/\b(cv|resume|curriculum vitae|ats)\b/.test(msg))
    return { type: "tool_suggest", toolKey: "resume" };

  if (/\b(linkedin|linkedin profile|profile optimis|recruiter)\b/.test(msg))
    return { type: "tool_suggest", toolKey: "linkedin" };

  if (/\b(visa|immigrat|work permit|skilled worker route|tier 2|relocat to uk)\b/.test(msg))
    return { type: "tool_suggest", toolKey: "visa" };

  return { type: "direct_answer" };
}

// ─── API payload builder ───────────────────────────────────────────────────────

export function buildRequestPayload(message, context, intent, intelligenceMode, uploadedFile, documentText) {
  const payload = {
    message,
    context: _safeContext(context),
  };

  const mode = intelligenceMode || (intent?.type === "intelligence" ? intent.mode : null);
  if (mode) payload.intelligence_mode = mode;

  if (uploadedFile) {
    payload.fileName = uploadedFile.name;
    payload.fileType = detectUploadType(uploadedFile.name);
  }

  // Real document content — present only when client-side extraction succeeded
  if (documentText) {
    payload.documentText = documentText;
  }

  return payload;
}

function _safeContext(ctx) {
  if (!ctx || typeof ctx !== "object") return {};
  const out = {};
  for (const k of ["role", "target", "yearsExp", "country", "lastIntent"]) {
    if (ctx[k] != null) out[k] = ctx[k];
  }
  return out;
}

// ─── Response section parser ───────────────────────────────────────────────────

const SECTION_MAP = [
  { key: "summary",   patterns: [/^SUMMARY$/i],                                      icon: "→", color: "#6366f1" },
  { key: "insight",   patterns: [/^KEY INSIGHT$/i, /^INSIGHT$/i],                   icon: "◆", color: "#0F6E56" },
  { key: "gap",       patterns: [/^GAP$/i, /^OPPORTUNITY$/i, /^GAP \/ OPPORTUNITY$/i, /^GAPS?$/i], icon: "△", color: "#f59e0b" },
  { key: "next_step", patterns: [/^NEXT STEP$/i, /^RECOMMENDED NEXT STEP$/i, /^ACTION$/i], icon: "✓", color: "#10b981" },
  { key: "snapshot",  patterns: [/TRANSITION SNAPSHOT/i, /^SNAPSHOT$/i],            icon: "S",  color: "#6366f1" },
  { key: "skills",    patterns: [/SKILL GAP ANALYSIS/i, /^SKILL GAPS?$/i],          icon: "G",  color: "#f59e0b" },
  { key: "market",    patterns: [/MARKET EXPECTATION/i, /^MARKET$/i],               icon: "M",  color: "#10b981" },
  { key: "position",  patterns: [/STRATEGIC POSITION/i, /^POSITIONING$/i],          icon: "P",  color: "#8b5cf6" },
  { key: "action",    patterns: [/NEXT BEST ACTION/i],                              icon: "A",  color: "#0F6E56" },
];

export function parseReplyIntoSections(text) {
  if (!text) return [];

  const lines = text.split("\n");
  const sections = [];
  let current = null;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (current) current.lines.push({ type: "gap" });
      continue;
    }

    const cleaned    = trimmed.replace(/\*\*/g, "").trim();
    const sectionDef = SECTION_MAP.find(s => s.patterns.some(p => p.test(cleaned)));

    if (sectionDef) {
      if (current) sections.push(current);
      current = { key: sectionDef.key, title: cleaned, icon: sectionDef.icon, color: sectionDef.color, lines: [] };
    } else if (current) {
      current.lines.push(_classifyLine(raw, cleaned));
    } else {
      const intro = sections.find(s => s.key === "intro");
      if (!intro) {
        sections.push({ key: "intro", title: "", icon: "", color: "#0F6E56", lines: [_classifyLine(raw, cleaned)] });
      } else {
        intro.lines.push(_classifyLine(raw, cleaned));
      }
    }
  }

  if (current) sections.push(current);

  if (!sections.length || (sections.length === 1 && sections[0].key === "intro")) {
    return [{
      key:   "plain",
      title: "",
      icon:  "",
      color: "#0F6E56",
      lines: text.split("\n").map(l => _classifyLine(l.trim(), l.replace(/\*\*/g, "").trim())),
    }];
  }

  return sections;
}

function _classifyLine(raw, cleaned) {
  if (!cleaned) return { type: "gap" };
  if (/^[-•·]\s+/.test(raw)) return { type: "bullet", text: cleaned.replace(/^[-•·]\s+/, "") };
  if (/^\*\s+/.test(raw))    return { type: "bullet", text: cleaned.replace(/^\*\s+/, "") };
  if (/^\d+\.\s+/.test(raw)) return { type: "bullet", text: cleaned.replace(/^\d+\.\s+/, "") };
  return { type: "text", text: cleaned };
}
