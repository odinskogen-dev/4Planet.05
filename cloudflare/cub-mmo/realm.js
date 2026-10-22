// CUB GAME LAB — independent, non-monetised shared realm alpha.
// This is an authoritative multiplayer *metagame* (settlements/economy), not
// a server-authoritative tactical combat simulation. No passwords or payment APIs.
import { DurableObject } from 'cloudflare:workers';

const ALLOWED = new Set(['https://lab.p4nther.com', 'https://labs.p4nther.com']);
const REGION = 'marches-01';
const MAX_PLAYERS = 40;
const START = { wood: 500, stone: 270, food: 420, iron: 100, coin: 150 };
const BUILDINGS = {
  house: { cost: { wood: 45 }, seconds: 15 },
  farm: { cost: { wood: 55 }, seconds: 20 },
  lumber: { cost: { wood: 45 }, seconds: 20 },
  quarry: { cost: { wood: 65, stone: 10 }, seconds: 25 },
  market: { cost: { wood: 95, stone: 25 }, seconds: 30 },
  barracks: { cost: { wood: 130, stone: 45 }, seconds: 40 },
  wall: { cost: { stone: 30 }, seconds: 12 },
  tower: { cost: { wood: 50, stone: 90 }, seconds: 38 },
};
const TROOPS = {
  infantry: { food: 60, coin: 20, iron: 8, seconds: 18 },
  archers: { food: 45, coin: 30, iron: 12, seconds: 24 },
  cavalry: { food: 75, coin: 65, iron: 32, seconds: 38 },
};
const cleanName = name => String(name || '').trim().replace(/[^a-zA-ZÀ-ÿ0-9' -]/g, '').slice(0, 24);
const validTile = n => Number.isInteger(n) && n >= 0 && n < 14;
const validRequest = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{8,96}$/.test(id);
const value = n => Math.max(0, Math.floor(Number(n) || 0));
const safeJSON = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
});
const active = item => item && item.readyAt <= Date.now();

async function hashToken(token) {
  const bytes = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('');
}
function tokenValue() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(n => n.toString(16).padStart(2, '0')).join('');
}
function produce(p, timestamp) {
  const chunks = Math.min(1440, Math.floor(Math.max(0, timestamp - p.lastUpdate) / 30000));
  if (chunks < 1) return;
  const completed = kind => p.buildings.filter(b => b.kind === kind && b.readyAt <= timestamp).length;
  p.stock.wood += chunks * (2 + completed('lumber') * 5);
  p.stock.food += chunks * (2 + completed('farm') * 5);
  p.stock.stone += chunks * (1 + completed('quarry') * 4);
  p.stock.coin += chunks * (1 + completed('market') * 3);
  p.lastUpdate += chunks * 30000;
}
function canPay(stock, cost) {
  return Object.entries(cost).every(([k, v]) => stock[k] >= v);
}
function deduct(stock, cost) {
  for (const [k, v] of Object.entries(cost)) stock[k] -= v;
}
function view(state) {
  return {
    region: REGION,
    version: state.version,
    players: Object.values(state.players).map(p => ({
      id: p.id, name: p.name, slot: p.slot,
      settlements: p.buildings.length, regiments: p.army.length,
      foundedAt: p.foundedAt,
    })),
  };
}
function privateView(p) {
  return { id: p.id, name: p.name, slot: p.slot, stock: p.stock, buildings: p.buildings,
    army: p.army, foundedAt: p.foundedAt, version: p.version };
}
function defaultWorld() { return { version: 0, players: {}, tokens: {} }; }
function newPlayer(id, name, slot) {
  const stamp = Date.now();
  return { id, name, slot, foundedAt: stamp, lastUpdate: stamp, version: 1,
    stock: { ...START }, receipts: [],
    buildings: [
      { id: 'town-' + id, kind: 'town', x: 7, y: 7, readyAt: stamp - 1 },
      { id: 'house-' + id, kind: 'house', x: 3, y: 7, readyAt: stamp - 1 },
      { id: 'farm-' + id, kind: 'farm', x: 10, y: 8, readyAt: stamp - 1 },
    ],
    army: [],
  };
}

export class Realm extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }
  async fetch(request) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ playerId: null });
      server.send(JSON.stringify({ type: 'welcome', region: REGION, protocol: 1, message: 'Send hello with an existing guest key or a new house name.' }));
      return new Response(null, { status: 101, webSocket: client });
    }
    const state = await this.ctx.storage.get('state') || defaultWorld();
    if (new URL(request.url).pathname.endsWith('/snapshot')) return safeJSON(view(state));
    return safeJSON({ ok: true, region: REGION, guestPlayers: Object.keys(state.players).length });
  }
  send(ws, payload) {
    try { ws.send(JSON.stringify(payload)); } catch (error) { console.warn('socket unavailable', String(error)); }
  }
  broadcast(state) {
    const snapshot = { type: 'realm', data: view(state) };
    for (const ws of this.ctx.getWebSockets()) {
      const session = ws.deserializeAttachment();
      if (session?.playerId) this.send(ws, snapshot);
    }
  }
  async webSocketMessage(ws, message) {
    if (typeof message !== 'string' || message.length > 4096) return this.send(ws, { type: 'error', message: 'Invalid message' });
    let payload;
    try { payload = JSON.parse(message); } catch { return this.send(ws, { type: 'error', message: 'Invalid JSON' }); }
    if (!payload || typeof payload !== 'object') return;
    if (payload.type === 'ping') return this.send(ws, { type: 'pong' });
    if (payload.type === 'hello') return this.hello(ws, payload);
    if (payload.type === 'order') return this.order(ws, payload);
    this.send(ws, { type: 'error', message: 'Unknown command' });
  }
  async hello(ws, payload) {
    const old = ws.deserializeAttachment();
    if (old?.playerId) return this.send(ws, { type: 'error', message: 'Already joined' });
    const supplied = String(payload.token || '');
    const token = /^[a-f0-9]{64}$/.test(supplied) ? supplied : tokenValue();
    const hash = await hashToken(token);
    const display = cleanName(payload.name);
    let player;
    try {
      await this.ctx.storage.transaction(async txn => {
        const state = await txn.get('state') || defaultWorld();
        const priorId = state.tokens[hash];
        if (priorId && state.players[priorId]) {
          player = state.players[priorId];
          produce(player, Date.now());
        } else {
          if (display.length < 3) throw Error('A house name needs at least three characters');
          const used = new Set(Object.values(state.players).map(p => p.slot));
          if (used.size >= MAX_PLAYERS) throw Error('The alpha realm is full');
          const slot = Array.from({ length: MAX_PLAYERS }, (_, n) => n).find(n => !used.has(n));
          const id = 'm_' + hash.slice(0, 20);
          player = newPlayer(id, display, slot);
          state.players[id] = player;
          state.tokens[hash] = id;
        }
        state.version += 1;
        await txn.put('state', state);
      });
    } catch (error) { return this.send(ws, { type: 'error', message: String(error.message || error) }); }
    ws.serializeAttachment({ playerId: player.id });
    this.send(ws, { type: 'session', token, player: privateView(player) });
    const state = await this.ctx.storage.get('state') || defaultWorld();
    this.broadcast(state);
  }
  async order(ws, payload) {
    const session = ws.deserializeAttachment();
    if (!session?.playerId) return this.send(ws, { type: 'error', message: 'Join the realm before issuing orders' });
    if (!validRequest(payload.requestId)) return this.send(ws, { type: 'error', message: 'Invalid order ID' });
    const kind = String(payload.kind || '');
    let updated, replayed = false;
    try {
      await this.ctx.storage.transaction(async txn => {
        const state = await txn.get('state') || defaultWorld();
        const p = state.players[session.playerId];
        if (!p) throw Error('Your kingdom is unavailable');
        if (p.receipts.includes(payload.requestId)) { replayed = true; updated = privateView(p); return; }
        if (p.receipts.length >= 120) p.receipts.shift();
        produce(p, Date.now());
        if (kind === 'build') {
          const type = String(payload.building || '');
          const rule = BUILDINGS[type];
          const x = Number(payload.x), y = Number(payload.y);
          if (!rule) throw Error('Unknown building');
          if (!validTile(x) || !validTile(y)) throw Error('Invalid construction tile');
          if (p.buildings.length >= 70 || p.buildings.some(b => Math.abs(b.x - x) < 2 && Math.abs(b.y - y) < 2)) throw Error('This plot cannot be built upon');
          if (!canPay(p.stock, rule.cost)) throw Error('Not enough resources');
          deduct(p.stock, rule.cost);
          p.buildings.push({ id: 'b_' + crypto.randomUUID(), kind: type, x, y, readyAt: Date.now() + rule.seconds * 1000 });
        } else if (kind === 'recruit') {
          const type = String(payload.troop || '');
          const rule = TROOPS[type];
          if (!rule) throw Error('Unknown troop type');
          if (!p.buildings.some(b => b.kind === 'barracks' && active(b))) throw Error('Build a barracks first');
          if (p.army.length >= 18 || !canPay(p.stock, { food: rule.food, coin: rule.coin, iron: rule.iron })) throw Error('Recruitment limit or insufficient resources');
          deduct(p.stock, { food: rule.food, coin: rule.coin, iron: rule.iron });
          p.army.push({ id: 'a_' + crypto.randomUUID(), kind: type, count: 24, slot: p.slot, x: 7, y: 7, readyAt: Date.now() + rule.seconds * 1000 });
        } else if (kind === 'trade') {
          const target = String(payload.target || '');
          const res = String(payload.resource || '');
          const amt = Number(payload.amount);
          if (!Object.hasOwn(p.stock, res) || !Number.isInteger(amt) || amt < 1 || amt > 50) throw Error('Invalid trade');
          const other = state.players[target];
          if (!other || target === p.id || p.stock[res] < amt) throw Error('Invalid recipient or insufficient resources');
          p.stock[res] -= amt;
          other.stock[res] += amt;
          other.version += 1;
        } else if (kind === 'collect') {
          // Trigger lazy economy production; no player supplied resource quantities.
        } else throw Error('Unsupported order');
        p.version += 1;
        p.receipts.push(payload.requestId);
        state.version += 1;
        updated = privateView(p);
        await txn.put('state', state);
      });
    } catch (error) { return this.send(ws, { type: 'error', requestId: payload.requestId, message: String(error.message || error) }); }
    this.send(ws, { type: 'ack', requestId: payload.requestId, replayed, player: updated });
    const state = await this.ctx.storage.get('state') || defaultWorld();
    this.broadcast(state);
    for (const client of this.ctx.getWebSockets()) {
      const attachment = client.deserializeAttachment();
      if (attachment?.playerId && attachment.playerId !== session.playerId) {
        const p = state.players[attachment.playerId];
        if (p) this.send(client, { type: 'player', player: privateView(p) });
      }
    }
  }
  async webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch {}
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (origin && !ALLOWED.has(origin)) return safeJSON({ error: 'Origin not permitted' }, 403);
    const url = new URL(request.url);
    if (url.pathname === '/health') return safeJSON({ ok: true, game: 'medieval-kingdoms-realm-alpha', protocol: 1 });
    if (!['/connect', '/snapshot'].includes(url.pathname)) return safeJSON({ error: 'Not found' }, 404);
    const stub = env.REALM.get(env.REALM.idFromName(REGION));
    const response = await stub.fetch(request);
    if (response.status === 101) return response;
    const headers = new Headers(response.headers);
    if (origin && ALLOWED.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    return new Response(response.body, { status: response.status, headers });
  },
};