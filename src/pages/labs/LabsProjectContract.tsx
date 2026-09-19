import type { GoldLabProject } from "./labsGoldMeta";
import { projectContractFor } from "./labsProjectContractProjection";
import "./labsProjectContract.css";

function Block({ label, text, wide = false }: { label: string; text: string; wide?: boolean }) {
  return <article className={wide ? "labs-contract-card labs-contract-card--wide" : "labs-contract-card"}><span>{label}</span><p>{text || "UNKNOWN / NOT PROJECTED"}</p></article>;
}

export default function LabsProjectContract({ project }: { project: GoldLabProject }) {
  const contract = projectContractFor(project);
  if (!contract) return null;

  return <section className="labs-control-section labs-project-contract" aria-label="Project contract">
    <div className="labs-section-head labs-section-head--v4"><span>PROJECT CONTRACT</span><span>{contract.goalContractStatus} · {contract.source}</span></div>
    <div className="labs-contract-grid">
      <Block label="THEORY / HYPOTHESIS" text={contract.theory} wide />
      <Block label="SCOPE IN" text={contract.scopeIn} />
      <Block label="OUT / LATER" text={contract.outLater} />
      <Block label="OPERATING MODEL" text={contract.operatingModel} />
      <Block label="DECISION RIGHTS" text={contract.decisionRights} />
      <Block label="CAPITAL ROUTING" text={contract.capitalRouting} />
      <Block label="PROOF / SCIENCE / IP / RISK" text={contract.proofRisk} />
      <Block label="STRATEGIC ROLE + MECHANISMS" text={contract.strategicRole} wide />
    </div>
  </section>;
}
