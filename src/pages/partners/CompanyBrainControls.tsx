import {useEffect,useState} from 'react';
import CompanyBrainSignIn from '@/pages/partners/CompanyBrainSignIn';
import {companyCompoundingMetrics,companyValueReport,createCompanyBrainWorkspace,currentCompanyBrainSession,listCompanyBrainWorkspaces,loadCompanyBrain,saveCompanyTwin,syncCompanyAnalysis,type CompanyBrainSnapshot,type CompanyWorkspace} from '@/product/FourBrandBrainClient';

type Props={
 companyName:string;
 legalName?:string;
 twin:Record<string,string>;
 ledger:Record<string,string>;
 analysis:unknown;
 onSnapshot:(snapshot:CompanyBrainSnapshot)=>void;
 onLocalRecovery:()=>void;
};

export default function CompanyBrainControls({companyName,legalName,twin,ledger,analysis,onSnapshot,onLocalRecovery}:Props){
 const[signedIn,setSignedIn]=useState(false);
 const[workspaces,setWorkspaces]=useState<CompanyWorkspace[]>([]);
 const[companyId,setCompanyId]=useState('');
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState('');
 const[metrics,setMetrics]=useState<Record<string,unknown>|null>(null);
 useEffect(()=>{currentCompanyBrainSession().then(async session=>{if(!session)return;setSignedIn(true);const rows=await listCompanyBrainWorkspaces();setWorkspaces(rows);const match=rows.find(item=>item.display_name.trim().toLowerCase()===companyName.trim().toLowerCase());setCompanyId(match?.company_id||'')}).catch(cause=>setMessage(cause instanceof Error?cause.message:'Company Brain unavailable.'))},[companyName]);
 async function createWorkspace(){setBusy(true);setMessage('');try{const created=await createCompanyBrainWorkspace(companyName,legalName);setCompanyId(created.company_id);setMessage('Company Brain workspace ready.')}catch(cause){setMessage(cause instanceof Error?cause.message:'Could not create Company Brain.')}finally{setBusy(false)}}
 async function save(){if(!signedIn||!companyId){onLocalRecovery();setMessage('Local recovery saved. Sign in to make company state canonical and cross-device.');return}setBusy(true);setMessage('');try{await saveCompanyTwin(companyId,twin);const snapshot=await syncCompanyAnalysis(companyId,analysis,ledger);onSnapshot(snapshot);setMessage('Saved to Company Brain. Exact server readback passed.')}catch(cause){setMessage(cause instanceof Error?cause.message:'Company Brain save failed.')}finally{setBusy(false)}}
 async function load(){if(!companyId)return;setBusy(true);setMessage('');try{onSnapshot(await loadCompanyBrain(companyId));setMetrics(await companyCompoundingMetrics(companyId));setMessage('Company Brain loaded from server.')}catch(cause){setMessage(cause instanceof Error?cause.message:'Company Brain readback failed.')}finally{setBusy(false)}}
 async function report(){if(!companyId)return;setBusy(true);setMessage('');try{const value=await companyValueReport(companyId);const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`4brand-${companyName.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-value-report.json`;a.click();URL.revokeObjectURL(url);setMessage('Company Value Report exported from canonical objects.')}catch(cause){setMessage(cause instanceof Error?cause.message:'Company Value Report failed.')}finally{setBusy(false)}}
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