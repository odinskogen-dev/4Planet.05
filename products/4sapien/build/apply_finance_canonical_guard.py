from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_canonical_guard.py <site-dir>')
site=Path(sys.argv[1])
paths=[site/'app'/'money'/'index.html',site/'finance.html',site/'finance'/'index.html']

old_up="async function up(t,id,p){let{error}=await D.from(t).update(p).eq('id',id);if(error)return toast('Kunne ikke lagre');await load();render();toast('Lagret')}"
new_up="async function up(t,id,p){let fn=t===ET?'four_sapien_finance_save_event':'four_sapien_finance_save_account',args=t===ET?{p_event_id:id,p_patch:p}:{p_account_id:id,p_patch:p};let{error}=await D.rpc(fn,args);if(error)return toast('Kunne ikke lagre');await load();render();toast('Lagret')}"
old_del="async function del(id){if(!confirm('Slette denne hendelsen?'))return;let{error}=await D.from(ET).delete().eq('id',id);if(error)return toast('Kunne ikke slette');await load();render()}"
new_del="async function del(id){if(!confirm('Slette denne hendelsen?'))return;let{error}=await D.rpc('four_sapien_finance_soft_delete_event',{p_event_id:id});if(error)return toast('Kunne ikke slette');await load();render()}"
old_rows="async function saveRows(){let s=(await D.auth.getSession()).data.session;if(!s)return;let p=[];$$('.qr').forEach(r=>{let n=$('.qn',r).value.trim(),a=Math.abs(Math.round(+$('.qa',r).value||0));if(!n||!a)return;let t=$('.qt',r).value;p.push({user_id:s.user.id,type:t,amount:a,currency:'NOK',name:n,occurred_on:$('.qd',r).value,category:$('.qc',r).value,recurring:$('.qrp',r).value,state:t==='bill'?'upcoming':'active',source:'manual',truth:'user'})});if(!p.length)return toast('Ingen komplette rader');let{error}=await D.from(ET).insert(p);if(error)return toast('Kunne ikke lagre');$('#afModal').classList.remove('on');await load();render();toast(p.length+' rader lagret')}"
new_rows="async function saveRows(){let s=(await D.auth.getSession()).data.session;if(!s)return;let p=[];$$('.qr').forEach(r=>{let n=$('.qn',r).value.trim(),a=Math.abs(Math.round(+$('.qa',r).value||0));if(!n||!a)return;let t=$('.qt',r).value;p.push({type:t,amount:a,currency:'NOK',name:n,occurred_on:$('.qd',r).value,category:$('.qc',r).value,recurring:$('.qrp',r).value,state:t==='bill'?'upcoming':'active',source:'manual',truth:'user'})});if(!p.length)return toast('Ingen komplette rader');let{error}=await D.rpc('four_sapien_finance_batch_save_events',{p_rows:p});if(error)return toast('Kunne ikke lagre');$('#afModal').classList.remove('on');await load();render();toast(p.length+' rader lagret')}"

canonical_helpers=r'''async function financeTool(tool,args={}){let{data,error}=await D.rpc('four_sapien_embla_finance_tool',{p_tool:tool,p_arguments:args});if(error)throw error;return data}
function canonMoney(v){return v===null||v===undefined?'UKJENT':kr(+v||0)}
function canonCard(t){let l=t?.liquidity||{},f=t?.freedom_months||{},nw=t?.net_worth||{},burn=t?.monthly_recurring_expense_equivalent||{};return`<div class="bar"><div><div class="ttl">Canonical Finance Twin</div><div class="mut">Samme truth-state brukes av Finance, Embla og FOOD × MONEY.</div></div><span class="truth">DETERMINISTISK</span></div><div class="detail"><div><div class="lab">Likviditet</div><b>${l.truth==='UNKNOWN'?'UKJENT':canonMoney(l.amount)}</b></div><div><div class="lab">Nettoformue</div><b>${canonMoney(nw.amount)}</b></div><div><div class="lab">Fast månedsburn</div><b>${canonMoney(burn.amount)}</b></div><div><div class="lab">Runway</div><b>${f.truth==='UNKNOWN'?'UKJENT':f.amount+' mnd'}</b></div></div><div class="actions"><button class="btn" id="afAsk">Spør Embla om økonomien</button></div>`}
async function refreshTwin(){let box=$('#afCanon');if(!box)return;box.innerHTML='<div class="mut">Henter canonical state…</div>';try{let t=await financeTool('finance_twin',{year:new Date().getFullYear()});box.innerHTML=canonCard(t);$('#afAsk')?.addEventListener('click',askFinance)}catch(e){box.innerHTML='<div class="mut">Canonical state er utilgjengelig akkurat nå. Lokale registrerte data er ikke endret.</div>'}}
function answerText(tool,d){if(tool==='finance_twin'){let l=d?.liquidity||{},f=d?.freedom_months||{};return l.truth==='UNKNOWN'?'Likviditet: UKJENT. Registrer minst én bank- eller kontantkonto.':`Tilgjengelig nå: ${canonMoney(l.amount)}. Runway: ${f.truth==='UNKNOWN'?'UKJENT':f.amount+' mnd'}.`;}if(tool==='monthly_timeline'){let m=(d?.months||[]).find(x=>x.month===new Date().getMonth()+1);return m?`Denne måneden: registrert netto ${canonMoney(m.actual?.net)} · prognose resten ${canonMoney(m.forecast?.net)}.`:'Månedsdata er UKJENT.';}if(tool==='food_until_payday'){if(d?.state==='PERMISSION_REQUIRED')return'FOOD × MONEY krever eksplisitt tillatelse i Middag før økonomidata kan brukes der.';if(d?.available_after_known_obligations==null)return'Ramme frem til neste inntekt: UKJENT. Mangler likviditet eller neste inntekt.';return`Etter kjente forpliktelser frem til ${d.next_income_date}: ${canonMoney(d.available_after_known_obligations)}.`;}return'UKJENT'}
function askFinance(){let m=$('#afModal');m.innerHTML=`<div class="modal"><div class="mhead"><div><h2 style="margin:0">Embla · Finance tools</h2><div class="mut">Deterministiske svar fra registrert Finance-state. Ingen gjetting.</div></div><button class="btn" id="afCloseAsk">×</button></div><div class="actions" style="flex-wrap:wrap"><button class="btn fq" data-tool="finance_twin">Hva har jeg tilgjengelig nå?</button><button class="btn fq" data-tool="monthly_timeline">Hva skjer denne måneden?</button><button class="btn fq" data-tool="food_until_payday">Hva har jeg frem til neste inntekt?</button></div><div id="afAnswer" class="card" style="margin-top:14px"><div class="mut">Velg et spørsmål.</div></div></div>`;m.classList.add('on');$('#afCloseAsk').onclick=()=>m.classList.remove('on');$$('.fq',m).forEach(b=>b.onclick=async()=>{let out=$('#afAnswer');out.innerHTML='<div class="mut">Beregner…</div>';try{let d=await financeTool(b.dataset.tool,{year:new Date().getFullYear()});out.innerHTML=`<div class="truth">FACTS, NOT ADVICE</div><div style="margin-top:8px">${esc(answerText(b.dataset.tool,d))}</div>`}catch(e){out.innerHTML='<div class="mut">Kunne ikke hente svaret.</div>'}})}
'''
old_render="function render(){let m=mode(),l=$('#axeFin');if(!m){l.style.display='none';return}l.style.display='block';$('#afBody').innerHTML=m==='overview'?overview():moneyPage();bind()}"
new_render="function render(){let m=mode(),l=$('#axeFin');if(!m){l.style.display='none';return}l.style.display='block';$('#afBody').innerHTML=m==='overview'?overview():moneyPage();bind();if(m==='overview')void refreshTwin()}"
old_overview='Registrerte fakta holdes adskilt fra prognose.</div><div class="card quad">'
new_overview='Registrerte fakta holdes adskilt fra prognose.</div><div id="afCanon" class="card" style="margin-top:18px"><div class="mut">Henter canonical state…</div></div><div class="card quad">'

for path in paths:
    if not path.exists(): raise SystemExit(f'Finance canonical target missing: {path}')
    s=path.read_text(encoding='utf-8')
    if 'AXE_FINANCE_CANONICAL_V1' in s: raise SystemExit(f'Finance canonical guard duplicated: {path}')
    for old,new,label in ((old_up,new_up,'up'),(old_del,new_del,'delete'),(old_rows,new_rows,'batch'),(old_render,new_render,'render'),(old_overview,new_overview,'overview')):
        if s.count(old)!=1: raise SystemExit(f'Finance canonical anchor {label} mismatch: {s.count(old)} in {path}')
        s=s.replace(old,new,1)
    marker="<!-- AXE_FINANCE_EXPERIENCE_V2 -->"
    if s.count(marker)!=1: raise SystemExit(f'Finance experience marker mismatch: {path}')
    s=s.replace(marker,marker+'<!-- AXE_FINANCE_CANONICAL_V1 -->',1)
    anchor='function render(){'
    if s.count(anchor)!=1: raise SystemExit(f'Finance render helper anchor mismatch after replacement: {path}')
    s=s.replace(anchor,canonical_helpers+'\n'+anchor,1)
    for required in ('four_sapien_finance_save_event','four_sapien_finance_save_account','four_sapien_finance_batch_save_events','four_sapien_finance_soft_delete_event','four_sapien_embla_finance_tool','Canonical Finance Twin','FACTS, NOT ADVICE'):
        if required not in s: raise SystemExit(f'Finance canonical marker missing {required}: {path}')
    path.write_text(s,encoding='utf-8')
print('4SAPIEN Finance canonical runtime guard applied')
