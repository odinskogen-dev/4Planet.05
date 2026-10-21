import fs from "node:fs";
const spec = JSON.parse(fs.readFileSync(new URL("./curated-wild-commons-fallback-20261021.json", import.meta.url), "utf8"));
const clean = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
export async function wildCommonsCandidates(slug, loader) {
  const entries = spec.candidates[slug] || [];
  if (!entries.length) return [];
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2",
    prop: "imageinfo", iiprop: "url|size|mime|sha1|extmetadata",
    iiurlwidth: "1400", titles: entries.map(f => "File:" + f.file).join("|")
  });
  const res = await loader("https://commons.wikimedia.org/w/api.php?" + params.toString());
  const list = [];
  for (const entry of entries) {
    const page = (res.query?.pages || []).find(p => p.title === "File:" + entry.file);
    const i = page?.imageinfo?.[0];
    const meta = i?.extmetadata || {};
    const license = clean(meta.LicenseShortName?.value);
    const artist = clean(meta.Artist?.value);
    const licenceUrl = clean(meta.LicenseUrl?.value);
    const url = i?.descriptionurl || "";
    const valid = i && i.thumburl && i.width >= 1000 && i.height >= 600 &&
      ["image/jpeg", "image/png", "image/webp"].includes(i.mime) &&
      license.toLowerCase() === entry.licenceExpected.toLowerCase() &&
      artist && licenceUrl && url.replaceAll("_", " ").toLowerCase() ===
        entry.sourcePage.replaceAll("_", " ").toLowerCase();
    if (!valid) {
      console.log("SPECIES_WILD_COMMONS_REJECT " + JSON.stringify({ slug, file: entry.file, license, artist: !!artist }));
      continue;
    }
    list.push({
      name: "Wild natural-habitat candidate: " + entry.file,
      sourcePage: url, original: i.url, thumbnail: i.thumburl,
      artist, license, licenceUrl, sourceSha1: i.sha1,
      captive: false,
      observationQuality: "AUTHOR_WILD_CONTEXT_ATTESTED",
      review: "HUMAN_VISUAL_RIGHTS_GOLD_PENDING",
      provenance: "Commons description claims natural habitat: " + entry.wildBasis + ". Independent check pending."
    });
  }
  return list;
}
