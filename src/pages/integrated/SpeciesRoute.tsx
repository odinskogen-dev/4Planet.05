import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { speciesBySlug } from "@/data/species";
import { UniversalSpeciesProfilePage } from "@/pages/integrated/UniversalSpeciesProfilePage";

export function SpeciesRoute({ curatedElement }: { curatedElement: ReactNode }) {
  const { slug = "" } = useParams();
  const curated = speciesBySlug(slug);
  if (curated) return <>{curatedElement}</>;
  return <UniversalSpeciesProfilePage />;
}

export default SpeciesRoute;
