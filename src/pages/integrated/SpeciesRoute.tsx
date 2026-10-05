import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { speciesBySlug } from "@/data/species";
import { speciesSourceEnvelopeBySlug } from "@/data/speciesSourceEnvelope";
import { SpeciesEvidenceSeam } from "@/components/species/SpeciesEvidenceSeam";
import { UniversalSpeciesProfilePage } from "@/pages/integrated/UniversalSpeciesProfilePage";
import { Seo } from "@/components/Seo";

export function SpeciesRoute({ curatedElement }: { curatedElement: ReactNode }) {
  const { slug = "" } = useParams();
  const curated = speciesBySlug(slug);
  const envelope = speciesSourceEnvelopeBySlug(slug);
  const humanFirstOrca = curated?.slug === "orca";
  const title = curated ? `${curated.commonName} (${curated.scientificName}) — 4PLANET SPECIES` : "Universal Species Profile — 4PLANET SPECIES";
  const description = curated
    ? curated.intro || curated.habitat || `Source-grounded profile for ${curated.commonName} with ATLAS context and reported observations.`
    : "Source-materialised taxon profile. Universal profiles remain noindex until they pass the curated 4PLANET publication threshold.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={`/species/${slug}`}
        robots={curated ? "index,follow,max-image-preview:large" : "noindex,follow"}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: canonicalUrl,
          about: curated ? { "@type": "Thing", name: curated.commonName, alternateName: curated.scientificName, sameAs: curated.taxonSourceUrl } : undefined,
        })}
      />
      {curated ? curatedElement : <UniversalSpeciesProfilePage />}
      {!humanFirstOrca ? <SpeciesEvidenceSeam envelope={envelope} /> : null}
    </>
  );
}
export default SpeciesRoute;
