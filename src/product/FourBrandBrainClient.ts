import { getIdentityClient } from "@/identity/identityClient";

const EDGE_URL=import.meta.env.VITE_COMPANY_BRAIN_URL||'https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/company-brain';
export type BrainSession={access_token:string;refresh_token:string;expires_at:number;token_type?:string};
export type CompanyWorkspace={company_id:string;display_name:string;legal_name?:string|null;claim_state?:string;role:string;updated_at?:string};
export type CompanyBrainSnapshot={company:Record<string,unknown>;member_role:string;memories:Array<Record<string,unknown>>;metrics:Array<Record<string,unknown>>;opportunities:Array<Record<string,unknown>>;decisions:Array<Record<string,unknown>>;interventions:Array<Record<string,unknown>>;results:Array<Record<string,unknown>>;learning:Array<Record<string,unknown>>;retrieved_at:string};

async function edge<T>(action:string,payload:Record<string,unknown>={},accessToken?:string):Promise<T>{const response=await fetch(EDGE_URL,{method:'POST',headers:{'content-type':'application/json',...(accessToken?{authorization:`Bearer ${accessToken}`}:{})},body:JSON.stringify({action,...payload})});const body=await response.json().catch(()=>null) as {ok?:boolean;state?:string;detail?:string;error_code?:string;data?:T;session?:T}|null;if(!response.ok||!body?.ok)throw new Error(body?.detail||body?.state||body?.error_code||`Company Brain ${action} failed`);return(body.data??body.session??body) as T}

export async function currentCompanyBrainSession():Promise<BrainSession|null>{
 const client=await getIdentityClient();
 const result=await client.auth.getSession();
 const session=result.data.session;
 if(result.error||!session)return null;
 return {access_token:session.access_token,refresh_token:session.refresh_token,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer'};
}
async function authed<T>(action:string,payload:Record<string,unknown>={}){const session=await currentCompanyBrainSession();if(!session)throw new Error('AUTH_REQUIRED');return edge<T>(action,payload,session.access_token)}
export async function signOutCompanyBrain(){const client=await getIdentityClient();await client.auth.signOut({scope:'local'});}
export const listCompanyBrainWorkspaces=()=>authed<CompanyWorkspace[]>('list_workspaces');
export const createCompanyBrainWorkspace=(displayName:string,legalName?:string)=>authed<{company_id:string}>('create_workspace',{display_name:displayName,legal_name:legalName||null});
export const loadCompanyBrain=(companyId:string)=>authed<CompanyBrainSnapshot>('snapshot',{company_id:companyId});
export const saveCompanyTwin=(companyId:string,twin:Record<string,string>)=>authed<CompanyBrainSnapshot>('save_twin',{company_id:companyId,twin});
export const syncCompanyAnalysis=(companyId:string,analysis:unknown,ledger:Record<string,string>)=>authed<CompanyBrainSnapshot>('sync_analysis',{company_id:companyId,analysis,ledger});
export const companyValueReport=(companyId:string)=>authed<Record<string,unknown>>('value_report',{company_id:companyId});
export const companyCompoundingMetrics=(companyId:string)=>authed<Record<string,unknown>>('compounding_metrics',{company_id:companyId});
