export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/canary") return new Response("AXE wake canary ready", { status: 200 });
    const eventId = "cloudflare-canary:" + Date.now();
    const text = [
      "[CLOUDFLARE / CANARY]",
      "event_id: " + eventId,
      "kind: PORTFOLIO_CLOCK",
      "action: quarter_hour_wake",
      "scope: GLOBAL_4PLANET_OPERATIONS",
      "source: cloudflare-worker",
      "CANARY ONLY — prove Cloudflare → Slack → native AXE wake. Fresh-read canonical context; perform one safe concrete value action or close a real return; write RESULT | EVIDENCE | STATE CHANGE | LEARNING | NEXT | OWNER | WAKE CONDITION."
    ].join("\n");
    const res = await fetch(env.SLACK_AXE_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return new Response("Slack failed: " + res.status, { status: 502 });
    return new Response(JSON.stringify({ ok: true, event_id: eventId }), { headers: { "content-type": "application/json" } });
  }
};

// trigger registered canary workflow
