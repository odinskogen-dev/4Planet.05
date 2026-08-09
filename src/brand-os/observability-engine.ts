import type { FounderIntervention, IncidentRecord, PublishJob } from "./types";
import { summarizeFounderBurden } from "./runtime";

export interface BrandOSHealthSnapshot {
  jobCount: number;
  queued: number;
  retryWaiting: number;
  deadLetter: number;
  succeeded: number;
  terminalFailureRate: number;
  oldestActiveJobAgeMinutes: number | null;
  openIncidentCount: number;
  highSeverityOpenIncidentCount: number;
  founderInterventionCount: number;
  founderMinutes: number;
  founderAverageSeconds: number;
  automationHealth: "HEALTHY" | "DEGRADED" | "BLOCKED" | "NO_DATA";
  reasons: string[];
}

export function buildHealthSnapshot(
  jobs: PublishJob[],
  incidents: IncidentRecord[],
  interventions: FounderIntervention[],
  now = new Date(),
): BrandOSHealthSnapshot {
  const active = jobs.filter((job) => ["QUEUED", "RUNNING", "RETRY_WAIT"].includes(job.state));
  const terminal = jobs.filter((job) => ["SUCCEEDED", "DEAD_LETTER", "CANCELLED"].includes(job.state));
  const deadLetter = jobs.filter((job) => job.state === "DEAD_LETTER").length;
  const succeeded = jobs.filter((job) => job.state === "SUCCEEDED").length;
  const burden = summarizeFounderBurden(interventions);
  const openIncidents = incidents.filter((incident) => incident.status !== "RESOLVED");
  const highOpen = openIncidents.filter((incident) => incident.severity === "HIGH" || incident.severity === "CRITICAL");
  const oldest = active.length
    ? Math.max(...active.map((job) => Math.max(0, now.getTime() - new Date(job.createdAt).getTime()))) / 60_000
    : null;
  const terminalFailureRate = terminal.length ? deadLetter / terminal.length : 0;
  const reasons: string[] = [];

  if (highOpen.length) reasons.push(`${highOpen.length} unresolved high/critical incident(s).`);
  if (deadLetter > 0) reasons.push(`${deadLetter} publish job(s) in dead letter.`);
  if (oldest !== null && oldest > 60) reasons.push(`Oldest active publish job is ${oldest.toFixed(1)} minutes old.`);
  if (terminalFailureRate > 0.05) reasons.push(`Terminal publish failure rate is ${(terminalFailureRate * 100).toFixed(1)}%.`);

  let automationHealth: BrandOSHealthSnapshot["automationHealth"] = "HEALTHY";
  if (!jobs.length && !incidents.length && !interventions.length) automationHealth = "NO_DATA";
  else if (highOpen.length || terminalFailureRate > 0.2) automationHealth = "BLOCKED";
  else if (reasons.length) automationHealth = "DEGRADED";

  return {
    jobCount: jobs.length,
    queued: jobs.filter((job) => job.state === "QUEUED").length,
    retryWaiting: jobs.filter((job) => job.state === "RETRY_WAIT").length,
    deadLetter,
    succeeded,
    terminalFailureRate,
    oldestActiveJobAgeMinutes: oldest,
    openIncidentCount: openIncidents.length,
    highSeverityOpenIncidentCount: highOpen.length,
    founderInterventionCount: burden.interventionCount,
    founderMinutes: burden.totalMinutes,
    founderAverageSeconds: burden.averageSeconds,
    automationHealth,
    reasons,
  };
}

export function safeAutonomyExpansionAllowed(snapshot: BrandOSHealthSnapshot): boolean {
  return snapshot.automationHealth === "HEALTHY"
    && snapshot.deadLetter === 0
    && snapshot.highSeverityOpenIncidentCount === 0
    && snapshot.jobCount > 0;
}
