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
  Pages: ["Property URL", "Page URL", "Google clicks", "Google impressions", "CTR", "Average position", "Period start", "Period end", "Snapshot UTC"],
  PageQueries: ["Property URL", "Page URL", "Search query", "Google clicks", "Google impressions", "CTR", "Average position", "Period start", "Period end", "Snapshot UTC"],
  URLInspections: ["Property URL", "Inspected URL", "Verdict", "Coverage state", "Google last crawl UTC", "Google canonical", "Declared canonical", "Fetch state", "Robots state", "Indexing state", "Status", "Snapshot UTC"],
  Diagnostics: ["UTC timestamp", "Property URL", "Stage", "Status", "Detail"]
});

const GSC4P_API = "https://www.googleapis.com";
const GSC4P_QUERY_MAX = 10;
const GSC4P_PAGE_MAX = 150;
const GSC4P_PAGE_QUERY_MAX = 150;
const GSC4P_INSPECTION_MAX = 3;

// Organisation-only allowlist: the owner's Google account also has unrelated
// personal/art domains. They MUST NOT be copied into the shared 4PLANET readback.
const GSC4P_ORG_DOMAINS = Object.freeze([
  "4brain.app", "4brands.org", "4nation.org", "4planet.org",
  "4planetatlas.com", "4planetmagazine.com", "4planetmarket.com",
  "4sapien.com", "4species.com", "cre4tors.com", "n4turetech.com",
  "oce4n.com", "p4nther.com", "p4nther.org", "pl4net.org",
  "s4piens.com", "supersapien.org"
]);

function gsc4pSiteHost_(url) {
  const value = String(url || "").trim().toLowerCase();
  if (value.indexOf("sc-domain:") === 0) return value.slice(10).replace(/^www\./, "");
  const match = /^https?:\/\/(?:www\.)?([^\/:?#]+)/.exec(value);
  return match ? match[1] : "";
}

function gsc4pOrgProperty_(url) {
  return GSC4P_ORG_DOMAINS.indexOf(gsc4pSiteHost_(url)) !== -1;
}

// Do not persist parameterised or fragment-bearing URLs, personal landing
// links, authentication paths, or subdomain traffic to the shared readback.
function gsc4pDecodedPath_(rawPath) {
  let path = String(rawPath || "/");
  // Decode a bounded number of layers so percent-encoding cannot disguise a
  // private route (for example /%61uth or /%2561uth). Malformed or still-
  // encoded paths fail closed rather than entering the shared readback.
  for (let i = 0; i < 3; i++) {
    let decoded;
    try {
      decoded = decodeURIComponent(path);
    } catch (error) {
      return "";
    }
    if (decoded === path) return path;
    path = decoded;
  }
  return /%[0-9a-f]{2}/i.test(path) ? "" : path;
}

function gsc4pPublicPage_(raw, property) {
  const text = String(raw || "").trim();
  if (/[?#]/.test(text)) return ""; // Parameterised URLs are not safe canonical objects.
  const m = /^https:\/\/(?:www\.)?([^\/?#]+)(\/[^?#]*)?/i.exec(text);
  if (!m || !gsc4pOrgProperty_("sc-domain:" + m[1])) return "";
  if (property && m[1].toLowerCase().replace(/^www\./, "") !== gsc4pSiteHost_(property)) return "";
  const path = m[2] || "/";
  const decodedPath = gsc4pDecodedPath_(path);
  if (!decodedPath || decodedPath.length > 240 || /[<>"'@\\]/.test(decodedPath) ||
      /^\/+(?:api|auth|oauth|admin|account|id|os|labs|test|private|checkout|login|saved)(?:\/|$)/i.test(decodedPath)) return "";
  return "https://" + m[1].toLowerCase() + path;
}

function gsc4pSafeQuery_(raw) {
  const value = String(raw || "").trim();
  if (!value || value.length > 160 || /@|eyJ[A-Za-z0-9_-]{10,}\.|(?:access_token|refresh_token|id_token|client_secret)/i.test(value)) return "";
  return value;
}
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
  const allEntries = sites.siteEntry.filter(function(v) {
    return v && typeof v.siteUrl === "string";
  });
  const entries = allEntries.filter(function(v) {
    return gsc4pOrgProperty_(v.siteUrl);
  }).sort(function(a, b) { return a.siteUrl.localeCompare(b.siteUrl); });
  if (!entries.length) throw new Error("No approved 4PLANET organisational Search Console properties. Kept previous snapshot.");

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
          feed.warnings ?? 0, feed.errors ?? 0,
          Number(feed.errors || 0) > 0 ? "ERRORS" : Number(feed.warnings || 0) > 0 ? "WARNINGS" : feed.isPending ? "PENDING" : "OK", stamp
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
        const query = gsc4pSafeQuery_((r.keys || [])[0]);
        if (!query) return;
        output.Queries.push([url, query, r.clicks || 0, r.impressions || 0, r.ctr || 0, r.position || 0, start, end, stamp]);
      });
    } catch (error) {
      diagnostics.push([stamp, url, "queries", "ERROR", gsc4pSafeError_(error)]);
    }
  });

  // Fetch two independent Google search views. Page-level metrics are not
  // derived by summing query rows (Google anonymises rare search queries).
  entries.filter(function(v) { return v.permissionLevel !== "siteUnverifiedUser"; })
    .forEach(function(site) {
      const siteUrl = site.siteUrl;
      const queryEndpoint = "/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query";
      try {
        const data = gsc4pFetch_(queryEndpoint, "post", {
          startDate: start, endDate: end, dimensions: ["page"],
          searchType: "web", rowLimit: GSC4P_PAGE_MAX, dataState: "final"
        });
        const inspectTargets = [];
        if ((data.rows || []).length >= GSC4P_PAGE_MAX) {
          diagnostics.push([stamp, siteUrl, "pages-cap", "WARNING",
            "Top " + GSC4P_PAGE_MAX + " pages returned: may be partial; increase/paginate after runtime quota QA"]);
        }
        (data.rows || []).forEach(function(row) {
          const page = gsc4pPublicPage_((row.keys || [])[0], siteUrl);
          if (!page) return;
          output.Pages.push([siteUrl, page, row.clicks || 0, row.impressions || 0,
            row.ctr || 0, row.position || 0, start, end, stamp]);
          if (inspectTargets.length < GSC4P_INSPECTION_MAX && inspectTargets.indexOf(page) < 0) inspectTargets.push(page);
        });
        inspectTargets.forEach(function(page) {
          try {
            const inspect = gsc4pFetch_("/v1/urlInspection/index:inspect", "post", {
              inspectionUrl: page, siteUrl: siteUrl, languageCode: "en-US"
            });
            const status = (inspect.inspectionResult || {}).indexStatusResult || {};
            output.URLInspections.push([siteUrl, page, status.verdict || "UNKNOWN",
              status.coverageState || "", status.lastCrawlTime || "",
              gsc4pPublicPage_(status.googleCanonical, null),
              gsc4pPublicPage_(status.userCanonical, null),
              status.pageFetchState || "", status.robotsTxtState || "",
              status.indexingState || "", "OK", stamp]);
          } catch (error) {
            output.URLInspections.push([siteUrl, page, "", "", "", "", "", "", "", "", "ERROR", stamp]);
            diagnostics.push([stamp, siteUrl, "url-inspection", "ERROR", gsc4pSafeError_(error)]);
          }
        });
      } catch (error) {
        diagnostics.push([stamp, siteUrl, "pages", "ERROR", gsc4pSafeError_(error)]);
      }
      try {
        const data = gsc4pFetch_(queryEndpoint, "post", {
          startDate: start, endDate: end, dimensions: ["page", "query"],
          searchType: "web", rowLimit: GSC4P_PAGE_QUERY_MAX, dataState: "final"
        });
        if ((data.rows || []).length >= GSC4P_PAGE_QUERY_MAX) {
          diagnostics.push([stamp, siteUrl, "page-queries-cap", "WARNING",
            "Top " + GSC4P_PAGE_QUERY_MAX + " page/query pairs returned: Google data may be partial"]);
        }
        (data.rows || []).forEach(function(row) {
          const page = gsc4pPublicPage_((row.keys || [])[0], siteUrl);
          const query = gsc4pSafeQuery_((row.keys || [])[1]);
          if (!page || !query) return;
          output.PageQueries.push([siteUrl, page, query, row.clicks || 0,
            row.impressions || 0, row.ctr || 0, row.position || 0, start, end, stamp]);
        });
      } catch (error) {
        diagnostics.push([stamp, siteUrl, "page-queries", "ERROR", gsc4pSafeError_(error)]);
      }
    });

  diagnostics.unshift([stamp, "*", "portfolio-discovery", "OK",
    "Google properties discovered " + allEntries.length + "; organisation-only " + entries.length +
    "; excluded " + (allEntries.length - entries.length) +
    "; readable " + readableCount + "; window " + start + ".." + end]);
  // Preserve the last known good snapshot of each tab when even one property's
  // API read for that tab fails. Diagnostics is still refreshed to expose debt.
  const stageToTab = {
    performance: "Performance", sitemaps: "Sitemaps", queries: "Queries",
    pages: "Pages", "page-queries": "PageQueries", "url-inspection": "URLInspections"
  };
  const staleTabs = [];
  diagnostics.forEach(function(row) {
    const tabName = stageToTab[row[2]];
    if (row[3] === "ERROR" && tabName && staleTabs.indexOf(tabName) < 0) staleTabs.push(tabName);
  });
  staleTabs.forEach(function(name) {
    diagnostics.push([stamp, "*", "snapshot-write", "HELD",
      "Preserved prior " + name + " tab because one or more Google API calls failed"]);
  });
  output.Diagnostics = diagnostics;

  // Each owned tab is an export-only readback surface. Preserve format, headers
  // and all other tabs (including START HERE and any existing user content).
  Object.keys(output).forEach(function(name) {
    if (staleTabs.indexOf(name) >= 0) return;
    gsc4pWriteRows_(workbook.getSheetByName(name), GSC4P_TAB_HEADERS[name], output[name]);
  });
  SpreadsheetApp.flush();
  const report = { discovered: allEntries.length, properties: entries.length, excluded: allEntries.length - entries.length, readable: readableCount, performanceRows: output.Performance.length, sitemapRows: output.Sitemaps.length, queryRows: output.Queries.length, pageRows: output.Pages.length, pageQueryRows: output.PageQueries.length, inspectionRows: output.URLInspections.length, staleTabs: staleTabs, lastSync: stamp };
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
  const apiOrigin = resourcePath.indexOf("/v1/urlInspection/") === 0
    ? "https://searchconsole.googleapis.com" : GSC4P_API;
  const response = UrlFetchApp.fetch(apiOrigin + resourcePath, opts);
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
  if (rows.length > existingRows - 1) tab.insertRowsAfter(existingRows, rows.length - (existingRows - 1));
  if (existingRows > 1) tab.getRange(2, 1, existingRows - 1, headers.length).clearContent();
  if (rows.length) tab.getRange(2, 1, rows.length, headers.length).setValues(rows.map(function(row) {
    return row.map(function(value) {
      // Search query strings and site names must remain literal cell values:
      // never allow search terms returned by an API to become spreadsheet formulas.
      return typeof value === "string" && /^[=+@-]/.test(value) ? "'" + value : value;
    });
  }));
}
