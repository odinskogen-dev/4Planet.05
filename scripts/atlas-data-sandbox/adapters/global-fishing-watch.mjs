const GFW_API = "https://gateway.api.globalfishingwatch.org/v3";

export const GFW_DESCRIPTOR = Object.freeze({
  id: "global-fishing-watch",
  authority: "Global Fishing Watch",
  docs: "https://globalfishingwatch.org/our-apis/documentation",
  protocol: "REST / 4Wings map visualization",
  authentication: "Bearer token",
  tokenHandling: "SERVER_SIDE_ONLY",
  initialDataset: "public-global-fishing-effort:latest",
  sourceClass: "AIS_DERIVED_APPARENT_FISHING_EFFORT",
  semanticBoundary:
    "Apparent fishing effort is an algorithmic AIS-derived estimate of fishing-related activity. It does not prove illegal fishing, legal liability, gear deployment, catch, or complete vessel presence.",
  stateWithoutToken: "AUTH_REQUIRED",
});

export function gfwAuthState(token) {
  return typeof token === "string" && token.trim().length > 0 ? "AUTH_AVAILABLE" : "AUTH_REQUIRED";
}

export function gfwHeaders(token) {
  if (gfwAuthState(token) !== "AUTH_AVAILABLE") {
    throw new Error("GFW_AUTH_REQUIRED");
  }
  return {
    accept: "application/vnd.mapbox-vector-tile,application/x-protobuf,application/octet-stream",
    authorization: `Bearer ${token.trim()}`,
  };
}

function assertTileCoordinate(name, value, max) {
  if (!Number.isInteger(value) || value < 0 || value > max) throw new Error(`GFW_INVALID_${name.toUpperCase()}`);
}

/**
 * Build one bounded 4Wings MVT heatmap-tile request using the documented v3
 * `/4wings/tile/heatmap/{z}/{x}/{y}` contract. No request is executed here.
 */
export function gfwFishingEffortTileRequest({
  token,
  z,
  x,
  y,
  startDate,
  endDate,
  dataset = GFW_DESCRIPTOR.initialDataset,
  interval = "DAY",
  temporalAggregation = true,
} = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || "")) {
    throw new Error("GFW_DATE_RANGE_REQUIRED");
  }
  if (!Number.isInteger(z) || z < 0 || z > 12) throw new Error("GFW_INVALID_Z");
  const maxIndex = 2 ** z - 1;
  assertTileCoordinate("x", x, maxIndex);
  assertTileCoordinate("y", y, maxIndex);

  const query = new URLSearchParams();
  query.set("datasets[0]", dataset);
  query.set("date-range", `${startDate},${endDate}`);
  query.set("format", "MVT");
  query.set("interval", interval);
  query.set("temporal-aggregation", String(Boolean(temporalAggregation)));

  return {
    state: gfwAuthState(token),
    url: `${GFW_API}/4wings/tile/heatmap/${z}/${x}/${y}?${query.toString()}`,
    headers: token ? gfwHeaders(token) : null,
    dataset,
    semanticBoundary: GFW_DESCRIPTOR.semanticBoundary,
  };
}

export function redactGfwRequest(request) {
  return {
    ...request,
    headers: request?.headers ? { ...request.headers, authorization: "Bearer REDACTED" } : null,
  };
}
