/* Team-level finance CRM: member-authorised workspaces on existing 4PLANET ID.
 * These are private drafts; shared global funding catalogue remains DEMO until BRAIN import.
 */
import {useEffect,useRef,useState,type FormEvent} from "react";
import type {FourPlanetSession} from "@/identity/identityClient";
import {CALLS,THEMES,STATUS,FUNDERS,PROGRAMMES,amount,prettyDate,validTransition,type Project,type PipelineItem,type Status,type Theme,type Workspace} from "./financeData";
import {addTeamMember,createTeamSpace,getTeamMembers,getTeamSnapshot,getTeamSpaces,removeTeamMember,writeTeamSnapshot,type TeamMember,type TeamSpace} from "./financeTeams";
const blank=():Workspace=>({projects:[],pipeline:[]});
export default function FinanceTeamDesk({session}:{session:FourPlanetSession|null}){
 const [spaces,setSpaces]=useState<TeamSpace[]>([]),[selected,setSelected]=useState(""),[members,setMembers]=useState<TeamMember[]>([]),
 [workspace,setWorkspace]=useState<Workspace>(blank),[status,setStatus]=useState<"loading"|"ready"|"saving"|"error">("loading"),
 [error,setError]=useState(""),[newName,setNewName]=useState(""),[projectName,setProjectName]=useState(""),
 [projectTheme,setProjectTheme]=useState<Theme>("Climate"),[selectedCall,setSelectedCall]=useState(""),
 [memberEmail,setMemberEmail]=useState(""),[memberRole,setMemberRole]=useState<"editor"|"viewer">("viewer"),[notice,setNotice]=useState(""),
 [mode,setMode]=useState<"pipeline"|"projects"|"calendar"|"members">("pipeline"),[month,setMonth]=useState("2026-10");
 const current=useRef(blank()),revision=useRef(1),queue=useRef<Promise<void>>(Promise.resolve());
 const [pending,setPending]=useState(false);
 const selfRole=members.find(m=>m.user_id===session?.user.id)?.role;
 const editable=selfRole==="owner"||selfRole==="admin"||selfRole==="editor";
 useEffect(()=>{if(!session){setStatus("error");setError("Sign in with 4PLANET ID to use a shared workspace.");return}
  let active=true;getTeamSpaces(session).then(items=>{if(active){setSpaces(items);setSelected(old=>items.some(x=>x.id===old)?old:(items[0]?.id||""));setStatus("ready")}}).catch(e=>{if(active){setStatus("error");setError(String(e))}});
  return()=>{active=false};
 },[session?.user.id]);
 useEffect(()=>{if(!selected||!session)return;let active=true;setStatus("loading");setError("");
  Promise.all([getTeamSnapshot(session,selected),getTeamMembers(session,selected)]).then(([record,roster])=>{
   if(!active)return;current.current=record.app_state;revision.current=record.revision;queue.current=Promise.resolve();setMembers(roster);setWorkspace(record.app_state);setStatus("ready");
  }).catch(e=>{if(active){setStatus("error");setError(String(e))}});
  return()=>{active=false};
 },[selected,session?.user.id]);
 async function create(event:FormEvent){event.preventDefault();if(!session||newName.trim().length<3)return;setPending(true);setError("");
  try{const id=await createTeamSpace(session,newName.trim());const all=await getTeamSpaces(session);setSpaces(all);setSelected(id);setNewName("");setNotice("Workspace created. You are its owner.")}
  catch(e){setError(String(e))}finally{setPending(false)}
 }
 function change(fn:(current:Workspace)=>Workspace){if(!session||!selected||!editable||status==="error"||status==="loading")return;
  const next=fn(current.current);current.current=next;setWorkspace(next);setStatus("saving");
  const id=selected,s=current,identity=session;
  queue.current=queue.current.then(async()=>{revision.current=await writeTeamSnapshot(identity,id,next,revision.current);if(current.current===next)setStatus("ready")}).catch(e=>{setStatus("error");setError(String(e))});
 }
 async function grant(event:FormEvent){event.preventDefault();if(!session||!selected||selfRole!=="owner")return;setPending(true);setError("");try{
  const ok=await addTeamMember(session,selected,memberEmail,memberRole);
  if(!ok)throw new Error("No existing 4PLANET ID account matched. No invitation was sent.");
  setMembers(await getTeamMembers(session,selected));setMemberEmail("");setNotice("Existing 4PLANET ID member added. No email was sent.");
 }catch(e){setError(String(e))}finally{setPending(false)}}
 async function revoke(userId:string){if(!session||!selected||selfRole!=="owner")return;
  if(!window.confirm("Remove this member's access to team finance data?"))return;setPending(true);
  try{await removeTeamMember(session,selected,userId);setMembers(await getTeamMembers(session,selected));setNotice("Membership revoked.")}catch(e){setError(String(e))}finally{setPending(false)}
 }
 if(!session)return <section className="fc-team-auth"><h2>Team workspaces</h2><p>Use an existing 4PLANET ID to manage your organisation's project and funding pipeline. Personal workspace information is kept separate.</p><a className="fc-btn fc-btn-primary" href="/sign-in">Sign in to continue</a></section>;
 const opts=CALLS.filter(c=>!workspace.pipeline.some(x=>x.callId===c.id));
 const monthCalls=workspace.pipeline.map(i=>({i,c:CALLS.find(x=>x.id===i.callId)})).filter(x=>x.c?.deadline.slice(0,7)===month);
 return <div className="fc-team">
  <div className="fc-sectionheading"><div><p className="fc-eyebrow">AUTHENTICATED ORGANISATION WORKSPACE</p><h2>Team finance</h2></div><span className="fc-muted fc-small">Workspace-scoped, not BRAIN data</span></div>
  <p className="fc-lead">Projects, opportunities, roles and preparation notes belong to the selected team. All funding calls shown here remain fictional test data until canonical source import.</p>
  <div className="fc-team-actions"><label>Active team<select aria-label="Active organisation" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select a team</option>{spaces.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <form onSubmit={create} className="fc-team-create"><label>New team name<input aria-label="New team name" value={newName} minLength={3} maxLength={120} onChange={e=>setNewName(e.target.value)} placeholder="Organisation or team"/></label><button disabled={pending} className="fc-btn" type="submit">Create team</button></form>
  </div>
  {notice&&<div className="fc-sync-banner" role="status">{notice}</div>}
  {error&&<div className="fc-sync-error" role="alert">{error}</div>}
  {!selected?<div className="fc-empty"><strong>No shared organisation workspace</strong><p>Create a team to keep organisation funding separate from your personal account. Creating a team does not change existing 4PLANET project masters.</p></div>:<>
   <div className="fc-team-subnav" role="group" aria-label="Team sections">{(["pipeline","projects","calendar","members"] as const).map(tab=><button className={mode===tab?"active":""} key={tab} onClick={()=>setMode(tab)}>{tab==="pipeline"?"CRM":tab==="projects"?"Projects":tab==="calendar"?"Deadlines":"Members"}</button>)}</div>
   <p className="fc-muted fc-small">Your role: {selfRole||"unverified"} · {status==="saving"?"Saving changes…":status==="ready"?"Synced to 4PLANET ID workspace":status}</p>
   {status==="loading"?<div className="fc-empty">Loading access-controlled team data…</div>:null}
   {status!=="loading"&&mode==="pipeline"&&<>
    <div className="fc-resultshead"><strong>Team CRM</strong><span>{workspace.pipeline.length} selected demo opportunities</span></div>
    {editable&&<div className="fc-team-add"><select aria-label="Add an opportunity to team CRM" value={selectedCall} onChange={e=>setSelectedCall(e.target.value)}><option value="">Select illustrated opportunity</option>{opts.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><button className="fc-btn fc-btn-primary" disabled={!selectedCall||status==="error"} onClick={()=>{const callId=selectedCall;change(w=>({...w,pipeline:[...w.pipeline,{id:"team-pipe-"+crypto.randomUUID(),callId,projectId:"",status:"Saved",notes:"",receipt:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}]}));setSelectedCall("")}}>Add to CRM</button></div>}
    {workspace.pipeline.length?workspace.pipeline.map(i=>{const c=CALLS.find(x=>x.id===i.callId);if(!c)return null;
     return <div key={i.id} className="fc-team-item"><div><strong>{c.title}</strong><small>{prettyDate(c.deadline)} · {amount(c)} · DEMO ONLY</small></div><select aria-label={"Team stage for "+c.title} disabled={!editable||status==="error"} value={i.status} onChange={e=>{const next=e.target.value as Status;if(!validTransition(next,i.receipt))return;change(w=>({...w,pipeline:w.pipeline.map(p=>p.id===i.id?{...p,status:next}:p)}))}}>{STATUS.map(stage=><option disabled={!validTransition(stage,i.receipt)} key={stage}>{stage}</option>)}</select><select aria-label={"Team project for "+c.title} disabled={!editable||status==="error"} value={i.projectId} onChange={e=>change(w=>({...w,pipeline:w.pipeline.map(p=>p.id===i.id?{...p,projectId:e.target.value}:p)}))}><option value="">Unassigned</option>{workspace.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>{editable&&<button className="fc-textbutton" onClick={()=>change(w=>({...w,pipeline:w.pipeline.filter(p=>p.id!==i.id)}))}>Remove</button>}</div>
    }):<div className="fc-empty"><strong>No opportunities selected</strong><p>Start with a fictional opportunity to test the shared CRM and roles.</p></div>}
   </>}
   {status!=="loading"&&mode==="projects"&&<>
    <div className="fc-resultshead"><strong>Team projects</strong><span>{workspace.projects.length} private projects</span></div>
    {editable&&<form className="fc-team-add" onSubmit={e=>{e.preventDefault();if(!projectName.trim())return;change(w=>({...w,projects:[...w.projects,{id:"team-project-"+crypto.randomUUID(),name:projectName.trim(),theme:projectTheme,description:"",region:"Worldwide",fundingNeed:""}]}));setProjectName("")}}>
      <input aria-label="New team project" required value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Project name"/>
      <select value={projectTheme} aria-label="Project theme" onChange={e=>setProjectTheme(e.target.value as Theme)}>{THEMES.map(t=><option key={t}>{t}</option>)}</select><button type="submit" className="fc-btn fc-btn-primary">Create project</button>
    </form>}
    {workspace.projects.map(p=><div className="fc-team-item" key={p.id}><div><strong>{p.name}</strong><small>{p.theme} · {workspace.pipeline.filter(x=>x.projectId===p.id).length} linked</small></div></div>)}
   </>}
   {status!=="loading"&&mode==="calendar"&&<>
     <div className="fc-calendar-controls"><button onClick={()=>setMonth(m=>{const d=new Date(m+"-01T12:00:00Z");d.setUTCMonth(d.getUTCMonth()-1);return d.toISOString().slice(0,7)})} aria-label="Previous month">Previous</button><strong>{new Date(month+"-01T12:00:00Z").toLocaleString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"})}</strong><button onClick={()=>setMonth(m=>{const d=new Date(m+"-01T12:00:00Z");d.setUTCMonth(d.getUTCMonth()+1);return d.toISOString().slice(0,7)})} aria-label="Next month">Next</button></div>
     <p className="fc-muted fc-small">Illustrative deadlines are not verified and will not trigger external applications.</p>
     {monthCalls.map(({i,c})=>c&&<div className="fc-team-item" key={i.id}><div><strong>{c.title}</strong><small>{prettyDate(c.deadline)} · {amount(c)} · {i.status}</small></div></div>)}
     {!monthCalls.length&&<div className="fc-empty">No saved team deadlines for this month.</div>}
   </>}
   {status!=="loading"&&mode==="members"&&<>
    <div className="fc-resultshead"><strong>Member access</strong><span>4PLANET ID membership, enforced by RLS</span></div>
    {members.map(m=><div key={m.user_id} className="fc-team-item"><div><strong>{m.user_id===session.user.id?"Your account":"Team member"}</strong><small>{m.role} · {m.user_id.slice(0,8)}</small></div>{selfRole==="owner"&&m.role!=="owner"&&<button className="fc-textbutton" onClick={()=>revoke(m.user_id)}>Revoke</button>}</div>)}
    {selfRole==="owner"&&<form onSubmit={grant} className="fc-team-add"><input type="email" required aria-label="Existing 4PLANET ID email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="Existing member email"/><select value={memberRole} aria-label="New member role" onChange={e=>setMemberRole(e.target.value as "editor"|"viewer")}><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button className="fc-btn" disabled={pending} type="submit">Grant access</button></form>}
    <p className="fc-muted fc-small">Only an existing 4PLANET ID account can receive access. No invitation or email is sent. Roles can be revoked by the workspace owner.</p>
   </>}
  </>}
 </div>;
}
