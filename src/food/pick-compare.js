import { classifyHealthProfile, evaluateHealth, healthComparisonMetrics } from "./pick-health.js";

export const PICK_COMPARE_VERSION = "p18-pick-compare-0.6.0";

const finite = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const reliable = (product) => product && !["malformed", "conflicted"].includes(product.dataQuality?.state);

const CONTROLLED_UPGRADES = new Set([
  "refined_bread>wholegrain_bread",
  "refined_pasta>wholegrain_pasta",
]);

const CONTROLLED_DOWNGRADES = new Set([
  "wholegrain_bread>refined_bread",
  "wholegrain_pasta>refined_pasta",
]);

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
  const candidateHealth = evaluateHealth(candidate);
  const sameProfile = baselineProfile.id !== "unknown" && baselineProfile.id === candidateProfile.id;
  const sameFamily = baselineProfile.family !== "unknown" && baselineProfile.family === candidateProfile.family;
  const transition = `${baselineProfile.id}>${candidateProfile.id}`;
  const controlledUpgrade = CONTROLLED_UPGRADES.has(transition);
  const controlledDowngrade = CONTROLLED_DOWNGRADES.has(transition);

  if (!reliable(baseline) || !reliable(candidate)) {
    return { eligible: false, relation: "BLOCKED", reason: "One product record is conflicted or malformed.", profile: candidateProfile, health: candidateHealth, comparisons: [], state: "INSUFFICIENT EVIDENCE" };
  }

  if (!sameProfile && !controlledUpgrade) {
    const reason = controlledDowngrade
      ? "This is a controlled move away from the preferred wholegrain variant, not an upgrade."
      : sameFamily
        ? "Same broader food family, but not a controlled direct substitute or upgrade."
        : "Different functional food categories.";
    return { eligible: false, relation: controlledDowngrade ? "CONTROLLED DOWNGRADE" : sameFamily ? "ADJACENT" : "NOT COMPARABLE", reason, profile: candidateProfile, health: candidateHealth, comparisons: [], state: "NOT A RECOMMENDED SUBSTITUTE" };
  }

  const relation = controlledUpgrade ? "CONTROLLED UPGRADE" : "DIRECT";
  const reason = controlledUpgrade
    ? `Same functional family with a controlled wholegrain upgrade: ${baselineProfile.label} → ${candidateProfile.label}.`
    : `Same controlled profile: ${baselineProfile.label}.`;
  const metricProfile = controlledUpgrade ? candidateProfile.id : baselineProfile.id;
  const metrics = healthComparisonMetrics(metricProfile);
  if (!metrics.length) {
    return { eligible: true, relation, reason, profile: candidateProfile, health: candidateHealth, comparisons: [], state: controlledUpgrade ? "PREFERRED CATEGORY UPGRADE" : "NO CONTROLLED COMPOSITION DIFFERENCE" };
  }

  const comparisons = metrics.map((metric) => metricComparison(baseline, candidate, metric));
  const complete = comparisons.every((item) => item.known);
  if (!complete) {
    return { eligible: true, relation, reason, profile: candidateProfile, health: candidateHealth, comparisons, state: controlledUpgrade ? "PREFERRED CATEGORY UPGRADE · PARTIAL COMPOSITION DATA" : "INSUFFICIENT COMPARABLE DATA" };
  }
  const favourable = comparisons.filter((item) => item.favourable).length;
  const adverse = comparisons.filter((item) => item.adverse).length;
  const state = controlledUpgrade
    ? adverse > 0 ? "CATEGORY UPGRADE · COMPOSITION TRADE-OFF" : "PREFERRED CATEGORY UPGRADE"
    : favourable > 0 && adverse === 0 ? "BETTER ON CONTROLLED COMPOSITION" : adverse > 0 && favourable > 0 ? "TRADE-OFF" : adverse > 0 ? "WORSE ON CONTROLLED COMPOSITION" : "NO CLEAR ADVANTAGE";
  return { eligible: true, relation, reason, profile: candidateProfile, health: candidateHealth, comparisons, state };
}

export function rankPickAlternatives(baseline, alternatives) {
  if (!baseline || !Array.isArray(alternatives)) return [];
  const evaluated = alternatives.map((product) => ({ product, ...compareHealthAlternative(baseline, product) }));
  const order = {
    "PREFERRED CATEGORY UPGRADE": 0,
    "PREFERRED CATEGORY UPGRADE · PARTIAL COMPOSITION DATA": 1,
    "BETTER ON CONTROLLED COMPOSITION": 2,
    "NO CLEAR ADVANTAGE": 3,
    "CATEGORY UPGRADE · COMPOSITION TRADE-OFF": 4,
    "TRADE-OFF": 5,
    "INSUFFICIENT COMPARABLE DATA": 6,
    "NO CONTROLLED COMPOSITION DIFFERENCE": 7,
    "WORSE ON CONTROLLED COMPOSITION": 8,
    "NOT A RECOMMENDED SUBSTITUTE": 9,
    "INSUFFICIENT EVIDENCE": 10,
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
