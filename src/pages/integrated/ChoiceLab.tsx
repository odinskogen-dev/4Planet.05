import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NITROGEN_GOLD, type NitrogenOption } from "@/data/nitrogenGold";
import "@/styles/choice-lab.css";

type View = "system" | "innovation" | "capital";
type ParticipantRole = "innovator" | "capital" | "field" | "institution";

type IncentiveContract = {
  label: string;
  thesis: string;
  contributes: string[];
  receives: string[];
  actions: string[];
  control: string;
};

const TRACE = [
  ["HUMAN NEED", "FOOD"],
  ["VALUE CHAIN", "INPUTS → PRODUCTION"],
  ["PRESSURE", "NITROGEN LOSS"],
  ["SOLUTION", "REDUCE / PREVENT"],
  ["INNOVATION", "CAPABILITIES + OPEN GAPS"],
  ["ACTOR", "DEVELOPER / ADOPTER / IMPLEMENTER"],
  ["CAPITAL", "NEXT CREDIBLE INSTRUMENT"],
  ["IMPACT", "DELIVERY"],
  ["PROOF", "EVIDENCE / OUTCOME"],
] as const;

const INCENTIVE_CONTRACTS: Record<ParticipantRole, IncentiveContract> = {
  innovator: {
    label: "INNOVATOR",
    thesis: "A strong builder should gain more from contributing truthful evidence than from withholding it.",
    contributes: ["Product / method identity", "Evidence + limitations", "Pilot / deployment records", "Correction requests"],
    receives: ["Verified problem context", "Independent profile", "Relevant adopters + implementers", "Capital-fit and proof pathway"],
    actions: ["CLAIM / CORRECT PROFILE", "ADD SOURCE", "SUBMIT PILOT", "RESPOND TO OPEN GAP"],
    control: "4PLANET keeps editorial independence. Contribution never equals endorsement or verified effectiveness.",
  },
  capital: {
    label: "CAPITAL",
    thesis: "Capital should gain decision context, not another unranked project list or opaque score.",
    contributes: ["Mandate / geography", "Instrument constraints", "Evidence threshold", "Public programme terms where applicable"],
    receives: ["Problem materiality", "Solution + innovation landscape", "Implementation capacity", "Next credible capital need + proof requirement"],
    actions: ["WATCH CAPITAL NEED", "COMPARE PATHWAYS", "OPEN MANDATE", "FUND PROOF / PILOT"],
    control: "Private relationship state, internal probabilities, asks and negotiation intelligence never leak into the public layer.",
  },
  field: {
    label: "FIELD + SCIENCE",
    thesis: "Real-world implementers and researchers should be rewarded for making what works — and what fails — legible.",
    contributes: ["Implementation context", "Methods + observations", "Failure / constraint evidence", "Place-specific expertise"],
    receives: ["Visibility + attribution", "Comparable evidence context", "Potential collaborators", "Qualified innovation / capital discovery"],
    actions: ["ADD IMPLEMENTATION", "CHALLENGE CLAIM", "ADD OBSERVATION", "REQUEST COLLABORATION"],
    control: "Negative evidence and limitations remain visible. 4PLANET does not optimise the graph for sponsor preference.",
  },
  institution: {
    label: "STATE / INSTITUTION",
    thesis: "Institutions should be able to move from targets and financing gaps to concrete solution and implementation intelligence.",
    contributes: ["Public targets / mandates", "Geography + system boundaries", "Procurement / eligibility rules", "Public datasets + evidence"],
    receives: ["Problem → solution decomposition", "Innovation / implementation gaps", "Actor ecosystems", "Capital and proof requirements"],
    actions: ["PUBLISH CHALLENGE", "MAP FINANCING GAP", "REQUEST EVIDENCE", "OPEN PROCUREMENT PATH"],
    control: "Policy goals, funding need and measured ecological outcome remain separate truth states.",
  },
};

const CAPITAL_DIMENSIONS = [
  ["Problem materiality", "Is the underlying problem meaningful in this defined system and place?"],
  ["Mechanism", "Does the proposed pathway plausibly address the identified pressure?"],
  ["Readiness", "Research, frontier, source-checked, deployed — what is actually established?"],
  ["Evidence", "What supports the claim, and what remains unknown or context dependent?"],
  ["Implementation", "Are there capable adopters, operators, rights holders and verifiers?"],
  ["Capital need", "What exactly does the next credible step require?"],
  ["Instrument fit", "Grant, pilot, procurement, capex, blended, investment — which logic fits?"],
  ["Additionality", "What becomes possible because this capital enters now?"],
  ["Proof", "What evidence must be produced before the next decision or scale step?"],
] as const;

function noIndex() {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const created = !existing;
  const meta = existing ?? document.createElement("meta");
  const previous = meta.content;
  meta.name = "robots";
  meta.content = "noindex,nofollow";
  if (created) document.head.appendChild(meta);
  return () => {
    if (created) meta.remove();
    else meta.content = previous;
  };
}

function SourceStatus({ option }: { option: NitrogenOption }) {
  return (
    <div className="choice-source-status">
      <span>SOURCE / CONTROL</span>
      <strong>{option.canonicalRef}</strong>
      <p>{option.sourceRef} · internal Gold working record · public review not inferred.</p>
      {option.sourceUrl && <a href={option.sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE ANCHOR ↗</a>}
    </div>
  );
}

export function ChoiceLabPage() {
  const [view, setView] = useState<View>("system");
  const [selectedId, setSelectedId] = useState("biofix");
  const [role, setRole] = useState<ParticipantRole>("innovator");

  const selected = useMemo(
    () => NITROGEN_GOLD.options.find((option) => option.id === selectedId) ?? NITROGEN_GOLD.options[0],
    [selectedId],
  );
  const incentive = INCENTIVE_CONTRACTS[role];

  useEffect(() => {
    const previous = document.title;
    document.title = "CHOICE_ — FOOD Nitrogen Gold × Innovation × Capital";
    const restore = noIndex();
    return () => {
      document.title = previous;
      restore();
    };
  }, []);

  return (
    <div className="choice-page">
      <header className="choice-header">
        <Link to="/tree-of-life" className="choice-back">← TREE OF LIFE_</Link>
        <div className="choice-modes" role="group" aria-label="CHOICE view">
          {(["system", "innovation", "capital"] as View[]).map((item) => (
            <button key={item} type="button" className={view === item ? "is-active" : ""} onClick={() => setView(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <span>LABS / GOLD SANDBOX / NOINDEX</span>
      </header>

      <main>
        <section className="choice-hero">
          <div className="choice-hero-copy">
            <span className="choice-kicker">4PLANET LABS_ / FOOD GOLD / CASE-07</span>
            <h1>CHOICE_</h1>
            <p>System context around the decision.</p>
          </div>
          <div className="choice-thesis">
            <span>GOLD VERTICAL</span>
            <p>Start with one material FOOD problem. Connect the solution landscape, emerging innovation, open gaps, actor capacity, capital need and proof — without collapsing uncertainty into a score.</p>
          </div>
        </section>

        <section className="choice-gold-context">
          <div>
            <span>PROBLEM</span>
            <strong>{NITROGEN_GOLD.title}</strong>
            <small>{NITROGEN_GOLD.problemId}</small>
          </div>
          <div>
            <span>VALUE CHAIN</span>
            <strong>{NITROGEN_GOLD.valueChainStage}</strong>
            <small>{NITROGEN_GOLD.system}</small>
          </div>
          <div className="choice-gold-context-wide">
            <span>GOLD DIRECTION</span>
            <strong>{NITROGEN_GOLD.goldDirection}</strong>
            <small>Context-dependent; no universal effectiveness claim.</small>
          </div>
        </section>

        <section className="choice-trace" aria-label="Decision trace">
          {TRACE.map(([type, value], index) => (
            <div key={type} className="choice-trace-step">
              <span>{String(index + 1).padStart(2, "0")} / {type}</span>
              <strong>{value}</strong>
              {index < TRACE.length - 1 && <i>→</i>}
            </div>
          ))}
        </section>

        <section className={`choice-workspace choice-view-${view}`}>
          <div className="choice-map">
            <div className="choice-map-head">
              <span>01_ INNOVATION LANDSCAPE</span>
              <h2>What exists — and where is the system still weak?</h2>
              <p>{NITROGEN_GOLD.problemFraming}</p>
            </div>

            <div className="choice-option-list">
              {NITROGEN_GOLD.options.map((option, index) => {
                const active = option.id === selected.id;
                const readinessClass = option.readiness.toLowerCase().replace(/\s+/g, "-");
                return (
                  <button type="button" key={option.id} className={active ? "is-active" : ""} onClick={() => setSelectedId(option.id)}>
                    <span className="choice-option-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="choice-option-main">
                      <small>{option.type} · {option.canonicalRef}</small>
                      <strong>{option.label}</strong>
                    </span>
                    <span className={`choice-readiness choice-readiness-${readinessClass}`}>{option.readiness}</span>
                  </button>
                );
              })}
            </div>

            <div className="choice-open-gaps">
              <div className="choice-map-head choice-map-head-small">
                <span>OPEN / UNDER-SOLVED</span>
                <h3>Turn weak points into falsifiable challenge briefs.</h3>
              </div>
              {NITROGEN_GOLD.gaps.map((gap) => (
                <article key={gap.id}>
                  <span>{gap.type} / {gap.id}</span>
                  <strong>{gap.statement}</strong>
                  <small>{gap.assessment} · REVIEW REQUIRED</small>
                </article>
              ))}
            </div>
          </div>

          <aside className="choice-inspector" aria-live="polite">
            <span className="choice-inspector-type">SELECTED / {selected.type}</span>
            <h2>{selected.label}</h2>
            <div className="choice-inspector-grid">
              <div><span>MECHANISM</span><p>{selected.mechanism}</p></div>
              <div><span>EVIDENCE STATE</span><p>{selected.evidenceState}</p></div>
              <div><span>WHAT REMAINS UNKNOWN</span><p>{selected.unknowns}</p></div>
              <div><span>ACTOR ECOSYSTEM</span><p>{selected.actorNeed}</p></div>
              <div><span>CAPITAL NEED</span><p>{selected.capitalNeed}</p></div>
            </div>
            <div className="choice-next-move">
              <span>NEXT CREDIBLE MOVE</span>
              <strong>{selected.nextMove}</strong>
            </div>
            <SourceStatus option={selected} />
          </aside>
        </section>

        <section className="choice-capital">
          <div className="choice-capital-copy">
            <span>02_ CAPITAL DECISION INTELLIGENCE</span>
            <h2>Finance the next credible step — not the best story.</h2>
            <p>CHOICE should make the causal and evidence chain inspectable before money moves. Capital can compare pathways without pretending one black-box score can resolve ecological, technical, economic and implementation trade-offs.</p>
          </div>
          <div className="choice-dimensions">
            {CAPITAL_DIMENSIONS.map(([dimension, question], index) => (
              <div key={dimension}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{dimension}</strong>
                <small>{question}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="choice-capital-path">
          <div className="choice-capital-path-head">
            <span>CAPITAL PATH / SELECTED OBJECT</span>
            <h2>{selected.label}</h2>
          </div>
          <div className="choice-capital-path-grid">
            <div><span>01</span><small>PROBLEM</small><strong>{NITROGEN_GOLD.title}</strong></div>
            <div><span>02</span><small>CAPABILITY</small><strong>{selected.label}</strong></div>
            <div><span>03</span><small>READINESS</small><strong>{selected.readiness}</strong></div>
            <div><span>04</span><small>CAPITAL NEED</small><strong>{selected.capitalNeed}</strong></div>
            <div><span>05</span><small>PROOF GATE</small><strong>{selected.evidenceState}</strong></div>
          </div>
        </section>

        <section className="choice-incentives">
          <div className="choice-incentive-head">
            <span>03_ INCENTIVE DESIGN / PARTICIPATION ENGINE</span>
            <h2>Make truth contribution economically and strategically useful.</h2>
            <p>The prototype should not merely explain incentives. It should show the transaction: what each participant contributes, what they receive, what they can do next, and what truth control prevents capture.</p>
          </div>

          <div className="choice-role-tabs" role="group" aria-label="Participant role">
            {(Object.keys(INCENTIVE_CONTRACTS) as ParticipantRole[]).map((participant) => (
              <button key={participant} type="button" className={role === participant ? "is-active" : ""} onClick={() => setRole(participant)}>
                {INCENTIVE_CONTRACTS[participant].label}
              </button>
            ))}
          </div>

          <div className="choice-incentive-console">
            <div className="choice-incentive-thesis">
              <span>SELECTED PARTICIPANT</span>
              <h3>{incentive.label}</h3>
              <p>{incentive.thesis}</p>
            </div>
            <div className="choice-exchange">
              <div>
                <span>CONTRIBUTES TO THE GRAPH</span>
                {incentive.contributes.map((item) => <strong key={item}>+ {item}</strong>)}
              </div>
              <i>⇄</i>
              <div>
                <span>RECEIVES FROM 4PLANET</span>
                {incentive.receives.map((item) => <strong key={item}>+ {item}</strong>)}
              </div>
            </div>
            <div className="choice-role-actions">
              {incentive.actions.map((action) => <button key={action} type="button" aria-label={`${action} prototype action`}>{action}</button>)}
            </div>
            <div className="choice-trust-control">
              <span>TRUST CONTROL</span>
              <p>{incentive.control}</p>
            </div>
          </div>

          <div className="choice-flywheel" aria-label="Incentive flywheel">
            {["BETTER PROBLEM INTELLIGENCE", "BETTER PROFILES", "MORE EVIDENCE", "BETTER MATCHING", "BETTER CAPITAL DECISIONS", "MORE IMPLEMENTATION", "MORE PROOF", "STRONGER PLANET MODEL"].map((item, index, all) => (
              <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < all.length - 1 && <i>→</i>}</div>
            ))}
          </div>
        </section>

        <section className="choice-boundary">
          <span>TRUTH / PRODUCT BOUNDARY</span>
          <p>This Gold sandbox uses existing internal 4PLANET Problem/Solution/Gap/Innovation Radar records and source anchors to prove the product model. Source-checked does not mean public-reviewed, universally effective or recommended. Open-gap records are 4PLANET hypotheses unless independently established. No named company, funder, funding relationship, ecological outcome or investment recommendation is asserted by this page.</p>
        </section>
      </main>
    </div>
  );
}
