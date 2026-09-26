type VolunteerConnectorActivity = { name?: string; category?: string };
type VolunteerConnectorResult = {
  id?: number;
  url?: string;
  title?: string;
  description?: string;
  remote_or_online?: boolean;
  organization?: { name?: string; url?: string };
  activities?: VolunteerConnectorActivity[];
  dates?: string;
  duration?: string | null;
  audience?: { scope?: string; regions?: string[]; latitude?: number; longitude?: number };
};

type VolunteerConnectorResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: VolunteerConnectorResult[];
};

function plainText(value = "") {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function locationLabel(item: VolunteerConnectorResult) {
  const audience = item.audience;
  if (item.remote_or_online) return "Remote / online";
  if (audience?.regions?.length) return audience.regions.join(", ");
  if (audience?.scope) return audience.scope[0].toUpperCase() + audience.scope.slice(1);
  return "Location supplied by source";
}

export async function onRequestGet() {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch("https://www.volunteerconnector.org/api/search/", {
      headers: { Accept: "application/json", "User-Agent": "4PLANET-Opportunity-Adapter/1.0" },
      cf: { cacheTtl: 900, cacheEverything: true },
    } as RequestInit & { cf?: { cacheTtl: number; cacheEverything: boolean } });

    if (!response.ok) throw new Error(`VolunteerConnector returned ${response.status}`);
    const data = (await response.json()) as VolunteerConnectorResponse;
    const opportunities = (data.results ?? []).slice(0, 18).flatMap((item) => {
      if (!item.id || !item.url || !item.title || !item.organization?.name) return [];
      return [{
        id: `external:volunteerconnector:${item.id}`,
        actorName: plainText(item.organization.name),
        title: plainText(item.title),
        summary: plainText(item.description ?? "").slice(0, 520),
        remote: Boolean(item.remote_or_online),
        activities: (item.activities ?? [])
          .map((activity) => plainText(activity.name || activity.category || ""))
          .filter(Boolean),
        dates: plainText(item.dates ?? ""),
        duration: plainText(item.duration ?? ""),
        place: locationLabel(item),
        sourceUrl: item.url,
        checkedAt,
      }];
    });

    return Response.json(
      {
        status: "LIVE_EXTERNAL_SOURCE",
        source: {
          id: "volunteerconnector",
          label: "VolunteerConnector public search API",
          url: "https://www.volunteerconnector.org/api",
          assertion: "EXTERNAL_LISTING",
          verifiedBy4Planet: false,
          checkedAt,
          reportedCount: data.count ?? null,
        },
        opportunities,
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } },
    );
  } catch (error) {
    return Response.json(
      {
        status: "SOURCE_UNAVAILABLE",
        source: {
          id: "volunteerconnector",
          label: "VolunteerConnector public search API",
          url: "https://www.volunteerconnector.org/api",
          assertion: "EXTERNAL_LISTING",
          verifiedBy4Planet: false,
          checkedAt,
        },
        opportunities: [],
        note: error instanceof Error ? error.message : "External opportunity source unavailable",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
