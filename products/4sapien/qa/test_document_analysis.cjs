// Synthetic-only browser parser tests; no real user files, no network.
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const ctx={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../source/4sapien-document-analysis.js"),"utf8"),ctx);
const p=ctx.module.exports;
const a=p.parseAmount("1 250,00");
assert.equal(a.kr,1250);assert.equal(a.ore,0);assert.equal(a.wholeKroner,true);
const b=p.parseAmount("1.250,50");
assert.equal(b.kr,1250);assert.equal(b.ore,50);assert.equal(b.wholeKroner,false);
assert.equal(p.parseAmount("1250").kr,1250);
assert.equal(p.parseAmount("0"),null);
assert.equal(p.parseAmount("abc"),null);
assert.equal(p.dateFrom("31.02.2026"),null);
assert.equal(p.dateFrom("29.02.2024"),"2024-02-29");
assert.equal(p.dateFrom("2026-09-30"),"2026-09-30");
const bill=p.propose("Faktura\nLeverandør: Eksempel Energi AS\nKID 123456789\nBeløp å betale kr 1 250,00\nForfallsdato: 30.09.2026","bill");
assert.equal(bill.name.value,"Eksempel Energi AS");
assert.equal(bill.amount.kr,1250);
assert.equal(bill.amount.wholeKroner,true);
assert.equal(bill.date.value,"2026-09-30");
const receipt=p.propose("Butikk: Eksempel Mat AS\nKjøpsdato 19.09.2026\nMelk 25,00\nSum inkl. mva 325,50","receipt");
assert.equal(receipt.amount.kr,325);
assert.equal(receipt.amount.wholeKroner,false);
assert.equal(receipt.date.value,"2026-09-19");
assert.equal(receipt.itemLines[0],"Melk 25,00");
const unknown=p.propose("KID 123456789\nIBAN NO1212341234\nOrganisasjonsnr 999999999","bill");
assert.equal(unknown.amount,null);assert.equal(unknown.date,null);assert.equal(unknown.name,null);

// Claude Kravsvakt MERGE 01: no live data and no hardcoded local file path.
const invoice=p.propose(`Faktura
Leverandør: Telia Norge AS
Beløp å betale: 749,00 kr
Forfallsdato: 2026-10-15
KID: 1234 5678 9012 3
Kontonr: 1503 12 34567`,"bill");
assert.equal(invoice.amount.kr,749);
assert.equal(invoice.date.value,"2026-10-15");
assert.equal(invoice.kid.value,"1234567890123");
assert.equal(invoice.account.value,"15031234567");
assert.equal(invoice.claimStage.value,"faktura");
const ink=p.propose(`INKASSOVARSEL
Kravet gjelder ubetalt faktura. Purregebyr påløpt.
Beløp: 1 890 kr
Forfall: 30.10.2026
KID-nr: 99887766554`,"bill");
assert.equal(ink.claimStage.value,"inkassovarsel");
assert.equal(ink.kid.value,"99887766554");
assert.equal(p.propose("Dato: 03.01.2026\\nTotalt å betale: 250,00","receipt").date.value,"2026-01-03");
// Unknown remains null. Extracted account/KID are not validated payment instructions.
const noClaim=p.propose("Ukjent dokument uten betalingsdetaljer","bill");
assert.equal(noClaim.amount,null);assert.equal(noClaim.kid,null);assert.equal(noClaim.account,null);assert.equal(noClaim.claimStage,null);

console.log("PASS document-analysis: synthetic parsing, precision, invalid dates, uncertainty");
