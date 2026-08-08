import type { CanonicalSolutionType, DecisionReadyEvidencePack, EvidenceItem } from "./contracts";

/**
 * Public-safe projection boundary.
 * Internal hypotheses, unreviewed claims, weak entity matches, internal needs,
 * GOLD review designations and internal gaps are never projected implicitly.
 */
const publicEvidence = (item: EvidenceItem): boolean =>
  item.reviewStatus !== "UNREVIEWED" && item.reviewStatus !== "REJECTED";

export interface PublicEvidencePack {
  decisionQuestion: string;
  problem: {
    problemId: string;
    title: string;
    statement: string;
    scope: string;
  };
  solutions: Array<{
    solutionId: string;
    title: string;
    canonicalType: CanonicalSolutionType;
    limitations: string[];
  }>;
  evidence: EvidenceItem[];
  implementationCount: number;
  observedOutcomeCount: number;
  sourceCount: number;
  disclosure: string;
}

export function projectEvidencePackPublic(pack: DecisionReadyEvidencePack): PublicEvidencePack {
  const evidence = [...pack.supports, ...pack.qualifies, ...pack.challenges].filter(publicEvidence);
  const sourceCount = new Set(evidence.flatMap((item) => item.sources.map((source) => source.sourceRecordId))).size;
  const solutions = [
    ...pack.solutionLandscape.pathways,
    ...pack.solutionLandscape.interventions,
    ...pack.solutionLandscape.offerings,
  ].map(({ solutionId, title, canonicalType, limitations }) => ({ solutionId, title, canonicalType, limitations }));

  return {
    decisionQuestion: pack.decisionQuestion,
    problem: {
      problemId: pack.problem.problemId,
      title: pack.problem.title,
      statement: pack.problem.statement,
      scope: pack.problem.scope,
    },
    solutions,
    evidence,
    implementationCount: pack.implementations.records.length,
    observedOutcomeCount: pack.observedOutcomes.length,
    sourceCount,
    disclosure:
      "Evidence summaries are contextual and source-linked. Solution relevance is not proof of effectiveness; implementation is not outcome; policy existence is not ecological result; local applicability requires separate verification.",
  };
}
