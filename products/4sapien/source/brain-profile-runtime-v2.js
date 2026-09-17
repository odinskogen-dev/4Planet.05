// 4PLANET BRAIN PROFILES — correction/removal runtime v2
// Overrides the prototype's direct row mutation with the canonical server-side
// supersession and soft-delete semantics exposed by the authenticated brain-profile edge function.

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
