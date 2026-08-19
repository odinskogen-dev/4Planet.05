export type RelationClass = "DEPENDENCY" | "PRESSURE" | "RESPONSE";
export type RelationshipEvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface SpeciesRelationshipRecord {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationClass: RelationClass;
  relationshipType: string;
  state: RelationshipEvidenceState;
  commonName: string;
  scientificName: string;
  relationshipLabel: string;
  relation: string;
  boundary: string;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string;
  atlasHref?: string;
}

/**
 * Canonical, source-bounded inter-species relationships used across SPECIES,
 * Living Systems and rendering lenses. These records describe only the cited
 * relationship and must not be promoted into local abundance, diet-share,
 * range or ecological-condition claims.
 */
export const SPECIES_RELATIONSHIPS: SpeciesRelationshipRecord[] = [
  {
    id: "relationship:4p:jaguar-capybara-prey-southern-pantanal",
    fromEntityId: "taxon:gbif:5219426",
    toEntityId: "taxon:gbif:2437610",
    relationClass: "DEPENDENCY",
    relationshipType: "PREY",
    state: "KNOWN",
    commonName: "Capybara",
    scientificName: "Hydrochoerus hydrochaeris",
    relationshipLabel: "DOCUMENTED JAGUAR PREY · SOUTHERN PANTANAL STUDY CONTEXT",
    relation: "Capybara is a documented jaguar prey taxon in a bounded Southern Pantanal diet-study context.",
    boundary: "The cited study is from the Southern Pantanal and its field data span November 2001–April 2004. This does not imply the same dietary importance elsewhere, diagnose an Amazon diet, establish local prey availability or create a Capybara Species World before that profile is ready.",
    sourceLabel: "PERILLI ET AL. 2016 · PLOS ONE",
    sourceUrl: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0151814",
    checkedAt: "2026-08-19",
    atlasHref: "/atlas?entity=taxon%3Agbif%3A2437610&journey=jaguar-living-web",
  },
];

export const speciesRelationshipById = (id: string) => SPECIES_RELATIONSHIPS.find((relationship) => relationship.id === id);
