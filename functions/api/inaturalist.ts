/**
 * GET /api/inaturalist
 *
 * Bounded, read-only bridge to the supported iNaturalist API.
 * Public occurrence records remain observations, never range/abundance/live tracking.
 * Public coordinates are passed through exactly as supplied; obscured/private
 * locations are never reconstructed or sharpened.
 */

const BASE = "https://api.inaturalist.org/v1";

const json = (body: unknown, status = 200, maxAge = 300) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${maxAge}`,
      "access-control-allow-origin": "*",
    },
  });

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min ? Math.min(n, max) : fallback;
};

const finiteCoord = (value: string | null, min: number, max: number) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const safeDate = (value: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
const safeQuality = (value: string | null) => value && ["research", "needs_id", "casual"].includes(value) ? value : null;

function normaliseLicence(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  const map: Record<string, string> = {
    cc0: "CC0",
    "cc-by": "CC BY",
    "cc-by-sa": "CC BY-SA",
    "cc-by-nc": "CC BY-NC",
    "cc-by-nd": "CC BY-ND",
    "cc-by-nc-sa": "CC BY-NC-SA",
    "cc-by-nc-nd": "CC BY-NC-ND",
  };
  return map[raw] || (raw ? raw.toUpperCase() : "UNSPECIFIED");
}

function commercialWebStatus(licence: string) {
  if (licence === "CC0" || licence === "CC BY") return "AUTO_ACCEPTABLE";
  if (licence === "CC BY-SA") return "CONDITIONAL_SHARE_ALIKE";
  if (licence.includes("NC") || licence.includes("ND") || licence === "UNSPECIFIED") return "WITHHOLD_MEDIA";
  return "REVIEW_REQUIRED";
}

export const onRequestGet = async ({ request }: { request: Request }) => {
  const incoming = new URL(request.url);
  const taxonId = clampInt(incoming.searchParams.get("taxonId"), 0, 1, Number.MAX_SAFE_INTEGER);
  if (!taxonId) return json({ ok: false, error: "TAXON_ID_REQUIRED" }, 400, 60);

  const perPage = clampInt(incoming.searchParams.get("perPage"), 40, 1, 100);
  const page = clampInt(incoming.searchParams.get("page"), 1, 1, 100);
  const quality = safeQuality(incoming.searchParams.get("quality")) || "research";
  const d1 = safeDate(incoming.searchParams.get("d1"));
  const d2 = safeDate(incoming.searchParams.get("d2"));

  const swlat = finiteCoord(incoming.searchParams.get("swlat"), -90, 90);
  const swlng = finiteCoord(incoming.searchParams.get("swlng"), -180, 180);
  const nelat = finiteCoord(incoming.searchParams.get("nelat"), -90, 90);
  const nelng = finiteCoord(incoming.searchParams.get("nelng"), -180, 180);
  const bboxProvided = [swlat, swlng, nelat, nelng].some((v) => v != null);
  if (bboxProvided && [swlat, swlng, nelat, nelng].some((v) => v == null)) {
    return json({ ok: false, error: "INCOMPLETE_BBOX" }, 400, 60);
  }
  if (bboxProvided && (!(swlat! < nelat!) || !(swlng! < nelng!))) {
    return json({ ok: false, error: "INVALID_BBOX" }, 400, 60);
  }

  const qs = new URLSearchParams({
    taxon_id: String(taxonId),
    geo: "true",
    quality_grade: quality,
    per_page: String(perPage),
    page: String(page),
    order_by: "observed_on",
    order: "desc",
  });
  if (d1) qs.set("d1", d1);
  if (d2) qs.set("d2", d2);
  if (bboxProvided) {
    qs.set("swlat", String(swlat));
    qs.set("swlng", String(swlng));
    qs.set("nelat", String(nelat));
    qs.set("nelng", String(nelng));
  }

  const upstream = `${BASE}/observations?${qs.toString()}`;
  try {
    const response = await fetch(upstream, {
      headers: {
        accept: "application/json",
        "user-agent": "4PLANET-SPECIES/1.0 (+https://4planet.org)",
      },
      cf: { cacheTtl: 300 } as RequestInit["cf"],
    });
    if (!response.ok) return json({ ok: false, source: "inaturalist", error: `UPSTREAM_${response.status}` }, 502, 60);

    const data = await response.json() as any;
    if (!Array.isArray(data?.results)) return json({ ok: false, source: "inaturalist", error: "CONTRACT_MISMATCH" }, 502, 60);

    const records = data.results.map((row: any) => {
      const publicCoords = Array.isArray(row?.geojson?.coordinates) && row.geojson.coordinates.length >= 2
        ? { longitude: Number(row.geojson.coordinates[0]), latitude: Number(row.geojson.coordinates[1]) }
        : null;
      const observationLicence = normaliseLicence(row?.license_code);
      const photos = Array.isArray(row?.photos) ? row.photos.map((photo: any) => {
        const licence = normaliseLicence(photo?.license_code);
        return {
          id: photo?.id ? String(photo.id) : null,
          attribution: photo?.attribution ?? null,
          licence,
          commercialWebStatus: commercialWebStatus(licence),
          url: photo?.url ?? null,
          originalDimensions: photo?.original_dimensions ?? null,
        };
      }) : [];

      // Keep provider geoprivacy semantics explicit. iNaturalist payloads can expose
      // taxon_geoprivacy directly or via taxon conservation status depending on endpoint/version.
      const taxonGeoprivacy = row?.taxon_geoprivacy ?? row?.taxon?.geoprivacy ?? row?.taxon?.conservation_status?.geoprivacy ?? null;

      return {
        id: row?.id ? String(row.id) : null,
        sourceUrl: row?.uri ?? (row?.id ? `https://www.inaturalist.org/observations/${row.id}` : null),
        taxon: row?.taxon ? {
          id: row.taxon.id ?? null,
          name: row.taxon.name ?? null,
          preferredCommonName: row.taxon.preferred_common_name ?? null,
        } : null,
        observedAt: row?.observed_on_string ?? row?.observed_on ?? null,
        createdAt: row?.created_at ?? null,
        qualityGrade: row?.quality_grade ?? null,
        geoprivacy: row?.geoprivacy ?? null,
        taxonGeoprivacy,
        positionalAccuracyM: row?.positional_accuracy ?? null,
        publicCoordinates: publicCoords && Number.isFinite(publicCoords.latitude) && Number.isFinite(publicCoords.longitude) ? publicCoords : null,
        observer: row?.user ? { id: row.user.id ?? null, login: row.user.login ?? null } : null,
        observationLicence,
        photos,
      };
    });

    return json({
      ok: true,
      source: "inaturalist",
      api: "https://api.inaturalist.org/v1",
      retrievedAt: new Date().toISOString(),
      query: { taxonId, page, perPage, quality, d1, d2, bbox: bboxProvided ? { swlat, swlng, nelat, nelng } : null },
      totalResults: Number(data?.total_results ?? records.length),
      records,
      limitations: [
        "Occurrences are reported observations, not range, abundance, population trend or live tracking.",
        "Only public coordinates supplied by iNaturalist are returned; obscured/private locations are never reconstructed.",
        "Observation licence and photo licence are distinct; media reuse requires the photo-specific licence check.",
      ],
    }, 200, 300);
  } catch (error) {
    return json({ ok: false, source: "inaturalist", error: String((error as Error)?.message || error) }, 502, 60);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});