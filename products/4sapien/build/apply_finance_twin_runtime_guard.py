from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_twin_runtime_guard.py <site-dir>')

site = Path(sys.argv[1])
paths = [site/'app'/'money'/'index.html', site/'finance.html', site/'finance'/'index.html']

runtime = r'''<!-- FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1 -->
<script id="four-sapien-finance-twin-runtime">
(function(){
  'use strict';
  const URL='https://ghvdzetmplqkdtfqiror.supabase.co';
  const KEY='sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE';
  let client=null;
  function sb(){
    if(client) return client;
    if(!window.supabase || !window.supabase.createClient) return null;
    client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }
  async function session(){
    const c=sb(); if(!c) return null;
    const r=await c.auth.getSession();
    return r && r.data ? r.data.session : null;
  }
  async function rpc(name,args){
    const c=sb(); if(!c) throw new Error('SUPABASE_CLIENT_UNAVAILABLE');
    const s=await session(); if(!s) throw new Error('UNAUTHENTICATED');
    const r=await c.rpc(name,args||{});
    if(r.error) throw r.error;
    return r.data;
  }
  async function readTwin(year){
    const data=await rpc('four_sapien_finance_twin',{p_year:Number(year)||new Date().getFullYear()});
    window.__FOUR_SAPIEN_FINANCE_TWIN__=data;
    window.dispatchEvent(new CustomEvent('four-sapien-finance-twin',{detail:data}));
    truthGuard(data);
    return data;
  }
  async function saveEvent(id,patch){
    const out=await rpc('four_sapien_finance_save_event',{p_event_id:id||null,p_patch:patch||{}});
    await readTwin(new Date().getFullYear());
    return out;
  }
  async function batchSave(rows){
    const out=await rpc('four_sapien_finance_batch_save_events',{p_rows:Array.isArray(rows)?rows:[]});
    await readTwin(new Date().getFullYear());
    return out;
  }
  async function softDeleteEvent(id){
    const out=await rpc('four_sapien_finance_soft_delete_event',{p_event_id:id});
    await readTwin(new Date().getFullYear());
    return out;
  }
  async function saveAccount(id,patch){
    const out=await rpc('four_sapien_finance_save_account',{p_account_id:id||null,p_patch:patch||{}});
    await readTwin(new Date().getFullYear());
    return out;
  }
  async function foodUntilPaydayContext(){
    return await rpc('four_sapien_plan_food_until_payday_context',{});
  }
  async function setFoodUntilPaydayPermission(state){
    return await rpc('four_sapien_set_permission',{
      p_consumer_world:'food',p_provider_world:'finance',p_capability:'plan_food_until_payday',p_state:state==='allowed'?'allowed':'denied'
    });
  }
  function truthGuard(twin){
    if(!twin || twin.state!=='AVAILABLE') return;
    const freedom=twin.freedom_months||{};
    const liquidity=twin.liquidity||{};
    if(freedom.state==='MODELLED' && liquidity.state==='AVAILABLE') return;
    // Historical Finance donor can render `99+ mnd` from an unknown/zero-like baseline.
    // Fail closed visually until Claude replaces this with native Twin rendering.
    const nodes=document.querySelectorAll('body *');
    nodes.forEach(function(el){
      if(el.children.length) return;
      const t=(el.textContent||'').trim();
      if(/^99\+\s*mnd$/i.test(t)){
        el.textContent='Ukjent';
        el.setAttribute('data-truth','UNKNOWN');
        el.setAttribute('title', freedom.state||'UNKNOWN');
      }
    });
  }
  window.FourSapienFinanceRuntime={
    version:'FINANCE_TWIN_RUNTIME_V1',readTwin,saveEvent,batchSave,softDeleteEvent,saveAccount,
    foodUntilPaydayContext,setFoodUntilPaydayPermission,session
  };
  async function hydrate(){
    try{
      const s=await session();
      if(s) await readTwin(new Date().getFullYear());
    }catch(e){
      window.__FOUR_SAPIEN_FINANCE_TWIN_ERROR__=String(e&&e.message||e);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hydrate,{once:true});
  else hydrate();
  const observer=new MutationObserver(function(){
    const twin=window.__FOUR_SAPIEN_FINANCE_TWIN__; if(twin) truthGuard(twin);
  });
  if(document.documentElement) observer.observe(document.documentElement,{childList:true,subtree:true});
})();
</script>'''

for path in paths:
    if not path.exists():
        raise SystemExit(f'Finance Twin runtime target missing: {path}')
    s=path.read_text(encoding='utf-8')
    if 'FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1' in s:
        raise SystemExit(f'Finance Twin runtime duplicated: {path}')
    if s.count('</body>') != 1:
        raise SystemExit(f'Finance Twin runtime body anchor mismatch: {path}')
    s=s.replace('</body>',runtime+'\n</body>',1)
    for marker in (
        'four_sapien_finance_twin',
        'four_sapien_finance_save_event',
        'four_sapien_finance_batch_save_events',
        'four_sapien_finance_soft_delete_event',
        'four_sapien_finance_save_account',
        'four_sapien_plan_food_until_payday_context',
        'FourSapienFinanceRuntime',
    ):
        if marker not in s:
            raise SystemExit(f'Finance Twin runtime marker missing {marker}: {path}')
    path.write_text(s,encoding='utf-8')

print('4SAPIEN Finance Twin runtime guard injected: canonical RPCs + UNKNOWN fail-closed')
