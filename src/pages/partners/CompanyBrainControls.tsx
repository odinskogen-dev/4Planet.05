import {useEffect,useState} from 'react';
import CompanyBrainSignIn from '@/pages/partners/CompanyBrainSignIn';
import {currentCompanyBrainSession,listCompanyBrainWorkspaces,type CompanyWorkspace} from '@/product/FourBrandBrainClient';

export default function CompanyBrainControls({companyName}:{companyName:string}){
 const[signedIn,setSignedIn]=useState(false);
 const[workspaces,setWorkspaces]=useState<CompanyWorkspace[]>([]);
 const[message,setMessage]=useState('');
 useEffect(()=>{currentCompanyBrainSession().then(async session=>{if(!session)return;setSignedIn(true);setWorkspaces(await listCompanyBrainWorkspaces())}).catch(cause=>setMessage(cause instanceof Error?cause.message:'Company Brain unavailable.'))},[]);
 const matching=workspaces.find(item=>item.display_name.trim().toLowerCase()===companyName.trim().toLowerCase());
 return <div style={{borderTop:'1px solid #0a0a0a',padding:'18px 0 32px'}}>
  <strong>COMPANY BRAIN · {signedIn?(matching?'WORKSPACE CONNECTED':'SIGNED IN'):'LOCAL RECOVERY ONLY'}</strong>
  {!signedIn&&<CompanyBrainSignIn onMessage={setMessage}/>}
  {message&&<p>{message}</p>}
 </div>
}