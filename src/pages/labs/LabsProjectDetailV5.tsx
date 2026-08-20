import LabsProjectDetailPremium from "./LabsProjectDetailPremium";
import { withGoldMeta } from "./labsGoldMeta";
import type { LabProject } from "./labsFreshProjection";

export default function LabsProjectDetailV5({ project }: { project: LabProject }) {
  return <LabsProjectDetailPremium project={withGoldMeta(project)} />;
}
