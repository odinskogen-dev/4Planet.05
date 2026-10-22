/* CUB MEDIEVAL KINGDOMS — persistent multiplayer realm layer.
 * Game's fullframe Three.js RTS remains intact underneath. The realm is a real
 * shared server economy; tactical battles remain local pending server-sim port.
 */
(() => {
  'use strict';
  const WS_URL = 'wss://cub-medieval-realm.odin-skogen.workers.dev/connect';
  const TOKEN_KEY = 'cub_medieval_realmalpha_guest_v1';
  const NAME_KEY = 'cub_medieval_realmalpha_house_v1';
  const TYPES = [
    ['house', 'House', '45 wood'],
    ['farm', 'Farm', '55 wood'],
    ['lumber', 'Timber camp', '45 wood'],
    ['quarry', 'Quarry', '65 wood + 10 stone'],
    ['market', 'Market', '95 wood + 25 stone'],
    ['barracks', 'Barracks', '130 wood + 45 stone'],
    ['wall', 'Stone wall', '30 stone'],
    ['tower', 'Watchtower', '50 wood + 90 stone'],
  ];
  let socket = null;
  let me = null;
  let world = null;
  let active = false;
  let slot = { x: 2, y: 2 };
  let selectedBuilding = 'house';
  let visible = false;
  let lastMessage = 'Join the shared medieval realm to meet other rulers.';
  let lastConnected = false;
  let reconnectTimer = null;

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  const button = el('button', 'cub-realm-toggle', 'ONLINE REALM');
  button.type = 'button';
  button.setAttribute('aria-label', 'Open Online Realm');
  button.hidden = true;
  const panel = el('aside', 'cub-realm-panel');
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Online Realm');
  document.body.append(button, panel);
  const head = el('header', 'cub-realm-head');
  const heading = el('div', '', 'THE MARCHES');
  heading.append(el('small', '', 'SHARED WORLD · ALPHA 01'));
  const close = el('button', '', '×');
  close.setAttribute('aria-label', 'Close online realm');
  close.onclick = () => toggle(false);
  head.append(heading, close);
  const contents = el('div', 'cub-realm-contents');
  const status = el('p', 'cub-realm-message');
  panel.append(head, contents, status);
  button.onclick = () => toggle(!visible);
  function toggle(open) {
    visible = open;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open && !socket && !reconnectTimer) connect();
    if (open) render();
  }
  function send(value) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return note('The realm connection is not ready.');
    socket.send(JSON.stringify(value));
  }
  function note(message) { lastMessage = String(message); status.textContent = lastMessage; }
  function issue(kind, additional = {}) {
    send({ type: 'order', requestId: crypto.randomUUID(), kind, ...additional });
  }
  function connect() {
    try { socket = new WebSocket(WS_URL); }
    catch { note('Live realm is temporarily unavailable. Your offline RTS is unaffected.'); return; }
    note('Connecting to the medieval realm…');
    socket.onopen = () => {
      lastConnected = true;
      note('Connection established.');
      const prior = localStorage.getItem(TOKEN_KEY);
      if (prior) send({ type: 'hello', token: prior, name: localStorage.getItem(NAME_KEY) || 'House of Alder' });
      render();
    };
    socket.onmessage = event => {
      let packet;
      try { packet = JSON.parse(event.data); } catch { return; }
      if (packet.type === 'session') {
        if (packet.token) localStorage.setItem(TOKEN_KEY, packet.token);
        me = packet.player;
        note('Kingdom loaded. This realm is shared with other human players.');
      } else if (packet.type === 'realm') {
        world = packet.data;
      } else if (packet.type === 'player') {
        me = packet.player;
      } else if (packet.type === 'ack') {
        me = packet.player;
        note('Server confirmed the kingdom order.' + (packet.replayed ? ' Duplicate order ignored.' : ''));
      } else if (packet.type === 'error') {
        note(packet.message || 'Server rejected the order.');
      }
      render();
    };
    socket.onerror = () => note('Realm connection failed. Your 3D strategy game continues offline.');
    socket.onclose = () => {
      socket = null;
      me = null;
      note('Online realm disconnected. Your 3D strategy game continues.');
      render();
      if (lastConnected && !reconnectTimer && !document.hidden) {
        reconnectTimer = setTimeout(() => { reconnectTimer = null; if (visible) connect(); }, 4500);
      }
    };
  }
  function simpleButton(text, fn, extraClass = '') {
    const b = el('button', 'cub-realm-action ' + extraClass, text);
    b.type = 'button'; b.onclick = fn; return b;
  }
  function placeGrid() {
    const wrap = el('div', 'cub-realm-grid');
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
      const filled = me?.buildings?.find(b => Math.abs(b.x - x) < 1 && Math.abs(b.y - y) < 1);
      const tile = el('button', 'cub-realm-tile' + (filled ? ' occupied' : '') + (slot.x === x && slot.y === y ? ' selected' : ''), filled ? '■' : '·');
      tile.type = 'button'; tile.title = filled ? filled.kind : `Tile ${x + 1}, ${y + 1}`;
      tile.onclick = () => { slot = { x, y }; render(); };
      wrap.append(tile);
    }
    return wrap;
  }
  function render() {
    if (!visible) return;
    contents.replaceChildren();
    const descriptor = el('p', 'cub-realm-small', 'Online settlements and trade are server-persistent. Full 3D tactical combat is currently local while multiplayer battles are in development.');
    contents.append(descriptor);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      contents.append(simpleButton('RECONNECT REALM', connect));
      status.textContent = lastMessage;
      return;
    }
    if (!me) {
      const label = el('label', '', 'FOUND YOUR HOUSE');
      const input = el('input', 'cub-realm-input');
      input.maxLength = 24;
      input.placeholder = 'House of Alder';
      input.value = localStorage.getItem(NAME_KEY) || 'House of Alder';
      label.append(input);
      contents.append(label, simpleButton('JOIN SHARED REALM', () => {
        const value = input.value.trim();
        localStorage.setItem(NAME_KEY, value);
        send({ type: 'hello', name: value });
      }));
      status.textContent = lastMessage;
      return;
    }
    const name = el('h2', 'cub-realm-player', me.name);
    contents.append(name, el('p', 'cub-realm-small', 'Guest kingdom · private access key stored in this browser only'));
    const resources = el('div', 'cub-realm-resources');
    for (const k of ['wood', 'stone', 'food', 'iron', 'coin']) {
      const stat = el('div', '', ''); stat.append(el('small', '', k.toUpperCase()), el('strong', '', String(me.stock?.[k] || 0)));
      resources.append(stat);
    }
    contents.append(resources, simpleButton('COLLECT PRODUCTION', () => issue('collect')));
    contents.append(el('h3', '', 'SETTLEMENT ORDERS'));
    const picker = el('select', 'cub-realm-input');
    for (const [id, name, cost] of TYPES) {
      const option = el('option', '', `${name} — ${cost}`);option.value = id;option.selected = id === selectedBuilding;picker.append(option);
    }
    picker.onchange = event => selectedBuilding = event.target.value;
    contents.append(picker, placeGrid(), simpleButton('BUILD AT SELECTED TILE', () => issue('build', { building: selectedBuilding, ...slot })));
    contents.append(el('h3', '', 'RECRUIT FORMATIONS'));
    const army = el('div', 'cub-realm-buttons');
    for (const kind of ['infantry', 'archers', 'cavalry']) army.append(simpleButton(kind.toUpperCase(), () => issue('recruit', { troop: kind })));
    contents.append(army);
    contents.append(el('h3', '', 'OTHER HUMAN KINGDOMS'));
    const others = (world?.players || []).filter(p => p.id !== me.id);
    if (!others.length) contents.append(el('p', 'cub-realm-small', 'No other rulers have founded a kingdom yet.'));
    for (const other of others.slice(0, 18)) {
      const line = el('div', 'cub-realm-other', other.name);
      line.append(el('small', '', `${other.settlements} buildings · ${other.regiments} regiments`));
      line.append(simpleButton('GIVE 10 WOOD', () => issue('trade', { target: other.id, resource: 'wood', amount: 10 })));
      contents.append(line);
    }
    status.textContent = lastMessage;
  }
  const css = el('style');
  css.textContent = `
.cub-realm-toggle{position:fixed;z-index:5500;right:calc(14px + env(safe-area-inset-right));top:calc(12px + env(safe-area-inset-top));background:rgba(23,48,35,.92);color:#fff;padding:8px 11px;font:600 10px/1.3 'DM Sans',system-ui,sans-serif;border:1px solid #879b8a;border-radius:9px;letter-spacing:.05em;box-shadow:0 2px 13px #0005}
.cub-realm-toggle[hidden],.cub-realm-panel[hidden]{display:none!important}
.cub-realm-panel{position:fixed;z-index:5600;right:calc(12px + env(safe-area-inset-right));top:calc(58px + env(safe-area-inset-top));width:min(380px,calc(100vw - 22px));max-height:min(76dvh,740px);overflow:auto;background:#fff;color:#263d2c;border-radius:15px;border:1px solid #d9e4d9;box-shadow:0 12px 55px #091b1390;font:13px/1.5 'DM Sans',system-ui,sans-serif}
.cub-realm-head{display:flex;justify-content:space-between;gap:12px;align-items:center;border-bottom:1px solid #e2e9e1;padding:15px 17px;font-weight:700;letter-spacing:.05em}
.cub-realm-head small{display:block;font-size:9px;color:#7e8c81;font-weight:500;margin-top:4px}.cub-realm-head>button{background:transparent;border:0;font-size:27px;cursor:pointer;color:#526a58}
.cub-realm-contents{padding:12px 16px 18px}.cub-realm-small{font-size:10px;color:#738173;line-height:1.6}.cub-realm-player{font-size:22px;letter-spacing:-.045em;margin:7px 0}
.cub-realm-resources{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:14px 0}.cub-realm-resources>div{border:1px solid #e7eee6;border-radius:7px;padding:7px 5px;display:flex;flex-direction:column}.cub-realm-resources small{font-size:8px;color:#839288}.cub-realm-resources strong{font-size:14px}
.cub-realm-action{background:#254835;border:0;color:#fff;border-radius:8px;font:600 10px 'DM Sans',system-ui,sans-serif;padding:11px 12px;cursor:pointer}.cub-realm-action:disabled{opacity:.45}
.cub-realm-contents>h3{font-size:10px;letter-spacing:.12em;color:#577661;margin:21px 0 10px}.cub-realm-input{width:100%;background:#fff;border:1px solid #bfcfc0;border-radius:7px;padding:11px 10px;margin:8px 0;font:12px 'DM Sans',system-ui,sans-serif}
.cub-realm-grid{display:grid;grid-template-columns:repeat(14,1fr);gap:2px;margin:9px 0 14px}.cub-realm-tile{aspect-ratio:1/1;background:#eaf2e7;border:1px solid #d0dfce;padding:0;cursor:pointer;font:12px sans-serif;color:#9aaba1;border-radius:2px}.cub-realm-tile.occupied{background:#7b9e87;color:#fff}.cub-realm-tile.selected{outline:2px solid #cb8338;outline-offset:-2px}
.cub-realm-buttons{display:flex;gap:5px}.cub-realm-buttons button{flex:1}.cub-realm-other{border-top:1px solid #e4ebe3;display:grid;grid-template-columns:1fr auto;gap:5px;padding:8px 0;align-items:center}.cub-realm-other small{grid-column:1;color:#859287}.cub-realm-other button{grid-column:2;grid-row:1/span 2}
.cub-realm-message{position:sticky;bottom:0;margin:0;background:#f0f5ef;padding:12px 16px;color:#4f775c;border-top:1px solid #d7e5d6;font-size:10px}
@media(max-width:490px){.cub-realm-panel{top:5dvh;right:2vw;width:96vw;max-height:90dvh}.cub-realm-toggle{top:auto;bottom:calc(15px + env(safe-area-inset-bottom));right:12px}}
`;
  document.head.append(css);
  const visibility = setInterval(() => {
    const game = window.ROMA?.app;
    const shouldShow = Boolean(game?.playing);
    if (button.hidden === shouldShow) button.hidden = !shouldShow;
    if (!shouldShow && visible) toggle(false);
  }, 750);
  window.addEventListener('beforeunload', () => { clearInterval(visibility); if (socket) socket.close(); });
})();