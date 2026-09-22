import LabsProjectDetailPremium from "./LabsProjectDetailPremium";
import { withCompleteMeta } from "./labsCompleteMeta";
import type { LabProject } from "./labsFreshProjection";

export default function LabsProjectDetailV5({ project }: { project: LabProject }) {
  return <LabsProjectDetailPremium project={withCompleteMeta(project)} />;
}
