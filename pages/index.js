// ============================================================================
// pages/index.js
// HireEdge — Marketing landing page
//
// This page opts OUT of the app shell (no sidebar, no topbar).
// AppShell.js must include "/" in NO_SHELL_ROUTES for this to work.
// See also: components/layout/AppShell.js
// ============================================================================

import "../styles/marketing.css";
import Link from "next/link";
import Head from "next/head";

// ── HireEdge wordmark + wedge logo (inline — no import needed) ────────────

function Logo({ size = 28 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
        <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
      </svg>
      <span style={{ fontSize: size * 0.55, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
        HireEdge
      </span>
    </span>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="mkt-nav">
      <div className="mkt-nav__inner">
        <Link href="/" className="mkt-nav__logo">
          <Logo size={24} />
        </Link>
        <div className="mkt-nav__links">
          <Link href="/intelligence" className="mkt-nav__link">Intelligence</Link>
          <Link href="/tools"        className="mkt-nav__link">Tools</Link>
          <Link href="/billing"      className="mkt-nav__link">Pricing</Link>
        </div>
        <div className="mkt-nav__actions">
          <Link href="/copilot" className="mkt-nav__cta">
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    head: "You're guessing.",
    body: "Most people decide their next move based on what a friend did, what looks good on LinkedIn, or what feels safe. Not data.",
  },
  {
    head: "Advice online is for everyone. Which means it's for no one.",
    body: "Generic frameworks, US salary benchmarks, recycled playbooks. None of it knows your role, your market, or your gap.",
  },
  {
    head: "Recruiters see things you don't.",
    body: "They know which skills are actually required vs. listed. They know what salary bands are real. You're negotiating blind.",
  },
  {
    head: "Your career decisions are fragmented.",
    body: "Your CV is in one place. Salary research in another. Career advice in a third. No single view of where you actually stand.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Ask EDGEX",
    body: "Tell EDGEX your current role, your target, and what you're unsure about. It asks the right follow-ups.",
  },
  {
    num: "02",
    title: "Get your gap analysis",
    body: "EDGEX maps your gap against real UK role data — skills, salary, transition paths, timeline, and what's actually blocking you.",
  },
  {
    num: "03",
    title: "Execute with tools",
    body: "Use Career Pack or Pro tools to rewrite your CV, rebuild your LinkedIn, prep for interviews, and move.",
  },
];

const PLATFORM_LAYERS = [
  {
    id:    "edgex",
    tag:   "AI engine",
    name:  "EDGEX",
    color: "#4f46e5",
    body:  "The intelligence layer. Ask anything about your career — salary, transitions, gaps, visa, negotiation. EDGEX gives structured, specific answers grounded in UK job market data.",
    href:  "/copilot",
    cta:   "Open EDGEX",
  },
  {
    id:    "intelligence",
    tag:   "Data layer",
    name:  "Career Intelligence",
    color: "#0F6E56",
    body:  "1,200+ UK roles with live salary ranges, required skills, transition logic, and market demand signals — all searchable without a subscription.",
    href:  "/intelligence",
    cta:   "Explore data",
  },
  {
    id:    "tools",
    tag:   "Execution layer",
    name:  "Career Tools",
    color: "#0F6E56",
    body:  "Six AI-powered tools that produce real outputs. Not scores, not dashboards — rewritten CVs, rebuilt profiles, structured interview prep, and visa strategy.",
    href:  "/tools",
    cta:   "See all tools",
  },
];

const TRUST_STATS = [
  { figure: "1,200+",                        label: "UK roles mapped" },
  { figure: "Salary benchmarks",             label: "from live UK job data" },
  { figure: "Real transitions",              label: "not generic advice" },
  { figure: "Built for UK",                  label: "job market decisions" },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function MarketingHome() {
  return (
    <>
      <Head>
        <title>HireEdge — AI Career Intelligence for the UK Job Market</title>
        <meta name="description" content="Know your salary, your gaps, and your best next move — before you apply. EDGEX gives structured career intelligence built on real UK role data." />
      </Head>

      <div className="mkt">
        <Nav />

        {/* ── 1. HERO ────────────────────────────────────────────────── */}
        <section className="mkt-hero">
          <div className="mkt-hero__inner">
            <div className="mkt-hero__eyebrow">
              <span className="mkt-dot" />
              AI Career Intelligence · Built for the UK job market
            </div>

            <h1 className="mkt-hero__h1">
              Know your salary,<br />
              your gaps, and your<br />
              best next move —<br />
              <span className="mkt-hero__h1-em">before you apply.</span>
            </h1>

            <p className="mkt-hero__sub">
              HireEdge gives you structured career intelligence — role data, transition logic, salary benchmarks, and AI analysis — so you stop guessing and start moving.
            </p>

            <p className="mkt-hero__bridge">
              Stop second-guessing your next move. Know exactly where you stand — and what to do next.
            </p>

            <div className="mkt-hero__actions">
              <Link href="/copilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                Start with EDGEX — free
              </Link>
              <Link href="/billing" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
                View plans
              </Link>
            </div>

            <p className="mkt-hero__disclaimer">
              No credit card. No setup. Start in seconds.
            </p>
          </div>

          {/* Demo conversation */}
          <div className="mkt-hero__demo">
            <div className="mkt-chat">
              <div className="mkt-chat__bar">
                <span className="mkt-chat__dot" /><span className="mkt-chat__dot" /><span className="mkt-chat__dot" />
                <span className="mkt-chat__label">EDGEX</span>
              </div>
              <div className="mkt-chat__msg mkt-chat__msg--user">
                <p>I'm a mid-level software engineer in Birmingham. I want to move into product at a Series B. How realistic is that, and what's my biggest gap?</p>
              </div>
              <div className="mkt-chat__msg mkt-chat__msg--edgex">
                <div className="mkt-chat__avatar">
                  <svg width="10" height="10" viewBox="0 0 32 32" fill="none">
                    <path d="M 5,3 L 30,16 L 2,29 Z" fill="#0F6E56" />
                    <path d="M 5,3 L 30,16 L 28.85,18.22 L 3.85,5.22 Z" fill="#4f46e5" />
                  </svg>
                </div>
                <div className="mkt-chat__body">
                  <p>Realistic — with a clear gap plan. Your core gap is product sense: you can build, but you need evidence you can prioritise and ship decisions.</p>
                  <p className="mkt-chat__item"><span className="mkt-chat__n">1.</span> Series B PMs care about execution speed — your eng background is a differentiator if framed correctly.</p>
                  <p className="mkt-chat__item"><span className="mkt-chat__n">2.</span> Birmingham has a thin PM market. Remote-first or London-hybrid is your real target pool.</p>
                  <p className="mkt-chat__item"><span className="mkt-chat__n">3.</span> Salary reality: £55–70k is achievable for a first PM role at your level.</p>
                  <p className="mkt-chat__cta-line">Want me to build you a 90-day transition plan?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. TRUST BAR ──────────────────────────────────────────── */}
        <div className="mkt-trust-bar">
          {TRUST_STATS.map((s, i) => (
            <div key={i} className="mkt-trust-bar__item">
              <span className="mkt-trust-bar__fig">{s.figure}</span>
              <span className="mkt-trust-bar__label">{s.label}</span>
            </div>
          ))}
          <div className="mkt-trust-bar__item">
            <span className="mkt-trust-bar__tag">UK-focused</span>
            <span className="mkt-trust-bar__label">salary &amp; role data</span>
          </div>
          <div className="mkt-trust-bar__item">
            <span className="mkt-trust-bar__tag">Structured</span>
            <span className="mkt-trust-bar__label">transition logic</span>
          </div>
        </div>

        {/* ── 3. PROBLEM ────────────────────────────────────────────── */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label">The problem</div>
            <h2 className="mkt-section__h2">
              Most career decisions<br />are made in the dark.
            </h2>
            <div className="mkt-pain-grid">
              {PAIN_POINTS.map((p, i) => (
                <div key={i} className="mkt-pain-card">
                  <h4 className="mkt-pain-card__head">{p.head}</h4>
                  <p className="mkt-pain-card__body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. SOLUTION ───────────────────────────────────────────── */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner">
            <div className="mkt-section__label">The solution</div>
            <h2 className="mkt-section__h2">
              One platform.<br />
              Full career clarity.
            </h2>
            <p className="mkt-section__sub">
              HireEdge replaces guesswork with structured intelligence at every stage of your career decision.
            </p>
            <div className="mkt-solution-grid">
              <div className="mkt-solution-row">
                <div className="mkt-solution-row__icon">→</div>
                <div>
                  <div className="mkt-solution-row__title">Understand where you actually stand</div>
                  <p className="mkt-solution-row__body">See how your skills, salary, and experience map against real UK role requirements — not what's listed on LinkedIn.</p>
                </div>
              </div>
              <div className="mkt-solution-row">
                <div className="mkt-solution-row__icon">→</div>
                <div>
                  <div className="mkt-solution-row__title">See exactly what's missing</div>
                  <p className="mkt-solution-row__body">Gap analysis built from actual job postings, not guesswork. Know which skills matter and which don't for your specific target.</p>
                </div>
              </div>
              <div className="mkt-solution-row">
                <div className="mkt-solution-row__icon">→</div>
                <div>
                  <div className="mkt-solution-row__title">Build a path, not a vague plan</div>
                  <p className="mkt-solution-row__body">Structured transition logic — timeline, milestones, risks, and what to do first. Specific to your role, not a generic framework.</p>
                </div>
              </div>
              <div className="mkt-solution-row">
                <div className="mkt-solution-row__icon">→</div>
                <div>
                  <div className="mkt-solution-row__title">Execute with the right tools</div>
                  <p className="mkt-solution-row__body">CV rewrite, LinkedIn rebuild, interview prep, and visa strategy — all tied to your specific target role, not a template.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. HOW IT WORKS ───────────────────────────────────────── */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label">How it works</div>
            <h2 className="mkt-section__h2">Three steps to clarity.</h2>
            <div className="mkt-steps">
              {HOW_STEPS.map((s, i) => (
                <div key={i} className="mkt-step">
                  <div className="mkt-step__num">{s.num}</div>
                  <div className="mkt-step__content">
                    <h3 className="mkt-step__title">{s.title}</h3>
                    <p className="mkt-step__body">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. EDGEX SECTION ─────────────────────────────────────── */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner mkt-edgex-section">
            <div className="mkt-edgex-section__text">
              <div className="mkt-section__label">EDGEX</div>
              <h2 className="mkt-section__h2">
                Career intelligence<br />you can talk to.
              </h2>
              <p className="mkt-edgex-section__body">
                EDGEX isn't a chatbot. It's a career reasoning engine trained on UK job market structure. Ask it where you stand. Ask it what your gap is. Ask it what salary to negotiate. Ask it what your visa options are.
              </p>
              <p className="mkt-edgex-section__body">
                It responds with frameworks, numbers, and specific next steps — not encouragement.
              </p>
              <Link href="/copilot" className="mkt-btn mkt-btn--primary">
                Open EDGEX →
              </Link>
            </div>
            <div className="mkt-edgex-section__prompts">
              <div className="mkt-prompt-label">Things people ask EDGEX</div>
              {[
                "What salary should I negotiate for a Senior PM role in London?",
                "I'm a data analyst. What's the fastest path to data engineering?",
                "My company wants to sponsor me for a Skilled Worker visa. What do I need?",
                "How do I position 3 years of freelance work for a permanent role application?",
                "What skills am I missing for a Director of Product role at a Series C?",
              ].map((q, i) => (
                <div key={i} className="mkt-prompt">
                  <span className="mkt-prompt__q">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. PLATFORM ──────────────────────────────────────────── */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label">Platform</div>
            <h2 className="mkt-section__h2">Everything you need to move<br />your career forward.</h2>
            <p className="mkt-section__sub">
              Every part of HireEdge is useful on its own. Together, they form a complete career intelligence system.
            </p>
            <div className="mkt-platform-grid">
              {PLATFORM_LAYERS.map((l) => (
                <div key={l.id} className="mkt-platform-card">
                  <span className="mkt-platform-card__tag" style={{ color: l.color }}>
                    {l.tag}
                  </span>
                  <h3 className="mkt-platform-card__name">{l.name}</h3>
                  <p className="mkt-platform-card__body">{l.body}</p>
                  <Link href={l.href} className="mkt-platform-card__link">
                    {l.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. PRICING ────────────────────────────────────────────── */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner">
            <div className="mkt-section__label">Pricing</div>
            <h2 className="mkt-section__h2">Start free. No lock-in.</h2>
            <div className="mkt-pricing-row">

              <div className="mkt-pricing-card">
                <div className="mkt-pricing-card__name">Free</div>
                <div className="mkt-pricing-card__price">£0</div>
                <div className="mkt-pricing-card__note">forever</div>
                <ul className="mkt-pricing-card__features">
                  <li>EDGEX AI (10 messages/day)</li>
                  <li>Career Intelligence</li>
                  <li>Gap Explainer</li>
                </ul>
                <Link href="/copilot" className="mkt-btn mkt-btn--ghost mkt-btn--sm">
                  Start free
                </Link>
              </div>

              <div className="mkt-pricing-card mkt-pricing-card--featured">
                <div className="mkt-pricing-card__badge">Most popular</div>
                <div className="mkt-pricing-card__name">Career Pack</div>
                <div className="mkt-pricing-card__price">£6.99</div>
                <div className="mkt-pricing-card__note">one-time · no subscription</div>
                <ul className="mkt-pricing-card__features">
                  <li>Full transition report</li>
                  <li>Career Roadmap tool</li>
                  <li>CV + LinkedIn + interview plan</li>
                </ul>
                <p className="mkt-pricing-card__forever">Pay once — yours forever.</p>
                <Link href="/billing?plan=career_pack" className="mkt-btn mkt-btn--teal mkt-btn--sm">
                  Get Career Pack
                </Link>
              </div>

              <div className="mkt-pricing-card">
                <div className="mkt-pricing-card__name">Pro</div>
                <div className="mkt-pricing-card__price">£14.99</div>
                <div className="mkt-pricing-card__note">/month · cancel anytime</div>
                <ul className="mkt-pricing-card__features">
                  <li>All 6 career tools</li>
                  <li>100 EDGEX messages/day</li>
                  <li>Talent Profile</li>
                  <li>Visa Intelligence</li>
                </ul>
                <Link href="/billing?plan=pro" className="mkt-btn mkt-btn--ghost mkt-btn--sm">
                  Start Pro
                </Link>
              </div>

            </div>
            <p className="mkt-pricing__footnote">
              <Link href="/billing">See full plan details →</Link>
            </p>
          </div>
        </section>

        {/* ── 9. FINAL CTA ─────────────────────────────────────────── */}
        <section className="mkt-cta-final">
          <div className="mkt-cta-final__inner">
            <h2 className="mkt-cta-final__h2">
              Your next role won't find itself.
            </h2>
            <p className="mkt-cta-final__sub">
              Ask EDGEX your first question — free, no setup. Most people get their gap analysis in under 2 minutes.
            </p>
            <div className="mkt-cta-final__actions">
              <Link href="/copilot" className="mkt-btn mkt-btn--primary mkt-btn--xl">
                Start with EDGEX — it's free
              </Link>
              <Link href="/billing" className="mkt-btn mkt-btn--ghost mkt-btn--xl">
                View pricing
              </Link>
            </div>
            <p className="mkt-cta-final__note">
              Free to start. No credit card. Career Pack from £6.99.
            </p>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="mkt-footer">
          <div className="mkt-footer__inner">
            <Logo size={20} />
            <div className="mkt-footer__links">
              <Link href="/intelligence" className="mkt-footer__link">Intelligence</Link>
              <Link href="/tools"        className="mkt-footer__link">Tools</Link>
              <Link href="/career-pack"  className="mkt-footer__link">Career Pack</Link>
              <Link href="/billing"      className="mkt-footer__link">Pricing</Link>
              <Link href="/copilot"      className="mkt-footer__link">EDGEX</Link>
            </div>
            <p className="mkt-footer__copy">
              © {new Date().getFullYear()} HireEdge. UK career intelligence platform.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
