/* CAP-PLATFORM-01 — source contract for canonical BRAIN/x500, NOT a replacement register.
 * No importer is permitted to treat historic rows as currently available funding.
 */
export type ClaimConfidence="VERIFIED_CURRENT"|"HISTORIC"|"EXTERNAL_UNVERIFIED"|"UNKNOWN";
export type AwardEvidence="RECEIPT"|"PROVIDER_DECISION"|"CONTRACT"|"BANK_RECEIPT"|"SELF_REPORTED"|"NONE";
export type FinanceEntitySource={
 canonicalId:string;
 canonicalTrack:string;
 owningMaster:string;
 sourceRecord:string;
 sourceUrl:string|null;
 receivedAt:string|null;
 verifiedAt:string|null;
 licence:"PUBLIC_REUSE"|"INTERNAL_ONLY"|"REVIEW_REQUIRED";
 confidence:ClaimConfidence;
};
export type FundingCallCycle={
 actorId:string;
 programmeId:string;
 cycleId:string;
 year:number;
 callTitle:string;
 opensAt:string|null;
 deadlineAt:string|null;
 timezone:string|null;
 status:"OPEN"|"EXPECTED"|"CLOSED"|"UNCONFIRMED";
 deadlineEvidence:ClaimConfidence;
 awardBand:{minimum:number|null;maximum:number|null;currency:string|null;instrument:string;amountBasis:string};
 source:FinanceEntitySource;
};
export type FundingImportGate={status:"READY"|"BLOCKED"|"HOLD";reasons:string[];canPublish:boolean};
export function assessImportGate(source:FinanceEntitySource,cycle:FundingCallCycle,derivedViewStatus:"OK"|"REF_ERROR"|"STALE"|"UNKNOWN"):FundingImportGate{
 const reasons:string[]=[];
 if(derivedViewStatus==="REF_ERROR")reasons.push("The canonical derived submissions view contains #REF; reconcile without deleting independent receipt evidence");
 if(derivedViewStatus==="STALE"||derivedViewStatus==="UNKNOWN")reasons.push("Canonical source freshness not established");
 if(source.licence!=="PUBLIC_REUSE")reasons.push("Public reuse not authorised; source is internal-only or requires licence review");
 if(!source.canonicalId||!source.canonicalTrack||!source.owningMaster)reasons.push("Missing canonical BRAIN identity or owning master");
 if(!source.sourceUrl)reasons.push("No original source link");
 if(!source.verifiedAt||source.confidence!=="VERIFIED_CURRENT")reasons.push("No verified current-source state");
 if(cycle.deadlineAt&&!cycle.timezone)reasons.push("Deadline timezone missing");
 if(cycle.deadlineAt&&!/(?:Z|[+\-]\d{2}:\d{2})$/.test(cycle.deadlineAt))reasons.push("Deadline needs explicit UTC offset or Z");
 if(cycle.status==="OPEN"&&(!cycle.deadlineAt||cycle.deadlineEvidence!=="VERIFIED_CURRENT"))reasons.push("Cannot label open with unverified deadline");
 const blocked=reasons.some(x=>x.includes("#REF")||x.includes("Missing canonical")||x.includes("Public reuse"));
 return {status:blocked?"BLOCKED":reasons.length?"HOLD":"READY",reasons,canPublish:reasons.length===0};
}
export type FundingTransaction={eventId:string;actorId:string;programmeId:string|null;callId:string|null;kind:"PLANNED_ASK"|"FORMAL_SUBMISSION"|"AWARDED"|"CONTRACTED"|"RECEIVED_CASH";amount:number|null;currency:string|null;evidence:AwardEvidence;sourceUrl:string|null;asOf:string};
export function validateFinanceEvent(event:FundingTransaction):{accepted:boolean;reason:string}{
 if(!event.eventId||!event.actorId||!event.asOf)return {accepted:false,reason:"Missing core identity/date"};
 if(event.kind==="FORMAL_SUBMISSION"&&event.evidence!=="RECEIPT")return {accepted:false,reason:"Submission requires official provider receipt"};
 if(event.kind==="AWARDED"&&event.evidence!=="PROVIDER_DECISION")return {accepted:false,reason:"Award requires provider decision"};
 if(event.kind==="CONTRACTED"&&event.evidence!=="CONTRACT")return {accepted:false,reason:"Contracted requires binding document"};
 if(event.kind==="RECEIVED_CASH"&&event.evidence!=="BANK_RECEIPT")return {accepted:false,reason:"Received cash requires transaction evidence"};
 if(event.kind!=="PLANNED_ASK"&&!event.sourceUrl)return {accepted:false,reason:"External source missing"};
 if(event.amount!==null&&(!Number.isFinite(event.amount)||event.amount<0||!event.currency))return {accepted:false,reason:"Invalid amount or original currency"};
 return {accepted:true,reason:"Evidence contract satisfied"};
}
export type DeadlineTask={id:string;cycleId:string;kind:"SOURCE_CHECK"|"AI_PREP"|"QUALITY_REVIEW"|"FOUNDER_ACTION"|"EXTERNAL_DEADLINE";dueAt:string|null;confirmed:boolean;state:"PENDING"|"HOLD"|"DONE";source:string|null};
export function deadlineAssurance(cycle:FundingCallCycle,leadDays={source:45,prep:28,qa:14,founder:7}):DeadlineTask[]{
 const accepted=cycle.deadlineEvidence==="VERIFIED_CURRENT"&&cycle.deadlineAt!==null&&cycle.timezone!==null&&/(?:Z|[+\-]\d{2}:\d{2})$/.test(cycle.deadlineAt);
 function back(days:number){if(!accepted||!cycle.deadlineAt)return null;const raw=Date.parse(cycle.deadlineAt);if(!Number.isFinite(raw))return null;return new Date(raw-days*86400000).toISOString()}
 return [
  {id:cycle.cycleId+":source",cycleId:cycle.cycleId,kind:"SOURCE_CHECK",dueAt:back(leadDays.source),confirmed:accepted,state:accepted?"PENDING":"HOLD",source:cycle.source.sourceUrl},
  {id:cycle.cycleId+":prep",cycleId:cycle.cycleId,kind:"AI_PREP",dueAt:back(leadDays.prep),confirmed:accepted,state:accepted?"PENDING":"HOLD",source:cycle.source.sourceUrl},
  {id:cycle.cycleId+":qa",cycleId:cycle.cycleId,kind:"QUALITY_REVIEW",dueAt:back(leadDays.qa),confirmed:accepted,state:accepted?"PENDING":"HOLD",source:cycle.source.sourceUrl},
  {id:cycle.cycleId+":founder",cycleId:cycle.cycleId,kind:"FOUNDER_ACTION",dueAt:back(leadDays.founder),confirmed:accepted,state:accepted?"PENDING":"HOLD",source:cycle.source.sourceUrl},
  {id:cycle.cycleId+":external",cycleId:cycle.cycleId,kind:"EXTERNAL_DEADLINE",dueAt:accepted?cycle.deadlineAt:null,confirmed:accepted,state:accepted?"PENDING":"HOLD",source:cycle.source.sourceUrl}
 ];
}
export const EXISTING_CAPITAL_AUTHORITY={
 spreadsheetId:"1rX-ENgkxF68V980X2ae270VggzKvNk-ag8cFkTfV6NA",
 opportunities:"01_OPPORTUNITIES",
 submissions:"04_SUBMISSIONS",
 founderView:"28_FOUNDER_VIEW",
 deadlines:"29_DEADLINE_ASSURANCE",
 identifiers:{opportunity:"Opportunity ID",actor:"Actor ID",evidence:"Evidence Tier",externalEvent:"Last External Event Class"},
 integrationStatus:"HOLD_FOR_RECONCILIATION",
} as const;
