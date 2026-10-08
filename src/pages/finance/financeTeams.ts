import {identityConstants,type FourPlanetSession} from "@/identity/identityClient";
import type {Workspace} from "./financeData";

export type TeamRole="owner"|"admin"|"editor"|"viewer";
export type TeamSpace={id:string;title:string;owner_user_id:string;created_at:string};
export type TeamMember={space_id:string;user_id:string;role:TeamRole;created_at:string};
export type TeamSnapshot={app_state:Workspace;revision:number};

const api=identityConstants.supabaseUrl+"/rest/v1";
function headers(session:FourPlanetSession,preferred?:string):HeadersInit {
 return {"apikey":identityConstants.publishableKey,"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json",
 "Accept":"application/json",...(preferred?{"Prefer":preferred}:{})};
}
async function readJson<T>(response:Response,context:string):Promise<T>{
 if(!response.ok)throw new Error(context+" unavailable (HTTP "+response.status+")");
 return response.json() as Promise<T>;
}
export async function getTeamSpaces(session:FourPlanetSession):Promise<TeamSpace[]>{
 return readJson<TeamSpace[]>(await fetch(api+"/finance_team_spaces?select=id,title,owner_user_id,created_at&order=created_at.asc",{headers:headers(session),cache:"no-store"}),"Team list");
}
export async function getTeamMembers(session:FourPlanetSession,id:string):Promise<TeamMember[]>{
 return readJson<TeamMember[]>(await fetch(api+"/finance_team_memberships?select=space_id,user_id,role,created_at&space_id=eq."+encodeURIComponent(id),{headers:headers(session),cache:"no-store"}),"Team members");
}
export async function createTeamSpace(session:FourPlanetSession,title:string):Promise<string>{
 return readJson<string>(await fetch(api+"/rpc/finance_create_team",{method:"POST",headers:headers(session),body:JSON.stringify({p_title:title}),cache:"no-store"}),"Create workspace");
}
export async function addTeamMember(session:FourPlanetSession,id:string,email:string,role:"viewer"|"editor"):Promise<boolean>{
 return readJson<boolean>(await fetch(api+"/rpc/finance_add_team_member",{method:"POST",headers:headers(session),body:JSON.stringify({p_space:id,p_email:email,p_role:role}),cache:"no-store"}),"Membership change");
}
export async function removeTeamMember(session:FourPlanetSession,id:string,userId:string):Promise<boolean>{
 return readJson<boolean>(await fetch(api+"/rpc/finance_remove_team_member",{method:"POST",headers:headers(session),body:JSON.stringify({p_space:id,p_user:userId}),cache:"no-store"}),"Membership removal");
}
export async function getTeamSnapshot(session:FourPlanetSession,id:string):Promise<TeamSnapshot>{
 const rows=await readJson<TeamSnapshot[]>(await fetch(api+"/finance_team_state?select=app_state,revision&space_id=eq."+encodeURIComponent(id),{headers:headers(session),cache:"no-store"}),"Team workspace");
 if(rows.length!==1||!rows[0].app_state||!Array.isArray(rows[0].app_state.projects)||!Array.isArray(rows[0].app_state.pipeline))throw new Error("Team workspace unavailable or invalid");
 return rows[0];
}
export async function writeTeamSnapshot(session:FourPlanetSession,id:string,state:Workspace,revision:number):Promise<number>{
 if(!Array.isArray(state.projects)||!Array.isArray(state.pipeline))throw new Error("Invalid workspace data");
 const url=api+"/finance_team_state?space_id=eq."+encodeURIComponent(id)+"&revision=eq."+revision+"&select=revision";
 const rows=await readJson<{revision:number}[]>(await fetch(url,{method:"PATCH",headers:headers(session,"return=representation"),cache:"no-store",body:JSON.stringify({app_state:state,revision:revision+1,updated_at:new Date().toISOString()})}),"Save team workspace");
 if(rows.length!==1||rows[0].revision!==revision+1)throw new Error("Workspace changed elsewhere. Reload to reconcile.");
 return rows[0].revision;
}
