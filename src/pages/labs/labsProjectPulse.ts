import type { GoldLabProject } from "./labsGoldMeta";
import { humanStateFor } from "./labsHumanState";
import { wbsProjectionFor } from "./labsWbsProjection";

export type PulseWorkItem = {
  state: string;
  text: string;
  owner?: string;
};

export type ProjectPulse = {
  why: string;
  current: string;
  owner: string;
  authority: string;
  aiPlan: string;
  proof: string;
  freshness: string;
  workNow: PulseWorkItem[];
  workNext: PulseWorkItem[];
  waiting: PulseWorkItem[];
  founder: PulseWorkItem[];
  wbsSummary: string;
  digitalState: string;
};

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function unique(items: PulseWorkItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = clean(item.text).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function taskItems(project: GoldLabProject, states: string[]): PulseWorkItem[] {
  return (project.tasks ?? [])
    .filter((item) => states.includes(item.state.toUpperCase()))
    .map((item) => ({ state: item.state, text: item.text, owner: item.owner }));
}

function processItems(project: GoldLabProject): PulseWorkItem[] {
  return (project.processes ?? [])
    .filter((item) => /ACTIVE|NOW|BUILD|READY|OPEN|GATED/i.test(item.state))
    .map((item) => ({ state: item.state, text: `${item.name} — ${item.text}`, owner: "AI / SYSTEM" }));
}

function roadmapItems(project: GoldLabProject, stage: RegExp): PulseWorkItem[] {
  return (project.roadmap ?? [])
    .filter((item) => stage.test(item.stage) || stage.test(item.title))
    .map((item) => ({ state: item.stage, text: `${item.title} — ${item.text}` }));
}

export function projectPulseFor(project: GoldLabProject): ProjectPulse {
  const brainWbs = wbsProjectionFor(project);

  const derivedNow = unique([
    ...taskItems(project, ["ACTIVE", "NOW", "BUILDING", "READY"]),
    ...processItems(project),
    ...roadmapItems(project, /NOW|ACTIVE/i),
  ]).slice(0, 4);

  const derivedNext = unique([
    ...taskItems(project, ["NEXT", "QUEUED", "GATED"]),
    ...roadmapItems(project, /NEXT|LATER/i),
    { state: "NEXT GATE", text: project.control.nextGate },
  ]).slice(0, 4);

  const derivedWaiting = unique([
    ...taskItems(project, ["WAITING", "BLOCKED", "HOLD"]),
  ]).slice(0, 4);

  const workNow = brainWbs?.now.length
    ? brainWbs.now.map((text) => ({ state: "BRAIN WBS", text, owner: "CURRENT PROJECT" }))
    : derivedNow.length ? derivedNow : [{ state: "CURRENT", text: project.control.nextGate }];

  const workNext = brainWbs?.next.length
    ? brainWbs.next.map((text) => ({ state: "NEXT", text }))
    : derivedNext;

  const waiting = brainWbs?.waiting.length
    ? brainWbs.waiting.map((text) => ({ state: "WAITING / GATED", text }))
    : derivedWaiting;

  const founder = unique((project.founderDecisions ?? []).map((text) => ({
    state: "FOUNDER",
    text,
    owner: "FOUNDER",
  }))).slice(0, 3);

  const explicitWork = (project.tasks?.length ?? 0) + (project.processes?.length ?? 0) + (project.roadmap?.length ?? 0);
  const wbsSummary = brainWbs
    ? `${brainWbs.source}. Current gate: ${brainWbs.gate} Full task-detail truth remains in BRAIN / WBS / Atomic.`
    : explicitWork
      ? `${explicitWork} projected work / process / roadmap items available on this LABS view. Full task-detail truth remains in BRAIN / WBS / Atomic.`
      : "No task-level WBS items are projected on this public-safe view yet. The controlled Project Goal and Next Gate remain the execution boundary; detailed WBS stays in BRAIN rather than being invented here.";

  const digitalState = project.control.links.length
    ? `${project.control.links.length} verified or controlled digital link${project.control.links.length === 1 ? "" : "s"} projected. Leading One is shown first.`
    : "No verified Founder-facing digital home is projected right now. Broken, stale or unverified URLs are withheld instead of guessed.";

  return {
    why: project.why || project.summary,
    current: humanStateFor(project),
    owner: project.owner || "UNKNOWN / NOT PROJECTED",
    authority: project.authority || "UNKNOWN / NOT PROJECTED",
    aiPlan: project.aiPlan || project.control.nextGate,
    proof: project.evidence || project.control.source,
    freshness: project.freshness || "UNKNOWN",
    workNow,
    workNext,
    waiting,
    founder,
    wbsSummary,
    digitalState,
  };
}
