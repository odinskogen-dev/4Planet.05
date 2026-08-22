import { useParams } from "react-router-dom";
import { speciesBySlug } from "@/data/species";
import { SpeciesProfilePage } from "@/pages/integrated/Species";
import { UniversalSpeciesProfilePage } from "@/pages/integrated/UniversalSpeciesProfilePage";

export function SpeciesRoute() {
  const { slug = "" } = useParams();
  const curated = speciesBySlug(slug);
  if (curated) return <SpeciesProfilePage />;
  return <UniversalSpeciesProfilePage />;
}

export default SpeciesRoute;
