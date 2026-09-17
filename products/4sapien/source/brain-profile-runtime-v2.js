// 4PLANET BRAIN PROFILES — correction/removal/detail runtime v2
// Keeps edits append-only through supersession, removes by archive/soft-delete,
// and exposes relationship + version history in the Brain object detail sheet.

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

window.openObject = async function openObjectV2(i){
  current=objects[i];
  if(!current) return;
  document.getElementById('modalCategory').textContent=categoryFor(current);
  document.getElementById('modalTitle').textContent=current.title||titleCase(current.kind);
  document.getElementById('modalMeta').textContent=`${current.confirmation_state||current.truth_state||current.truth_class||'source-derived'} · ${current.source||'4PLANET'} · ${niceDate(current.updated_at||current.created_at)}`;
  document.getElementById('modalContent').value=String(current.content??'');
  document.getElementById('modalContent').disabled=!current.editable;
  const prov=document.getElementById('modalProv');
  const relationships=Array.isArray(current.value?.relationships)?current.value.relationships:[];
  prov.textContent=[
    `Source: ${current.source||current.provenance?.source||'4PLANET'}`,
    `Confidence: ${current.confidence==null?'not scored':Math.round(Number(current.confidence)*100)+'%'}`,
    `Relationships: ${relationships.length?relationships.join(', '):'none recorded yet'}`,
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
      `History: ${versions||'current version only'}`,
      `Provenance: ${JSON.stringify(current.provenance||{})}`
    ].join('\n');
  }catch(_e){
    prov.textContent += '\nHistory: unavailable without changing the object.';
  }
};

window.saveCurrent = async function saveCurrentV2(){
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

window.deleteCurrent = async function deleteCurrentV2(){
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
