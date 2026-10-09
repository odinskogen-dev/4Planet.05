import {useEffect,useRef,useState} from 'react';
import CompanyBrainSignIn from '@/pages/partners/CompanyBrainSignIn';
import {trackEvent} from '@/analytics/Analytics';
import {getIdentityClient,type FourPlanetSession} from '@/identity/identityClient';
import {ANONYMOUS_COMPANY_BRAIN_SCOPE,companyBrainPersonScope} from '@/product/companyBrainRecovery';
import {companyCompoundingMetrics,companyValueReport,createCompanyBrainWorkspace,listCompanyBrainWorkspaces,loadCompanyBrain,saveCompanyTwin,syncCompanyAnalysis,type CompanyBrainSnapshot} from '@/product/FourBrandBrainClient';

type Props={
 companyName:string;
 legalName?:string;
 twin:Record<string,string>;
 ledger:Record<string,string>;
 analysis:unknown;
 onSnapshot:(snapshot:CompanyBrainSnapshot)=>void;
 onLocalRecovery:()=>void;
 onActorScopeChange:(actorScope:string)=>void;
};

export default function CompanyBrainControls({companyName,legalName,twin,ledger,analysis,onSnapshot,onLocalRecovery,onActorScopeChange}:Props){
 const[signedIn,setSignedIn]=useState(false);
 const[companyId,setCompanyId]=useState('');
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState('');
 const[metrics,setMetrics]=useState<Record<string,unknown>|null>(null);
 const requestVersion=useRef(0);
 useEffect(()=>{
  let active=true;
  let unsubscribe=()=>{};
  const refresh=async(session:FourPlanetSession|null)=>{
   const version=++requestVersion.current;
   onActorScopeChange(session?companyBrainPersonScope(session.user.id):ANONYMOUS_COMPANY_BRAIN_SCOPE);
   setSignedIn(Boolean(session));
   setCompanyId('');
   setBusy(false);
   setMetrics(null);
   setMessage('');
   if(!session)return;
   try{
    const rows=await listCompanyBrainWorkspaces();
    if(!active||version!==requestVersion.current)return;
    const match=rows.find(item=>item.display_name.trim().toLowerCase()===companyName.trim().toLowerCase());
    setCompanyId(match?.company_id||'');
   }catch(cause){
    if(active&&version===requestVersion.current)setMessage(cause instanceof Error?cause.message:'Company Brain unavailable.');
   }
  };
  void getIdentityClient().then(async client=>{
   if(!active)return;
   const subscription=client.auth.onAuthStateChange((_event,session)=>{void refresh(session);});
   unsubscribe=()=>subscription.data.subscription.unsubscribe();
   const result=await client.auth.getSession();
   if(!active)return;
   if(result.error)throw result.error;
   await refresh(result.data.session);
  }).catch(cause=>{if(active)setMessage(cause instanceof Error?cause.message:'Company Brain unavailable.');});
  return()=>{active=false;requestVersion.current+=1;unsubscribe();};
 },[companyName,onActorScopeChange]);
 async function createWorkspace(){
  const version=requestVersion.current;
  setBusy(true);setMessage('');
  trackEvent('company_claim_started',{product_area:'4brands',claim_kind:'company_brain_workspace'});
  try{
   const created=await createCompanyBrainWorkspace(companyName,legalName);
   if(version!==requestVersion.current)return;
   setCompanyId(created.company_id);
   trackEvent('company_brain_created',{product_area:'4brands',creation_kind:'workspace'});
   setMessage('Company Brain workspace ready.');
  }catch(cause){
   if(version!==requestVersion.current)return;
   trackEvent('error',{product_area:'4brands',error_kind:'company_brain_create_failed'});
   setMessage(cause instanceof Error?cause.message:'Could not create Company Brain.');
  }finally{if(version===requestVersion.current)setBusy(false)}
 }
 async function save(){
  if(!signedIn||!companyId){onLocalRecovery();setMessage('Local recovery saved. Sign in to make company state canonical and cross-device.');return}
  const version=requestVersion.current;
  setBusy(true);setMessage('');
  try{
   await saveCompanyTwin(companyId,twin);
   if(version!==requestVersion.current)return;
   const snapshot=await syncCompanyAnalysis(companyId,analysis,ledger);
   if(version!==requestVersion.current)return;
   onSnapshot(snapshot);
   trackEvent('value_action',{product_area:'4brands',action_kind:'company_brain_saved'});
   setMessage('Saved to Company Brain. Exact server readback passed.');
  }catch(cause){if(version===requestVersion.current)setMessage(cause instanceof Error?cause.message:'Company Brain save failed.')}finally{if(version===requestVersion.current)setBusy(false)}
 }
 async function load(){
  if(!companyId)return;
  const version=requestVersion.current;
  setBusy(true);setMessage('');
  try{
   const snapshot=await loadCompanyBrain(companyId);
   if(version!==requestVersion.current)return;
   onSnapshot(snapshot);
   const nextMetrics=await companyCompoundingMetrics(companyId);
   if(version!==requestVersion.current)return;
   setMetrics(nextMetrics);
   setMessage('Company Brain loaded from server.');
  }catch(cause){if(version===requestVersion.current)setMessage(cause instanceof Error?cause.message:'Company Brain readback failed.')}finally{if(version===requestVersion.current)setBusy(false)}
 }
 async function report(){
  if(!companyId)return;
  const version=requestVersion.current;
  setBusy(true);setMessage('');
  try{
   const value=await companyValueReport(companyId);
   if(version!==requestVersion.current)return;
   const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download=`4brand-${companyName.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-value-report.json`;a.click();URL.revokeObjectURL(url);
   setMessage('Company Value Report exported from canonical objects.');
  }catch(cause){if(version===requestVersion.current)setMessage(cause instanceof Error?cause.message:'Company Value Report failed.')}finally{if(version===requestVersion.current)setBusy(false)}
 }
 return <div style={{borderTop:'1px solid #0a0a0a',padding:'18px 0 32px'}}>
  <strong>COMPANY BRAIN · {signedIn?(companyId?'WORKSPACE CONNECTED':'SIGNED IN'):'LOCAL RECOVERY ONLY'}</strong>
  {!signedIn&&<CompanyBrainSignIn onMessage={setMessage}/>}
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
   {signedIn&&!companyId&&<button type='button' disabled={busy} onClick={createWorkspace}>CREATE COMPANY BRAIN</button>}
   <button type='button' disabled={busy} onClick={save}>{signedIn&&companyId?'SAVE TO COMPANY BRAIN':'SAVE LOCAL RECOVERY'}</button>
   {signedIn&&companyId&&<button type='button' disabled={busy} onClick={load}>LOAD / READBACK</button>}
   {signedIn&&companyId&&<button type='button' disabled={busy} onClick={report}>EXPORT VALUE REPORT</button>}
  </div>
  {metrics&&<p style={{fontSize:11,color:'#666'}}>Context {String(metrics.context_count??0)} · Metrics {String(metrics.metric_count??0)} · Opportunities {String(metrics.opportunity_count??0)} · Decisions {String(metrics.decision_count??0)} · Results {String(metrics.result_count??0)} · Learning {String(metrics.learning_count??0)}</p>}
  {message&&<p role='status' style={{fontSize:12,color:'#666'}}>{message}</p>}
  <p style={{fontSize:11,color:'#666'}}>Authenticated company state uses the existing 4Planet_ OS workspace membership and RLS. Browser storage is recovery only, never canonical for an authenticated company.</p>
 </div>
}
