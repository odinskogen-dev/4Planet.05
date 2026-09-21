#!/usr/bin/env python3
"""Bounded stdlib XLSX reader for read-only Google Drive Sheets export.
No formulas evaluated; cached values only. Emits JSON to parent process, never logs source data.
"""
import json, re, sys, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
S = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
P = "{http://schemas.openxmlformats.org/package/2006/relationships}"
def main(path, row_limit=900):
    if not 1 <= row_limit <= 3600: raise ValueError("XLSX_ROW_LIMIT_INVALID")
    if Path(path).stat().st_size > 10_500_000:
        raise ValueError("XLSX_EXPORT_OVER_10MB")
    with zipfile.ZipFile(path) as z:
        members = z.infolist()
        if len(members) > 1800 or sum(x.file_size for x in members) > 145_000_000:
            raise ValueError("XLSX_UNCOMPRESSED_LIMIT")
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall(S+"si"):
                shared.append("".join(t.text or "" for t in si.iter(S+"t")))
        book = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        paths = {r.attrib.get("Id"): r.attrib.get("Target") for r in rels.findall(P+"Relationship")}
        result = []
        for tab in book.find(S+"sheets") or []:
            if len(result) >= 35: break
            target = paths.get(tab.attrib.get(R+"id"), "")
            target = target.lstrip("/") if target.startswith("/") else "xl/"+target.lstrip("/")
            target = target.replace("xl/xl/", "xl/")
            if not target.startswith("xl/worksheets/") or target not in z.namelist(): continue
            sheet = ET.fromstring(z.read(target))
            rows=[]
            for row in sheet.findall(".//"+S+"sheetData/"+S+"row"):
                if len(rows) >= row_limit:break
                cells=[]
                for cell in row.findall(S+"c"):
                    ref=cell.attrib.get("r","")
                    col=re.match(r"[A-Z]+",ref)
                    if not col:continue
                    index=0
                    for ch in col.group(): index=index*26+ord(ch)-64
                    index-=1
                    if index<0 or index>=25:continue
                    kind=cell.attrib.get("t","")
                    val=cell.find(S+"v")
                    if kind=="inlineStr":
                        inline=cell.find(S+"is")
                        value="".join(t.text or "" for t in inline.iter(S+"t")) if inline is not None else ""
                    elif kind=="s" and val is not None:
                        try: value=shared[int(val.text or "0")]
                        except (ValueError,IndexError):value=""
                    else:value=(val.text or "") if val is not None else ""
                    if len(cells)<=index: cells.extend([""]*(index+1-len(cells)))
                    cells[index]=str(value)[:3500]
                rows.append(cells)
            result.append({"name":tab.attrib.get("name","UNKNOWN")[:160],
                "sheetId":tab.attrib.get("sheetId","0"),"rows":rows})
        sys.stdout.write(json.dumps(result,ensure_ascii=False,separators=(",",":")))
if __name__=="__main__":
    try:main(sys.argv[1], int(sys.argv[2]) if len(sys.argv)>2 else 900)
    except Exception as e:
        sys.stderr.write("SHEET_READ_FAILED_"+str(e).split(":")[0][:70])
        sys.exit(1)
