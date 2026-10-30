// 4NATION: UNESCO country matching (World Heritage count bug: Norway showed 0).
// Fixture records are verbatim fields from https://4nation.org/api/unesco-data?dataset=whc001
// (snapshot 2026-10-21), mapped exactly like normaliseUnescoAtlasRecord in src/data/unescoOpenData.ts.
// Run: node --test scripts/4nation-unesco-match.test.mjs (Node >= 23.6 strips TS types natively).
import test from "node:test";
import assert from "node:assert/strict";
import { unescoRecordMatchesCountry, unescoTokens } from "../src/nation/unescoCountryMatch.ts";
const RAW = [{"name_en": "Bryggen","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Rjukan-Notodden Industrial Heritage Site","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Rock Art of Alta","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Røros Mining Town and the Circumference","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Urnes Stave Church","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Vegaøyan – The Vega Archipelago","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "West Norwegian Fjords – Geirangerfjord and Nærøyfjord","states_names": ["[\"Norway\"]"],"iso_codes": "[\"NO\"]"},{"name_en": "Struve Geodetic Arc","states_names": ["[\"Latvia\"","\"Norway\"","\"Sweden\"","\"Belarus\"","\"Estonia\"","\"Finland\"","\"Ukraine\"","\"Lithuania\"","\"Republic of Moldova\"","\"Russian Federation\"]"],"iso_codes": "[\"LV\", \"NO\", \"SE\", \"BY\", \"EE\", \"FI\", \"UA\", \"LT\", \"MD\", \"RU\"]"},{"name_en": "Sacred Mijikenda Kaya Forests","states_names": ["[\"Kenya\"]"],"iso_codes": "[\"KE\"]"},{"name_en": "Lake Turkana National Parks","states_names": ["[\"Kenya\"]"],"iso_codes": "[\"KE\"]"},{"name_en": "Amami-Oshima Island, Tokunoshima Island, Northern part of Okinawa Island, and Iriomote Island","states_names": ["[\"Japan\"]"],"iso_codes": "[\"JP\"]"},{"name_en": "Hiraizumi – Temples, Gardens and Archaeological Sites Representing the Buddhist Pure Land","states_names": ["[\"Japan\"]"],"iso_codes": "[\"JP\"]"},{"name_en": "Ancient and Primeval Beech Forests of the Carpathians and Other Regions of Europe","states_names": ["[\"North Macedonia\"","\"Spain\"","\"Italy\"","\"France\"","\"Poland\"","\"Albania\"","\"Austria\"","\"Belgium\"","\"Croatia\"","\"Romania\"","\"Ukraine\"","\"Bulgaria\"","\"Slovenia\"","\"Slovakia\"","\"Switzerland\"","\"Bosnia and Herzegovina\"","\"Germany\"","\"Czechia\"]"],"iso_codes": "[\"MK\", \"ES\", \"IT\", \"FR\", \"PL\", \"AL\", \"AT\", \"BE\", \"HR\", \"RO\", \"UA\", \"BG\", \"SI\", \"SK\", \"CH\", \"BA\", \"DE\", \"CZ\"]"}];
const recs = RAW.map((f) => ({ name: f.name_en, country: String(f.states_names ?? "").trim() || undefined, iso2: String(f.iso_codes ?? "").trim().toUpperCase() || undefined }));
const count = (iso2, name) => recs.filter((x) => unescoRecordMatchesCountry(x, iso2, name)).length;
test("JSON-encoded code lists are read as plain tokens", () => {
  assert.deepEqual(unescoTokens('["NO"]'), ["NO"]);
  assert.deepEqual(unescoTokens('["NO","SE"]'), ["NO", "SE"]);
  assert.deepEqual(unescoTokens(undefined), []);
});
test("Norway gets its 8 UNESCO-listed sites, not 0", () => {
  assert.equal(count("NO", "Norway"), 8);
});
test("Kenya and Japan resolve from the same record shape", () => {
  assert.equal(count("KE", "Kenya"), 2);
  assert.equal(count("JP", "Japan"), 2);
});
test("no false match on a code substring or another country", () => {
  assert.equal(unescoRecordMatchesCountry({ iso2: '["NOR"]' }, "NO", "Norway"), false);
  assert.equal(unescoRecordMatchesCountry({ iso2: '["NO","SE"]' }, "SE", "Sweden"), true);
  assert.equal(unescoRecordMatchesCountry({ iso2: '["SE"]', country: '["Sweden"]' }, "NO", "Norway"), false);
});
test("name fallback works when codes are missing", () => {
  assert.equal(unescoRecordMatchesCountry({ country: '["Norway"]' }, "NO", "Norway"), true);
});
