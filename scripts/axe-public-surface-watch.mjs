/** Existing 4PLANET distribution/SEO lane: deterministic read-only public-surface check. */
export const pages=[
 {url:'https://4planet.org/',owner:'4PLANET core'},
 {url:'https://4species.com/species/orca',owner:'SPECIES'},
 {url:'https://4planetmagazine.com/',owner:'MAGAZINE'},
 {url:'https://4sapien.com/',owner:'4SAPIEN'},
];
export const sitemaps=[
 'https://4planet.org/sitemap.xml',
 'https://4species.com/sitemap.xml',
 'https://4planetmagazine.com/sitemap.xml',
];
export async function probe(fetcher,url,type,timeoutMs=14000){
 const outcome={url,type,state:'UNKNOWN',code:null,final_url:null,canonical:null,issues:[]};
 try{
  const res=await fetcher(url,{redirect:'follow',headers:{'User-Agent':'4PLANET-Public-Surface-Verification/1.0 (+https://4planet.org)'},signal:AbortSignal.timeout(timeoutMs)});
  outcome.code=res.status;outcome.final_url=res.url||url;
  if(res.status<200||res.status>=400){outcome.state=type==='sitemap'?'WARN':'FAIL';outcome.issues.push('HTTP_'+res.status);return outcome;}
  const html=(await res.text()).slice(0,450000);
  if(type==='sitemap'){
   if(!html.includes('<urlset')&&!html.includes('<sitemapindex'))outcome.issues.push('SITEMAP_NOT_XML');
   outcome.state=outcome.issues.length?'WARN':'PASS';return outcome;
  }
  if(!/<html[\s>]/i.test(html))outcome.issues.push('NOT_HTML');
  const robotsHeader=res.headers?.get?.('x-robots-tag')||'';
  const robotsMeta=html.match(/<meta\s+[^>]*name\s*=\s*["']robots["'][^>]*>/i)?.[0]||html.match(/<meta\s+[^>]*content\s*=\s*["'][^"']*noindex[^"']*["'][^>]*>/i)?.[0]||'';
  if(/noindex/i.test(robotsHeader+' '+robotsMeta))outcome.issues.push('NOINDEX_PUBLIC_PAGE');
  const canonical=html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0]||'';
  outcome.canonical=canonical.match(/href\s*=\s*["']([^"']+)/i)?.[1]||null;
  if(!outcome.canonical)outcome.issues.push('CANONICAL_NOT_IN_SERVER_HTML');
  if(outcome.canonical&&new URL(outcome.canonical,url).hostname!==new URL(url).hostname)outcome.issues.push('CANONICAL_DIFFERENT_HOST');
  outcome.state=outcome.issues.some(i=>['NOINDEX_PUBLIC_PAGE','NOT_HTML'].includes(i))?'FAIL':outcome.issues.length?'WARN':'PASS';
 }catch(err){outcome.state=type==='sitemap'?'WARN':'FAIL';outcome.issues.push('FETCH_ERROR_'+(err.name||'Error'));}
 return outcome;
}
export async function check(fetcher=globalThis.fetch){
 const results=[];
 for(const page of pages)results.push(await probe(fetcher,page.url,'page'));
 for(const url of sitemaps)results.push(await probe(fetcher,url,'sitemap'));
 const failed=results.filter(x=>x.state==='FAIL'),warnings=results.filter(x=>x.state==='WARN');
 return {checked_at:new Date().toISOString(),state:failed.length?'FAIL':warnings.length?'WARN':'PASS',failures:failed.length,warnings:warnings.length,results};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const outcome=await check();console.log(JSON.stringify(outcome,null,2));
 if(process.env.GITHUB_STEP_SUMMARY){
  const fs=await import('node:fs');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`# 4PLANET public-surface monitor\n\nState: ${outcome.state}; failed ${outcome.failures}, warnings ${outcome.warnings}.\n\n`+outcome.results.map(r=>`- ${r.url}: ${r.state} (${r.code??'network'}) — ${r.issues.join(', ')||'OK'}\n`).join(''));
 }
 if(outcome.failures>0)process.exitCode=1;
}
