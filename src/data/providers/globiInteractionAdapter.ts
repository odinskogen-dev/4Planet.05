import type { SourceRefreshSnapshot } from "../sourceRefresh";

export const GLOBI_INTERACTION_URL="https://api.globalbioticinteractions.org/interaction";
export const GLOBI_PROVIDER="Global Biotic Interactions (GloBI)";

export interface GlobiInteractionReference {
  sourceTaxonName:string;interactionType:string;targetTaxonName:string;
  sourceTaxonId?:string;targetTaxonId?:string;studyCitation?:string;studyExternalId?:string;studySourceCitation?:string;
}
export interface GlobiSearchResult {
  provider:typeof GLOBI_PROVIDER;providerId:string;canonicalLocator:string;scientificName:string;
  interactions:GlobiInteractionReference[];snapshot:SourceRefreshSnapshot;
  rights:"GLOBI_CC_BY_4_GENERAL_ORIGINAL_DATASET_PROVENANCE_REQUIRED";error?:string;
}
const fnv1a32=(input:string)=>{let hash=0x811c9dc5;for(let i=0;i<input.length;i+=1){hash^=input.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}return hash.toString(16).padStart(8,"0");};
const stripControlCharacters=(input:string)=>Array.from(input,(char)=>{const code=char.charCodeAt(0);return code<32||code===127?" ":char;}).join("");\nconst clean=(v:unknown,max=500)=>typeof v==="string"?stripControlCharacters(v).replace(/\\s+/g," ").trim().slice(0,max):"";
const pick=(row:Record<string,unknown>,...keys:string[])=>{for(const k of keys){const v=clean(row[k]);if(v)return v;}return "";};

export const normalizeGlobiInteraction=(row:Record<string,unknown>):GlobiInteractionReference=>{
  const sourceTaxonName=pick(row,"source_taxon_name","sourceTaxonName");
  const interactionType=pick(row,"interaction_type","interactionType","interaction_type_name","interactionTypeName");
  const targetTaxonName=pick(row,"target_taxon_name","targetTaxonName");
  if(!sourceTaxonName||!interactionType||!targetTaxonName)throw new Error("Malformed GloBI interaction: source, interaction type and target are required.");
  const out:GlobiInteractionReference={sourceTaxonName,interactionType,targetTaxonName};
  const sourceId=pick(row,"source_taxon_external_id","sourceTaxonId");if(sourceId)out.sourceTaxonId=sourceId;
  const targetId=pick(row,"target_taxon_external_id","targetTaxonId");if(targetId)out.targetTaxonId=targetId;
  const citation=pick(row,"study_citation","studyCitation");if(citation)out.studyCitation=citation;
  const external=pick(row,"study_external_id","studyExternalId");if(external)out.studyExternalId=external;
  const sourceCitation=pick(row,"study_source_citation","studySourceCitation");if(sourceCitation)out.studySourceCitation=sourceCitation;
  return out;
};
const unwrap=(payload:unknown):Record<string,unknown>[]=>{
  if(Array.isArray(payload))return payload.filter(x=>x&&typeof x==="object") as Record<string,unknown>[];
  if(payload&&typeof payload==="object"){
    for(const key of ["data","results","interactions"]){
      const v=(payload as Record<string,unknown>)[key];
      if(Array.isArray(v))return v.filter(x=>x&&typeof x==="object") as Record<string,unknown>[];
    }
  }
  throw new Error("Malformed GloBI response: interaction rows missing.");
};

export async function fetchGlobiInteractions(
  scientificName:string,checkedAt:string,
  options:{fetcher?:typeof fetch;signal?:AbortSignal;limit?:number}={}
):Promise<GlobiSearchResult>{
  const fetcher=options.fetcher??fetch,limit=Math.max(1,Math.min(options.limit??12,50));
  const params=new URLSearchParams({sourceTaxon:scientificName,includeObservations:"true",type:"json.v2",limit:String(limit),
    fields:"source_taxon_external_id,source_taxon_name,interaction_type,target_taxon_external_id,target_taxon_name,study_citation,study_external_id,study_source_citation"});
  const canonicalLocator=`${GLOBI_INTERACTION_URL}?${params.toString()}`;
  const providerId=`GLOBI:sourceTaxon:${fnv1a32(scientificName.trim().toLowerCase())}`;
  try{
    const response=await fetcher(canonicalLocator,{headers:{Accept:"application/json"},signal:options.signal});
    if(!response.ok)throw new Error(`GloBI returned HTTP ${response.status}.`);
    const rows=unwrap(await response.json());
    const interactions=rows.map(row=>{try{return normalizeGlobiInteraction(row);}catch{return null;}})
      .filter((x):x is GlobiInteractionReference=>x!==null);
    const semantic=interactions.map(x=>[x.sourceTaxonName,x.interactionType,x.targetTaxonName,x.studyExternalId??""].join(":")).join("|");
    const fingerprint=`GLOBI:interaction-search-v1:${fnv1a32(semantic)}`;
    return {provider:GLOBI_PROVIDER,providerId,canonicalLocator,scientificName,interactions,
      rights:"GLOBI_CC_BY_4_GENERAL_ORIGINAL_DATASET_PROVENANCE_REQUIRED",
      snapshot:{checkedAt,fingerprint,fingerprintMethod:"SEMANTIC_VERSION",sourceVersion:fingerprint,verification:"REVIEW_REQUIRED",available:true,providerId,changeScope:"CLAIM_RELEVANT",
        changedFields:["interaction_records"]}};
  }catch(error){
    const message=error instanceof Error?error.message:"Unknown GloBI fetch error";
    return {provider:GLOBI_PROVIDER,providerId,canonicalLocator,scientificName,interactions:[],
      rights:"GLOBI_CC_BY_4_GENERAL_ORIGINAL_DATASET_PROVENANCE_REQUIRED",
      snapshot:{checkedAt,fingerprint:`${providerId}:UNAVAILABLE`,fingerprintMethod:"PROVIDER_VERSION",verification:"REVIEW_REQUIRED",available:false,providerId,changeScope:"UNKNOWN"},error:message};
  }
}
