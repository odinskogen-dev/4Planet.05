/**
 * GET /api/obis — bounded, read-only OBIS v3 occurrence bridge for marine biodiversity.
 *
 * Truth boundary:
 * - returned records are occurrence records, not abundance, range, population trend or live positions;
 * - absence records are excluded by default;
 * - provider/dataset licence is preserved per record and must be evaluated before downstream reuse;
 * - upstream failure is never represented as zero records.
 *
 * This is intentionally not a bulk-download endpoint. OBIS recommends its API for
 * smaller subsets and AWS Open Data for large downloads.
 */

const BASE = "https://api.obis.org/v3/occurrence";
const MAX_SIZE = 200;
const MAX_OFFSET = 10000;
const MAX_BBOX_SPAN_DEG = 30;

const json = (body: unknown, status = 200, maxAge = 900) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": status === 200 ? `public, max-age=${maxAge}` : "no-store",
      "access-control-allow-origin": "*",
    },
  });

const cleanScientificName = (value: string | null) => {
  const v = (value || "").trim();
  return v.length >= 2 && v.length <= 180 && /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .()'\-]+$/.test(v) ? v : "";
};

const cleanIsoDate = (value: string | null) => {
  const v = value || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";

  const [year, month, day] = v.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1] ? v : "";
};

const boundedInt = (value: string | null, fallback: number, max: number) => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? Math.min(n, max) : fallback;
};

function bboxToWkt(value: string | null) {
  const parts = (value || "").split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [west, south, east, north] = parts;
  if (west < -180 || east > 180 || south < -90 || north > 90 || west >= east || south >= north) return null;
  if (east - west > MAX_BBOX_SPAN_DEG || north - south > MAX_BBOX_SPAN_DEG) return null;
  return `POLYGON ((${west} ${south}, ${west} ${north}, ${east} ${north}, ${east} ${south}, ${west} ${south}))`;
}

const ISSUED_CC_VERSIONS = new Set(["1.0", "2.0", "2.5", "3.0", "4.0"]);

const officialCreativeCommonsCode = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if ((url.protocol !== "https:" && url.protocol !== "http:") ||
        (host !== "creativecommons.org" && host !== "www.creativecommons.org") ||
        url.username || url.password) {
      return null;
    }
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    const publicDomain = path.match(/^\/publicdomain\/(zero|mark)\/(1\.0)(?:\/legalcode)?$/);
    if (publicDomain) return publicDomain[1] === "zero" ? "CC0" : "PUBLIC_DOMAIN";
    const licence = path.match(
      /^\/licenses\/(by(?:-(?:nc(?:-(?:nd|sa))?|nd|sa))?)\/(1\.0|2\.0|2\.5|3\.0|4\.0)(?:\/legalcode)?$/,
    );
    return licence && ISSUED_CC_VERSIONS.has(licence[2]) ? licence[1].toUpperCase() : null;
  } catch {
    return null;
  }
};

const vettedLicenceCode = (value: unknown) => {
  const official = officialCreativeCommonsCode(value);
  if (official) return official;

  const token = String(value || "").trim().toUpperCase().replace(/_/g, " ").replace(/\s+/g, " ");
  if (/^(?:CC0|CC-0) 1\.0$/.test(token)) return "CC0";
  if (token === "PUBLIC DOMAIN" || token === "PUBLIC DOMAIN MARK 1.0") return "PUBLIC_DOMAIN";

  const licence = token.match(
    /^CC[ -]BY(?:[ -](NC(?:[ -](?:ND|SA))?|ND|SA))?[ -](1\.0|2\.0|2\.5|3\.0|4\.0)$/,
  );
  if (!licence || !ISSUED_CC_VERSIONS.has(licence[2])) return null;
  return licence[1] ? `BY-${licence[1].replace(/ /g, "-")}` : "BY";
};

const licenceClass = (value: unknown) => {
  const code = vettedLicenceCode(value);
  if (code === "CC0" || code === "PUBLIC_DOMAIN") return "OPEN_CC0";
  if (!code?.startsWith("BY")) return "REVIEW_REQUIRED";
  if (code.includes("-NC")) return "NONCOMMERCIAL";
  if (code.includes("-ND")) return "NO_DERIVATIVES";
  if (code.includes("-SA")) return "SHARE_ALIKE_REVIEW";
  return "OPEN_ATTRIBUTION";
};

const licenceRestrictions = (value: unknown) => {
  const v = String(value || "").trim().toUpperCase().replace(/[\s_]+/g, "-");
  const restrictions: string[] = [];
  if (v.includes("-NC") || v.includes("/BY-NC")) restrictions.push("NONCOMMERCIAL");
  if (v.includes("-ND") || v.includes("/BY-ND")) restrictions.push("NO_DERIVATIVES");
  if (v.includes("-SA") || v.includes("/BY-SA")) restrictions.push("SHARE_ALIKE");
  if (licenceClass(value) === "REVIEW_REQUIRED") restrictions.push("UNKNOWN_OR_MISSING");
  return restrictions;
};

const STRICT_DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

const finiteDecimal = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || !STRICT_DECIMAL.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const finiteCoordinate = (value: unknown, min: number, max: number) => {
  const number = finiteDecimal(value);
  return number !== null && number >= min && number <= max ? number : null;
};

const finiteNonNegativeMeasurement = (value: unknown) => {
  const number = finiteDecimal(value);
  return number !== null && number >= 0 ? number : null;
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const incoming = new URL(request.url);
  const scientificName = cleanScientificName(incoming.searchParams.get("scientificName"));
  if (!scientificName) return json({ ok: false, error: "INVALID_SCIENTIFIC_NAME" }, 400, 60);

  const bbox = incoming.searchParams.get("bbox");
  const geometry = bbox ? bboxToWkt(bbox) : null;
  if (bbox && !geometry) return json({ ok: false, error: "INVALID_OR_UNBOUNDED_BBOX" }, 400, 60);

  const size = Math.max(1, boundedInt(incoming.searchParams.get("size"), 50, MAX_SIZE));
  const offset = boundedInt(incoming.searchParams.get("offset"), 0, MAX_OFFSET);
  const rawStartDate = incoming.searchParams.get("startDate");
  const rawEndDate = incoming.searchParams.get("endDate");
  const startDate = cleanIsoDate(rawStartDate);
  const endDate = cleanIsoDate(rawEndDate);
  if ((rawStartDate !== null && !startDate) || (rawEndDate !== null && !endDate)) {
    return json({ ok: false, error: "INVALID_DATE" }, 400, 60);
  }
  if (startDate && endDate && startDate > endDate) {
    return json({ ok: false, error: "INVALID_DATE_RANGE" }, 400, 60);
  }

  const qs = new URLSearchParams({
    scientificname: scientificName,
    size: String(size),
    offset: String(offset),
    absence: "exclude",
  });
  if (geometry) qs.set("geometry", geometry);
  if (startDate) qs.set("startdate", startDate);
  if (endDate) qs.set("enddate", endDate);

  const upstream = `${BASE}?${qs.toString()}`;
  try {
    const response = await fetch(upstream, {
      headers: {
        accept: "application/json",
        "user-agent": "4PLANET-ATLAS/1.0 (+https://4planet.org)",
      },
      cf: { cacheTtl: 900 } as RequestInit["cf"],
    });
    if (!response.ok) return json({ ok: false, source: "obis", error: `UPSTREAM_${response.status}` }, 502, 60);

    const payload = await response.json() as any;
    const rows = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : null;
    if (!rows) return json({ ok: false, source: "obis", error: "CONTRACT_MISMATCH" }, 502, 60);

    const records = rows
      .filter((row: any) => String(row?.occurrenceStatus ?? "").trim().toUpperCase() === "PRESENT")
      .map((row: any) => {
        const lat = finiteCoordinate(row?.decimalLatitude, -90, 90);
        const lon = finiteCoordinate(row?.decimalLongitude, -180, 180);
        return {
          occurrenceId: row?.occurrenceID ?? row?.id ?? null,
          eventId: row?.eventID ?? null,
          scientificName: row?.scientificName ?? null,
          scientificNameId: row?.scientificNameID ?? row?.aphiaID ?? null,
          eventDate: row?.eventDate ?? null,
          basisOfRecord: row?.basisOfRecord ?? null,
          occurrenceStatus: row.occurrenceStatus,
          latitude: lat,
          longitude: lon,
          coordinateUncertaintyM: finiteNonNegativeMeasurement(row?.coordinateUncertaintyInMeters),
          depthMinM: finiteNonNegativeMeasurement(row?.minimumDepthInMeters),
          depthMaxM: finiteNonNegativeMeasurement(row?.maximumDepthInMeters),
          datasetId: row?.dataset_id ?? row?.datasetID ?? row?.datasetKey ?? null,
          datasetName: row?.datasetName ?? row?.dataset_name ?? null,
          datasetCitation: row?.bibliographicCitation ?? row?.datasetCitation ?? row?.citation ?? null,
          datasetDoi: row?.datasetDOI ?? row?.datasetDoi ?? row?.doi ?? null,
          datasetUrl: row?.datasetURL ?? row?.datasetUrl ?? null,
          sourceRecordUrl: row?.references ?? null,
          provider: row?.datasetProvider ?? row?.provider ?? row?.institution ?? row?.institutionCode ?? row?.collectionCode ?? null,
          institutionCode: row?.institutionCode ?? null,
          collectionCode: row?.collectionCode ?? null,
          recordedBy: row?.recordedBy ?? null,
          licence: row?.license ?? row?.licence ?? null,
          licenceClass: licenceClass(row?.license ?? row?.licence),
          licenceRestrictions: licenceRestrictions(row?.license ?? row?.licence),
          informationWithheld: row?.informationWithheld ?? null,
          dataGeneralizations: row?.dataGeneralizations ?? null,
          locationSensitive: Boolean(
            String(row?.informationWithheld ?? "").trim() ||
            String(row?.dataGeneralizations ?? "").trim()
          ),
        };
      });

    return json({
      ok: true,
      source: "obis",
      apiVersion: "v3",
      retrievedAt: new Date().toISOString(),
      query: { scientificName, bbox: bbox || null, startDate: startDate || null, endDate: endDate || null, size, offset },
      semantics: {
        recordType: "OCCURRENCE",
        notEvidenceOf: ["abundance", "range", "population_trend", "live_position"],
        absenceRecords: "excluded",
        licencePolicy: "evaluate_original_occurrence_rights_per_record_or_dataset_before_reuse",
        rightsBoundary: "OBIS-derived products may be CC0; original occurrence dataset licences still apply",
      },
      count: records.length,
      total: payload?.total !== null && payload?.total !== undefined && Number.isFinite(Number(payload.total))
        ? Number(payload.total)
        : null,
      records,
    }, 200, 900);
  } catch (error) {
    return json({ ok: false, source: "obis", error: String((error as Error)?.message || error) }, 502, 60);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});
