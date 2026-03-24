// ============================================================================
// pages/index.js  —  HireEdge Marketing Landing Page v3
//
// UPGRADES vs v2:
//   - useScrollReveal: IntersectionObserver fade/slide on every section
//   - useNavScroll: sticky nav gains backdrop blur + border on scroll
//   - Card hover: translateY lift + glow (CSS transitions)
//   - Button hover: scale + shadow pulse
//   - Flow diagram: SVG arrows, animated on scroll
//   - Pricing: Elite plan added (£29.99/month), Pro dominant
//   - Section transitions: gradient bridges between alt/plain sections
//   - No external dependencies
//
// AppShell.js must include "/" in NO_SHELL_ROUTES.
// CSS in styles/marketing.css — import in pages/_app.js
// ============================================================================

import { useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

// ── Scroll reveal ─────────────────────────────────────────────────────────
// Content is visible by default. JS adds mkt-js-ready to body which
// activates opacity:0 on .mkt-reveal elements, then fades them in.
// This ensures content is always visible — motion is progressive enhancement.

function useScrollReveal() {
  useEffect(() => {
    // Mark body as JS-ready — activates CSS transitions
    document.body.classList.add("mkt-js-ready");

    const els = document.querySelectorAll(".mkt-reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("mkt-reveal--in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );

    // Small delay so browser paints visible state before hiding elements
    const timer = setTimeout(() => {
      els.forEach((el) => io.observe(el));
    }, 50);

    return () => {
      clearTimeout(timer);
      io.disconnect();
      document.body.classList.remove("mkt-js-ready");
    };
  }, []);
}

// ── Nav scroll effect ─────────────────────────────────────────────────────

function useNavScroll() {
  useEffect(() => {
    const nav = document.getElementById("mkt-nav-root");
    if (!nav) return;
    const fn = () =>
      window.scrollY > 20
        ? nav.classList.add("mkt-nav--scrolled")
        : nav.classList.remove("mkt-nav--scrolled");
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
}

// ── Logo ──────────────────────────────────────────────────────────────────

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
    <nav id="mkt-nav-root" className="mkt-nav">
      <div className="mkt-nav__inner">
        <Link href="/" className="mkt-nav__logo"><Logo size={24} /></Link>
        <div className="mkt-nav__links">
          <Link href="/intelligence" className="mkt-nav__link">Intelligence</Link>
          <Link href="/tools"        className="mkt-nav__link">Tools</Link>
          <Link href="/billing"      className="mkt-nav__link">Pricing</Link>
        </div>
        <div className="mkt-nav__actions">
          <Link href="/copilot" className="mkt-nav__cta">Start free</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    head: "You're deciding without data.",
    body: "Most people base their next move on what a friend did or what feels safe — not what's true for their role and market.",
  },
  {
    head: "Generic advice doesn't know your situation.",
    body: "Frameworks built for everyone work for no one. US benchmarks, recycled playbooks — none of it knows your role, your seniority, or your gap.",
  },
  {
    head: "Recruiters know things you don't.",
    body: "They know which skills are actually required versus listed. They know what salary bands are real. You're negotiating blind.",
  },
  {
    head: "Your career picture is fragmented.",
    body: "CV in one place. Salary research in another. Advice elsewhere. No single view of where you stand or what to do first.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Tell EDGEX where you are",
    body: "Share your current role, your target, and what you're uncertain about. EDGEX asks the right follow-ups.",
  },
  {
    num: "02",
    title: "Get a structured gap analysis",
    body: "EDGEX maps your position against real UK role data — skills, salary, transition logic, and what's blocking your next move.",
  },
  {
    num: "03",
    title: "Execute with the right tools",
    body: "Rewrite your CV, rebuild your LinkedIn, prep for interviews — all tied to your specific target role.",
  },
];

const PLATFORM_LAYERS = [
  {
    id:    "edgex",
    tag:   "Intelligence engine",
    name:  "EDGEX",
    color: "#4f46e5",
    href:  "/copilot",
    cta:   "Open EDGEX",
    body:  "Ask anything — salary ranges, transition paths, skill gaps, visa options, negotiation strategy. Specific answers, built on UK job market data.",
  },
  {
    id:    "intelligence",
    tag:   "Data layer",
    name:  "Career Intelligence",
    color: "#0F6E56",
    href:  "/intelligence",
    cta:   "Explore data",
    body:  "1,200+ UK roles with live salary ranges, required skills, and transition logic — fully searchable without a subscription.",
  },
  {
    id:    "tools",
    tag:   "Execution layer",
    name:  "Career Tools",
    color: "#0F6E56",
    href:  "/tools",
    cta:   "See all tools",
    body:  "Six AI-powered tools that produce real deliverables — rewritten CVs, rebuilt profiles, interview prep, visa strategy. Not dashboards.",
  },
];

const TRUST_STATS = [
  { figure: "1,200+",  label: "UK roles mapped" },
  { figure: "Salary",  label: "benchmarks by role & seniority" },
  { figure: "Structured", label: "transition logic, not generic advice" },
  { figure: "Built",   label: "specifically for the UK job market" },
];

const FLOW_NODES = [
  { label: "You",          sub: "Your position",        cls: "you" },
  { label: "EDGEX",        sub: "AI reasoning",         cls: "platform" },
  { label: "Intelligence", sub: "UK role intelligence", cls: "platform" },
  { label: "Tools",        sub: "Action outputs",       cls: "platform" },
  { label: "Outcome",      sub: "Your next move",       cls: "outcome" },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function MarketingHome() {
  useScrollReveal();
  useNavScroll();

  return (
    <>
      <Head>
        <title>HireEdge — AI Career Intelligence for the UK Job Market</title>
        <meta name="description" content="Know your salary, your gaps, and your best next move — before you apply. EDGEX gives structured career intelligence built on real UK role data." />
      </Head>

      <div className="mkt">
        <Nav />

        {/* ─────────────────────────────────────────────── HERO */}
        <section className="mkt-hero">
          <div className="mkt-hero__inner mkt-reveal">
            <div className="mkt-hero__eyebrow">
              <span className="mkt-dot" />
              Career intelligence · Built for the UK job market
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
              Know exactly where you stand. Know what's missing. Know what to do next.
            </p>
            <div className="mkt-hero__actions">
              <Link href="/copilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Start with EDGEX — free</Link>
              <Link href="/billing" className="mkt-btn mkt-btn--ghost mkt-btn--lg">View plans</Link>
            </div>
            <p className="mkt-hero__disclaimer">No credit card. No setup. Start in seconds.</p>

            {/* Intelligence strip */}
            <div className="mkt-intel-strip">
              <div className="mkt-intel-strip__label">
                <span className="mkt-intel-strip__dot" />
                Live output example
              </div>
              <div className="mkt-intel-strip__chips">
                <div className="mkt-intel-chip mkt-intel-chip--role">
                  <span className="mkt-intel-chip__key">Target Role</span>
                  <span className="mkt-intel-chip__val">Account Manager</span>
                </div>
                <div className="mkt-intel-chip mkt-intel-chip--salary">
                  <span className="mkt-intel-chip__key">Salary Range</span>
                  <span className="mkt-intel-chip__val">£32K – £48K</span>
                </div>
                <div className="mkt-intel-chip mkt-intel-chip--gap">
                  <span className="mkt-intel-chip__key">Missing Skills</span>
                  <span className="mkt-intel-chip__val">CRM · Stakeholder Mgmt</span>
                </div>
                <div className="mkt-intel-chip mkt-intel-chip--action">
                  <span className="mkt-intel-chip__key">Next Step</span>
                  <span className="mkt-intel-chip__val">Apply within 14 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard demo card */}
          <div className="mkt-hero__demo mkt-reveal mkt-reveal--right">
            <div className="mkt-chat">
              <div className="mkt-chat__bar">
                <span className="mkt-chat__dot" /><span className="mkt-chat__dot" /><span className="mkt-chat__dot" />
                <span className="mkt-chat__label">EDGEX</span>
              </div>
              <div className="mkt-chat__msg mkt-chat__msg--user">
                <p>I'm a mid-level software engineer in Birmingham. I want to move into product at a Series B. How realistic is that, and what's my biggest gap?</p>
              </div>
              <div className="mkt-chat__output">
                <div className="mkt-out-card mkt-out-card--fit">
                  <div className="mkt-out-card__label">Role fit</div>
                  <div className="mkt-out-card__score-row">
                    <span className="mkt-out-card__score-val">74%</span>
                    <div className="mkt-out-card__bar-track">
                      <div className="mkt-out-card__bar-fill" style={{ width: "74%" }} />
                    </div>
                  </div>
                  <div className="mkt-out-card__note">Achievable — gap is closeable in 60–90 days</div>
                </div>
                <div className="mkt-out-card mkt-out-card--salary">
                  <div className="mkt-out-card__label">Salary · Series B PM · London</div>
                  <div className="mkt-out-card__salary">£55K – £70K</div>
                  <div className="mkt-out-card__note">Based on 38 live UK postings</div>
                </div>
                <div className="mkt-out-card mkt-out-card--gaps">
                  <div className="mkt-out-card__label">Skills gap</div>
                  <div className="mkt-out-card__tags">
                    <span className="mkt-gap-tag mkt-gap-tag--miss">Product sense</span>
                    <span className="mkt-gap-tag mkt-gap-tag--miss">Roadmap ownership</span>
                    <span className="mkt-gap-tag mkt-gap-tag--have">Systems thinking ✓</span>
                    <span className="mkt-gap-tag mkt-gap-tag--have">Execution speed ✓</span>
                  </div>
                </div>
                <div className="mkt-out-card mkt-out-card--action">
                  <div className="mkt-out-card__label">Next step</div>
                  <div className="mkt-out-card__action-text">Build your 90-day PM transition plan →</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────── TRUST BAR */}
        <div className="mkt-trust-bar">
          {TRUST_STATS.map((s, i) => (
            <div key={i} className="mkt-trust-bar__item">
              <span className="mkt-trust-bar__fig">{s.figure}</span>
              <span className="mkt-trust-bar__label">{s.label}</span>
            </div>
          ))}
          <div className="mkt-trust-bar__item">
            <span className="mkt-trust-bar__tag">UK-only</span>
            <span className="mkt-trust-bar__label">salary &amp; role data</span>
          </div>
          <div className="mkt-trust-bar__item">
            <span className="mkt-trust-bar__tag">No guesswork</span>
            <span className="mkt-trust-bar__label">structured transition logic</span>
          </div>
        </div>

        {/* ──────────────────────────────────────────── PROBLEM */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label mkt-reveal">The problem</div>
            <h2 className="mkt-section__h2 mkt-reveal mkt-reveal--delay-1">
              Most career decisions<br />are made without real data.
            </h2>
            <div className="mkt-pain-grid">
              {PAIN_POINTS.map((p, i) => (
                <div key={i} className={`mkt-pain-card mkt-reveal mkt-reveal--delay-${i % 3}`}>
                  <h4 className="mkt-pain-card__head">{p.head}</h4>
                  <p className="mkt-pain-card__body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mkt-bridge mkt-bridge--down" />

        {/* ─────────────────────────────────────────── SOLUTION */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner">
            <div className="mkt-section__label mkt-reveal">The solution</div>
            <h2 className="mkt-section__h2 mkt-reveal mkt-reveal--delay-1">One platform.<br />Full career clarity.</h2>
            <p className="mkt-section__sub mkt-reveal mkt-reveal--delay-2">Structured intelligence at every stage of your career decision — not advice, not encouragement. Data and logic.</p>
            <div className="mkt-solution-grid">
              {[
                { title: "Understand where you actually stand", body: "See how your skills, salary, and experience map against real UK role requirements — not what's listed on LinkedIn." },
                { title: "See exactly what's missing", body: "Gap analysis built from actual job postings, not guesswork. Know which skills matter for your specific target." },
                { title: "Build a path, not a vague plan", body: "Structured transition logic — timeline, milestones, risks, and what to do first. Specific to your role." },
                { title: "Execute with the right tools", body: "CV rewrite, LinkedIn rebuild, interview prep, and visa strategy — all tied to your specific target role." },
              ].map((row, i) => (
                <div key={i} className={`mkt-solution-row mkt-reveal mkt-reveal--delay-${i % 2}`}>
                  <div className="mkt-solution-row__icon">→</div>
                  <div>
                    <div className="mkt-solution-row__title">{row.title}</div>
                    <p className="mkt-solution-row__body">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mkt-bridge mkt-bridge--up" />

        {/* ──────────────────────────────────── HOW IT WORKS */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label mkt-reveal">How it works</div>
            <h2 className="mkt-section__h2 mkt-reveal mkt-reveal--delay-1">From question to clarity<br />in three steps.</h2>
            <div className="mkt-steps">
              {HOW_STEPS.map((s, i) => (
                <div key={i} className={`mkt-step mkt-reveal mkt-reveal--delay-${i}`} data-num={s.num}>
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

        <div className="mkt-bridge mkt-bridge--down" />

        {/* ─────────────────────────────────────────────── EDGEX */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner mkt-edgex-section">
            <div className="mkt-edgex-section__text mkt-reveal">
              <div className="mkt-section__label">EDGEX</div>
              <h2 className="mkt-section__h2">Career intelligence<br />you can talk to.</h2>
              <p className="mkt-edgex-section__body">EDGEX isn't a chatbot. It's a career reasoning engine built on UK job market structure — salary negotiation, transition paths, skill gaps, visa options. Specific answers, not encouragement.</p>
              <Link href="/copilot" className="mkt-btn mkt-btn--primary">Open EDGEX →</Link>
            </div>
            <div className="mkt-edgex-section__prompts mkt-reveal mkt-reveal--right">
              <div className="mkt-prompt-label">What people ask EDGEX</div>
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

        <div className="mkt-bridge mkt-bridge--up" />

        {/* ─────────────────────────────────────────── PLATFORM */}
        <section className="mkt-section">
          <div className="mkt-section__inner">
            <div className="mkt-section__label mkt-reveal">Platform</div>
            <h2 className="mkt-section__h2 mkt-reveal mkt-reveal--delay-1">Everything you need to move<br />your career forward.</h2>
            <p className="mkt-section__sub mkt-reveal mkt-reveal--delay-2">Each part of HireEdge works on its own. Together, they form a complete career intelligence system — from first question to executed move.</p>

            {/* ── Signature flow diagram ── */}
            <div className="mkt-flow-panel mkt-reveal mkt-reveal--delay-1">
              <div className="mkt-flow-panel__track">
                {FLOW_NODES.map((node, i) => (
                  <div key={i} className="mkt-flow-panel__step">
                    <div className={`mkt-flow-panel__node mkt-flow-panel__node--${node.cls}`}>
                      <span className="mkt-flow-panel__node-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="mkt-flow-panel__node-label">{node.label}</span>
                      <span className="mkt-flow-panel__node-sub">{node.sub}</span>
                    </div>
                    {i < FLOW_NODES.length - 1 && (
                      <div className="mkt-flow-panel__connector" aria-hidden="true">
                        <svg width="32" height="2" viewBox="0 0 32 2" fill="none">
                          <line x1="0" y1="1" x2="32" y2="1" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" />
                          <defs>
                            <linearGradient id="conn-grad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                              <stop offset="0%" stopColor="rgba(79,70,229,0.5)" />
                              <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mkt-platform-grid">
              {PLATFORM_LAYERS.map((l, i) => (
                <div key={l.id} className={`mkt-platform-card mkt-reveal mkt-reveal--delay-${i}`}>
                  <span className="mkt-platform-card__tag" style={{ color: l.color }}>{l.tag}</span>
                  <h3 className="mkt-platform-card__name">{l.name}</h3>
                  <p className="mkt-platform-card__body">{l.body}</p>
                  <Link href={l.href} className="mkt-platform-card__link">{l.cta} →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mkt-bridge mkt-bridge--down" />

        {/* ─────────────────────────────────────────────── PRICING */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-section__inner">
            <div className="mkt-section__label mkt-reveal">Pricing</div>
            <h2 className="mkt-section__h2 mkt-reveal mkt-reveal--delay-1">Start free. No lock-in.</h2>
            <div className="mkt-pricing-row">

              <div className="mkt-pricing-card mkt-reveal">
                <div className="mkt-pricing-card__name">Free</div>
                <div className="mkt-pricing-card__price">£0</div>
                <div className="mkt-pricing-card__note">always free</div>
                <ul className="mkt-pricing-card__features">
                  <li>EDGEX AI (10 messages/day)</li>
                  <li>Career Intelligence</li>
                  <li>Gap Explainer</li>
                </ul>
                <Link href="/copilot" className="mkt-btn mkt-btn--ghost mkt-btn--sm">Start free</Link>
              </div>

              <div className="mkt-pricing-card mkt-pricing-card--featured mkt-reveal mkt-reveal--delay-1">
                <div className="mkt-pricing-card__badge">Best for starters</div>
                <div className="mkt-pricing-card__name">Career Pack</div>
                <div className="mkt-pricing-card__price">£6.99</div>
                <div className="mkt-pricing-card__note">one-time · no subscription</div>
                <ul className="mkt-pricing-card__features">
                  <li>Full transition report</li>
                  <li>Career Roadmap tool</li>
                  <li>CV + LinkedIn + interview plan</li>
                </ul>
                <p className="mkt-pricing-card__forever">Pay once — yours forever.</p>
                <Link href="/billing?plan=career_pack" className="mkt-btn mkt-btn--teal mkt-btn--sm">Get Career Pack</Link>
              </div>

              <div className="mkt-pricing-card mkt-pricing-card--pro mkt-reveal mkt-reveal--delay-2">
                <div className="mkt-pricing-card__badge mkt-pricing-card__badge--indigo">Most popular</div>
                <div className="mkt-pricing-card__name">Pro</div>
                <div className="mkt-pricing-card__price">£14.99</div>
                <div className="mkt-pricing-card__note">/month · cancel anytime</div>
                <ul className="mkt-pricing-card__features">
                  <li>All 6 career tools</li>
                  <li>100 EDGEX messages/day</li>
                  <li>Talent Profile</li>
                  <li>Visa Intelligence</li>
                </ul>
                <p className="mkt-pricing-card__nudge">Most users start here.</p>
                <Link href="/billing?plan=pro" className="mkt-btn mkt-btn--primary mkt-btn--sm">Start Pro</Link>
              </div>

              <div className="mkt-pricing-card mkt-pricing-card--elite mkt-reveal mkt-reveal--delay-3">
                <div className="mkt-pricing-card__name">Elite</div>
                <div className="mkt-pricing-card__price">£29.99</div>
                <div className="mkt-pricing-card__note">/month · cancel anytime</div>
                <ul className="mkt-pricing-card__features">
                  <li>Everything in Pro</li>
                  <li>Unlimited EDGEX messages</li>
                  <li>Unlimited tool uses</li>
                  <li>Priority support</li>
                  <li>Early access to new features</li>
                </ul>
                <Link href="/billing?plan=elite" className="mkt-btn mkt-btn--ghost mkt-btn--sm">Go Elite</Link>
              </div>

            </div>
            <p className="mkt-pricing__footnote">
              <Link href="/billing">See full plan details →</Link>
            </p>
          </div>
        </section>

        <div className="mkt-bridge mkt-bridge--up" />

        {/* ──────────────────────────────────────────── FINAL CTA */}
        <section className="mkt-cta-final">
          <div className="mkt-cta-final__inner mkt-reveal">
            <h2 className="mkt-cta-final__h2">
              Your next career move<br />should not be a guess.
            </h2>
            <p className="mkt-cta-final__sub">
              Know your position. Close your gaps. Move with clarity.
            </p>
            <div className="mkt-cta-final__actions">
              <Link href="/copilot" className="mkt-btn mkt-btn--primary mkt-btn--xl">Start with EDGEX — it's free</Link>
              <Link href="/billing" className="mkt-btn mkt-btn--ghost mkt-btn--xl">View pricing</Link>
            </div>
            <p className="mkt-cta-final__note">Free to start. No credit card. Career Pack from £6.99.</p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────── FOOTER */}
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
