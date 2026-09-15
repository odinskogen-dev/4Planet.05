from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"4SAPIEN Human Gold preview anchor mismatch: {label} ({count} matches)")
    s = s.replace(old, new, 1)


# A preview login must return to the preview origin. The production guard deliberately
# pins auth to 4sapien.com, so override it only in this isolated founder-preview build.
replace_once(
    'emailRedirectTo:"https://4sapien.com/"',
    'emailRedirectTo:window.location.origin+"/"',
    "email confirmation return",
)
replace_once(
    'redirectTo:"https://4sapien.com/"',
    'redirectTo:window.location.origin+"/"',
    "Google OAuth return",
)

# Preview transport hardening: refresh the Supabase session once if the Core boundary
# rejects the bearer token. The Edge Function independently validates the bearer token
# against Supabase Auth, so no trust is moved into the browser.
old_transport = '''async function emblaCoreRequest(message,conversationId){
 const{data:{session}}=await SB.auth.getSession();
 if(!session?.access_token)throw Object.assign(new Error("AUTH_REQUIRED"),{code:"AUTH_REQUIRED"});
 const run=async(cid)=>{
  const r=await fetch(`${SUPABASE_URL}/functions/v1/embla-core-preview`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({message,conversation_id:cid||null})});
  const d=await r.json().catch(()=>({ok:false,state:"RUNTIME_ERROR"}));
  return{r,d};
 };
 let out=await run(conversationId);
 if(out.r.status===404&&conversationId){sessionStorage.removeItem(`4sapien_embla_conversation_${session.user.id}`);out=await run(null);}
 if(!out.r.ok||!out.d?.ok)throw Object.assign(new Error(out.d?.state||`HTTP_${out.r.status}`),{code:out.d?.state||`HTTP_${out.r.status}`,detail:out.d});
 if(out.d.conversation_id)sessionStorage.setItem(`4sapien_embla_conversation_${session.user.id}`,out.d.conversation_id);
 return out.d;
}'''
new_transport = '''async function emblaCoreRequest(message,conversationId){
 let{data:{session}}=await SB.auth.getSession();
 if(!session?.access_token)throw Object.assign(new Error("AUTH_REQUIRED"),{code:"AUTH_REQUIRED"});
 const run=async(cid,token)=>{
  const r=await fetch(`${SUPABASE_URL}/functions/v1/embla-core-preview`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({message,conversation_id:cid||null})});
  const d=await r.json().catch(()=>({ok:false,state:"RUNTIME_ERROR"}));
  return{r,d};
 };
 let out=await run(conversationId,session.access_token);
 if(out.r.status===401){
  const refreshed=await SB.auth.refreshSession();
  session=refreshed?.data?.session||null;
  if(!session?.access_token)throw Object.assign(new Error("AUTH_REQUIRED"),{code:"AUTH_REQUIRED"});
  out=await run(conversationId,session.access_token);
 }
 if(out.r.status===404&&conversationId){sessionStorage.removeItem(`4sapien_embla_conversation_${session.user.id}`);out=await run(null,session.access_token);}
 if(!out.r.ok||!out.d?.ok)throw Object.assign(new Error(out.d?.state||`HTTP_${out.r.status}`),{code:out.d?.state||`HTTP_${out.r.status}`,detail:out.d});
 if(out.d.conversation_id)sessionStorage.setItem(`4sapien_embla_conversation_${session.user.id}`,out.d.conversation_id);
 return out.d;
}'''
replace_once(old_transport, new_transport, "Embla authenticated transport")

# Human Gold is a diagnostic preview. If a request still fails, expose only the stable
# backend state/code (never secrets) so the next fix is deterministic instead of blind.
replace_once(
    '"Embla fikk ikke fullført dette forsøket. Ingen ukjente data blir fylt inn."',
    '`Embla fikk ikke fullført dette forsøket. Ingen ukjente data blir fylt inn. [${code}]`',
    "preview runtime error code",
)

# Make it visually impossible to confuse the isolated Human Gold preview with live.
preview_badge = '''<div id="human-gold-preview-badge" style="position:fixed;top:8px;right:8px;z-index:2147483647;background:#000;color:#FFFF00;border:1px solid #FFFF00;border-radius:999px;padding:5px 8px;font:700 9px/1.1 monospace;letter-spacing:.8px;pointer-events:none">HUMAN GOLD PREVIEW</div>'''
if 'id="human-gold-preview-badge"' not in s:
    if '<body>' in s:
        s = s.replace('<body>', '<body>' + preview_badge, 1)
    elif '<body ' in s:
        idx = s.find('>', s.find('<body '))
        if idx < 0:
            raise SystemExit("4SAPIEN Human Gold preview body anchor missing")
        s = s[:idx+1] + preview_badge + s[idx+1:]
    else:
        raise SystemExit("4SAPIEN Human Gold preview body anchor missing")

# Give the composer a stable target and add a small founder-only jump affordance.
replace_once(
    '<section aria-label="Ask Embla"',
    '<section id="human-gold-embla" aria-label="Ask Embla"',
    "Embla composer section",
)
preview_jump = '''<a id="human-gold-jump" href="#human-gold-embla" style="position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483646;background:#000;color:#FFFF00;border:1px solid #FFFF00;border-radius:999px;padding:9px 14px;font:700 11px/1 monospace;letter-spacing:.6px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.25)">SPØR EMBLA ↑</a>'''
if 'id="human-gold-jump"' not in s:
    marker = '<div id="root"></div>'
    if marker not in s:
        raise SystemExit("4SAPIEN Human Gold preview root anchor missing")
    s = s.replace(marker, preview_jump + marker, 1)

for marker in [
    'emailRedirectTo:window.location.origin+"/"',
    'redirectTo:window.location.origin+"/"',
    'SB.auth.refreshSession()',
    'id="human-gold-preview-badge"',
    'id="human-gold-embla"',
    'id="human-gold-jump"',
    'HUMAN GOLD PREVIEW',
    'SPØR EMBLA ↑',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN Human Gold preview invariant missing: {marker}")

p.write_text(s)
print("4SAPIEN Human Gold preview auth + transport + visibility guard applied")
