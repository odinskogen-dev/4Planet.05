// Existing isolated 4PLANET AXE clock worker: additive, bounded Grok/COO dispatch.
// The 15-minute clock is transport only. One scheduled daily command asks the
// existing Oppie router to choose ONE authorised task from canonical BRAIN.
const sender = async (env, text) => {
  if (!env.SLACK_AXE_WEBHOOK_URL) throw new Error('SLACK_AXE_WEBHOOK_URL missing');
  const res = await fetch(env.SLACK_AXE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Slack dispatch returned HTTP ' + res.status);
};

async function wake(env, source, scheduledTime = Date.now()) {
  const eventId = 'cloudflare-clock:' + scheduledTime;
  await sender(env, [
    '[CLOUDFLARE / CLOCK]',
    'event_id: ' + eventId,
    'kind: PORTFOLIO_CLOCK',
    'action: quarter_hour_wake',
    'scope: GLOBAL_4PLANET_OPERATIONS',
    'source: ' + source,
    'WAKE SIGNAL ONLY — not evidence that AXE or Grok executed work.',
  ].join('\n'));

  // Conservative one-per-UTC-day starter, not 96 costly Grok runs.
  const when = new Date(scheduledTime);
  if (source === 'cloudflare-cron' && when.getUTCHours() === 8 && when.getUTCMinutes() < 15) {
    await sender(env, [
      '[AXE / ChatGPT] AXE-JOB-01',
      'SOURCE: cloudflare-symphony-daily-v1',
      'event_id: cloudflare-oppie-daily:' + when.toISOString().slice(0, 10),
      '@oppie — EXISTING COO ROUTE. DAILY ONE-TASK EXECUTION, NOT ACK ONLY.',
      'Read current Project Lead CURRENT, Programme Control, exact Project Home + owner/lease',
      'and existing work queue in canonical BRAIN. Choose ONE unclaimed highest-value',
      'safe, reversible task producing verified capital, discovery/SEO, code/test or LIVE',
      'progress. Route to existing competent specialist only; never create a new Brain,',
      'task store, agent or parallel product branch. Prefer completion of existing accepted',
      'candidates over new candidates. Respect Founder release/send/spend/contract gates.',
      'Report JOB_ID | OWNER | CLAIM | ACTUAL CHANGE | SOURCE+AS_OF | EVIDENCE URL',
      '| independent QA state | LIVE/USER/CASH truth | BLOCKER | NEXT in #axe-grok-lab.',
      'If quota or connector stops you, explicitly report BLOCKED. Do not declare PASS on wake.',
    ].join('\n'));
  }
  return eventId;
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(wake(env, 'cloudflare-cron', controller.scheduledTime || Date.now()));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('AXE clock canary ready', { status: 200 });
    if (url.pathname !== '/canary') return new Response('Not found', { status: 404 });
    // Public GET /canary is health-only. Never relay unauthenticated HTTP input to Slack.\n    return Response.json({ ok: true, mode: 'health_only', wake_sent: false });
  },
};
