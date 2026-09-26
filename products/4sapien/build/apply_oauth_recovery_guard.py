from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_oauth_recovery_guard.py <generated-food.html>')
p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')
old = 'const google=async()=>{setBusy(true);setMsg("");const{error}=await SB.auth.signInWithOAuth({provider:"google",options:{redirectTo:"https://4sapien.com/app/food/"}});if(error){setMsg(error.message||"Google-innlogging er ikke tilgjengelig.");setBusy(false);}};'
new = 'const google=async()=>{setBusy(true);setMsg("");try{const{error}=await SB.auth.signInWithOAuth({provider:"google",options:{redirectTo:"https://4sapien.com/app/food/"}});if(error)throw error;}catch(e){setMsg(e?.message||"Google-innlogging er ikke tilgjengelig.");setBusy(false);}};'
if s.count(old) != 1:
    raise SystemExit('4SAPIEN OAuth recovery anchor mismatch')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('4SAPIEN OAuth error recovery applied; success/provider/callback preserved')
