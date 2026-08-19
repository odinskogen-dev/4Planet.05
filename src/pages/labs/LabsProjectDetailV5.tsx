import LabsProjectDetailPremium from "./LabsProjectDetailPremium";
import { withCurrentProjectMeta } from "./labsCurrentMeta";
import type { LabProject } from "./labsFreshProjection";

export default function LabsProjectDetailV5({ project }: { project: LabProject }) {
  return <LabsProjectDetailPremium project={withCurrentProjectMeta(project)} />;
}
