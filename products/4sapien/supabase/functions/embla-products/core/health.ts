const NUTRI_SCORE: Record<string, number> = { a: 100, b: 82, c: 62, d: 38, e: 18 };

export type HealthSignal = {kind:string; label:string; tone:"positive"|"neutral"|"warning"; source:string};
export type HealthEvidence = {
  nutritionRank:number|null;
  processingRank:number|null;
  tieBreak:number|null;
  signals:HealthSignal[];
  confidence:"SOURCE"|"PARTIAL"|"UNKNOWN";
};

function num(v:any){const n=Number(v);return Number.isFinite(n)?n:null;}

export function healthEvidence(p:any): HealthEvidence {
  const grade = String(p?.nutriscore_grade || "").toLowerCase();
  const nova = num(p?.nova_group);
  const n = p?.nutriments || {};
  const signals:HealthSignal[]=[];
  const nutritionRank = grade in NUTRI_SCORE ? NUTRI_SCORE[grade] : null;
  const processingRank = nova === 1 ? 100 : nova === 2 ? 80 : nova === 3 ? 55 : nova === 4 ? 25 : null;

  if (nutritionRank != null) signals.push({kind:"nutri",label:`NUTRI-SCORE ${grade.toUpperCase()}`,tone:grade==="a"||grade==="b"?"positive":grade==="d"||grade==="e"?"warning":"neutral",source:"Open Food Facts / Nutri-Score"});
  if (nova != null) signals.push({kind:"nova",label:nova===4?"NOVA 4 · ULTRAPROSESSERT":`NOVA ${nova}`,tone:nova===4?"warning":nova===1?"positive":"neutral",source:"Open Food Facts / NOVA"});

  const sugar=num(n.sugars_100g), salt=num(n.salt_100g), sat=num(n["saturated-fat_100g"]), fiber=num(n.fiber_100g);
  if(sugar!=null) signals.push({kind:"sugar",label:`SUKKER ${sugar} g/100g`,tone:"neutral",source:"produktdata"});
  if(salt!=null) signals.push({kind:"salt",label:`SALT ${salt} g/100g`,tone:"neutral",source:"produktdata"});
  if(sat!=null) signals.push({kind:"satfat",label:`METTET FETT ${sat} g/100g`,tone:"neutral",source:"produktdata"});
  if(fiber!=null) signals.push({kind:"fiber",label:`FIBER ${fiber} g/100g`,tone:"neutral",source:"produktdata"});

  // Tie-break only. Not exposed as a medical score. Lower sugar/salt/saturated fat and higher fibre
  // help distinguish products when primary evidence is otherwise close.
  const parts:number[]=[];
  if(sugar!=null) parts.push(Math.max(0,100-Math.min(100,sugar*4)));
  if(salt!=null) parts.push(Math.max(0,100-Math.min(100,salt*25)));
  if(sat!=null) parts.push(Math.max(0,100-Math.min(100,sat*6)));
  if(fiber!=null) parts.push(Math.min(100,fiber*12));
  const tieBreak=parts.length?Math.round(parts.reduce((a,b)=>a+b,0)/parts.length):null;
  const evidenceCount=[nutritionRank,processingRank,tieBreak].filter(v=>v!=null).length;
  return {nutritionRank,processingRank,tieBreak,signals,confidence:evidenceCount>=2?"SOURCE":evidenceCount===1?"PARTIAL":"UNKNOWN"};
}

export function compareHealth(a:any,b:any){
  const A=healthEvidence(a),B=healthEvidence(b);
  const cmp=(x:number|null,y:number|null)=> (y??-1)-(x??-1);
  // Nutri-Score is the primary product-comparison signal when available. NOVA remains separate
  // and secondary; nutrient fields are only a cautious tie-breaker. Relevance is enforced outside.
  return cmp(A.nutritionRank,B.nutritionRank) || cmp(A.processingRank,B.processingRank) || cmp(A.tieBreak,B.tieBreak);
}
