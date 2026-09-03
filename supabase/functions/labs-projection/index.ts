import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL");
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceRole) throw new Error("LABS_PROJECTION_FAIL_CLOSED: Supabase server credentials unavailable");

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  try {
    const { data, error } = await admin
      .schema("cns")
      .from("v_labs_projection")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return Response.json(
      {
        schemaVersion: 1,
        authority: "CNS_READ_ONLY_PROJECTION",
        generatedAt: new Date().toISOString(),
        hydrated: (data?.length ?? 0) > 0,
        projects: data ?? [],
        note:
          (data?.length ?? 0) > 0
            ? null
            : "CNS schema is live but canonical portfolio hydration has not yet occurred.",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "LABS_PROJECTION_ERROR";
    return Response.json(
      { schemaVersion: 1, authority: "CNS_READ_ONLY_PROJECTION", error: message },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
});
