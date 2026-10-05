import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import discovery from "@/data/discoveryInventory.json";
import { speciesBySlug } from "@/data/species";
import { speciesSourceEnvelopeBySlug } from "@/data/speciesSourceEnvelope";
import { hasShowableImage, speciesMedia } from "@/data/speciesMedia";
import { SpeciesEvidenceSeam } from "@/components/species/SpeciesEvidenceSeam";
import { UniversalSpeciesProfilePage } from "@/pages/integrated/UniversalSpeciesProfilePage";
import { Seo } from "@/components/Seo";

export function SpeciesRoute({ curatedElement }: { curatedElement: ReactNode }) {
  const { slug = "" } = useParams();
  const curated = speciesBySlug(slug);
  const envelope = speciesSourceEnvelopeBySlug(slug);
  const discoveryItem = discovery.species.find((item) => item.slug === slug);
  const media = curated && hasShowableImage(slug) ? speciesMedia(slug) : undefined;
  const sourceUrls = envelope?.records.map((record) => record.sourceUrl) ?? [];
  const limitations = envelope?.forbiddenInferences ?? [];
  const relatedPlaces = curated ? discovery.places.filter((place) => place.indexable && place.relatedSpecies.some((species) => species.slug === slug && species.state === "CURATED")) : [];
  const title = curated ? discoveryItem?.title || `${curated.commonName} (${curated.scientificName}) — 4PLANET SPECIES` : "Universal Species Profile — 4PLANET SPECIES";
  const description = curated
    ? discoveryItem?.description || curated.intro || curated.habitat || `Source-grounded profile for ${curated.commonName} with ATLAS context and reported observations.`
    : "Source-materialised taxon profile. Universal profiles remain noindex until they pass the curated 4PLANET publication threshold.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={`/species/${slug}`}
        image={media?.localPath}
        imageAlt={discoveryItem?.imageAlt || (curated ? `${curated.commonName} — 4PLANET SPECIES` : "4PLANET SPECIES")}
        robots={curated ? "index,follow,max-image-preview:large" : "noindex,follow"}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: canonicalUrl,
          dateModified: discoveryItem?.reviewedAt || discovery.updatedAt,
          image: media?.localPath ? new URL(media.localPath, canonicalUrl).toString() : undefined,
          citation: sourceUrls,
          mainEntity: curated ? {
            "@type": "Taxon",
            name: curated.commonName,
            alternateName: curated.scientificName,
            scientificName: curated.scientificName,
            taxonRank: curated.rank.toLowerCase(),
            sameAs: sourceUrls.length > 0 ? sourceUrls : [curated.taxonSourceUrl],
          } : undefined,
          about: curated ? { "@type": "Thing", name: curated.commonName, alternateName: curated.scientificName } : undefined,
          subjectOf: discoveryItem?.atlasHref ? { "@type": "WebPage", url: new URL(discoveryItem.atlasHref, canonicalUrl).toString(), name: `${curated?.commonName || "Species"} in 4PLANET ATLAS` } : undefined,
          disambiguatingDescription: limitations.length > 0 ? limitations.join(" ") : undefined,
        })}
      />
      {curated ? curatedElement : <UniversalSpeciesProfilePage />}
      <SpeciesEvidenceSeam envelope={envelope} />
      {curated && relatedPlaces.length > 0 ? (
        <nav aria-label={`Places connected to ${curated.commonName}`} style={{ padding: "24px clamp(20px,5vw,64px) 40px", borderTop: "1px solid rgba(0,0,0,.12)" }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6 }}>EXPLORE WHERE IT LIVES / 4PLANET PLACE_</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {relatedPlaces.map((place) => <Link key={place.slug} to={`/place/${place.slug}`} style={{ color: "inherit", fontWeight: 600 }}>{place.name} →</Link>)}
          </div>
        </nav>
      ) : null}
    </>
  );
}
export default SpeciesRoute;
