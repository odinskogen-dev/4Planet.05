interface Env {
  ARTSORAKEL_API_TOKEN?: string;
  ARTSORAKEL_SIGNING_SECRET?: string;
  ARTSORAKEL_API_URL?: string;
}

type Candidate = {
  scientificName: string;
  commonName?: string;
  probability: number;
  scientificNameId?: string;
  groupName?: string;
  infoUrl?: string;
  redListCategory?: string;
  invasiveCategory?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string | ArrayBuffer): Promise<string> {
  const input = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return hex(await crypto.subtle.digest("SHA-256", input));
}

async function hmacSha256(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function artsorakelSignature(
  token: string,
  secret: string,
  images: File[],
  fields: Record<string, string>,
): Promise<{ timestamp: string; signature: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const imageHashes: string[] = [];
  for (const image of images) imageHashes.push(await sha256(await image.arrayBuffer()));
  const fieldLines = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const bodyDigest = await sha256(`${imageHashes.join("\n")}\n${fieldLines}`);
  const canonical = ["v1", "POST", "/identify", token, timestamp, bodyDigest].join("\n");
  const signature = `v1=${await hmacSha256(secret, canonical)}`;
  return { timestamp, signature };
}

function cleanCoordinate(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return String(n);
}

function normalisePredictions(raw: any): Candidate[] {
  const predictions = Array.isArray(raw?.predictions) ? raw.predictions : [];
  return predictions
    .map((row: any) => {
      const taxon = row?.taxon ?? row;
      const scientificName = String(
        taxon?.scientificName ?? taxon?.scientific_name ?? taxon?.name ?? "",
      ).trim();
      const probability = Number(row?.probability ?? taxon?.probability);
      if (!scientificName || !Number.isFinite(probability)) return null;
      return {
        scientificName,
        commonName: String(taxon?.vernacularName ?? "").trim() || undefined,
        probability: Math.max(0, Math.min(1, probability)),
        scientificNameId: String(
          taxon?.scientificNameID ?? taxon?.scientific_name_id ?? taxon?.scientificNameId ?? "",
        ).trim() || undefined,
        groupName: String(taxon?.groupName ?? "").trim() || undefined,
        infoUrl: String(taxon?.infoUrl ?? "").trim() || undefined,
        redListCategory: String(taxon?.redListCategory ?? "").trim() || undefined,
        invasiveCategory: String(taxon?.invasiveCategory ?? "").trim() || undefined,
      } satisfies Candidate;
    })
    .filter(Boolean)
    .slice(0, 5) as Candidate[];
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const token = env.ARTSORAKEL_API_TOKEN?.trim();
  if (!token) {
    return json({
      ok: false,
      configured: false,
      provider: "artsorakel-norway",
      error: "PROVIDER_NOT_CONFIGURED",
      truthBoundary: "No recognition claim was created.",
    }, 503);
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return json({ ok: false, configured: true, error: "INVALID_MULTIPART" }, 400);
  }

  const images = incoming.getAll("image").filter((entry): entry is File => entry instanceof File);
  if (!images.length) return json({ ok: false, configured: true, error: "IMAGE_REQUIRED" }, 400);
  if (images.length > 4) return json({ ok: false, configured: true, error: "TOO_MANY_IMAGES" }, 400);

  let totalBytes = 0;
  for (const image of images) {
    if (!image.type.startsWith("image/")) return json({ ok: false, configured: true, error: "IMAGE_TYPE_REQUIRED" }, 400);
    totalBytes += image.size;
  }
  if (totalBytes > 30 * 1024 * 1024) return json({ ok: false, configured: true, error: "IMAGES_TOO_LARGE" }, 413);

  const fields: Record<string, string> = {};
  const latitude = cleanCoordinate(incoming.get("latitude"));
  const longitude = cleanCoordinate(incoming.get("longitude"));
  if (latitude) fields.latitude = latitude;
  if (longitude) fields.longitude = longitude;

  const outbound = new FormData();
  for (const image of images) outbound.append("image", image, image.name || "4planet-lens.jpg");
  for (const [key, value] of Object.entries(fields)) outbound.append(key, value);

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const signingSecret = env.ARTSORAKEL_SIGNING_SECRET?.trim();
  if (signingSecret) {
    const signed = await artsorakelSignature(token, signingSecret, images, fields);
    headers["X-Artsorakel-Timestamp"] = signed.timestamp;
    headers["X-Artsorakel-Signature"] = signed.signature;
  }

  const endpoint = env.ARTSORAKEL_API_URL?.trim() || "https://ai.artsdatabanken.no/identify";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: outbound,
    });

    if (!response.ok) {
      return json({
        ok: false,
        configured: true,
        provider: "artsorakel-norway",
        error: response.status === 401 || response.status === 403 ? "PROVIDER_AUTH_FAILED" : "PROVIDER_REQUEST_FAILED",
        providerStatus: response.status,
        truthBoundary: "No recognition claim was created.",
      }, 502);
    }

    const raw = await response.json();
    const candidates = normalisePredictions(raw);
    return json({
      ok: true,
      configured: true,
      provider: "artsorakel-norway",
      providerModel: raw?.modelInfo?.model ?? raw?.modelInfo?.name ?? "Norwegian model",
      candidates,
      unknownAllowed: true,
      selectedTaxon: null,
      verificationState: "AI_SUGGESTED",
      truthBoundary: "Candidates are model suggestions, not verified identifications or observations.",
    });
  } catch {
    return json({
      ok: false,
      configured: true,
      provider: "artsorakel-norway",
      error: "PROVIDER_UNAVAILABLE",
      truthBoundary: "No recognition claim was created.",
    }, 502);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
};
