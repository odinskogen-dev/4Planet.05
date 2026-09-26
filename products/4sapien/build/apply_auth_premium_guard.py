from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_auth_premium_guard.py <site-dir>')

site = Path(sys.argv[1])
root = site / 'index.html'
food = site / 'app' / 'food' / 'index.html'
money = site / 'app' / 'money' / 'index.html'
brain = site / 'brain' / 'index.html'
for p in (root, food, money, brain):
    if not p.exists():
        raise SystemExit(f'premium auth target missing: {p}')

SB_URL = 'https://ghvdzetmplqkdtfqiror.supabase.co'
SB_KEY = 'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE'

auth_html = r'''<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<title>4SAPIEN ID — Logg inn</title>
<meta name="robots" content="noindex,nofollow">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js"></script>
<style>
:root{--paper:#fff;--ink:#090909;--soft:#6d6962;--line:#dddcd7;--fill:#f7f7f4;--accent:#39e86f;--danger:#b42318;--ok:#137333}
*{box-sizing:border-box}html{-webkit-font-smoothing:antialiased}body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif}
.wrap{min-height:100dvh;display:grid;place-items:center;padding:34px 20px calc(34px + env(safe-area-inset-bottom))}
.card{width:min(100%,500px)}
.brand{font-size:29px;font-weight:760;letter-spacing:-.04em;margin-bottom:6px}.by{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;margin-bottom:48px}
h1{font-size:40px;line-height:1.04;letter-spacing:-.045em;margin:0 0 12px;font-weight:760}.lead{font-size:18px;line-height:1.45;margin:0 0 30px;color:#262626}
.oauth,.primary{width:100%;min-height:54px;border-radius:14px;font-size:17px;font-weight:700;cursor:pointer}.oauth{background:#fff;border:1px solid var(--line);color:var(--ink)}.primary{background:var(--accent);border:0;color:#07170b;margin-top:8px}
.oauth:disabled,.primary:disabled{opacity:.55;cursor:wait}.divider{display:flex;align-items:center;gap:14px;margin:24px 0;color:var(--soft);font-size:13px;letter-spacing:.08em}.divider:before,.divider:after{content:"";height:1px;background:var(--line);flex:1}
label{display:block;font-size:13px;font-weight:700;margin:0 0 8px}.field{margin-bottom:18px}.inputrow{position:relative}
input{width:100%;height:56px;border:1px solid var(--line);border-radius:14px;background:var(--fill);padding:0 16px;font-size:17px;outline:none;color:var(--ink)}
input:focus{border-color:#111;box-shadow:0 0 0 3px rgba(0,0,0,.07)}input[type=password]{padding-right:74px}
.reveal{position:absolute;right:8px;top:8px;height:40px;border:0;background:transparent;padding:0 10px;font-weight:700;cursor:pointer;color:#333}
.row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:-5px;margin-bottom:12px}.link{border:0;background:transparent;padding:0;color:#159c46;font:inherit;cursor:pointer;text-decoration:none}.link:hover{text-decoration:underline}
.status{min-height:24px;margin:14px 0 0;font-size:14px;line-height:1.45}.status.err{color:var(--danger)}.status.ok{color:var(--ok)}
.switch{text-align:center;margin:28px 0 0;color:var(--soft)}.switch .link{font-weight:700}.fine{font-size:12px;line-height:1.55;color:var(--soft);margin-top:24px}
.hidden{display:none!important}.caps{font-size:12px;color:var(--soft);margin-top:7px;min-height:17px}
@media(max-width:560px){.wrap{place-items:start center;padding-top:42px}.brand{font-size:26px}.by{margin-bottom:42px}h1{font-size:36px}}
@media(prefers-color-scheme:dark){:root{--paper:#000;--ink:#fff;--soft:#aaa59d;--line:#333;--fill:#0d0d0d}.lead{color:#e9e9e9}.oauth{background:#080808;color:#fff}.inputrow input{color:#fff}.reveal{color:#ddd}}
</style>
</head>
<body>
<main class="wrap">
<section class="card" aria-labelledby="title">
<div class="brand">4SAPIEN</div><div class="by">BY 4PLANET</div>
<h1 id="title">Logg inn</h1>
<p class="lead" id="lead">Én sikker 4PLANET ID for 4SAPIEN og dine personlige tjenester.</p>

<div id="social">
<button class="oauth" id="google" type="button">Fortsett med Google</button>
<div class="divider">ELLER</div>
</div>

<form id="auth-form" novalidate>
<div class="field" id="email-field">
<label for="email">E-post</label>
<div class="inputrow"><input id="email" name="username" type="email" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" required enterkeyhint="next"></div>
</div>
<div class="field" id="password-field">
<div class="row"><label for="password" style="margin:0">Passord</label><button class="link" id="forgot" type="button">Glemt passord?</button></div>
<div class="inputrow"><input id="password" name="password" type="password" minlength="8" autocomplete="current-password" required enterkeyhint="go"><button class="reveal" type="button" data-for="password" aria-label="Vis passord">Vis</button></div>
<div class="caps" id="caps" aria-live="polite"></div>
</div>
<div class="field hidden" id="confirm-field">
<label for="confirm">Bekreft passord</label>
<div class="inputrow"><input id="confirm" name="new-password-confirm" type="password" minlength="8" autocomplete="new-password" enterkeyhint="go"><button class="reveal" type="button" data-for="confirm" aria-label="Vis passord">Vis</button></div>
</div>
<button class="primary" id="submit" type="submit">Logg inn</button>
<div class="status" id="status" role="status" aria-live="polite"></div>
</form>

<div class="switch" id="switch">Ny her? <button class="link" id="mode-link" type="button">Opprett konto</button></div>
<p class="fine" id="fine">4SAPIEN bruker sikker innlogging fra 4PLANET ID. Passord lagres aldri i denne nettsiden.</p>
</section>
</main>

<script>
(function(){
'use strict';
var SB_URL='https://ghvdzetmplqkdtfqiror.supabase.co';
var SB_KEY='sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE';
var sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
var qs=new URLSearchParams(location.search);
var allowed=['login','signup','forgot','reset'];
var mode=allowed.indexOf(qs.get('mode'))>=0?qs.get('mode'):'login';
var el=function(id){return document.getElementById(id)};
var form=el('auth-form'),email=el('email'),password=el('password'),confirm=el('confirm'),status=el('status');
function safeNext(v){
  try{
    var u=new URL(v||'/',location.origin);
    if(u.origin!==location.origin)return '/';
    var p=u.pathname+u.search+u.hash;
    if(p==='/'||p.indexOf('/app/food/')===0||p.indexOf('/app/money/')===0||p.indexOf('/brain/')===0)return p;
  }catch(_e){}
  return '/';
}
var next=safeNext(qs.get('next')||'/');
function setStatus(msg,kind){status.textContent=msg||'';status.className='status'+(kind?' '+kind:'')}
function humanError(e){
  var m=String((e&&e.message)||e||'');
  if(/Invalid login credentials/i.test(m))return 'E-post eller passord er ikke riktig.';
  if(/Email not confirmed/i.test(m))return 'Bekreft e-postadressen din før du logger inn.';
  if(/User already registered/i.test(m))return 'Det finnes allerede en konto med denne e-postadressen.';
  if(/Password should be at least/i.test(m))return 'Passordet må ha minst 8 tegn.';
  if(/rate limit/i.test(m))return 'For mange forsøk. Vent litt og prøv igjen.';
  if(/expired|invalid.*token|otp/i.test(m))return 'Lenken er utløpt eller ugyldig. Be om en ny.';
  return 'Noe gikk galt. Prøv igjen.';
}
function setMode(m){
  mode=allowed.indexOf(m)>=0?m:'login';
  var signup=mode==='signup',forgot=mode==='forgot',reset=mode==='reset';
  el('social').classList.toggle('hidden',forgot||reset);
  el('email-field').classList.toggle('hidden',reset);
  el('password-field').classList.toggle('hidden',forgot);
  el('forgot').classList.toggle('hidden',signup||reset);
  el('confirm-field').classList.toggle('hidden',!signup&&!reset);
  el('switch').classList.toggle('hidden',reset);
  password.autocomplete=(signup||reset)?'new-password':'current-password';
  password.name=(signup||reset)?'new-password':'password';
  email.autocomplete=signup?'email':'username';
  el('title').textContent=signup?'Opprett konto':forgot?'Tilbakestill passord':reset?'Velg nytt passord':'Logg inn';
  el('lead').textContent=signup?'Opprett din 4PLANET ID for 4SAPIEN.':forgot?'Skriv inn e-posten din. Du får en sikker lenke for å velge nytt passord.':reset?'Velg et nytt passord for 4PLANET ID.':'Én sikker 4PLANET ID for 4SAPIEN og dine personlige tjenester.';
  el('submit').textContent=signup?'Opprett konto':forgot?'Send tilbakestillingslenke':reset?'Lagre nytt passord':'Logg inn';
  el('switch').firstChild.nodeValue=signup?'Har du konto? ':'Ny her? ';
  el('mode-link').textContent=signup?'Logg inn':'Opprett konto';
  setStatus('');
  var u=new URL(location.href);if(mode==='login')u.searchParams.delete('mode');else u.searchParams.set('mode',mode);u.searchParams.set('next',next);history.replaceState({},'',u.pathname+'?'+u.searchParams.toString()+u.hash);
  setTimeout(function(){(reset?password:email).focus()},30);
}
function busy(v){el('submit').disabled=v;el('google').disabled=v}
function redirectNext(){location.replace(next)}
document.querySelectorAll('.reveal').forEach(function(b){b.addEventListener('click',function(){var i=el(b.getAttribute('data-for'));var show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Skjul':'Vis';b.setAttribute('aria-label',show?'Skjul passord':'Vis passord')})});
[password,confirm].forEach(function(i){i.addEventListener('keydown',function(e){el('caps').textContent=e.getModifierState&&e.getModifierState('CapsLock')?'Caps Lock er på.':''})});
el('mode-link').addEventListener('click',function(){setMode(mode==='signup'?'login':'signup')});
el('forgot').addEventListener('click',function(){setMode('forgot')});
el('google').addEventListener('click',async function(){
  busy(true);setStatus('');
  try{
    var redirect=location.origin+'/login/?next='+encodeURIComponent(next);
    var r=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect}});
    if(r.error)throw r.error;
  }catch(e){busy(false);setStatus(humanError(e),'err')}
});
form.addEventListener('submit',async function(e){
  e.preventDefault();setStatus('');
  var mail=email.value.trim();
  if(mode!=='reset'&&!mail){setStatus('Skriv inn e-postadressen din.','err');email.focus();return}
  if(mode!=='forgot'&&password.value.length<8){setStatus('Passordet må ha minst 8 tegn.','err');password.focus();return}
  if((mode==='signup'||mode==='reset')&&password.value!==confirm.value){setStatus('Passordene er ikke like.','err');confirm.focus();return}
  busy(true);
  try{
    if(mode==='login'){
      var a=await sb.auth.signInWithPassword({email:mail,password:password.value});if(a.error)throw a.error;redirectNext();return;
    }
    if(mode==='signup'){
      var red=location.origin+'/login/?next='+encodeURIComponent(next);
      var b=await sb.auth.signUp({email:mail,password:password.value,options:{emailRedirectTo:red}});if(b.error)throw b.error;
      if(b.data&&b.data.session){redirectNext();return}
      setStatus('Konto opprettet. Sjekk e-posten din for å bekrefte adressen.','ok');return;
    }
    if(mode==='forgot'){
      var rr=location.origin+'/login/?mode=reset&next='+encodeURIComponent(next);
      var c=await sb.auth.resetPasswordForEmail(mail,{redirectTo:rr});if(c.error)throw c.error;
      setStatus('Hvis adressen finnes hos oss, er en sikker tilbakestillingslenke sendt.','ok');return;
    }
    if(mode==='reset'){
      var d=await sb.auth.updateUser({password:password.value});if(d.error)throw d.error;
      setStatus('Passordet er oppdatert.','ok');setTimeout(redirectNext,700);return;
    }
  }catch(err){setStatus(humanError(err),'err')}
  finally{busy(false)}
});
sb.auth.onAuthStateChange(function(event,session){
  if(event==='PASSWORD_RECOVERY'){setMode('reset');return}
  if(event==='SIGNED_IN'&&session&&mode!=='reset'&&mode!=='signup'){setTimeout(redirectNext,50)}
});
async function boot(){
  setMode(mode);
  if(mode==='reset'){
    setStatus('Bekrefter tilbakestillingslenken…');
    setTimeout(async function(){
      var s=await sb.auth.getSession();
      if(s.data&&s.data.session){setStatus('');password.focus()}
      else setStatus('Tilbakestillingslenken er ugyldig eller utløpt. Be om en ny.','err');
    },450);
    return;
  }
  var s=await sb.auth.getSession();
  if(s.data&&s.data.session&&mode==='login')redirectNext();
}
boot();
})();
</script>
</body>
</html>'''

login = site / 'login' / 'index.html'
login.parent.mkdir(parents=True, exist_ok=True)
login.write_text(auth_html, encoding='utf-8')

# Public root points signed-out users to the dedicated identity surface.
s = root.read_text(encoding='utf-8')
if 'id="account-link"' not in s:
    raise SystemExit('root account-link missing')
s = s.replace('id="account-link" href="/app/food/"', 'id="account-link" href="/login/"', 1)
s = s.replace("a.href='/app/food/';a.className='btn pri';", "a.href='/login/?next=/';a.className='btn pri';", 1)
signed = "link.setAttribute('data-signed-in','1');"
if signed not in s:
    raise SystemExit('root signed-in identity marker missing')
s = s.replace(signed, signed+"link.href='/app/food/';", 1)
root.write_text(s, encoding='utf-8')

# All private worlds use one global 4PLANET ID entry point instead of maintaining
# separate partial login UIs. Existing authenticated sessions continue normally.
router = r'''<script id="four-sapien-global-auth-router">
(function(){
  var tries=0;
  async function run(){
    if(!window.supabase||!window.supabase.createClient){if(++tries<30)setTimeout(run,50);return}
    try{
      var sb=window.supabase.createClient('https://ghvdzetmplqkdtfqiror.supabase.co','sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      var r=await sb.auth.getSession();
      if(r&&r.data&&r.data.session)return;
      var n=location.pathname+location.search+location.hash;
      location.replace('/login/?next='+encodeURIComponent(n));
    }catch(_e){}
  }
  run();
})();
</script>'''

for p in (food, money, brain):
    q = p.read_text(encoding='utf-8')
    if 'id="four-sapien-global-auth-router"' in q:
        raise SystemExit(f'auth router already present: {p}')
    if '</body>' not in q:
        raise SystemExit(f'body close missing: {p}')
    q = q.replace('</body>', router + '\n</body>', 1)
    p.write_text(q, encoding='utf-8')

for marker in (
    'resetPasswordForEmail',
    'updateUser({password:password.value})',
    'signInWithPassword',
    "provider:'google'",
    'autocomplete="current-password"',
    'autocomplete="new-password"',
    'Glemt passord?',
    'Hvis adressen finnes hos oss',
):
    if marker not in auth_html:
        raise SystemExit(f'premium auth marker missing: {marker}')
for p in (food, money, brain):
    if 'four-sapien-global-auth-router' not in p.read_text(encoding='utf-8'):
        raise SystemExit(f'global auth router missing: {p}')
if 'href="/login/"' not in root.read_text(encoding='utf-8'):
    raise SystemExit('root login link not upgraded')

print('4SAPIEN PREMIUM AUTH 01 applied: shared login + Google + signup + forgot/reset + password-manager semantics + global private-world routing')
