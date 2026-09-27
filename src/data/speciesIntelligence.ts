import { searchOpenAlexWorks, type OpenAlexSearchResult } from "./providers/openAlexWorkAdapter";
import { fetchGlobiInteractions, type GlobiSearchResult } from "./providers/globiInteractionAdapter";

export interface SpeciesIntelligenceBundle {
  schema:"4PLANET_SPECIES_INTELLIGENCE_BUNDLE_01";
  scientificName:string;checkedAt:string;
  research:OpenAlexSearchResult;
  interactions:GlobiSearchResult;
  truthBoundary:{
    researchSearchIsNotFinding:boolean;
    indexedInteractionIsNotUniversalBehaviour:boolean;
    sourceRecordNeedsOriginalProvenance:boolean;
  };
}

export async function fetchSpeciesIntelligence(
  scientificName:string,checkedAt:string,
  options:{
    fetcher?:typeof fetch;signal?:AbortSignal;openAlexApiKey?:string;researchLimit?:number;interactionLimit?:number;
  }={}
):Promise<SpeciesIntelligenceBundle>{
  const [research,interactions]=await Promise.all([
    searchOpenAlexWorks(`"${scientificName}"`,checkedAt,{fetcher:options.fetcher,signal:options.signal,apiKey:options.openAlexApiKey,limit:options.researchLimit??6}),
    fetchGlobiInteractions(scientificName,checkedAt,{fetcher:options.fetcher,signal:options.signal,limit:options.interactionLimit??12}),
  ]);
  return {
    schema:"4PLANET_SPECIES_INTELLIGENCE_BUNDLE_01",scientificName,checkedAt,research,interactions,
    truthBoundary:{researchSearchIsNotFinding:true,indexedInteractionIsNotUniversalBehaviour:true,sourceRecordNeedsOriginalProvenance:true},
  };
}
