import {FormEvent,useState} from 'react';
import {sendCompanyBrainMagicLink} from '@/product/FourBrandBrainClient';

export default function CompanyBrainSignIn({onMessage}:{onMessage:(message:string)=>void}){
 const[email,setEmail]=useState('');const[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);try{await sendCompanyBrainMagicLink(email);onMessage('Sign-in link sent. Existing 4PLANET accounts only; no account is silently created.')}catch(cause){onMessage(cause instanceof Error?cause.message:'Sign-in link failed.')}finally{setBusy(false)}}
 return <form onSubmit={submit} style={{display:'grid',gridTemplateColumns:'minmax(0,360px) auto',gap:8,marginTop:16,maxWidth:620}}>
  <input type='email' value={email} onChange={event=>setEmail(event.target.value)} placeholder='Work email for existing 4PLANET ID' autoComplete='email' required style={{border:'1px solid #bdbdb7',background:'#fff',padding:'12px',font:'14px Instrument Sans, system-ui, sans-serif'}}/>
  <button type='submit' disabled={busy}>{busy?'SENDING…':'SIGN IN TO COMPANY BRAIN'}</button>
 </form>
}