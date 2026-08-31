import { DOMAIN_ACCENT } from "@/styles/tokens";

export type LumeRoomNode = {
  id: "identity" | "culture" | "place" | "boundary";
  label: string;
  status: "KNOWN" | "BOUNDARY";
  projection?: "map";
  title: string;
  body: string;
  limit: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type LumeRoomManifest = {
  id: string;
  domain: "OCE4N_";
  accent: string;
  species: {
    commonName: string;
    scientificName: string;
    taxonLabel: string;
    group: string;
    range: string;
    profileRoute: string;
  };
  visual: {
    src: string;
    alt: string;
    disclosure: string;
    checksum: string;
  };
  audio: {
    src: string;
    label: string;
    kind: "FIELD RECORDING";
    place: string;
    credit: string;
    sourceLabel: string;
    sourceUrl: string;
    usage: string;
    checksum: string;
  };
  proceduralSoundDisclosure: string;
  nodes: readonly LumeRoomNode[];
};

export const LUME_ORCA_ROOM: LumeRoomManifest = {
  id: "lume-room-03-orca",
  domain: "OCE4N_",
  accent: DOMAIN_ACCENT.OCE4N_,
  species: {
    commonName: "ORCA",
    scientificName: "Orcinus orca",
    taxonLabel: "GBIF 2440483",
    group: "MARINE MAMMAL",
    range: "ALL OCEANS",
    profileRoute: "/species/orca",
  },
  visual: {
    src: "/assets/species/orca/lume-orca-v1.png",
    alt: "Generated natural-history visualisation of a full-body Orca, Orcinus orca",
    disclosure: "AI-GENERATED SPECIES VISUALISATION · NOT EVIDENCE / NOT A PHOTOGRAPH",
    checksum: "sha256:43c4c2dd8bb358d529fcdc7351d866194c049c3737bed2c0efae2b26f3fcbaf9",
  },
  audio: {
    src: "/assets/species/orca/audio/nps-glacier-bay-orca-echolocation.mp3",
    label: "KILLER WHALE ECHOLOCATION CLICKS",
    kind: "FIELD RECORDING",
    place: "GLACIER BAY, ALASKA",
    credit: "NPS / C. GABRIELE",
    sourceLabel: "NATIONAL PARK SERVICE · GLACIER BAY",
    sourceUrl: "https://www.nps.gov/media/video/view.htm?id=802469FB-2FB2-4319-914E-423F39DF03A8",
    usage: "NPS-CREDITED PUBLIC-DOMAIN MEDIA",
    checksum: "sha256:c79f813ebee83f653d493c4f57050db6276e1e8af1ae9c4d78a14672c628fd67",
  },
  proceduralSoundDisclosure: "PROCEDURAL ROOM RESPONSE · NOT AN ANIMAL RECORDING",
  nodes: [
    {
      id: "identity",
      label: "IDENTITY",
      status: "KNOWN",
      title: "One species. Many different lives.",
      body: "Orcinus orca is the accepted species identity. It is the largest member of the dolphin family and occurs across the world’s oceans.",
      limit: "Taxonomy does not identify a population, pod, health state or present location.",
      sourceLabel: "GBIF · TAXON 2440483",
      sourceUrl: "https://www.gbif.org/species/2440483",
    },
    {
      id: "culture",
      label: "CULTURE",
      status: "KNOWN",
      title: "Calls can carry group identity.",
      body: "Killer whale populations can differ in calls, diet, behaviour, social structure and habitat use. Knowledge at species level is only the beginning.",
      limit: "This room does not infer dialect, ecotype or pod from a generic species identity.",
      sourceLabel: "NOAA FISHERIES · KILLER WHALE",
      sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
    },
    {
      id: "place",
      label: "PLACE",
      status: "KNOWN",
      projection: "map",
      title: "One species across every ocean.",
      body: "Killer whales occur in all oceans. That global species range contains distinct local populations, habitats, diets and cultures.",
      limit: "This schematic map is species-level orientation, not a live track, migration route, population range or abundance surface.",
      sourceLabel: "NOAA FISHERIES · RANGE",
      sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
    },
    {
      id: "boundary",
      label: "EVIDENCE",
      status: "BOUNDARY",
      title: "A record is not a live track.",
      body: "An occurrence can show that a human observation was published for a stated place and date. It cannot establish range, abundance, trend or ecological change on its own.",
      limit: "Population, pod, current location and migration remain unknown until specific evidence supports them.",
      sourceLabel: "GBIF · OCCURRENCE BOUNDARY",
      sourceUrl: "https://www.gbif.org/occurrence/5939349319",
    },
  ],
};
