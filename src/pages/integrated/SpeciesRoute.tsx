import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { speciesBySlug } from "@/data/species";
import { speciesSourceEnvelopeBySlug } from "@/data/speciesSourceEnvelope";
import { SpeciesEvidenceSeam } from "@/components/species/SpeciesEvidenceSeam";
import { UniversalSpeciesProfilePage } from "@/pages/integrated/UniversalSpeciesProfilePage";

export function SpeciesRoute({ curatedElement }: { curatedElement: ReactNode }) {
  const { slug = "" } = useParams();
  const curated = speciesBySlug(slug);
  const envelope = speciesSourceEnvelopeBySlug(slug);

  return (
    <>
      {curated ? curatedElement : <UniversalSpeciesProfilePage />}
      <SpeciesEvidenceSeam envelope={envelope} />
    </>
  );
}

export default SpeciesRoute;
