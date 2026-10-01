const LEGAL_SUFFIXES = new Set([
  "as","asa","ab","oy","oyj","aps","a/s","ltd","limited","plc","inc","incorporated","llc","corp","corporation",
  "gmbh","ag","sa","sas","sarl","bv","nv","spa","srl","pte","pty","co","company"
]);

function candidateFromUrl(value) {
  const raw=String(value??"").trim();
  if(!raw)return raw;
  try {
    const parsed=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);
    const host=parsed.hostname.toLowerCase().replace(/^www\./,"");
    if(host.includes("."))return host.split(".")[0]||raw;
  } catch {}
  return raw;
}

function tokens(value) {
  const raw=candidateFromUrl(value).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return (raw.match(/[a-z0-9]+/g)||[]).filter(token=>token.length>1&&!LEGAL_SUFFIXES.has(token));
}

function exactTokenMatch(a,b) {
  if(!a.length||!b.length||a.length!==b.length)return false;
  return a.every((token,index)=>token===b[index]);
}

function brandSubsetMatch(candidate,entity) {
  if(!candidate.length||!entity.length)return false;
  const meaningful=candidate.join("");
  if(meaningful.length<4)return false;
  return candidate.every(token=>entity.includes(token));
}

export function normaliseOrganisationNumber(value) {
  if(typeof value!=="string")return null;
  const compact=value.replace(/\s+/g,"");
  return /^\d{9}$/.test(compact)?compact:null;
}

export function companyIdentityMatches(entityName,analysisCompany={},query="") {
  const entity=tokens(entityName);
  const legal=tokens(analysisCompany?.legalName);
  if(legal.length)return exactTokenMatch(legal,entity);
  return [analysisCompany?.name,query].some(candidate=>brandSubsetMatch(tokens(candidate),entity));
}

export function markIdentityUnknown(analysis,state="IDENTITY_UNVERIFIED") {
  const code=String(state||"IDENTITY_UNVERIFIED").replace(/[^A-Z0-9_\-]/gi,"_").slice(0,80);
  const message=`Legal company identity remains UNKNOWN (${code}); no caller-provided identity or source URL was trusted.`;
  const unknowns=Array.isArray(analysis?.unknowns)?analysis.unknowns.filter(Boolean):[];
  return {
    ...analysis,
    company:{...(analysis?.company||{}),identityState:"UNKNOWN"},
    statusNote:`${analysis?.statusNote||""} ${message}`.trim(),
    unknowns:unknowns.includes(message)?unknowns:[...unknowns,message],
  };
}

export function bindBrregIdentity(analysis,entity,query="") {
  if(!entity||!/^\d{9}$/.test(String(entity.organizationNumber||""))||!entity.entityName||!entity.sourceUrl)
    return {state:"SOURCE_PARSE_FAILED",analysis:markIdentityUnknown(analysis,"SOURCE_PARSE_FAILED")};

  if(!companyIdentityMatches(entity.entityName,analysis?.company||{},query))
    return {state:"COMPANY_IDENTITY_MISMATCH",analysis:markIdentityUnknown(analysis,"COMPANY_IDENTITY_MISMATCH")};

  const checkedAt=String(entity.observedAt||new Date().toISOString()).slice(0,10);
  const evidence=(Array.isArray(analysis?.evidence)?analysis.evidence:[]).filter(item=>item?.id!=="BRREG-LEGAL-IDENTITY");
  evidence.push({
    id:"BRREG-LEGAL-IDENTITY",
    title:"Enhetsregisteret legal entity record",
    publisher:"Brønnøysundregistrene",
    url:entity.sourceUrl,
    checkedAt,
    note:`Server-resolved exact organisation number ${entity.organizationNumber}; NLOD 2.0. Legal identity does not prove economic, environmental or ownership claims.`,
    provenanceState:"SERVER_RESOLVED_PROVIDER_RECORD",
  });

  return {
    state:"EXACT_BRREG_IDENTITY",
    analysis:{
      ...analysis,
      company:{
        ...(analysis?.company||{}),
        legalName:entity.entityName,
        organizationNumber:entity.organizationNumber,
        identityState:"EXACT_BRREG_IDENTITY",
      },
      evidence,
      statusNote:`${analysis?.statusNote||""} Legal identity was resolved server-side from the exact Brønnøysundregistrene organisation-number record; caller-provided names, states, LEIs and URLs were ignored.`.trim(),
    },
  };
}
