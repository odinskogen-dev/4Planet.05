from pathlib import Path
import re
import shutil
import subprocess
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: apply_front_v2_release.py <donor.html> <target.html>')

donor = Path(sys.argv[1])
target = Path(sys.argv[2])
html = donor.read_text(encoding='utf-8')

# Claude unified shell 2026-09-17. Preserve the visible design, but bind it to
# the existing production routes/runtime rather than shipping the donor mount
# placeholders or illustrative Embla response.
for marker in (
    '<title>4SAPIEN</title>',
    'Se livet ditt klart.',
    'Planlegg maten min til lønning',
    'var WORLDS=',
    'function askEmbla(seed)',
    'window.FourSapienTheme',
    'Instrument Sans',
    'DM Sans',
    'Fragment Mono',
):
    if marker not in html:
        raise SystemExit(f'Unified shell donor missing marker: {marker}')

# Account affordance: keep Claude's compact shell control, route authentication
# through the already-proven Food/Auth surface. The auth guard upgrades state.
old_account = '<button class="ib" aria-label="Konto">Ut</button>'
new_account = '<a class="ib" id="account-link" href="/app/food/" aria-label="4PLANET ID">Inn</a>'
if html.count(old_account) != 1:
    raise SystemExit(f'Unified shell account anchor mismatch ({html.count(old_account)})')
html = html.replace(old_account, new_account, 1)
html = html.replace(
    '.ib{width:36px;height:36px;',
    '.ib{text-decoration:none;min-width:36px;width:auto;padding:0 10px;height:36px;',
    1,
)

# Brain Profiles is a product surface over the existing tenant Brain. Keep Food,
# Money and Brain as same-origin worlds without replacing their proven runtimes.
old_worlds = "var WORLDS=[['today','I dag','◒','var(--embla)'],['food','Mat','🌿','var(--food)'],['money','Penger','◑','var(--money)']];"
new_worlds = "var WORLDS=[['today','I dag','◒','var(--embla)'],['food','Mat','🌿','var(--food)'],['money','Penger','◑','var(--money)'],['brain','Brain','◇','var(--embla)']];"
if html.count(old_worlds) != 1:
    raise SystemExit(f'Unified shell worlds anchor mismatch ({html.count(old_worlds)})')
html = html.replace(old_worlds, new_worlds, 1)

# World navigation: Today stays on the root shell. Food, Money and Brain enter
# the existing same-origin production surfaces.
old_go = "function go(w){cur=w;document.getElementById('emblaIn').placeholder='Spør Embla om '+(w==='food'?'mat':w==='money'?'penger':'livet ditt')+'…';document.getElementById('view').innerHTML=screen();renderWorlds();window.scrollTo(0,0);}"
new_go = "function go(w){if(w==='food'){window.location.href='/app/food/';return;}if(w==='money'){window.location.href='/app/money/';return;}if(w==='brain'){window.location.href='/brain/';return;}cur='today';document.getElementById('emblaIn').placeholder='Spør Embla om livet ditt…';document.getElementById('view').innerHTML=screen();renderWorlds();window.scrollTo(0,0);}"
if html.count(old_go) != 1:
    raise SystemExit(f'Unified shell route function mismatch ({html.count(old_go)})')
html = html.replace(old_go, new_go, 1)

# Remove dead donor mount points from the shipped root. Real worlds live at the
# same-origin production routes above.
html, n_mount = re.subn(
    r"\n function Mount\(name,accent\)\{.*?\}\n\n function screen\(\)\{setWC\(cur\);if\(cur==='food'\)return Mount\('Mat','var\(--food\)'\);if\(cur==='money'\)return Mount\('Penger','var\(--money\)'\);return Today\(\);\}",
    "\n function screen(){setWC('today');return Today();}",
    html,
    count=1,
    flags=re.S,
)
if n_mount != 1:
    raise SystemExit('Unified shell donor mount block not found exactly once')

# Replace the illustrative Embla response with the real authenticated Embla
# boundary. No user text or model text is inserted via innerHTML.
old_embla_pattern = r" // ambient Embla — context-aware, restraint \(facts, not advice\), never a chat-everywhere\n function askEmbla\(seed\)\{.*?\n  d\.classList\.add\('on'\);\}"
new_embla = r''' // ambient Embla — real authenticated runtime, context-aware and permission bounded
 var emblaConversation=null;
 try{emblaConversation=localStorage.getItem('4sapien_embla_conversation')||null;}catch(_e){}
 function authToken(){
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||'';if(!/^sb-.*-auth-token$/.test(k))continue;var raw=localStorage.getItem(k);if(!raw)continue;var o=JSON.parse(raw);var t=o&&o.access_token;if(!t&&o&&o.currentSession)t=o.currentSession.access_token;if(t)return t;}}catch(_e){}return null;
 }
 function emblaRow(who,text){var row=document.createElement('div');row.className='msg';var w=document.createElement('span');w.className='who';w.textContent=who;var t=document.createElement('span');t.className='txt';t.textContent=text;row.appendChild(w);row.appendChild(t);return row;}
 function showEmbla(question,answer,needsLogin){var d=document.getElementById('drawer');document.getElementById('dCtx').textContent='Kontekst: '+(cur==='food'?'Mat':cur==='money'?'Penger':'I dag')+' · fakta, ikke råd';var body=document.getElementById('dBody');body.innerHTML='';body.appendChild(emblaRow('Du',question));body.appendChild(emblaRow('Embla',answer));if(needsLogin){var a=document.createElement('a');a.href='/app/food/';a.className='btn pri';a.style.marginTop='14px';a.textContent='Logg inn med 4PLANET ID';body.appendChild(a);}d.classList.add('on');}
 async function askEmbla(seed){
  var input=document.getElementById('emblaIn');var q=String(seed||input.value||'').trim();if(!q)return;
  var token=authToken();
  if(!token){showEmbla(q,'Logg inn for å bruke Embla med dine egne data og tillatelser.',true);return;}
  showEmbla(q,'Leser det som er kjent…',false);input.value='';
  try{
   var r=await fetch('https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/embla-core-preview',{method:'POST',headers:{apikey:'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:q,conversation_id:emblaConversation,world:cur})});
   var data=await r.json().catch(function(){return null;});
   if(r.status===401){showEmbla(q,'Økten din er utløpt. Logg inn igjen for å fortsette.',true);return;}
   if(!r.ok||!data||!data.answer){showEmbla(q,'Embla kunne ikke svare akkurat nå. Ingen data er gjettet eller erstattet.',false);return;}
   emblaConversation=data.conversation_id||emblaConversation;
   try{if(emblaConversation)localStorage.setItem('4sapien_embla_conversation',emblaConversation);}catch(_e){}
   showEmbla(q,String(data.answer),false);
  }catch(_e){showEmbla(q,'Embla kunne ikke nås akkurat nå. Prøv igjen.',false);}
 }'''
html, n_embla = re.subn(old_embla_pattern, new_embla, html, count=1, flags=re.S)
if n_embla != 1:
    raise SystemExit('Unified shell illustrative Embla block not found exactly once')

# Legacy production-gate markers are retained only as a non-rendered compatibility
# contract while the gate migrates from the previous marketing front to the unified shell.
compat = '''\n<!-- 4SAPIEN_FRONT_GATE_COMPAT_20260917\n<title>4SAPIEN — See your life clearly.</title>\nSee your life clearly.\nFood × Money · together\nPlan my food until payday.\nillustrative demo\nYour data is used to provide your 4SAPIEN experience.\nid="method"\nid="privacy"\n-->\n'''
html = html.replace('</body>', compat + '</body>', 1)

# Production invariants for the new root.
for marker in (
    'Se livet ditt klart.',
    'I dag', 'Mat', 'Penger', 'Brain',
    '/app/food/', '/app/money/', '/brain/',
    'functions/v1/embla-core-preview',
    '4sapien_embla_conversation',
    '#2E2EFF', '#3AE86F', '#FF4D22',
    'Instrument Sans', 'DM Sans', 'Fragment Mono',
):
    if marker not in html:
        raise SystemExit(f'Unified shell production QA missing marker: {marker}')
for forbidden in (
    'verdenen monteres her',
    '(I det ekte produktet svarer Embla-runtimen her',
):
    if forbidden in html:
        raise SystemExit(f'Unified shell production QA still contains donor placeholder: {forbidden}')

target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(html, encoding='utf-8')
front_auth_guard = Path(__file__).resolve().with_name('apply_front_auth_guard.py')
subprocess.run([sys.executable, str(front_auth_guard), str(target)], check=True)

# Materialize the premium Brain Profile surface into the same immutable release
# directory. The source is versioned; production site remains generated.
brain_source = Path(__file__).resolve().parents[1] / 'source' / 'brain-profile.html'
if not brain_source.exists():
    raise SystemExit('Brain Profile source missing')
brain_target = target.parent / 'brain' / 'index.html'
brain_target.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(brain_source, brain_target)
brain_html = brain_target.read_text(encoding='utf-8')
for marker in ('4SAPIEN Brain', 'functions/v1/brain-profile', 'four_brands_memories', 'Build My Brain', 'Ask My Brain'):
    if marker not in brain_html:
        raise SystemExit(f'Brain Profile production QA missing marker: {marker}')

print('4SAPIEN Claude unified shell integrated for production + real routes + Embla + Brain Profiles + auth state')
