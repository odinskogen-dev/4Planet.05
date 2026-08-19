import { classifyHealthProfile, evaluateHealth, healthComparisonMetrics } from "./pick-health.js";

export const PICK_COMPARE_VERSION = "p18-pick-compare-0.5.0";

const finite = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const reliable = (product) => product && !["malformed", "conflicted"].includes(product.dataQuality?.state);

function metricComparison(baseline, candidate, metric) {
  const base = finite(baseline?.nutrients?.[metric.key]);
  const next = finite(candidate?.nutrients?.[metric.key]);
  if (base === null || next === null) return { known: false, favourable: false, adverse: false, label: metric.label, text: `${metric.label}: missing comparable data` };
  const delta = next - base;
  const epsilon = 0.01;
  const favourable = metric.direction === "higher" ? delta > epsilon : delta < -epsilon;
  const adverse = metric.direction === "higher" ? delta < -epsilon : delta > epsilon;
  const relation = Math.abs(delta) <= epsilon ? "about the same" : `${Math.abs(delta).toFixed(1).replace(/\.0$/, "")} g ${delta < 0 ? "lower" : "higher"}`;
  return { known: true, favourable, adverse, label: metric.label, text: `${metric.label}: ${relation} per 100 g/ml` };
}

export function compareHealthAlternative(baseline, candidate) {
  const baselineProfile = classifyHealthProfile(baseline);
  const candidateProfile = classifyHealthProfile(candidate);
  const baselineHealth = evaluateHealth(baseline);
  const candidateHealth = evaluateHealth(candidate);
  const sameProfile = baselineProfile.id !== "unknown" && baselineProfile.id === candidateProfile.id;
  const sameFamily = baselineProfile.family !== "unknown" && baselineProfile.family === candidateProfile.family;

  if (!reliable(baseline) || !reliable(candidate)) {
    return { eligible: false, relation: "BLOCKED", reason: "One product record is conflicted or malformed.", profile: candidateProfile, health: candidateHealth, comparisons: [], state: "INSUFFICIENT EVIDENCE" };
  }
  if (!sameProfile) {
    return { eligible: false, relation: sameFamily ? "ADJACENT" : "NOT COMPARABLE", reason: sameFamily ? "Same broader food family, but not the same controlled health profile." : "Different functional food categories.", profile: candidateProfile, health: candidateHealth, comparisons: [], state: "NOT A DIRECT SUBSTITUTE" };
  }

  const metrics = healthComparisonMetrics(baselineProfile.id);
  if (!metrics.length) {
    return { eligible: true, relation: "DIRECT", reason: `Same controlled profile: ${baselineProfile.label}.`, profile: candidateProfile, health: candidateHealth, comparisons: [], state: "NO CONTROLLED COMPOSITION DIFFERENCE" };
  }

  const comparisons = metrics.map((metric) => metricComparison(baseline, candidate, metric));
  const complete = comparisons.every((item) => item.known);
  if (!complete) {
    return { eligible: true, relation: "DIRECT", reason: `Same controlled profile: ${baselineProfile.label}.`, profile: candidateProfile, health: candidateHealth, comparisons, state: "INSUFFICIENT COMPARABLE DATA" };
  }
  const favourable = comparisons.filter((item) => item.favourable).length;
  const adverse = comparisons.filter((item) => item.adverse).length;
  const state = favourable > 0 && adverse === 0 ? "BETTER ON CONTROLLED COMPOSITION" : adverse > 0 && favourable > 0 ? "TRADE-OFF" : adverse > 0 ? "WORSE ON CONTROLLED COMPOSITION" : "NO CLEAR ADVANTAGE";
  return { eligible: true, relation: "DIRECT", reason: `Same controlled profile: ${baselineProfile.label}.`, profile: candidateProfile, health: candidateHealth, comparisons, state };
}

export function rankPickAlternatives(baseline, alternatives) {
  if (!baseline || !Array.isArray(alternatives)) return [];
  const evaluated = alternatives.map((product) => ({ product, ...compareHealthAlternative(baseline, product) }));
  const order = {
    "BETTER ON CONTROLLED COMPOSITION": 0,
    "NO CLEAR ADVANTAGE": 1,
    "TRADE-OFF": 2,
    "INSUFFICIENT COMPARABLE DATA": 3,
    "NO CONTROLLED COMPOSITION DIFFERENCE": 4,
    "WORSE ON CONTROLLED COMPOSITION": 5,
    "NOT A DIRECT SUBSTITUTE": 6,
    "INSUFFICIENT EVIDENCE": 7,
  };
  return evaluated.sort((a, b) => {
    const stateDelta = (order[a.state] ?? 99) - (order[b.state] ?? 99);
    if (stateDelta) return stateDelta;
    const aComplete = a.product.dataQuality?.completeness ?? 0;
    const bComplete = b.product.dataQuality?.completeness ?? 0;
    if (aComplete !== bComplete) return bComplete - aComplete;
    return String(a.product.gtin).localeCompare(String(b.product.gtin));
  });
}
