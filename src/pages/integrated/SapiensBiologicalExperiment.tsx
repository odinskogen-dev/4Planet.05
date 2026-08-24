import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import SapiensAtlasSandbox from "@/pages/integrated/SapiensAtlasSandbox";
import "@/styles/sapiens-biological-experiment.css";

const SAPIENS_ACCENT = "#FF4D22";

type MotionState = "REST" | "SENSE" | "RESPOND" | "SETTLE";
type FocusMode = "ALL" | "FOOD";

type SpatialNode = {
  id: string;
  label: string;
  kicker: string;
  rest: [number, number];
  food: [number, number];
  relevance: "core" | "near" | "context" | "recede";
};

// Coverage map for the major human consumption / value-chain families.
// FOOD_ is the first proof journey; the other nodes describe model coverage,
// not a claim that those systems are already Gold or decision-grade.
const SYSTEM_NODES: SpatialNode[] = [
  { id: "food", label: "FOOD_", kicker: "LIVE GOLD JOURNEY", rest: [18, 25], food: [50, 22], relevance: "core" },
  { id: "water", label: "WATER_", kicker: "HUMAN SYSTEM", rest: [47, 9], food: [36, 34], relevance: "near" },
  { id: "energy", label: "EN4RGY_", kicker: "HUMAN SYSTEM", rest: [78, 19], food: [69, 34], relevance: "context" },
  { id: "fashion", label: "F4SHION_", kicker: "HUMAN SYSTEM", rest: [89, 41], food: [93, 28], relevance: "recede" },
  { id: "technology", label: "TECHNOLOGY_", kicker: "HUMAN SYSTEM", rest: [87, 68], food: [95, 56], relevance: "recede" },
  { id: "circularity", label: "WASTE / CIRCULARITY_", kicker: "HUMAN SYSTEM", rest: [69, 88], food: [91, 84], relevance: "context" },
  { id: "mobility", label: "MOBILITY_", kicker: "HUMAN SYSTEM", rest: [42, 92], food: [77, 87], relevance: "context" },
  { id: "home", label: "HOME_", kicker: "HUMAN SYSTEM", rest: [14, 78], food: [18, 84], relevance: "context" },
  { id: "materials", label: "MATERIALS_", kicker: "HUMAN SYSTEM", rest: [7, 49], food: [8, 56], relevance: "context" },
];

const FOOD_NODES: SpatialNode[] = [
  { id: "agriculture", label: "AGRICULTURE", kicker: "PRODUCTION", rest: [8, 48], food: [27, 27], relevance: "near" },
  { id: "pollination", label: "POLLINATION", kicker: "LIVING FUNCTION", rest: [14, 60], food: [31, 43], relevance: "near" },
  { id: "soil", label: "SOIL", kicker: "LIVING FOUNDATION", rest: [29, 92], food: [40, 59], relevance: "near" },
  { id: "freshwater", label: "FRESHWATER", kicker: "DEPENDENCY", rest: [3, 72], food: [27, 61], relevance: "near" },
  { id: "fertiliser", label: "FERTILISER", kicker: "INPUT", rest: [96, 17], food: [67, 52], relevance: "near" },
  { id: "transport", label: "TRANSPORT", kicker: "VALUE CHAIN", rest: [96, 72], food: [72, 67], relevance: "near" },
  { id: "climate", label: "CLIMATE", kicker: "CONDITION", rest: [91, 7], food: [66, 24], relevance: "near" },
  { id: "species", label: "SPECIES", kicker: "LIFE", rest: [3, 13], food: [34, 17], relevance: "near" },
  { id: "companies", label: "COMPANIES", kicker: "ACTORS", rest: [95, 91], food: [65, 75], relevance: "near" },
  { id: "solutions", label: "SOLUTIONS", kicker: "RESPONSE", rest: [5, 91], food: [38, 77], relevance: "near" },
];

const VASCULAR_LINKS = [
  ["food", "agriculture"],
  ["food", "pollination"],
  ["food", "soil"],
  ["food", "freshwater"],
  ["food", "fertiliser"],
  ["food", "transport"],
  ["food", "climate"],
  ["food", "species"],
  ["food", "companies"],
  ["food", "solutions"],
] as const;

function nodePosition(node: SpatialNode, mode: FocusMode) {
  return mode === "FOOD" ? node.food : node.rest;
}

function cssPosition(node: SpatialNode, mode: FocusMode): CSSProperties {
  const [x, y] = nodePosition(node, mode);
  return { "--bio-x": `${x}%`, "--bio-y": `${y}%` } as CSSProperties;
}

function pointById(id: string, mode: FocusMode) {
  const node = [...SYSTEM_NODES, ...FOOD_NODES].find((candidate) => candidate.id === id);
  if (!node) return [50, 50] as const;
  return nodePosition(node, mode);
}

function BiologicalHumanSystems({ onEnterFood }: { onEnterFood: () => void }) {
  const [focus, setFocus] = useState<FocusMode>("ALL");
  const [motion, setMotion] = useState<MotionState>("REST");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const setBiologicalFocus = (next: FocusMode) => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setMotion("SENSE");
    timers.current.push(window.setTimeout(() => {
      setFocus(next);
      setMotion("RESPOND");
    }, 90));
    timers.current.push(window.setTimeout(() => setMotion("SETTLE"), 760));
  };

  const allNodes = useMemo(() => [...SYSTEM_NODES, ...FOOD_NODES], []);

  return (
    <section
      className={`bio-sapiens bio-focus-${focus.toLowerCase()} bio-motion-${motion.toLowerCase()}`}
      style={{ "--bio-accent": SAPIENS_ACCENT } as CSSProperties}
      aria-labelledby="bio-sapiens-title"
    >
      <div className="bio-topline" aria-label="Prototype identity">
        <span>4PLANET_ / S4PIENS_ / HUMAN SYSTEMS</span>
        <span>BIOLOGICAL INTERACTION STUDY · DESIGN METAPHOR, NOT ECOLOGICAL EVIDENCE</span>
      </div>

      <div className="bio-intro">
        <span className="bio-kicker">HOMO SAPIENS · HUMAN SYSTEMS ATLAS</span>
        <h1 id="bio-sapiens-title">What does a human need?</h1>
        <p>
          Start with one species. Choose a need. The surrounding system reorganises around the question before you enter the deeper journey.
        </p>
      </div>

      <div className="bio-stage" data-motion={motion}>
        <svg className="bio-vascular" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="50" cy="50" r="13" className="bio-core-field" />
          {SYSTEM_NODES.map((node) => {
            const [x, y] = nodePosition(node, focus);
            return <path key={`human-${node.id}`} d={`M 50 50 Q ${(50 + x) / 2} ${(50 + y) / 2 - 2} ${x} ${y}`} className={`bio-link bio-link-system is-${node.relevance}`} />;
          })}
          {focus === "FOOD" && VASCULAR_LINKS.map(([from, to], index) => {
            const [x1, y1] = pointById(from, focus);
            const [x2, y2] = pointById(to, focus);
            const bendX = (x1 + x2) / 2 + (index % 2 === 0 ? -2.2 : 2.2);
            const bendY = (y1 + y2) / 2;
            return <path key={`${from}-${to}`} d={`M ${x1} ${y1} Q ${bendX} ${bendY} ${x2} ${y2}`} className="bio-link bio-link-food" />;
          })}
        </svg>

        <div className="bio-human-core" aria-label="Homo sapiens is the stable reference point">
          <span>SPECIES_</span>
          <strong>HOMO<br />SAPIENS</strong>
          <small>THE STABLE REFERENCE</small>
        </div>

        {allNodes.map((node) => {
          const isFoodDetail = FOOD_NODES.some((candidate) => candidate.id === node.id);
          const recedes = focus === "FOOD" && node.relevance === "recede";
          const isFood = node.id === "food";
          return (
            <button
              key={node.id}
              type="button"
              className={`bio-node ${isFoodDetail ? "bio-node-detail" : "bio-node-system"} is-${node.relevance} ${recedes ? "is-receding" : ""} ${isFood && focus === "FOOD" ? "is-selected" : ""}`}
              style={cssPosition(node, focus)}
              onClick={() => isFood ? setBiologicalFocus("FOOD") : undefined}
              aria-pressed={isFood ? focus === "FOOD" : undefined}
              tabIndex={isFoodDetail && focus !== "FOOD" ? -1 : 0}
            >
              <span>{node.kicker}</span>
              <strong>{node.label}</strong>
            </button>
          );
        })}

        <div className="bio-state" aria-live="polite">
          <span>STATE</span>
          <strong>{motion}</strong>
          <small>{focus === "FOOD" ? "FOOD relevance field active" : "System at equilibrium"}</small>
        </div>

        <div className="bio-legend" aria-label="Biological interaction legend">
          <span><i className="bio-dot bio-dot-human" /> HUMAN</span>
          <span><i className="bio-dot bio-dot-system" /> SYSTEM</span>
          <span><i className="bio-dot bio-dot-food" /> FOOD CONTEXT</span>
          <small>LINE WEIGHT = INTERFACE RELEVANCE · NOT ECOLOGICAL CAUSAL STRENGTH</small>
        </div>
      </div>

      <div className="bio-controls">
        <div>
          <span className="bio-kicker">TROPISM / RELEVANCE ATTRACTION</span>
          <p>{focus === "FOOD" ? "FOOD pulls relevant systems inward. Lower-relevance contexts remain present but recede." : "The system is resting. Select FOOD_ to create an attraction field."}</p>
        </div>
        <div className="bio-actions" role="group" aria-label="Human Systems focus">
          <button type="button" className={focus === "ALL" ? "is-active" : ""} onClick={() => setBiologicalFocus("ALL")}>ALL SYSTEMS</button>
          <button type="button" className={focus === "FOOD" ? "is-active is-food" : "is-food"} onClick={() => setBiologicalFocus("FOOD")}>FOOD_</button>
          <button type="button" className="bio-enter" onClick={() => { if (focus !== "FOOD") setFocus("FOOD"); onEnterFood(); }}>ENTER FOOD_ GOLD JOURNEY ↓</button>
        </div>
      </div>
    </section>
  );
}

export default function SapiensBiologicalExperiment() {
  const enterFood = () => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("s4x-food")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <BiologicalHumanSystems onEnterFood={enterFood} />
      <SapiensAtlasSandbox />
    </>
  );
}
