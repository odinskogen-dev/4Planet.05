import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import "@/styles/tree-of-life.css";

type Mode = "planetary" | "sapiens";
type NodeKind = "root" | "trunk" | "intelligence" | "execution" | "growth";

type TreeNode = {
  id: string;
  label: string;
  eyebrow: string;
  question: string;
  body: string;
  detail: string;
  kind: NodeKind;
  href?: string;
  relation?: string;
};

const PLANETARY: TreeNode[] = [
  {
    id: "sources",
    label: "SOURCES",
    eyebrow: "ROOTS",
    question: "What do we actually know?",
    body: "Evidence, rights, provenance, source records and explicit limits.",
    detail: "Truth enters once. Everything above this layer should remain traceable back to it.",
    kind: "root",
    relation: "EVIDENCES",
  },
  {
    id: "brain",
    label: "BRAIN",
    eyebrow: "TRUNK",
    question: "How does 4PLANET keep one truth spine?",
    body: "Canonical identity, source contracts, claims, relationships and shared Planet Model.",
    detail: "The trunk prevents ATLAS, SPECIES, Actors, Capital and Impact from becoming separate truth systems.",
    kind: "trunk",
    relation: "NORMALISES",
  },
  {
    id: "living-systems",
    label: "LIVING SYSTEMS",
    eyebrow: "UNDERSTAND",
    question: "What depends on what?",
    body: "Life, places, functions, dependencies and human relationships.",
    detail: "The system explains relationships before intervention. The same entities remain available in ATLAS and SPECIES.",
    kind: "intelligence",
    href: "/living-systems",
    relation: "REVEALS",
  },
  {
    id: "pressure",
    label: "PRESSURE",
    eyebrow: "PROBLEM",
    question: "What is changing or under pressure?",
    body: "A source-aware problem or pressure connected to life, place or human systems.",
    detail: "Pressure is not a campaign label. It should preserve geography, time, evidence and uncertainty.",
    kind: "intelligence",
    href: "/atlas",
    relation: "CREATES NEED FOR",
  },
  {
    id: "solution",
    label: "SOLUTION",
    eyebrow: "PATHWAY",
    question: "What could credibly change the pressure?",
    body: "Interventions, response pathways and mechanisms with evidence and constraints.",
    detail: "Solutions describe the pathway. They do not imply that 4PLANET or any actor has delivered it.",
    kind: "intelligence",
    href: "/missions",
    relation: "CAN BE STRENGTHENED BY",
  },
  {
    id: "innovation",
    label: "INNOVATION",
    eyebrow: "NEW CAPABILITY",
    question: "What can improve or scale the solution?",
    body: "Technology, methods, business models, science, data, policy mechanisms and delivery models.",
    detail: "A first-class intelligence object with maturity, evidence, developers, pilots, constraints, capital need and source-backed readiness.",
    kind: "intelligence",
    relation: "DEVELOPED / ADOPTED BY",
  },
  {
    id: "actors",
    label: "ACTORS",
    eyebrow: "WHO",
    question: "Who develops, tests, implements or verifies it?",
    body: "Organisations, researchers, field teams, institutions, companies and other actors.",
    detail: "One shared Actor identity can have different roles without duplicating organisations across partner, science, innovation and capital systems.",
    kind: "execution",
    href: "/actors",
    relation: "REQUIRES",
  },
  {
    id: "capital",
    label: "CAPITAL",
    eyebrow: "ENABLE",
    question: "Who can fund what, when, and against which proof?",
    body: "Capital need, instrument, stage, fit, evidence threshold and verified funding relationships.",
    detail: "Public Capital Intelligence can show verified public relationships and opportunities. Private CRM targeting stays private.",
    kind: "execution",
    relation: "ENABLES",
  },
  {
    id: "impact",
    label: "IMPACT",
    eyebrow: "DELIVER",
    question: "Who can actually deliver the action?",
    body: "Contribution, provider request, delivery, evidence and outcome remain separate states.",
    detail: "Capital is not impact. Delivery is not outcome. Outcome is not system-level impact without the required evidence.",
    kind: "execution",
    href: "/impact",
    relation: "GENERATES",
  },
  {
    id: "proof",
    label: "PROOF",
    eyebrow: "TRACK",
    question: "What actually happened?",
    body: "Delivery records, evidence records, review, limitations and measured outcomes where available.",
    detail: "Proof closes the loop back to truth and determines what can responsibly be said or scaled next.",
    kind: "growth",
    href: "/reports",
    relation: "BECOMES",
  },
  {
    id: "story",
    label: "STORY",
    eyebrow: "TELL",
    question: "How does verified reality become understandable?",
    body: "Human-first explanation built from evidence, not a substitute for it.",
    detail: "Story can turn proof into attention, understanding and cultural relevance without weakening source boundaries.",
    kind: "growth",
    href: "/stories",
    relation: "RECRUITS",
  },
  {
    id: "people",
    label: "PEOPLE",
    eyebrow: "PARTICIPATE",
    question: "Who enters the universe next?",
    body: "Users, supporters, partners, researchers, creators, talent and communities.",
    detail: "Participation creates distribution, new knowledge, new relationships and more capacity for the next cycle.",
    kind: "growth",
    href: "/people",
    relation: "EXPANDS",
  },
  {
    id: "scale",
    label: "SCALE + LEARN",
    eyebrow: "REPEAT",
    question: "How does what works become larger and better?",
    body: "More adoption, stronger actors, better capital fit, correction, learning and a new cycle.",
    detail: "Scale only follows evidence. Learning feeds back into BRAIN, the Planet Model and the next solution cycle.",
    kind: "growth",
    relation: "FEEDS BACK TO TRUTH",
  },
];

const SAPIENS: TreeNode[] = [
  {
    id: "human",
    label: "HOMO SAPIENS",
    eyebrow: "SPECIES",
    question: "What does a human need and use?",
    body: "The human becomes the starting point for dependencies, demand and planetary pressure.",
    detail: "Homo sapiens remains a SPECIES identity and a Human Systems lens over the same Planet Model.",
    kind: "root",
    href: "/species",
    relation: "CREATES",
  },
  {
    id: "demand",
    label: "NEED + DEMAND",
    eyebrow: "HUMAN SYSTEM",
    question: "What demand must the system satisfy?",
    body: "Food, energy, materials, clothing, mobility, shelter and other human needs.",
    detail: "Demand is the entry to the value chain, not a moral judgement about the person.",
    kind: "trunk",
    relation: "FLOWS THROUGH",
  },
  {
    id: "chain",
    label: "VALUE CHAIN",
    eyebrow: "FOOD GOLD PROOF",
    question: "How does demand become production and consumption?",
    body: "Production → inputs → processing → trade / logistics → consumption → loss / waste.",
    detail: "FOOD is the Gold transfer proof. The same chain grammar can later serve EN4RGY, F4SHION and CIRCULAR CITY.",
    kind: "intelligence",
    href: "/domains/s4piens",
    relation: "CREATES",
  },
  {
    id: "pressure",
    label: "CHALLENGES",
    eyebrow: "PRESSURE",
    question: "Where does the chain create material pressure or failure?",
    body: "Land, water, energy, materials, emissions, waste, nature pressure and social constraints where sourced.",
    detail: "Every challenge should be tied to a specific chain stage, geography and evidence source where possible.",
    kind: "intelligence",
    href: "/atlas",
    relation: "CALLS FOR",
  },
  {
    id: "solution",
    label: "SOLUTIONS",
    eyebrow: "RESPONSE",
    question: "What could materially improve the chain?",
    body: "Prevention, substitution, efficiency, restoration, circularity and other evidence-backed pathways.",
    detail: "The solution can operate at one chain stage or alter the whole system. Its mechanism must remain explicit.",
    kind: "intelligence",
    href: "/missions",
    relation: "ACCELERATED BY",
  },
  {
    id: "innovation",
    label: "INNOVATIONS",
    eyebrow: "ACCELERATOR",
    question: "What new capability can change cost, speed, reach or effectiveness?",
    body: "Technology + methods + science/data + business models + policy/institutional innovation.",
    detail: "Innovation profiles connect the chain problem to maturity, evidence, adopters, implementers and capital needed for the next credible stage.",
    kind: "intelligence",
    relation: "BUILT BY",
  },
  {
    id: "actors",
    label: "ACTORS",
    eyebrow: "ECOSYSTEM",
    question: "Who can build, adopt, distribute or deliver it?",
    body: "Producers, companies, innovators, researchers, NGOs, governments and field implementers.",
    detail: "The same actor may be a developer in one chain and an adopter, funder or verifier in another context.",
    kind: "execution",
    href: "/actors",
    relation: "NEEDS",
  },
  {
    id: "capital",
    label: "CAPITAL",
    eyebrow: "UNLOCK",
    question: "What capital unlocks the next credible move?",
    body: "Grant, philanthropy, paid pilot, partnership, project finance, investment or another qualified instrument.",
    detail: "Capital fit is a graph problem: stage + need + geography + evidence + actor + instrument, not just a list of funders.",
    kind: "execution",
    relation: "FUNDS",
  },
  {
    id: "impact",
    label: "IMPACT",
    eyebrow: "EXECUTE",
    question: "What intervention is actually delivered?",
    body: "Defined action, responsible implementer, delivery state and evidence path.",
    detail: "The same Impact truth contract applies whether the chain is FOOD, EN4RGY, F4SHION or CIRCULAR CITY.",
    kind: "execution",
    href: "/impact",
    relation: "MUST BE",
  },
  {
    id: "proof",
    label: "TRACK + PROVE",
    eyebrow: "EVIDENCE",
    question: "Did the intervention produce the intended result?",
    body: "Track contribution → delivery → proof → outcome without collapsing the states.",
    detail: "Evidence determines what 4PLANET can tell, recommend, fund again or scale.",
    kind: "growth",
    href: "/reports",
    relation: "ENABLES",
  },
  {
    id: "tell",
    label: "TELL",
    eyebrow: "STORY",
    question: "Can the result be understood and shared?",
    body: "Translate proof into a human story with the source boundary intact.",
    detail: "The story is a distribution mechanism for understanding and participation, not proof by itself.",
    kind: "growth",
    href: "/stories",
    relation: "RECRUITS",
  },
  {
    id: "recruit",
    label: "RECRUIT",
    eyebrow: "PEOPLE",
    question: "Who can join, adopt, fund or build the next cycle?",
    body: "Users, buyers, partners, talent, researchers, funders and communities.",
    detail: "Participation adds demand for better solutions and capacity to execute them.",
    kind: "growth",
    href: "/people",
    relation: "SCALES",
  },
  {
    id: "repeat",
    label: "SCALE + REPEAT",
    eyebrow: "LOOP",
    question: "What happens when the system works?",
    body: "More adoption → more proof → stronger capital confidence → more delivery → more learning.",
    detail: "The loop returns learning to the shared model and can be replayed across other S4PIENS chains.",
    kind: "growth",
    relation: "LEARNS + REPEATS",
  },
];

const KIND_LABEL: Record<NodeKind, string> = {
  root: "Truth / origin",
  trunk: "Shared core",
  intelligence: "Intelligence",
  execution: "Execution",
  growth: "Growth loop",
};

function setRobotsNoIndex() {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const created = !existing;
  const meta = existing ?? document.createElement("meta");
  const previous = existing?.content ?? "";
  meta.name = "robots";
  meta.content = "noindex,nofollow";
  if (created) document.head.appendChild(meta);
  return () => {
    if (created) meta.remove();
    else meta.content = previous;
  };
}

export function TreeOfLifePage() {
  const [mode, setMode] = useState<Mode>("planetary");
  const nodes = mode === "planetary" ? PLANETARY : SAPIENS;
  const [selectedId, setSelectedId] = useState(nodes[5].id);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "TREE OF LIFE_ — 4PLANET private sandbox";
    const restoreRobots = setRobotsNoIndex();
    return () => {
      document.title = previousTitle;
      restoreRobots();
    };
  }, []);

  useEffect(() => {
    setSelectedId(mode === "planetary" ? "innovation" : "innovation");
  }, [mode]);

  const selected = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? nodes[0],
    [nodes, selectedId],
  );

  return (
    <PublicShell>
      <div className="tol-page">
        <section className="tol-hero">
          <div className="tol-kicker-row">
            <span className="tol-kicker">4PLANET_ SYSTEM SANDBOX</span>
            <span className="tol-status">PRIVATE / NOINDEX / UNMERGED</span>
          </div>
          <h1>TREE OF LIFE_</h1>
          <p className="tol-lede">
            One living map of how truth becomes understanding, solutions, innovation,
            capital, action, proof — and then grows the next cycle.
          </p>
          <div className="tol-mode-switch" role="group" aria-label="Tree of Life mode">
            <button
              type="button"
              className={mode === "planetary" ? "is-active" : ""}
              aria-pressed={mode === "planetary"}
              onClick={() => setMode("planetary")}
            >
              PLANETARY ACTION
            </button>
            <button
              type="button"
              className={mode === "sapiens" ? "is-active" : ""}
              aria-pressed={mode === "sapiens"}
              onClick={() => setMode("sapiens")}
            >
              S4PIENS / HUMAN SYSTEMS
            </button>
          </div>
        </section>

        <section className="tol-map-section" aria-label="Interactive Tree of Life system map">
          <div className="tol-map-heading">
            <div>
              <span className="tol-section-index">01_ SYSTEM MAP</span>
              <h2>{mode === "planetary" ? "From truth to planetary action." : "From human need to a repeatable action loop."}</h2>
            </div>
            <p>
              Select any node. The line is deliberately continuous: every layer should preserve
              identity, evidence and context into the next.
            </p>
          </div>

          <div className="tol-system-layout">
            <div className="tol-tree" role="list" aria-label={`${mode} system nodes`}>
              {nodes.map((node, index) => {
                const selectedNode = node.id === selected.id;
                return (
                  <div className="tol-node-row" key={`${mode}-${node.id}`} role="listitem">
                    <button
                      type="button"
                      className={`tol-node tol-node-${node.kind} ${selectedNode ? "is-selected" : ""}`}
                      onClick={() => setSelectedId(node.id)}
                      aria-pressed={selectedNode}
                    >
                      <span className="tol-node-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="tol-node-copy">
                        <span className="tol-node-eyebrow">{node.eyebrow}</span>
                        <strong>{node.label}</strong>
                      </span>
                      <span className="tol-node-mark" aria-hidden>{selectedNode ? "●" : "○"}</span>
                    </button>
                    {index < nodes.length - 1 && (
                      <div className="tol-connector" aria-hidden>
                        <span>{node.relation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="tol-return" aria-hidden>
                <span>↺</span>
                <small>{mode === "planetary" ? "LEARNING RETURNS TO TRUTH" : "LEARNING RETURNS TO THE NEXT CHAIN CYCLE"}</small>
              </div>
            </div>

            <aside className="tol-detail" aria-live="polite">
              <div className="tol-detail-sticky">
                <span className="tol-section-index">SELECTED NODE / {KIND_LABEL[selected.kind]}</span>
                <h3>{selected.label}</h3>
                <p className="tol-question">{selected.question}</p>
                <p>{selected.body}</p>
                <div className="tol-detail-rule" />
                <p className="tol-detail-deep">{selected.detail}</p>
                {selected.href && (
                  <Link className="tol-open-link" to={selected.href}>
                    OPEN CONNECTED 4PLANET SURFACE →
                  </Link>
                )}
                <div className="tol-truth-note">
                  <span>TRUTH CONTROL</span>
                  <p>
                    This sandbox demonstrates system logic. It does not assert that an innovation,
                    funding relationship, delivery or ecological outcome exists unless a connected
                    source-backed record establishes it.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="tol-innovation-section">
          <div className="tol-map-heading">
            <div>
              <span className="tol-section-index">02_ INNOVATION INTELLIGENCE</span>
              <h2>Make the next capability visible.</h2>
            </div>
            <p>
              Innovation is not a synonym for solution. A solution is the pathway; innovation is a
              new capability that may make the pathway cheaper, faster, safer, more effective or scalable.
            </p>
          </div>
          <div className="tol-intelligence-grid">
            <article>
              <span>WHAT</span>
              <h3>Innovation profile</h3>
              <p>Technology · method · business model · science/data · policy mechanism · delivery model.</p>
            </article>
            <article>
              <span>READINESS</span>
              <h3>Maturity without hype</h3>
              <p>Research → prototype → pilot → deployed → scaling, only when the evidence supports the state.</p>
            </article>
            <article>
              <span>WHO</span>
              <h3>Developer → adopter</h3>
              <p>Connect inventors, researchers, implementers, customers, public actors and field operators through one Actor spine.</p>
            </article>
            <article>
              <span>UNLOCK</span>
              <h3>Capital need</h3>
              <p>Show the credible next step, the evidence gap and the capital instrument that could unlock it.</p>
            </article>
          </div>
        </section>

        <section className="tol-capital-section">
          <span className="tol-section-index">03_ CAPITAL GRAPH</span>
          <div className="tol-capital-copy">
            <h2>Capital sees the system behind the ask.</h2>
            <p>
              Instead of another funding directory, connect the decision itself: what problem,
              pathway, innovation, actor, stage and proof sit behind a capital need?
            </p>
          </div>
          <div className="tol-capital-flow" aria-label="Capital intelligence flow">
            {["PRESSURE", "SOLUTION", "INNOVATION", "ACTOR / PROJECT", "CAPITAL NEED", "INSTRUMENT", "FUNDER", "DELIVERY", "PROOF"].map((label, index, arr) => (
              <div className="tol-capital-step" key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
                {index < arr.length - 1 && <i aria-hidden>→</i>}
              </div>
            ))}
          </div>
          <div className="tol-boundary-grid">
            <div>
              <span>PUBLIC INTELLIGENCE</span>
              <p>Verified public funding relationships, public programmes, instrument logic, evidence and sourced project context.</p>
            </div>
            <div>
              <span>PRIVATE CAPITAL OS</span>
              <p>Target scoring, relationship state, warm paths, asks, internal probability, negotiation notes and confidential assessment.</p>
            </div>
          </div>
        </section>

        <section className="tol-sapiens-section">
          <div className="tol-map-heading">
            <div>
              <span className="tol-section-index">04_ S4PIENS TRANSFER ENGINE</span>
              <h2>One chain grammar. Many human systems.</h2>
            </div>
            <p>
              FOOD is the Gold proof. The same model can move through EN4RGY, F4SHION and
              CIRCULAR CITY without rebuilding the intelligence architecture each time.
            </p>
          </div>
          <div className="tol-sapiens-loop">
            <div className="tol-sapiens-primary">
              <strong>HOMO SAPIENS</strong><i>→</i><strong>NEED / DEMAND</strong><i>→</i><strong>VALUE CHAIN</strong><i>→</i><strong>PRESSURES</strong>
            </div>
            <div className="tol-sapiens-primary">
              <strong>SOLUTIONS</strong><i>→</i><strong>INNOVATIONS</strong><i>→</i><strong>ACTORS</strong><i>→</i><strong>CAPITAL</strong><i>→</i><strong>IMPACT</strong>
            </div>
            <div className="tol-sapiens-primary tol-sapiens-growth">
              <strong>TRACK / PROVE</strong><i>→</i><strong>TELL</strong><i>→</i><strong>RECRUIT</strong><i>→</i><strong>SCALE</strong><i>→</i><strong>REPEAT</strong>
            </div>
          </div>
        </section>

        <section className="tol-entry-section">
          <span className="tol-section-index">05_ ENTER THE EXISTING UNIVERSE</span>
          <div className="tol-entry-grid">
            <Link to="/atlas"><span>ATLAS</span><strong>Who works here?</strong><i>OPEN →</i></Link>
            <Link to="/species"><span>SPECIES</span><strong>Who works with this species?</strong><i>OPEN →</i></Link>
            <Link to="/living-systems"><span>LIVING SYSTEMS</span><strong>Who works in this system?</strong><i>OPEN →</i></Link>
            <Link to="/actors"><span>ORGANISATIONS_</span><strong>Who develops and delivers?</strong><i>OPEN →</i></Link>
            <Link to="/missions"><span>MISSIONS</span><strong>What ecosystem surrounds the problem?</strong><i>OPEN →</i></Link>
            <Link to="/impact"><span>IMPACT</span><strong>How does action become proof?</strong><i>OPEN →</i></Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
