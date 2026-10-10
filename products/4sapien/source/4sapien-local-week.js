(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FourSapienLocalWeek = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function resolvedTimeZone(requested) {
    let candidate = String(requested || "").trim();
    if (!candidate) {
      try {
        candidate = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      } catch (_error) {
        candidate = "";
      }
    }
    if (!candidate) candidate = "UTC";
    try {
      new Intl.DateTimeFormat("en-CA", { timeZone: candidate }).format(new Date(0));
      return candidate;
    } catch (_error) {
      return "UTC";
    }
  }

  function localDateParts(instant, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const values = {};
    for (const part of formatter.formatToParts(instant)) {
      if (part.type === "year" || part.type === "month" || part.type === "day") {
        values[part.type] = Number(part.value);
      }
    }
    if (!values.year || !values.month || !values.day) throw new Error("LOCAL_DATE_UNAVAILABLE");
    return values;
  }

  function startISO(value, requestedTimeZone) {
    const instant = value instanceof Date ? value : new Date(value == null ? Date.now() : value);
    if (!Number.isFinite(instant.getTime())) throw new TypeError("INVALID_WEEK_INSTANT");
    const timeZone = resolvedTimeZone(requestedTimeZone);
    const parts = localDateParts(instant, timeZone);
    const localDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    const mondayOffset = (localDate.getUTCDay() + 6) % 7;
    localDate.setUTCDate(localDate.getUTCDate() - mondayOffset);
    return localDate.toISOString().slice(0, 10);
  }

  return { resolvedTimeZone, startISO };
});
