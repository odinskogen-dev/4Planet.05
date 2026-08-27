import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { resolveEmblaIntake } from "../../choice/embla";

type BeeStep = {
  label: string;
  detail: string;
};

const beeSteps: BeeStep[] = [
  { label: "SCOUT", detail: "Find credible options and sources." },
  { label: "EVIDENCE", detail: "Separate facts, claims and unknowns." },
  { label: "COMPARE", detail: "Test each option against what matters to you." },
  { label: "QUORUM", detail: "Recommend only when the evidence is strong enough." },
  { label: "LEARN", detail: "Use outcomes to improve the next decision." },
];

const capabilityCards = [
  {
    kicker: "LIVE PROOF",
    title: "FOOD",
    body: "Scan a product. Understand what it is. Find a better-fit option and see why.",
    href: "/4sapien/food",
    cta: "Make a food choice",
  },
  {
    kicker: "NEXT",
    title: "HOME",
    body: "Compare homes, energy, running cost, materials, place and long-term trade-offs.",
  },
  {
    kicker: "NEXT",
    title: "CAR",
    body: "Compare total ownership cost, usefulness, energy, reliability and impact — for your life.",
  },
  {
    kicker: "FIRST BUILD",
    title: "4FINANCE",
    body: "See your money clearly, price decisions over time and understand investment cases without black-box advice.",
    href: "/4sapien/finance",
    cta: "Open 4FINANCE",
  },
];

const financeModules = [
  {
    title: "MONEY MAP",
    text: "One honest picture of income, fixed costs, debt, assets, goals and recurring commitments. Manual-first; connected accounts later.",
  },
  {
    title: "CHOICE COST",
    text: "Turn everyday decisions into 1, 5 and 10-year consequences: cash, total cost, risk and opportunity cost.",
  },
  {
    title: "INVESTMENT INTELLIGENCE",
    text: "Fundamentals, valuation ranges, scenarios, company evidence and uncertainty. Analysis and comparison — not BUY / SELL instructions.",
  },
];

function Hex({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 16,
        height: 18,
        display: "inline-block",
        background: active ? "#2E2EFF" : "transparent",
        border: `1px solid ${active ? "#2E2EFF" : "rgba(255,255,255,.28)"}`,
        clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
      }}
    />
  );
}

function Mark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(3, 9px)", gap: 2 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={index}
            style={{
              width: 9,
              height: 10,
              background: index === 2 ? "#2E2EFF" : "transparent",
              border: "1px solid rgba(255,255,255,.45)",
              clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
            }}
          />
        ))}
      </div>
      <strong style={{ fontSize: 14, letterSpacing: ".08em" }}>4SAPIEN</strong>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#070707",
  color: "#fff",
  fontFamily: '"DM Sans", system-ui, sans-serif',
};

const shell: React.CSSProperties = {
  width: "min(1180px, calc(100% - 40px))",
  margin: "0 auto",
};

const mono: React.CSSProperties = {
  fontFamily: '"Fragment Mono", ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: ".09em",
};

export function FourSapienHome() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  const examples = useMemo(
    () => [
      "Which of these groceries is the better choice for me?",
      "What car makes the most sense over five years?",
      "Can I afford this home without making my life tighter?",
      "Help me understand this investment case.",
    ],
    [],
  );
  const embla = useMemo(
    () => (submittedPrompt === null ? null : resolveEmblaIntake(submittedPrompt)),
    [submittedPrompt],
  );
  const runEmbla = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedPrompt(prompt);
  };

  return (
    <main style={page}>
      <header style={{ ...shell, height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.13)" }}>
        <Mark />
        <span style={{ ...mono, color: "rgba(255,255,255,.58)" }}>BY 4PLANET</span>
      </header>

      <section style={{ ...shell, padding: "clamp(72px, 10vw, 138px) 0 72px" }}>
        <p style={{ ...mono, color: "rgba(255,255,255,.56)", marginBottom: 24 }}>PERSONAL CHOICE INTELLIGENCE / PROTOTYPE 01</p>
        <h1 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(58px, 10vw, 132px)", fontWeight: 500, letterSpacing: "-.065em", lineHeight: ".86", maxWidth: 980, margin: 0 }}>
          Better choices.<br />For your life.
        </h1>
        <p style={{ maxWidth: 650, fontSize: "clamp(19px, 2.2vw, 28px)", lineHeight: 1.35, color: "rgba(255,255,255,.72)", margin: "38px 0 0" }}>
          Meet Embla. She helps you understand your options, what the evidence actually says, what remains unknown — and what fits you.
        </p>
      </section>

      <section style={{ ...shell, padding: "0 0 92px" }}>
        <form onSubmit={runEmbla} style={{ border: "1px solid rgba(255,255,255,.18)", padding: "clamp(22px, 4vw, 42px)", background: "#0d0d0d" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22 }}>
            <Hex active />
            <span style={mono}>ASK EMBLA</span>
          </div>
          <textarea
            aria-label="Ask Embla"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="What are you trying to decide?"
            style={{ width: "100%", boxSizing: "border-box", minHeight: 120, resize: "vertical", background: "transparent", border: 0, outline: 0, color: "#fff", font: '500 clamp(24px, 4vw, 46px)/1.15 "Instrument Sans", system-ui, sans-serif' }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: "1px solid rgba(255,255,255,.13)", paddingTop: 18 }}>
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => { setPrompt(example); setSubmittedPrompt(null); }} style={{ border: "1px solid rgba(255,255,255,.16)", background: "transparent", color: "rgba(255,255,255,.72)", padding: "10px 12px", font: "inherit", cursor: "pointer" }}>
                {example}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginTop: 22 }}>
            <p style={{ ...mono, color: "rgba(255,255,255,.42)", margin: 0, maxWidth: 650 }}>FIRST BOUNDED EMBLA SEAM — ROUTES ONLY TO PROOF THAT EXISTS. NO EVIDENCE MEANS NO RECOMMENDATION.</p>
            <button type="submit" style={{ border: "1px solid #fff", background: "#fff", color: "#080808", padding: "12px 18px", font: '600 12px/1 "Fragment Mono", ui-monospace, monospace', letterSpacing: ".08em", cursor: "pointer" }}>RUN EMBLA</button>
          </div>

          {embla ? (
            <section aria-live="polite" style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ ...mono, color: "#2E2EFF" }}>{embla.eyebrow}</span>
                <span style={{ ...mono, color: embla.status === "EVIDENCE_PATH_READY" ? "#3AE86F" : "rgba(255,255,255,.45)" }}>{embla.status.replaceAll("_", " ")}</span>
              </div>
              <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(30px, 4vw, 54px)", fontWeight: 500, letterSpacing: "-.04em", lineHeight: 1.02, margin: "18px 0" }}>{embla.title}</h2>
              <p style={{ maxWidth: 760, color: "rgba(255,255,255,.7)", fontSize: 18, lineHeight: 1.55, margin: "0 0 16px" }}>{embla.detail}</p>
              <p style={{ maxWidth: 760, color: "rgba(255,255,255,.48)", lineHeight: 1.5, margin: 0 }}>{embla.truthBoundary}</p>
              {embla.nextHref && embla.nextLabel ? (
                <Link to={embla.nextHref} style={{ display: "inline-block", marginTop: 24, color: "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,.55)", paddingBottom: 4 }}>{embla.nextLabel} →</Link>
              ) : null}
            </section>
          ) : null}
        </form>
      </section>

      <section style={{ borderTop: "1px solid rgba(255,255,255,.13)", borderBottom: "1px solid rgba(255,255,255,.13)" }}>
        <div style={{ ...shell, padding: "72px 0" }}>
          <p style={{ ...mono, color: "#2E2EFF", marginBottom: 18 }}>BEE / BIOMIMETIC DECISION INTELLIGENCE</p>
          <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(38px, 6vw, 76px)", fontWeight: 500, letterSpacing: "-.045em", lineHeight: .98, maxWidth: 820, margin: "0 0 50px" }}>
            Don’t guess. Scout, compare, build evidence, then decide.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 1, background: "rgba(255,255,255,.12)" }}>
            {beeSteps.map((step, index) => (
              <article key={step.label} style={{ background: "#070707", padding: "26px 22px", minHeight: 150 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 23 }}><Hex active={index < 4} /><span style={mono}>{String(index + 1).padStart(2, "0")}</span></div>
                <strong style={{ display: "block", fontSize: 16, marginBottom: 10 }}>{step.label}</strong>
                <span style={{ color: "rgba(255,255,255,.58)", lineHeight: 1.45 }}>{step.detail}</span>
              </article>
            ))}
          </div>
          <p style={{ maxWidth: 760, margin: "30px 0 0", color: "rgba(255,255,255,.62)", lineHeight: 1.55 }}>
            No quorum means no confident recommendation. Missing evidence stays UNKNOWN. Contradictory evidence stays visible. A better answer never outranks the proof behind it.
          </p>
        </div>
      </section>

      <section style={{ ...shell, padding: "88px 0" }}>
        <p style={{ ...mono, color: "rgba(255,255,255,.5)", marginBottom: 18 }}>ONE SAPIEN / MANY CHOICES</p>
        <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(40px, 6vw, 78px)", fontWeight: 500, letterSpacing: "-.05em", margin: "0 0 46px" }}>Start where life gets expensive.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
          {capabilityCards.map((card) => (
            <article key={card.title} style={{ border: "1px solid rgba(255,255,255,.15)", minHeight: 255, padding: 26, display: "flex", flexDirection: "column" }}>
              <span style={{ ...mono, color: card.kicker === "LIVE PROOF" ? "#3AE86F" : "rgba(255,255,255,.44)" }}>{card.kicker}</span>
              <h3 style={{ fontSize: 31, fontWeight: 500, letterSpacing: "-.04em", margin: "45px 0 12px" }}>{card.title}</h3>
              <p style={{ color: "rgba(255,255,255,.6)", lineHeight: 1.5, margin: 0 }}>{card.body}</p>
              {card.href ? <Link to={card.href} style={{ marginTop: "auto", paddingTop: 28, color: "#fff", textDecoration: "none" }}>{card.cta} →</Link> : <span style={{ ...mono, color: "rgba(255,255,255,.32)", marginTop: "auto", paddingTop: 28 }}>IN BUILD</span>}
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: "#fff", color: "#080808" }}>
        <div style={{ ...shell, padding: "88px 0" }}>
          <p style={{ ...mono, color: "rgba(0,0,0,.48)" }}>TRUTH BY DESIGN</p>
          <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 500, letterSpacing: "-.055em", lineHeight: .96, maxWidth: 900, margin: "22px 0" }}>
            “I don’t know yet” is a valid answer.
          </h2>
          <p style={{ maxWidth: 700, fontSize: 20, lineHeight: 1.55, color: "rgba(0,0,0,.64)" }}>Embla must never turn missing data into a negative score, certainty into theatre or sponsorship into ranking. Every recommendation keeps its evidence, unknowns and confidence attached.</p>
        </div>
      </section>
    </main>
  );
}

export function FourFinanceHome() {
  return (
    <main style={page}>
      <header style={{ ...shell, height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.13)" }}>
        <Link to="/4sapien" style={{ color: "#fff", textDecoration: "none" }}><Mark /></Link>
        <span style={{ ...mono, color: "rgba(255,255,255,.58)" }}>4FINANCE / PROOF 00</span>
      </header>

      <section style={{ ...shell, padding: "clamp(74px, 10vw, 130px) 0 70px" }}>
        <p style={{ ...mono, color: "#2E2EFF" }}>EMBLA / MONEY INTELLIGENCE</p>
        <h1 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(58px, 10vw, 126px)", fontWeight: 500, letterSpacing: "-.065em", lineHeight: .86, margin: "25px 0 38px" }}>Understand money.<br />Choose with it.</h1>
        <p style={{ maxWidth: 740, fontSize: "clamp(19px, 2.2vw, 27px)", lineHeight: 1.45, color: "rgba(255,255,255,.68)" }}>4FINANCE is the financial lens inside 4SAPIEN: personal economics first, then rigorous investment understanding. The same Choice Engine links money to the rest of your life.</p>
      </section>

      <section style={{ ...shell, paddingBottom: 82 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 1, background: "rgba(255,255,255,.13)" }}>
          {financeModules.map((module, index) => (
            <article key={module.title} style={{ background: "#070707", padding: "34px 28px", minHeight: 260 }}>
              <span style={{ ...mono, color: "rgba(255,255,255,.4)" }}>0{index + 1}</span>
              <h2 style={{ fontSize: 28, fontWeight: 500, margin: "58px 0 14px" }}>{module.title}</h2>
              <p style={{ color: "rgba(255,255,255,.61)", lineHeight: 1.55, margin: 0 }}>{module.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...shell, padding: "0 0 88px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,.16)", padding: "clamp(28px, 5vw, 54px)" }}>
          <p style={{ ...mono, color: "rgba(255,255,255,.45)" }}>PROTOTYPE SCENARIO / ILLUSTRATIVE INPUTS ONLY</p>
          <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(34px, 5vw, 62px)", fontWeight: 500, letterSpacing: "-.045em", margin: "22px 0 35px" }}>“Can I actually afford the better option?”</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            {[
              ["NOW", "Purchase price + immediate cash effect"],
              ["1 YEAR", "Running cost + financing + maintenance"],
              ["5 YEARS", "Total cost + resale + scenario range"],
              ["LIFE FIT", "Budget, goals, time, risk and preferences"],
            ].map(([title, text]) => (
              <div key={title} style={{ borderTop: "1px solid rgba(255,255,255,.22)", paddingTop: 16 }}><strong style={{ ...mono, display: "block", marginBottom: 8 }}>{title}</strong><span style={{ color: "rgba(255,255,255,.58)", lineHeight: 1.45 }}>{text}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", color: "#080808" }}>
        <div style={{ ...shell, padding: "82px 0" }}>
          <p style={{ ...mono, color: "rgba(0,0,0,.45)" }}>INVESTMENT INTELLIGENCE / BOUNDARY</p>
          <h2 style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif', fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 500, letterSpacing: "-.05em", lineHeight: 1, margin: "22px 0" }}>Evidence and scenarios. Not a magic BUY button.</h2>
          <p style={{ maxWidth: 760, fontSize: 19, lineHeight: 1.6, color: "rgba(0,0,0,.62)" }}>The first investment proof will combine fundamentals, cash flow, valuation ranges, bear/base/bull scenarios, company evidence, transition exposure and explicit uncertainty. The user keeps the decision.</p>
        </div>
      </section>
    </main>
  );
}
