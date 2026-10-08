import { identityConstants, type FourPlanetSession } from "@/identity/identityClient";
import { emptyState, type FinanceState } from "./financeData";

/** Persist private finance workspace decisions in the existing 4PLANET ID Supabase project.
 * Global funder/programme/call truth does not live here and is never copied to user state.
 * Account-private state only; organisation/team tenant-sharing is a separate, still unverified gate.
 */
type RemoteRecord = { app_state: FinanceState; revision: number };
export type FinanceWriteResult = { revision: number };
export class FinancePersistenceConflict extends Error {
  constructor() { super("Finance data changed in another session. Reload this workspace before saving again."); this.name="FinancePersistenceConflict"; }
}
function isWorkspaceState(value:unknown):value is FinanceState {
  if (!value || typeof value!=="object") return false;
  const data=value as Partial<FinanceState>;
  return (data.active==="4planet"||data.active==="personal") &&
    Array.isArray(data.workspaces?.["4planet"]?.pipeline)&&
    Array.isArray(data.workspaces?.["4planet"]?.projects)&&
    Array.isArray(data.workspaces?.personal?.pipeline)&&
    Array.isArray(data.workspaces?.personal?.projects);
}
function headers(session: FourPlanetSession,extra?:Record<string,string>):HeadersInit{
  return {apikey:identityConstants.publishableKey,Authorization:"Bearer "+session.access_token,
    Accept:"application/json","Content-Type":"application/json",...extra};
}
function recordUrl(session:FourPlanetSession,revision?:number){
  const url=new URL(identityConstants.supabaseUrl+"/rest/v1/finance_user_state");
  url.searchParams.set("user_id","eq."+session.user.id);
  if(revision!==undefined)url.searchParams.set("revision","eq."+revision);
  url.searchParams.set("select","app_state,revision");
  return url.href;
}
async function errorOr(response:Response,label:string){
  let detail="";
  try{const d=await response.json() as {message?:string;code?:string};detail=d.code||d.message||""}catch{/* protect private response body */}
  throw new Error(label+": HTTP "+response.status+(detail?(" ("+detail+")"):""));
}
export async function readFinanceWorkspace(session:FourPlanetSession):Promise<RemoteRecord>{
  const result=await fetch(recordUrl(session),{headers:headers(session),cache:"no-store"});
  if(!result.ok)await errorOr(result,"Finance read failed");
  const rows=await result.json() as RemoteRecord[];
  if(rows.length>1)throw new Error("Finance state has duplicate account ownership rows");
  if(rows.length){
    if(!isWorkspaceState(rows[0].app_state))throw new Error("Finance account state has unexpected format");
    return rows[0];
  }
  const insert=await fetch(identityConstants.supabaseUrl+"/rest/v1/finance_user_state?on_conflict=user_id",{
    method:"POST",headers:headers(session,{Prefer:"resolution=ignore-duplicates,return=minimal"}),
    body:JSON.stringify({user_id:session.user.id,app_state:emptyState(),revision:1}),
    cache:"no-store",
  });
  if(!insert.ok)await errorOr(insert,"Finance account initialise failed");
  const reread=await fetch(recordUrl(session),{headers:headers(session),cache:"no-store"});
  if(!reread.ok)await errorOr(reread,"Finance account readback failed");
  const inserted=await reread.json() as RemoteRecord[];
  if(inserted.length!==1||!isWorkspaceState(inserted[0].app_state))throw new Error("Finance state readback missing or invalid");
  return inserted[0];
}
export async function writeFinanceWorkspace(session:FourPlanetSession,state:FinanceState,revision:number):Promise<FinanceWriteResult>{
  if(!isWorkspaceState(state))throw new Error("Invalid workspace payload blocked");
  const response=await fetch(recordUrl(session,revision),{
    method:"PATCH",
    headers:headers(session,{Prefer:"return=representation"}),
    body:JSON.stringify({app_state:state,revision:revision+1,updated_at:new Date().toISOString()}),
    cache:"no-store",
  });
  if(!response.ok)await errorOr(response,"Finance save failed");
  const rows=await response.json() as RemoteRecord[];
  if(rows.length!==1||rows[0].revision!==revision+1)throw new FinancePersistenceConflict();
  return {revision:rows[0].revision};
}
