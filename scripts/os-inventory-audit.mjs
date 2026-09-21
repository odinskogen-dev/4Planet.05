// Pure, bounded reconciliation of existing Source Inventory against service-account
// traversal. Counts only; NEVER project excluded personal document names into OS.
export const SOURCE_INVENTORY_ID="1zND2mhYCQ5haYBWblqdK15_2XuGrUEFsdcEb704zmMw";
const PRIVATE=/odin brain|odin private|private root|personal brain|personlig|tenant brain|private person|secrets|credentials/i;
export function reconcileDocumentedInventory(rows, files) {
 const h=rows.find(r=>r[0]==="source_no");
 if(!h)throw Error("SOURCE_INVENTORY_HEADER_MISSING");
 const col=x=>h.indexOf(x);
 const idCol=col("provider_id"),fileCol=col("file_or_folder"),titleCol=col("title");
 if([idCol,fileCol,titleCol].includes(-1))throw Error("SOURCE_INVENTORY_COLUMNS_MISSING");
 const expected=new Map();
 for(const r of rows.slice(rows.indexOf(h)+1)){
  if(r[fileCol]!=="file"||!r[idCol])continue;
  if(expected.has(r[idCol]))throw Error("SOURCE_INVENTORY_DUPLICATE_PROVIDER_ID");
  expected.set(r[idCol],String(r[titleCol]||""));
 }
 if(expected.size<2000)throw Error("SOURCE_INVENTORY_PARTIAL_EXPORT");
 const present=new Set(files.map(f=>f.id));
 if(present.size!==files.length)throw Error("DRIVE_INVENTORY_DUPLICATE_FILE_ID");
 const absent=[...expected.entries()].filter(([id])=>!present.has(id));
 const allowed=absent.filter(([,name])=>PRIVATE.test(name));
 const unexplained=absent.filter(([,name])=>!PRIVATE.test(name));
 const unindexed=[...present].filter(id=>!expected.has(id));
 return {sourceInventoryFiles:expected.size,organisationalFilesPresent:present.size,
  excludedPrivate:allowed.length,unexplainedOmissions:unexplained.length,
  newOrUnindexedFiles:unindexed.length,inventoryOpen:true,
  // Preserve privacy: no private file names or IDs in audit output.
  expectedOrganisationalFiles:expected.size-allowed.length,
  reconciliation:"SOURCE_INVENTORY_SNAPSHOT_ONLY__LEGACY_CENSUS_OPEN",
  safeToCommit:unexplained.length===0};
}
