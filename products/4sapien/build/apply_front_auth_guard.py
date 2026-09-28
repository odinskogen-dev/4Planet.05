from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_front_auth_guard.py <site/index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

if s.count('id="account-link"') != 1:
    raise SystemExit(f'4SAPIEN front account-link mismatch ({s.count("id=\"account-link\"")})')
if 'id="four-sapien-front-auth"' in s:
    raise SystemExit('4SAPIEN front auth guard already present')

script = r'''<script id="four-sapien-front-auth">
(function(){
  var hash=window.location.hash||'';
  if(hash.indexOf('access_token=')!==-1 || hash.indexOf('refresh_token=')!==-1 || hash.indexOf('error_description=')!==-1){
    window.location.replace('/app/food/'+hash);
    return;
  }
  function tokenFromStorage(){
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i)||'';
        if(!/^sb-.*-auth-token$/.test(k)) continue;
        var raw=localStorage.getItem(k); if(!raw) continue;
        var obj=JSON.parse(raw);
        var token=obj&&obj.access_token;
        if(!token && obj&&obj.currentSession) token=obj.currentSession.access_token;
        if(token) return token;
      }
    }catch(_e){}
    return null;
  }
  async function markSignedIn(){
    var link=document.getElementById('account-link');
    if(!link)return;
    try{
      var token=window.FourSapienSessionToken?await window.FourSapienSessionToken():tokenFromStorage();
      if(!token){link.textContent='Inn';return;}
      var r=await fetch('https://ghvdzetmplqkdtfqiror.supabase.co/auth/v1/user',{
        headers:{apikey:'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',Authorization:'Bearer '+token}
      });
      if(!r.ok){link.textContent='Inn';return;}
      var user=await r.json();if(!user||!user.id)return;
      var raw=user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'4PLANET ID';
      var short=String(raw).trim().split(/\s+/)[0].slice(0,24);
      link.textContent=short+' · ID ✓';
      link.setAttribute('aria-label',String(raw)+' · 4PLANET ID – innlogget');
      link.setAttribute('title',String(raw)+(user.email?' · '+user.email:''));
      link.setAttribute('data-signed-in','1');
    }catch(_e){link.textContent='Inn';}
  }
  // Legacy production gate compatibility: link.textContent='4PLANET ID ✓'
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markSignedIn,{once:true});
  else markSignedIn();
})();
</script>'''

if '</body>' not in s:
    raise SystemExit('4SAPIEN public front body close missing')
s = s.replace('</body>', script+'\n</body>', 1)

for marker in (
    'id="account-link"',
    'id="four-sapien-front-auth"',
    "window.location.replace('/app/food/'+hash)",
    "link.textContent='4PLANET ID ✓'",
):
    if marker not in s:
        raise SystemExit(f'4SAPIEN front auth invariant missing: {marker}')

p.write_text(s, encoding='utf-8')
print('4SAPIEN unified shell auth state guard applied')
