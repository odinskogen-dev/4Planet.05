// 4PLANET BRAIN PROFILES — correction/removal/detail + document runtime v3
// Keeps edits append-only through supersession, removes by archive/soft-delete,
// exposes relationship + version history, and extracts supported documents locally.

async function brainObjectHistory(object){
  if(!object?.editable) return [];
  const table=tenantType==='company'?'four_brands_memories':'four_sapien_embla_memories';
  const history=[object];
  let cursor=object.supersedes_id||null;
  let guard=0;
  while(cursor && guard<10){
    const q=await sb.from(table)
      .select('id,content,state,confirmation_state,confidence,supersedes_id,provenance,created_at,updated_at')
      .eq('id',cursor)
      .maybeSingle();
    if(q.error||!q.data) break;
    history.push(q.data);
    cursor=q.data.supersedes_id||null;
    guard++;
  }
  return history;
}

window.openObject = async function openObjectV3(i){
  current=objects[i];
  if(!current) return;
  document.getElementById('modalCategory').textContent=categoryFor(current);
  document.getElementById('modalTitle').textContent=current.title||titleCase(current.kind);
  const brainState=current.provenance?.brain_state||current.state||'active';
  const confirmation=current.confirmation_state||current.provenance?.confirmation_state||current.truth_state||current.truth_class||'source-derived';
  document.getElementById('modalMeta').textContent=`${brainState} · ${confirmation} · ${current.source||'4PLANET'} · ${niceDate(current.updated_at||current.created_at)}`;
  document.getElementById('modalContent').value=String(current.content??'');
  document.getElementById('modalContent').disabled=!current.editable;
  const prov=document.getElementById('modalProv');
  const relationships=Array.isArray(current.value?.relationships)?current.value.relationships:[];
  const conflict=current.provenance?.conflict_state==='needs_confirmation'
    ? `Conflict: needs confirmation · prior ${current.provenance?.conflicts_with||'version'}`
    : 'Conflict: none recorded';
  prov.textContent=[
    `Source: ${current.source||current.provenance?.source||'4PLANET'}`,
    `Confidence: ${current.confidence==null?'not scored':Math.round(Number(current.confidence)*100)+'%'}`,
    `Relationships: ${relationships.length?relationships.join(', '):'none recorded yet'}`,
    conflict,
    'History: reading version chain…'
  ].join('\n');
  document.getElementById('modal').classList.add('on');
  try{
    const history=await brainObjectHistory(current);
    const versions=history.map((h,idx)=>{
      const state=h.state||'active';
      const when=niceDate(h.updated_at||h.created_at);
      return `${idx===0?'current':'v-'+idx} · ${state} · ${when}`;
    }).join(' | ');
    prov.textContent=[
      `Source: ${current.source||current.provenance?.source||'4PLANET'}`,
      `Confidence: ${current.confidence==null?'not scored':Math.round(Number(current.confidence)*100)+'%'}`,
      `Relationships: ${relationships.length?relationships.join(', '):'none recorded yet'}`,
      conflict,
      `History: ${versions||'current version only'}`,
      `Provenance: ${JSON.stringify(current.provenance||{})}`
    ].join('\n');
  }catch(_e){
    prov.textContent += '\nHistory: unavailable without changing the object.';
  }
};

window.saveCurrent = async function saveCurrentV3(){
  if(!current?.editable) return toast('This object is managed by its source system');
  const content=document.getElementById('modalContent').value.trim();
  if(!content) return toast('Content cannot be empty');
  try{
    await api({
      action:'correct',
      tenant_type:tenantType,
      company_id:companyId,
      object_id:current.id,
      content
    });
    closeModal();
    await loadData();
    toast('Brain corrected · history preserved');
  }catch(e){
    toast(String(e?.message||e||'Correction could not be saved'));
  }
};

window.deleteCurrent = async function deleteCurrentV3(){
  if(!current?.editable) return toast('Remove this object in its source system');
  try{
    await api({
      action:'remove',
      tenant_type:tenantType,
      company_id:companyId,
      object_id:current.id
    });
    closeModal();
    await loadData();
    toast('Removed from active Brain');
  }catch(e){
    toast(String(e?.message||e||'Object could not be removed'));
  }
};

async function extractPdfText(file){
  const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const data=new Uint8Array(await file.arrayBuffer());
  const pdf=await pdfjs.getDocument({data}).promise;
  const maxPages=Math.min(pdf.numPages,80);
  const pages=[];
  for(let i=1;i<=maxPages;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    const text=content.items.map(x=>String(x.str||'')).join(' ').replace(/\s+/g,' ').trim();
    if(text) pages.push(`[Page ${i}] ${text}`);
    if(pages.join('\n').length>60000) break;
  }
  const out=pages.join('\n\n').trim();
  if(!out) throw new Error('PDF_NO_EXTRACTABLE_TEXT');
  return out;
}

window.readFile = async function readBrainFile(input){
  const f=input.files?.[0];
  if(!f) return;
  const isPdf=f.type==='application/pdf'||/\.pdf$/i.test(f.name);
  const max=isPdf?12_000_000:1_200_000;
  if(f.size>max){toast(isPdf?'Use a PDF under 12 MB':'Use a text file under 1.2 MB');input.value='';return}
  const n=document.getElementById('fileName');
  n.textContent='Reading '+f.name+'…';
  try{
    const text=isPdf?await extractPdfText(f):await f.text();
    document.getElementById('contextInput').value=String(text||'').slice(0,24000);
    n.textContent=f.name;
    n.dataset.source=`Imported ${isPdf?'PDF':'document'}: ${f.name}`;
    toast(`${isPdf?'PDF':'Document'} loaded locally — review, then structure`);
  }catch(e){
    n.textContent='TXT · MD · CSV · JSON · PDF';
    n.dataset.source='';
    toast(String(e?.message||e)==='PDF_NO_EXTRACTABLE_TEXT'?'This PDF has no extractable text yet':'Document could not be read');
  }finally{input.value=''}
};

(function closeBrainProductGaps(){
  const apply=()=>{
    const input=document.getElementById('fileInput');
    if(input) input.accept='.txt,.md,.csv,.json,.html,.pdf,text/plain,text/csv,application/json,application/pdf';
    const label=document.getElementById('fileName');
    if(label&&!label.dataset.source) label.textContent='TXT · MD · CSV · JSON · PDF';
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true}); else apply();
})();
