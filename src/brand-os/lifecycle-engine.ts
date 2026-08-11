export type LifecycleStage = "DISCOVER" | "UNDERSTAND" | "FOLLOW" | "RETURN" | "PARTICIPATE" | "PROOF";
export type LifecycleSurface = "web" | "atlas" | "species" | "impact" | "newsletter" | "event" | "field";

export interface LifecycleEvent {
  eventId: string;
  anonymousSubjectId: string;
  storyId: string | null;
  stage: LifecycleStage;
  surface: LifecycleSurface;
  action: string;
  occurredAt: string;
  consentState: "NOT_REQUIRED" | "ANONYMOUS" | "CONSENTED" | "WITHDRAWN";
  metadata: Record<string, string | number | boolean>;
}

export interface LifecycleSummary {
  anonymousSubjectId: string;
  highestStage: LifecycleStage;
  eventCount: number;
  storyIds: string[];
  lastSeenAt: string;
  nextOwnedAction: string;
}

const stageOrder: LifecycleStage[] = ["DISCOVER", "UNDERSTAND", "FOLLOW", "RETURN", "PARTICIPATE", "PROOF"];

export function createLifecycleEvent(input: Omit<LifecycleEvent, "eventId" | "occurredAt">, now = new Date()): LifecycleEvent {
  if (!input.anonymousSubjectId.trim()) throw new Error("Lifecycle events require a pseudonymous/anonymous subject ID.");
  if (!input.action.trim()) throw new Error("Lifecycle action is required.");
  if (input.consentState === "WITHDRAWN" && input.surface === "newsletter") {
    throw new Error("Newsletter events may not be recorded after consent withdrawal except through a separate compliance log.");
  }

  return {
    ...input,
    eventId: `LCE-${input.anonymousSubjectId}-${now.getTime()}`,
    occurredAt: now.toISOString(),
  };
}

export function summarizeLifecycle(events: LifecycleEvent[]): LifecycleSummary | null {
  if (!events.length) return null;
  const subject = events[0].anonymousSubjectId;
  const scoped = events
    .filter((event) => event.anonymousSubjectId === subject)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  const highestStage = scoped.reduce<LifecycleStage>((highest, event) => (
    stageOrder.indexOf(event.stage) > stageOrder.indexOf(highest) ? event.stage : highest
  ), "DISCOVER");

  const nextOwnedAction: Record<LifecycleStage, string> = {
    DISCOVER: "Offer a canonical story or species/place destination.",
    UNDERSTAND: "Offer FOLLOW for the living subject/place without forcing a transaction.",
    FOLLOW: "Return with a meaningful signal, field note or change — not a generic newsletter blast.",
    RETURN: "Offer a credible role only when the story and evidence justify participation.",
    PARTICIPATE: "Return proof, outcome state or correction connected to the original participation.",
    PROOF: "Maintain continuity: what changed next, what remains uncertain, and where the living system goes from here.",
  };

  return {
    anonymousSubjectId: subject,
    highestStage,
    eventCount: scoped.length,
    storyIds: [...new Set(scoped.map((event) => event.storyId).filter((storyId): storyId is string => Boolean(storyId)))],
    lastSeenAt: scoped[scoped.length - 1].occurredAt,
    nextOwnedAction: nextOwnedAction[highestStage],
  };
}

export function isLifecycleProgressionValid(events: LifecycleEvent[]): boolean {
  const ordered = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  let highest = -1;

  for (const event of ordered) {
    const current = stageOrder.indexOf(event.stage);
    if (current < 0) return false;
    if (current > highest + 1 && highest >= 0) return false;
    highest = Math.max(highest, current);
  }

  return true;
}
