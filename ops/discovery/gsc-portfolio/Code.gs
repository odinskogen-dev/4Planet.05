/**
 * 4PLANET - First-party Google Search Console portfolio bridge.
 * Supports an ordinary standalone Apps Script (including iPhone setup),
 * linked by the private GSC4P_SHEET_ID Script Property.
 *
 * Run setup4PlanetGSC() ONCE after configuring that property.
 * It requests the current Google user's GSC read-only scope, tests all
 * available Search Console properties, and creates one daily trigger.
 * Google OAuth tokens stay inside Apps Script and are never written to Sheets.
 *
 * This DOES NOT modify, add, or verify Search Console properties or sitemaps.
 * It does not replace Google Analytics.
 */

const GSC4P_TAB_HEADERS = Object.freeze({
  Properties: ["Property URL", "Google access level", "Snapshot UTC", "Sync status"],
  Performance: ["Property URL", "Period start", "Period end", "Google clicks", "Google impressions", "CTR", "Average position", "Status", "Snapshot UTC"],
  Sitemaps: ["Property URL", "Sitemap URL", "Submitted UTC", "Last downloaded UTC", "Warnings", "Errors", "Status", "Snapshot UTC"],
  Queries: ["Property URL", "Search query", "Clicks", "Impressions", "CTR", "Average position", "Period start", "Period end", "Snapshot UTC"],
  Diagnostics: ["UTC timestamp", "Property URL", "Stage", "Status", "Detail"]
});

const GSC4P_API = "https://www.googleapis.com";
const GSC4P_QUERY_MAX = 10;
const GSC4P_QUERY_WINDOW_DAYS = 28;
const GSC4P_REPORT_LAG_DAYS = 3;

function setup4PlanetGSC() {
  // Run under the Google identity that already owns the entire GSC portfolio.
  // Fail before installing triggers if the first full sync cannot list sites.
  const report = sync4PlanetGSC();
  const handlers = ScriptApp.getProjectTriggers()
    .filter(function(t) { return t.getHandlerFunction() === "sync4PlanetGSC"; });
  handlers.forEach(function(trigger) { ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger("sync4PlanetGSC")
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
  Logger.log("GSC portfolio sync ready. Properties: " + report.properties + ". Daily sync installed.");
  return report;
}

function sync4PlanetGSC() {
  const boundWorkbook = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = boundWorkbook ? null : PropertiesService.getScriptProperties().getProperty("GSC4P_SHEET_ID");
  if (!boundWorkbook && !spreadsheetId) throw new Error("Missing Script Property GSC4P_SHEET_ID: set the ID of your private 4PLANET GSC readback Sheet in Apps Script Project Settings.");
  const workbook = boundWorkbook || SpreadsheetApp.openById(spreadsheetId);
  const output = {};
  Object.keys(GSC4P_TAB_HEADERS).forEach(function(name) {
    const tab = workbook.getSheetByName(name);
    if (!tab) throw new Error("Required tab missing: " + name + ". No data changed.");
    output[name] = [];
  });

  // This call is intentionally before ANY clear/write: never lose the previous
  // successful snapshot due to expired consent, disabled API or lost access.
  const sites = gsc4pFetch_("/webmasters/v3/sites", "get");
  if (!sites || !Array.isArray(sites.siteEntry) || !sites.siteEntry.length) {
    throw new Error("Google Search Console returned no properties. Kept previous snapshot.");
  }

  const stamp = new Date().toISOString();
  const end = gsc4pDate_(GSC4P_REPORT_LAG_DAYS);
  const start = gsc4pDate_(GSC4P_REPORT_LAG_DAYS + GSC4P_QUERY_WINDOW_DAYS - 1);
  const diagnostics = [];
  let readableCount = 0;
  const entries = sites.siteEntry
    .filter(function(v) { return v && typeof v.siteUrl === "string"; })
    .sort(function(a, b) { return a.siteUrl.localeCompare(b.siteUrl); });
  if (!entries.length) throw new Error("No valid Search Console properties. Kept previous snapshot.");

  entries.forEach(function(site) {
    const url = site.siteUrl; // Preserve GSC's exact sc-domain: or URL-prefix representation.
    const level = site.permissionLevel || "UNKNOWN";
    const verified = level !== "siteUnverifiedUser";
    output.Properties.push([url, level, stamp, verified ? "DISCOVERED" : "UNVERIFIED"]);
    if (!verified) {
      diagnostics.push([stamp, url, "site-access", "SKIPPED", "Property is not verified for this Google user"]);
      return;
    }
    readableCount++;
    try {
      const response = gsc4pFetch_(
        "/webmasters/v3/sites/" + encodeURIComponent(url) + "/searchAnalytics/query",
        "post",
        {
          startDate: start,
          endDate: end,
          dimensions: [],
          searchType: "web",
          rowLimit: 1,
          dataState: "final"
        }
      );
      const r = (response.rows || [])[0];
      if (r) {
        output.Performance.push([url, start, end, r.clicks || 0, r.impressions || 0, r.ctr || 0, r.position || 0, "OK", stamp]);
      } else {
        output.Performance.push([url, start, end, "", "", "", "", "NO_DATA", stamp]);
      }
    } catch (error) {
      output.Performance.push([url, start, end, "", "", "", "", "ERROR", stamp]);
      diagnostics.push([stamp, url, "performance", "ERROR", gsc4pSafeError_(error)]);
    }
    try {
      const result = gsc4pFetch_(
        "/webmasters/v3/sites/" + encodeURIComponent(url) + "/sitemaps", "get"
      );
      const feeds = Array.isArray(result.sitemap) ? result.sitemap : [];
      if (!feeds.length) {
        output.Sitemaps.push([url, "", "", "", "", "", "NOT_SUBMITTED", stamp]);
      }
      feeds.forEach(function(feed) {
        output.Sitemaps.push([
          url, feed.path || "", feed.lastSubmitted || "", feed.lastDownloaded || "",
          feed.warnings ?? 0, feed.errors ?? 0, feed.isPending ? "PENDING" : "OK", stamp
        ]);
      });
    } catch (error) {
      output.Sitemaps.push([url, "", "", "", "", "", "ERROR", stamp]);
      diagnostics.push([stamp, url, "sitemaps", "ERROR", gsc4pSafeError_(error)]);
    }
    try {
      const result = gsc4pFetch_(
        "/webmasters/v3/sites/" + encodeURIComponent(url) + "/searchAnalytics/query",
        "post",
        { startDate: start, endDate: end, dimensions: ["query"], searchType: "web", rowLimit: GSC4P_QUERY_MAX, dataState: "final" }
      );
      (result.rows || []).forEach(function(r) {
        output.Queries.push([url, (r.keys || [])[0] || "", r.clicks || 0, r.impressions || 0, r.ctr || 0, r.position || 0, start, end, stamp]);
      });
    } catch (error) {
      diagnostics.push([stamp, url, "queries", "ERROR", gsc4pSafeError_(error)]);
    }
  });

  diagnostics.unshift([stamp, "*", "portfolio-discovery", "OK", "Discovered " + entries.length + " GSC properties; readable " + readableCount + "; time window " + start + ".." + end]);
  output.Diagnostics = diagnostics;

  // Each owned tab is an export-only readback surface. Preserve format, headers
  // and all other tabs (including START HERE and any existing user content).
  Object.keys(output).forEach(function(name) {
    gsc4pWriteRows_(workbook.getSheetByName(name), GSC4P_TAB_HEADERS[name], output[name]);
  });
  SpreadsheetApp.flush();
  const report = { properties: entries.length, readable: readableCount, performanceRows: output.Performance.length, sitemapRows: output.Sitemaps.length, queryRows: output.Queries.length, lastSync: stamp };
  Logger.log(JSON.stringify(report));
  return report;
}

function gsc4pFetch_(resourcePath, method, payload) {
  // Bearer token is ephemeral and deliberately never returned or persisted.
  const opts = {
    method: method,
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken(), Accept: "application/json" },
    muteHttpExceptions: true,
    followRedirects: false
  };
  if (payload !== undefined) {
    opts.contentType = "application/json";
    opts.payload = JSON.stringify(payload);
  }
  const response = UrlFetchApp.fetch(GSC4P_API + resourcePath, opts);
  const code = response.getResponseCode();
  const raw = response.getContentText();
  let result = {};
  try { result = JSON.parse(raw || "{}"); } catch (_) {}
  if (code < 200 || code >= 300) {
    const detail = result.error || {};
    // Do not print raw response bodies or request headers: they might contain secrets.
    const message = String(detail.message || "Google API request failed").slice(0, 200);
    throw new Error("GSC HTTP " + code + ": " + message);
  }
  return result;
}

function gsc4pDate_(daysAgo) {
  return Utilities.formatDate(new Date(Date.now() - daysAgo * 86400000), "Etc/UTC", "yyyy-MM-dd");
}

function gsc4pSafeError_(error) {
  return String(error && error.message || error).slice(0, 250);
}

function gsc4pWriteRows_(tab, headers, rows) {
  if (tab.getLastColumn() < headers.length) throw new Error("Insufficient columns: " + tab.getName());
  const existingRows = tab.getMaxRows();
  if (existingRows > 1) tab.getRange(2, 1, existingRows - 1, headers.length).clearContent();
  if (rows.length > existingRows - 1) tab.insertRowsAfter(existingRows, rows.length - (existingRows - 1));
  if (rows.length) tab.getRange(2, 1, rows.length, headers.length).setValues(rows.map(function(row) {
    return row.map(function(value) {
      // Search query strings and site names must remain literal cell values:
      // never allow search terms returned by an API to become spreadsheet formulas.
      return typeof value === "string" && /^[=+@]/.test(value) ? "'" + value : value;
    });
  }));
}
