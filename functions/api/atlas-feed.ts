/**
 * GET /api/atlas-feed?source=eonet
 *
 * Same-origin, allowlisted proxy for public JSON feeds useful to ATLAS when
 * direct browser access is unreliable. This is intentionally not an open proxy.
 */

const json = (body: unknown, status = 200, maxAge = 300) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${maxAge}`,
      "access-control-allow-origin": "*",
    },
  });

const SOURCES = {
  eonet: {
    url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300",
    maxAge: 300,
    validate: (data: any) => Array.isArray(data?.events),
  },
} as const;

export const onRequestGet = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("source") as keyof typeof SOURCES | null;
  if (!key || !(key in SOURCES)) return json({ ok: false, error: "UNSUPPORTED_SOURCE" }, 400, 60);

  const config = SOURCES[key];
  try {
    const response = await fetch(config.url, {
      headers: {
        accept: "application/json",
        "user-agent": "4PLANET-ATLAS/1.0 (+https://4planet.org)",
      },
      cf: { cacheTtl: config.maxAge } as RequestInit["cf"],
    });
    if (!response.ok) return json({ ok: false, source: key, error: `UPSTREAM_${response.status}` }, 502, 60);
    const data = await response.json();
    if (!config.validate(data)) return json({ ok: false, source: key, error: "CONTRACT_MISMATCH" }, 502, 60);
    return json({ ok: true, source: key, retrievedAt: new Date().toISOString(), data }, 200, config.maxAge);
  } catch (error) {
    return json({ ok: false, source: key, error: String((error as Error)?.message || error) }, 502, 60);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});
