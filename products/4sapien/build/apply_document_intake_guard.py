from pathlib import Path
import sys

if len(sys.argv)!=2: raise SystemExit("usage: apply_document_intake_guard.py <site-dir>")
site=Path(sys.argv[1])
source=Path(__file__).resolve().parent.parent/"source"
money=site/"app"/"money"/"index.html"
brain=site/"brain"/"index.html"
for p in (money,brain,source/"4sapien-documents.html",source/"4sapien-documents.js",source/"4sapien-document-analysis.js"):
    if not p.exists(): raise SystemExit(f"DOCUMENT_INTAKE_MISSING: {p}")
page=site/"app"/"money"/"documents"/"index.html"
page.parent.mkdir(parents=True,exist_ok=True)
page.write_text((source/"4sapien-documents.html").read_text(encoding="utf-8"),encoding="utf-8")
(site/"4sapien-documents.js").write_text((source/"4sapien-documents.js").read_text(encoding="utf-8"),encoding="utf-8")
(site/"4sapien-document-analysis.js").write_text((source/"4sapien-document-analysis.js").read_text(encoding="utf-8"),encoding="utf-8")
if not ("/4sapien-documents.js" in page.read_text() and "four_sapien_finance_confirm_document" in (site/"4sapien-documents.js").read_text()):
    raise SystemExit("DOCUMENT_INTAKE_LINK_CONTRACT_MISSING")
anchor='<Btn kind="blue" size={13.5} onClick={()=>setAdd({})}><Icon name="plus" size={16}/>Legg til</Btn></div></header>'
link='<a className="fs-doc-shortcut" href="/app/money/documents/" aria-label="Regninger og kvitteringer">Dokumenter ↗</a>'
for target in [site/"app"/"money"/"index.html",site/"finance.html",site/"finance"/"index.html"]:
    text=target.read_text(encoding="utf-8")
    if text.count(anchor)!=1 or link in text: raise SystemExit(f"DOCUMENT_INTAKE_FINANCE_ANCHOR_MISMATCH: {target}")
    text=text.replace(anchor,anchor+link,1)
    text=text.replace('</head>','''<style id="fs-doc-shortcut-style">
.fs-doc-shortcut{display:inline-flex;align-items:center;max-width:100%;font:12px var(--body,'DM Sans',sans-serif);font-weight:600;color:var(--money,#FF4D22);text-decoration:none;border:1px solid var(--line2);border-radius:10px;padding:9px 12px;margin:-5px 0 15px}
.fs-doc-shortcut:hover{background:var(--fill)}
</style>
</head>''',1)
    target.write_text(text,encoding="utf-8")
# Brain export is opt-in, locally downloaded, RLS-scoped; no new database.
text=brain.read_text(encoding="utf-8")
anchor='<span class="state live">LIVE STATE</span>'
button='<button class="btn" id="brainExport" type="button" onclick="exportPersonalBrain()">Eksporter mine data</button>'
if text.count(anchor)!=1 or button in text: raise SystemExit("BRAIN_EXPORT_ANCHOR_MISMATCH")
text=text.replace(anchor,button+anchor,1)
script=r"""
<script id="four-sapien-personal-brain-export-v1">
async function exportPersonalBrain(){
  const button=document.getElementById('brainExport');
  if(tenantType!=='person'){toast('Company Brain export is not included in this personal export');return}
  const sessionCheck=await sb.auth.getUser();
  if(sessionCheck.error||!sessionCheck.data.user){toast('Logg inn før eksport');return}
  const uid=sessionCheck.data.user.id;
  button.disabled=true;button.textContent='Henter dine data…';
  try{
    const tables=[
      ['four_sapien_embla_memories','user_id'],
      ['four_sapien_goals','user_id'],
      ['four_sapien_decisions','user_id'],
      ['four_sapien_finance_accounts','user_id'],
      ['four_sapien_finance_events','user_id'],
      ['four_sapien_profiles','user_id']
    ];
    const data={};
    for(const [table,owner] of tables){
      const rows=[];let offset=0;
      while(true){
        const r=await sb.from(table).select('*').eq(owner,uid).range(offset,offset+499);
        if(r.error)throw r.error;
        rows.push(...(r.data||[]));
        if(!r.data||r.data.length<500)break;
        offset+=500;
        if(offset>=20000)throw new Error('EXPORT_ROW_LIMIT_REACHED: partial export refused');
      }
      data[table]=rows;
    }
    const payload={schema:'4sapien-personal-brain-export-v1',exported_at:new Date().toISOString(),
      owner_user_id:uid,notes:'Private local export. Original uploaded files are not embedded.',data};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='4sapien-personal-brain-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    toast('Eksporten er lastet ned lokalt. Den inneholder private data – oppbevar den sikkert.');
  }catch(e){toast('Eksport stoppet: '+String(e?.message||e).slice(0,120))}
  finally{button.disabled=false;button.textContent='Eksporter mine data'}
}
</script>
"""
if text.count("</body>")!=1: raise SystemExit("BRAIN_EXPORT_BODY_MISMATCH")
text=text.replace("</body>",script+"</body>",1)
brain.write_text(text,encoding="utf-8")
print("4SAPIEN DOCUMENT INTAKE PASS: private image/PDF upload, canonical Finance link, opt-in Brain context and personal export")
