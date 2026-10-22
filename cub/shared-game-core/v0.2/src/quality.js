/** Deterministic performance budget evaluation. Performance must be measured in an actual game/browser separately. */
export function evaluateBudgets(sample,budgets={frameP95Ms:33.3,drawCalls:300,triangles:180000,textureMB:96}){
 const out=[];
 for(const [k,limit] of Object.entries(budgets)){
  if(!Number.isFinite(limit)||limit<=0)throw Error(`Invalid budget ${k}`);
  const value=sample[k];if(value===undefined){out.push({metric:k,status:'missing',limit});continue;}
  if(!Number.isFinite(value)||value<0)throw Error(`Bad metric ${k}`);
  out.push({metric:k,status:value<=limit?'pass':'fail',actual:value,limit});
 }return {pass:out.every(x=>x.status==='pass'),checks:out};
}
export function summarizeBenchmark(samples){if(!Array.isArray(samples)||!samples.length||samples.some(n=>!Number.isFinite(n)||n<0))throw Error('Invalid samples');
 const sorted=[...samples].sort((a,b)=>a-b);return {count:samples.length,mean:samples.reduce((a,b)=>a+b,0)/samples.length,p95:sorted[Math.ceil(.95*(sorted.length-1))],max:sorted.at(-1)};
}