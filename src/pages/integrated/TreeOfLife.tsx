import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/tree-of-life.css";

type Lens = "planetary" | "sapiens";
type VisualMode = "clarity" | "colour" | "art";
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

type BranchGeometry = {
  main: string;
  twigs: string[];
};

const BRAND_GREEN = "#35ff66";

const STAGE_COLOURS = [
  BRAND_GREEN,
  BRAND_GREEN,
  "#91ff45",
  "#ff6b3f",
  "#27e4d4",
  "#4c8dff",
  "#bf68ff",
  "#ffc84a",
  "#ff8c38",
  "#ff668e",
  "#b96cff",
  "#4debd1",
  "#d7ff52",
] as const;

const PLANETARY: TreeNode[] = [
  {
    id: "sources",
    label: "TRUTH / SOURCES",
    eyebrow: "ROOTS",
    question: "What do we actually know?",
    body: "Evidence, rights, provenance, source records and explicit limits.",
    detail: "Truth enters once. Everything above this layer should remain traceable back to it.",
    kind: "root",
    relation: "EVIDENCES",
  },
  {
    id: "brain",
    label: "BRAIN / PLANET MODEL",
    eyebrow: "TRUNK",
    question: "How does 4PLANET keep one truth spine?",
    body: "Canonical identity, source contracts, claims, relationships and the shared Planet Model.",
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
    detail: "Relationships come before intervention. The same entities remain available in ATLAS and SPECIES.",
    kind: "intelligence",
    href: "/living-systems",
    relation: "REVEALS",
  },
  {
    id: "pressure",
    label: "PRESSURES",
    eyebrow: "PROBLEM",
    question: "What is changing or under pressure?",
    body: "Source-aware pressures connected to life, place and human systems.",
    detail: "Pressure preserves geography, time, evidence and uncertainty instead of collapsing them into a campaign label.",
    kind: "intelligence",
    href: "/atlas",
    relation: "CALLS FOR",
  },
  {
    id: "solution",
    label: "SOLUTIONS",
    eyebrow: "PATHWAY",
    question: "What could credibly change the pressure?",
    body: "Interventions, response pathways and mechanisms with evidence and constraints.",
    detail: "A solution describes a pathway. It does not claim that 4PLANET or an actor has delivered it.",
    kind: "intelligence",
    href: "/missions",
    relation: "STRENGTHENED BY",
  },
  {
    id: "innovation",
    label: "INNOVATION",
    eyebrow: "NEW CAPABILITY",
    question: "What can improve or scale the solution?",
    body: "Technology, methods, business models, science, data, policy mechanisms and delivery models.",
    detail: "A first-class intelligence object: maturity, evidence, developers, adopters, pilots, constraints and capital need.",
    kind: "intelligence",
    relation: "DEVELOPED BY",
  },
  {
    id: "actors",
    label: "ACTORS",
    eyebrow: "WHO",
    question: "Who develops, tests, implements or verifies it?",
    body: "Organisations, researchers, field teams, institutions, companies and public actors.",
    detail: "One shared Actor identity can hold different roles without duplicating organisations across systems.",
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
    body: "Delivery records, evidence, review, limitations and measured outcomes where available.",
    detail: "Proof determines what can responsibly be said, funded again or scaled next.",
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
    detail: "Story converts proof into attention, understanding and relevance without weakening source boundaries.",
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
    detail: "Participation creates distribution, knowledge, relationships and execution capacity for the next cycle.",
    kind: "growth",
    href: "/people",
    relation: "EXPANDS",
  },
  {
    id: "scale",
    label: "SCALE + LEARN",
    eyebrow: "REPEAT",
    question: "How does what works become larger and better?",
    body: "Adoption, correction, learning and the next cycle.",
    detail: "Scale follows evidence. Learning returns to BRAIN, the Planet Model and the next solution cycle.",
    kind: "growth",
    relation: "RETURNS TO TRUTH",
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
    detail: "Every challenge should be tied to a chain stage, geography and evidence source where possible.",
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
    detail: "A solution can operate at one chain stage or alter the whole system. Its mechanism remains explicit.",
    kind: "intelligence",
    href: "/missions",
    relation: "ACCELERATED BY",
  },
  {
    id: "innovation",
    label: "INNOVATIONS",
    eyebrow: "ACCELERATOR",
    question: "What new capability can change cost, speed, reach or effectiveness?",
    body: "Technology + methods + science/data + business models + policy and institutional innovation.",
    detail: "Innovation profiles connect a chain problem to maturity, evidence, adopters, implementers and capital required for the next credible stage.",
    kind: "intelligence",
    relation: "BUILT BY",
  },
  {
    id: "actors",
    label: "ACTORS",
    eyebrow: "ECOSYSTEM",
    question: "Who can build, adopt, distribute or deliver it?",
    body: "Producers, companies, innovators, researchers, NGOs, governments and field implementers.",
    detail: "The same actor can be a developer in one chain and an adopter, funder or verifier in another context.",
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
    detail: "Capital fit is a graph problem: stage + need + geography + evidence + actor + instrument.",
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
    detail: "Story is a distribution mechanism for understanding and participation, not proof by itself.",
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
    detail: "The loop returns learning to the shared model and can replay across other S4PIENS chains.",
    kind: "growth",
    relation: "LEARNS + REPEATS",
  },
];

const BRANCH_GEOMETRY: BranchGeometry[] = [
  {
    main: "M500 245 C455 205 394 150 305 112 C244 86 189 92 136 118",
    twigs: ["M410 168 C356 108 306 76 248 58", "M338 126 C301 90 262 69 214 65", "M285 106 C250 127 217 143 174 148"],
  },
  {
    main: "M490 300 C433 263 374 234 291 226 C219 218 170 239 112 278",
    twigs: ["M375 236 C326 194 280 170 224 168", "M299 226 C253 246 219 269 179 303", "M224 231 C190 219 157 221 124 234"],
  },
  {
    main: "M486 360 C424 342 363 327 282 335 C214 342 166 372 116 414",
    twigs: ["M365 327 C319 294 273 279 220 285", "M290 335 C248 366 217 394 188 429", "M215 347 C176 341 144 348 112 363"],
  },
  {
    main: "M482 422 C420 425 359 431 292 462 C235 488 195 526 151 566",
    twigs: ["M366 431 C318 408 272 401 226 413", "M300 457 C261 493 239 525 218 563", "M232 489 C197 485 169 491 141 508"],
  },
  {
    main: "M478 486 C424 511 376 548 331 595 C298 631 273 657 242 682",
    twigs: ["M389 539 C349 531 318 535 287 553", "M333 592 C300 596 271 609 246 632", "M300 626 C283 651 271 672 263 694"],
  },
  {
    main: "M522 486 C576 511 624 548 669 595 C702 631 727 657 758 682",
    twigs: ["M611 539 C651 531 682 535 713 553", "M667 592 C700 596 729 609 754 632", "M700 626 C717 651 729 672 737 694"],
  },
  {
    main: "M518 422 C580 425 641 431 708 462 C765 488 805 526 849 566",
    twigs: ["M634 431 C682 408 728 401 774 413", "M700 457 C739 493 761 525 782 563", "M768 489 C803 485 831 491 859 508"],
  },
  {
    main: "M514 360 C576 342 637 327 718 335 C786 342 834 372 884 414",
    twigs: ["M635 327 C681 294 727 279 780 285", "M710 335 C752 366 783 394 812 429", "M785 347 C824 341 856 348 888 363"],
  },
  {
    main: "M510 300 C567 263 626 234 709 226 C781 218 830 239 888 278",
    twigs: ["M625 236 C674 194 720 170 776 168", "M701 226 C747 246 781 269 821 303", "M776 231 C810 219 843 221 876 234"],
  },
  {
    main: "M500 245 C545 205 606 150 695 112 C756 86 811 92 864 118",
    twigs: ["M590 168 C644 108 694 76 752 58", "M662 126 C699 90 738 69 786 65", "M715 106 C750 127 783 143 826 148"],
  },
  {
    main: "M500 235 C500 176 500 122 500 56",
    twigs: ["M500 150 C470 118 444 95 414 78", "M500 150 C530 118 556 95 586 78", "M500 105 C472 72 454 51 438 36", "M500 105 C528 72 546 51 562 36"],
  },
];

const NODE_LAYOUT = [
  { side: "left", top: 13 },
  { side: "left", top: 28 },
  { side: "left", top: 43 },
  { side: "left", top: 58 },
  { side: "left", top: 73 },
  { side: "right", top: 73 },
  { side: "right", top: 58 },
  { side: "right", top: 43 },
  { side: "right", top: 28 },
  { side: "right", top: 13 },
  { side: "top", top: 3 },
] as const;

const FLOW = ["Understand", "Pressure", "Solution", "Innovation", "Actor", "Capital", "Impact", "Proof", "Story", "People", "Scale", "Learn", "Repeat"];

const CAPITAL_FLOW = ["PRESSURE", "SOLUTION", "INNOVATION", "ACTOR / PROJECT", "CAPITAL NEED", "INSTRUMENT", "CAPITAL ACTOR", "DELIVERY", "PROOF"];

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

function TreeGraphic({
  nodes,
  selectedIndex,
  hoveredIndex,
  visualMode,
  onSelect,
  onHover,
}: {
  nodes: TreeNode[];
  selectedIndex: number;
  hoveredIndex: number | null;
  visualMode: VisualMode;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const branchColour = (index: number) => {
    if (visualMode === "colour" || visualMode === "art") return STAGE_COLOURS[index];
    if (hoveredIndex === index || selectedIndex === index) return STAGE_COLOURS[index];
    return BRAND_GREEN;
  };

  return (
    <div className={`tol-yggdrasil tol-visual-${visualMode}`}>
      <div className="tol-tree-glow" aria-hidden />
      <svg className="tol-tree-svg" viewBox="0 0 1000 760" role="img" aria-label="Interactive Yggdrasil system map">
        <defs>
          <filter id="tol-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="tol-hot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="tol-trunk-gradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#35ff66" stopOpacity=".98" />
            <stop offset="100%" stopColor="#a8ffbd" stopOpacity=".55" />
          </linearGradient>
        </defs>

        <g className="tol-grid-crosses" aria-hidden>
          {Array.from({ length: 10 }).map((_, index) => (
            <circle key={`particle-${index}`} cx={110 + index * 84} cy={80 + (index % 4) * 146} r="1.5" fill={BRAND_GREEN} opacity=".5" />
          ))}
        </g>

        <g
          className={`tol-roots ${selectedIndex === 0 ? "is-selected" : ""}`}
          onMouseEnter={() => onHover(0)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onSelect(0)}
          role="presentation"
        >
          {["M500 608 C418 626 348 661 276 711 C210 755 142 741 76 724", "M500 608 C582 626 652 661 724 711 C790 755 858 741 924 724", "M500 612 C430 655 392 706 360 752", "M500 612 C570 655 608 706 640 752", "M500 612 C461 670 448 714 440 752", "M500 612 C539 670 552 714 560 752", "M500 615 C387 636 300 646 208 642 C151 640 103 653 55 680", "M500 615 C613 636 700 646 792 642 C849 640 897 653 945 680"].map((d, index) => (
            <path key={`root-${index}`} d={d} />
          ))}
        </g>

        <g
          className={`tol-trunk ${selectedIndex === 1 ? "is-selected" : ""}`}
          onMouseEnter={() => onHover(1)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onSelect(1)}
          role="presentation"
        >
          <path d="M500 620 C457 575 461 522 476 470 C493 409 480 358 488 301 C495 251 492 201 500 148" />
          <path d="M500 620 C543 575 539 522 524 470 C507 409 520 358 512 301 C505 251 508 201 500 148" />
          <path className="tol-trunk-core" d="M500 620 C498 529 505 451 500 372 C496 295 503 220 500 148" />
          {[590, 530, 470, 410, 350, 290, 230, 170].map((y) => <circle key={y} cx="500" cy={y} r="5" />)}
        </g>

        {BRANCH_GEOMETRY.map((geometry, branchIndex) => {
          const nodeIndex = branchIndex + 2;
          const colour = branchColour(nodeIndex);
          const active = selectedIndex === nodeIndex || hoveredIndex === nodeIndex;
          return (
            <g
              key={`branch-${nodeIndex}`}
              className={`tol-branch ${active ? "is-active" : ""}`}
              style={{ color: colour }}
              onMouseEnter={() => onHover(nodeIndex)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(nodeIndex)}
              role="presentation"
            >
              <path className="tol-branch-main" d={geometry.main} />
              {geometry.twigs.map((d, index) => <path className="tol-branch-twig" d={d} key={`${nodeIndex}-${index}`} />)}
              <circle className="tol-branch-seed" cx={nodeIndex === 12 ? 500 : nodeIndex <= 6 ? 136 + (nodeIndex - 2) * 18 : 864 - (nodeIndex - 7) * 18} cy={nodeIndex === 12 ? 56 : 110 + Math.abs(7 - nodeIndex) * 55} r="3.2" />
            </g>
          );
        })}
      </svg>

      <button className="tol-core-label tol-core-brain" type="button" onClick={() => onSelect(1)}>
        <span>BRAIN / PLANET MODEL</span>
        <small>The shared intelligence spine.</small>
      </button>
      <button className="tol-core-label tol-core-roots" type="button" onClick={() => onSelect(0)}>
        <span>{nodes[0].label}</span>
        <small>{nodes[0].eyebrow === "ROOTS" ? "Verified data, science, knowledge and provenance." : "Human need enters the system."}</small>
      </button>

      {nodes.slice(2).map((node, branchIndex) => {
        const nodeIndex = branchIndex + 2;
        const layout = NODE_LAYOUT[branchIndex];
        const colour = branchColour(nodeIndex);
        const active = selectedIndex === nodeIndex || hoveredIndex === nodeIndex;
        const style = layout.side === "left"
          ? { top: `${layout.top}%`, left: "0", color: colour }
          : layout.side === "right"
            ? { top: `${layout.top}%`, right: "0", color: colour }
            : { top: `${layout.top}%`, left: "50%", color: colour };
        return (
          <button
            type="button"
            key={`${node.id}-${nodeIndex}`}
            className={`tol-branch-label tol-branch-label-${layout.side} ${active ? "is-active" : ""}`}
            style={style}
            onMouseEnter={() => onHover(nodeIndex)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(nodeIndex)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(nodeIndex)}
            aria-pressed={selectedIndex === nodeIndex}
          >
            <span className="tol-node-code">{String(nodeIndex - 1).padStart(2, "0")} {node.eyebrow}</span>
            <strong>{node.label}</strong>
          </button>
        );
      })}
    </div>
  );
}

export function TreeOfLifePage() {
  const [lens, setLens] = useState<Lens>("planetary");
  const [visualMode, setVisualMode] = useState<VisualMode>("clarity");
  const nodes = lens === "planetary" ? PLANETARY : SAPIENS;
  const [selectedIndex, setSelectedIndex] = useState(5);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "TREE OF LIFE_ — 4PLANET Labs sandbox";
    const restoreRobots = setRobotsNoIndex();
    return () => {
      document.title = previousTitle;
      restoreRobots();
      document.body.classList.remove("tol-art-body");
    };
  }, []);

  useEffect(() => {
    setSelectedIndex(5);
  }, [lens]);

  useEffect(() => {
    document.body.classList.toggle("tol-art-body", visualMode === "art");
    return () => document.body.classList.remove("tol-art-body");
  }, [visualMode]);

  const selected = useMemo(() => nodes[selectedIndex] ?? nodes[5], [nodes, selectedIndex]);
  const selectedColour = STAGE_COLOURS[selectedIndex] ?? BRAND_GREEN;

  return (
    <div className={`tol-page tol-mode-${visualMode}`}>
      <header className="tol-labs-header">
        <Link className="tol-wordmark" to="/" aria-label="4PLANET home"><span>4</span>PLANET_</Link>
        <div className="tol-view-modes" role="group" aria-label="Visual mode">
          {(["clarity", "colour", "art"] as VisualMode[]).map((mode) => (
            <button key={mode} type="button" className={visualMode === mode ? "is-active" : ""} aria-pressed={visualMode === mode} onClick={() => setVisualMode(mode)}>
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="tol-private">LABS / PRIVATE</span>
      </header>

      <main className="tol-stage">
        <div className="tol-stage-title tol-hud">
          <span className="tol-micro">4PLANET LABS_ / SYS-PAI-01</span>
          <h1>TREE OF LIFE_</h1>
          <p>Planetary Action Intelligence</p>
        </div>

        <aside className="tol-state-panel tol-hud" aria-label="Tree state">
          <span className="tol-panel-title">SYSTEM VIEW</span>
          <dl>
            <div><dt>LENS</dt><dd>{lens === "planetary" ? "PLANETARY ACTION" : "S4PIENS"}</dd></div>
            <div><dt>VISUAL</dt><dd>{visualMode.toUpperCase()}</dd></div>
            <div><dt>SELECTED</dt><dd>{selected.label}</dd></div>
            <div><dt>MODEL</dt><dd>SHARED PLANET MODEL</dd></div>
          </dl>
          <div className="tol-lens-switch" role="group" aria-label="System lens">
            <button type="button" className={lens === "planetary" ? "is-active" : ""} onClick={() => setLens("planetary")}>PLANETARY</button>
            <button type="button" className={lens === "sapiens" ? "is-active" : ""} onClick={() => setLens("sapiens")}>S4PIENS</button>
          </div>
        </aside>

        <TreeGraphic
          nodes={nodes}
          selectedIndex={selectedIndex}
          hoveredIndex={hoveredIndex}
          visualMode={visualMode}
          onSelect={setSelectedIndex}
          onHover={setHoveredIndex}
        />

        <aside className="tol-detail-panel tol-hud" style={{ borderColor: selectedColour }} aria-live="polite">
          <div className="tol-detail-head">
            <span className="tol-selected-dot" style={{ background: selectedColour, boxShadow: `0 0 24px ${selectedColour}` }} />
            <span className="tol-micro">SELECTED NODE / {String(selectedIndex + 1).padStart(2, "0")}</span>
          </div>
          <span className="tol-detail-eyebrow" style={{ color: selectedColour }}>{selected.eyebrow}</span>
          <h2>{selected.label}</h2>
          <p className="tol-detail-question">{selected.question}</p>
          <p>{selected.body}</p>
          <div className="tol-detail-rule" />
          <p className="tol-detail-deep">{selected.detail}</p>
          <div className="tol-relation-row">
            <span>RELATION</span><strong>{selected.relation ?? "CONNECTED"}</strong>
          </div>
          {selected.href && <Link className="tol-open-link" to={selected.href}>OPEN CONNECTED SURFACE →</Link>}
        </aside>

        <nav className="tol-loop tol-hud" aria-label="Planetary action loop">
          <span className="tol-loop-infinity">∞</span>
          <div className="tol-loop-track">
            {FLOW.map((item, index) => (
              <span key={item} className={item.toLowerCase() === "innovation" ? "is-key" : ""}>{item}{index < FLOW.length - 1 && <i>→</i>}</span>
            ))}
          </div>
        </nav>

        <div className="tol-art-caption" aria-hidden={visualMode !== "art"}>
          <span>TREE OF LIFE_</span>
          <small>Truth → intelligence → action → proof → learning.</small>
        </div>
      </main>

      <section className="tol-explain tol-hud">
        <div className="tol-section-heading">
          <span>01_ INNOVATION INTELLIGENCE</span>
          <h2>Map what humanity still needs to solve.</h2>
          <p>Connect problems and value-chain bottlenecks to the innovations that already exist, the gaps that remain unsolved, the actors working on them and the capital needed for the next credible step.</p>
        </div>
        <div className="tol-four-grid">
          <article><span>PROBLEM</span><strong>Where is the bottleneck?</strong><p>Pressure, chain stage, geography and why it matters.</p></article>
          <article><span>CAPABILITY</span><strong>What could change it?</strong><p>Technology, method, science/data, business model, policy or delivery innovation.</p></article>
          <article><span>READINESS</span><strong>What is real now?</strong><p>Research → prototype → pilot → deployed → scaling, source-backed without maturity inflation.</p></article>
          <article><span>OPPORTUNITY</span><strong>What is still missing?</strong><p>Unsolved needs become explicit innovation and entrepreneurial opportunity spaces.</p></article>
        </div>
      </section>

      <section className="tol-explain tol-hud">
        <div className="tol-section-heading">
          <span>02_ CAPITAL INTELLIGENCE</span>
          <h2>Give capital system context around the decision.</h2>
          <p>Move from a funder list to a graph that shows what problem, solution, innovation, actor, stage, evidence and capital instrument sit behind the funding decision.</p>
        </div>
        <div className="tol-capital-flow">
          {CAPITAL_FLOW.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < CAPITAL_FLOW.length - 1 && <i>→</i>}</div>)}
        </div>
        <div className="tol-capital-boundary">
          <div><span>PUBLIC CAPITAL INTELLIGENCE</span><p>Verified funding relationships, public programmes, instrument logic, evidence thresholds and sourced project context.</p></div>
          <div><span>PRIVATE CAPITAL OS</span><p>Target scoring, warm paths, asks, probabilities, negotiation state and confidential relationship intelligence stay private.</p></div>
        </div>
      </section>

      <section className="tol-explain tol-hud">
        <div className="tol-section-heading">
          <span>03_ S4PIENS HUMAN SYSTEMS ENGINE</span>
          <h2>From human need to a regenerative system.</h2>
          <p>FOOD is the Gold proof. The same grammar transfers to EN4RGY, F4SHION and CIRCULAR CITY without creating separate truth systems.</p>
        </div>
        <div className="tol-sapiens-chain">
          <div>HOMO SAPIENS <i>→</i> NEED / DEMAND <i>→</i> VALUE CHAIN <i>→</i> PRESSURES / CHALLENGES</div>
          <div>SOLUTIONS <i>→</i> INNOVATIONS <i>→</i> ACTORS <i>→</i> CAPITAL <i>→</i> IMPACT</div>
          <div>TRACK / PROVE <i>→</i> TELL <i>→</i> RECRUIT <i>→</i> SCALE <i>→</i> LEARN <i>→</i> REPEAT</div>
        </div>
      </section>

      <footer className="tol-sandbox-footer tol-hud">
        <span>PRIVATE SANDBOX / NOINDEX / UNMERGED</span>
        <p>This interface explains architecture and interaction logic. It does not assert that a named innovation, funding relationship, delivery or ecological outcome exists unless a connected source-backed record establishes it.</p>
      </footer>
    </div>
  );
}
