import type { DecisionReadyEvidencePack, EvidenceItem } from "./contracts";

/**
 * Public-safe projection boundary.
 * Internal hypotheses, unreviewed claims, weak entity matches and internal gaps
 * are removed before any future public interface receives the payload.
 */
const publicEvidence = (item: EvidenceItem): boolean =>
  item.reviewStatus !== "UNREVIEWED" && item.reviewStatus !== "REJECTED";

export interface PublicEvidencePack {
  decisionQuestion: string;
  problem: {
    problemId: string;
    title: string;
    statement: string;
  };
  solutions: Array<{
    solutionId: string;
    title: string;
    level: "PATHWAY" | "INTERVENTION" | "VARIANT";
    limitations: string[];
  }>;
  evidence: EvidenceItem[];
  implementationCount: number;
  sourceCount: number;
  disclosure: string;
}

export function projectEvidencePackPublic(pack: DecisionReadyEvidencePack): PublicEvidencePack {
  const evidence = [...pack.supports, ...pack.qualifies, ...pack.challenges].filter(publicEvidence);
  const sourceCount = new Set(evidence.flatMap((item) => item.sources.map((source) => source.sourceRecordId))).size;
  const solutions = [
    ...pack.solutionLandscape.pathways,
    ...pack.solutionLandscape.interventions,
    ...pack.solutionLandscape.variants,
  ].map(({ solutionId, title, level, limitations }) => ({ solutionId, title, level, limitations }));

  return {
    decisionQuestion: pack.decisionQuestion,
    problem: {
      problemId: pack.problem.problemId,
      title: pack.problem.title,
      statement: pack.problem.statement,
    },
    solutions,
    evidence,
    implementationCount: pack.implementations.records.length,
    sourceCount,
    disclosure:
      "Evidence summaries are contextual and source-linked. They do not establish universal effectiveness, safety or local applicability.",
  };
}
