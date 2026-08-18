const GFW_API = "https://gateway.api.globalfishingwatch.org/v3";

export const GFW_DESCRIPTOR = Object.freeze({
  id: "global-fishing-watch",
  authority: "Global Fishing Watch",
  docs: "https://globalfishingwatch.org/our-apis/documentation",
  protocol: "REST / map visualization",
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
    accept: "application/json",
    authorization: `Bearer ${token.trim()}`,
  };
}

export function gfwFishingEffortRequest({
  token,
  startDate,
  endDate,
  dataset = GFW_DESCRIPTOR.initialDataset,
  interval = "DAY",
} = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || "")) {
    throw new Error("GFW_DATE_RANGE_REQUIRED");
  }

  // Build a bounded request descriptor only. Spatial filtering/render strategy must
  // be selected from the exact API operation before this seam is activated.
  const query = new URLSearchParams();
  query.set("datasets[0]", dataset);
  query.set("date-range", `${startDate},${endDate}`);
  query.set("interval", interval);

  return {
    state: gfwAuthState(token),
    url: `${GFW_API}/4wings/tile/heatmap?${query.toString()}`,
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
