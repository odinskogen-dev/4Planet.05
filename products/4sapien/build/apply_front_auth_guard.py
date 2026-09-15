from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_front_auth_guard.py <site/index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

old = '<a href="/app/food/" class="login">Log in</a>'
new = '<a href="/app/food/" class="login" id="account-link">Log in</a>'
if s.count(old) != 1:
    raise SystemExit(f'4SAPIEN front account-link anchor mismatch ({s.count(old)})')
s = s.replace(old, new, 1)

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
  function markSignedIn(){
    var link=document.getElementById('account-link');
    if(!link) return;
    var token=tokenFromStorage();
    if(!token) return;
    fetch('https://ghvdzetmplqkdtfqiror.supabase.co/auth/v1/user',{
      headers:{
        apikey:'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',
        Authorization:'Bearer '+token
      }
    }).then(function(r){return r.ok?r.json():null}).then(function(user){
      if(!user||!user.id) return;
      link.textContent='4PLANET ID ✓';
      link.setAttribute('aria-label','4PLANET ID – innlogget');
      link.setAttribute('title',user.email||'4PLANET ID');
    }).catch(function(){});
  }
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
print('4SAPIEN public front auth guard applied')
