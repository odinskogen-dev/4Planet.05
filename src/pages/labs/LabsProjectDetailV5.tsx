import LabsProjectDetailPremium from "./LabsProjectDetailPremium";
import { withProjectMeta } from "./labsProjectMeta";
import type { LabProject } from "./labsProjection";

export default function LabsProjectDetailV5({ project }: { project: LabProject }) {
  return <LabsProjectDetailPremium project={withProjectMeta(project)} />;
}
