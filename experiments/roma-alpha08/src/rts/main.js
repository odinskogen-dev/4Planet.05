import './style.css';
import { Simulation } from './simulation.js';
import { WorldView } from './renderer.js';
import { Sound } from './audio.js';
import { BUILDINGS, TROOPS, RESOURCE, VERSION, riverX, MAP } from './config.js';
const root = document.querySelector('#rts-root');
root.innerHTML = `<main class="rts-app"><canvas id="world" aria-label="Valley battlefield. Drag to pan, pinch to zoom, tap to select or order."></canvas><div id="labels"></div><header class="top-hud"><div class="title-row"><span class="wordmark">LIVING KINGDOM</span><span class="version-tag">GAME LAB / 01</span><span class="match-clock" id="clock">00:00</span></div><button class="menu-btn" id="menu" aria-label="Pause and menu">≡</button><div class="resources" id="resources"></div></header><div class="mission" id="mission"></div><nav class="camera-buttons" aria-label="Camera"><button id="zoom-in" aria-label="Zoom in">+</button><button id="zoom-out" aria-label="Zoom out">−</button><button id="home" class="home" aria-label="Focus settlement">⌂</button></nav><div class="mini-wrap"><canvas id="minimap" width="${MAP.width}" height="${MAP.depth}" aria-label="Valley overview; tap to move camera"></canvas><span class="mini-label">THE WILLOW VALLEY</span></div><div class="toast hidden" id="toast" role="status"></div><footer class="bottom-hud"><div class="selection"><div class="selection-icon" id="selection-icon">⌂</div><div class="selection-copy"><strong id="selection-title">Willowmere</strong><small id="selection-detail">Your settlement. Your story.</small></div><span class="pop" id="population"></span></div><div class="actions" id="actions"></div></footer><section class="sheet hidden" id="sheet"></section><section class="overlay" id="overlay"></section><div id="error"></div></main>`;
const $ = (id) => document.getElementById(id),
  audio = new Sound();
let sim = new Simulation(),
  view,
  selected = null,
  started = false,
  placement = null,
  preview = null,
  toastUntil = 0,
  lastEvent = '',
  uiKey = '',
  savedAt = 0,
  over = false;
const SAVE = 'gamelab:rts-core-01:save:v1';
function notify(message, error = false) {
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  toastUntil = performance.now() + 4500;
  audio.play(error ? 'error' : 'order');
}
function cost(c) {
  return Object.entries(c)
    .map(([k, v]) => `${v} ${RESOURCE[k].name.toLowerCase()}`)
    .join(' · ');
}
function button(text, fn, cls = '', disabled = false) {
  const b = document.createElement('button');
  b.innerHTML = text;
  b.className = cls;
  b.disabled = disabled;
  b.onclick = () => {
    audio.unlock();
    fn();
  };
  return b;
}
function hideSheet() {
  $('sheet').classList.add('hidden');
}
function showIntro() {
  sim.paused = true;
  $('overlay').classList.remove('hidden');
  $('overlay').innerHTML =
    `<div class="dialog"><div class="eyebrow">GAME LAB · RTS CORE 01</div><h1>A kingdom starts<br>with a village.</h1><p class="intro-line">Build a place worth fighting for.</p><p>Lead Willowmere from a handful of workers to a living settlement. Cross the river, claim Highmeadow and break Redbank’s stronghold.</p><div class="steps"><div class="step"><b>01</b>Gather real resources. Grow your village.</div><div class="step"><b>02</b>Raise regiments. Protect your people.</div><div class="step"><b>03</b>Take the high ground. Win the valley.</div></div><div class="button-stack" id="start-actions"></div><footer>Drag to pan · Pinch to zoom · Tap to select, then tap to order.<br>Single-player prototype · Fictional musket-era valley · No accounts.</footer></div>`;
  const actions = $('start-actions');
  actions.append(button('Begin a new settlement', () => startNew(), 'primary'));
  try {
    if (localStorage.getItem(SAVE))
      actions.append(button('Continue saved settlement', resume));
  } catch {}
  actions.append(button('How to play', () => help(true)));
}
function startNew() {
  sim = new Simulation();
  view.sim = sim;
  for (const g of view.objects.values()) view.scene.remove(g);
  view.objects.clear();
  view.center.set(34, 0, 103);
  view.span = 65;
  view.updateCamera();
  selected = null;
  started = true;
  over = false;
  uiKey = '';
  sim.paused = false;
  $('overlay').classList.add('hidden');
  audio.unlock();
  notify(
    'Your workers already gather. Build a barracks to raise your first regiment.',
  );
  updateUI(true);
}
function resume() {
  try {
    sim = Simulation.restore(JSON.parse(localStorage.getItem(SAVE)));
    view.sim = sim;
    for (const g of view.objects.values()) view.scene.remove(g);
    view.objects.clear();
    started = true;
    over = false;
    sim.paused = false;
    selected = null;
    uiKey = '';
    $('overlay').classList.add('hidden');
    notify('Settlement restored.');
    updateUI(true);
  } catch {
    notify('Saved settlement could not be read. Start a new match.', true);
  }
}
function save() {
  try {
    localStorage.setItem(SAVE, JSON.stringify(sim.serialize()));
    return true;
  } catch {
    return false;
  }
}
function pause() {
  if (!started) return;
  sim.paused = true;
  hideSheet();
  $('overlay').classList.remove('hidden');
  $('overlay').innerHTML =
    `<div class="dialog"><div class="eyebrow">THE VALLEY CAN WAIT</div><h2>Settlement paused</h2><p>Your workers and regiments are standing by.</p><div class="button-stack" id="pause-actions"></div><footer>${VERSION}<br>Saving is local to this browser and device.</footer></div>`;
  const a = $('pause-actions');
  a.append(
    button(
      'Return to the valley',
      () => {
        sim.paused = false;
        $('overlay').classList.add('hidden');
      },
      'primary',
    ),
    button('Save settlement', () =>
      notify(
        save()
          ? 'Settlement saved on this device.'
          : 'Saving is unavailable in this browser.',
        false,
      ),
    ),
    button(audio.enabled ? 'Sound: on' : 'Sound: off', () => {
      audio.enabled = !audio.enabled;
      pause();
    }),
    button('How to play', () => help()),
    button('Sources & licences', sources),
    button('Start another match', confirmRestart),
    button('Back to GAME LAB', () => {
      save();
      location.href = './';
    }),
  );
}
function confirmRestart() {
  $('overlay').innerHTML =
    `<div class="dialog"><h2>Start a new settlement?</h2><p>The next autosave will replace this match on this device.</p><div class="row" id="restart-actions"></div></div>`;
  $('restart-actions').append(
    button('Keep playing', pause),
    button('New settlement', startNew, 'primary'),
  );
}
function help(intro = false) {
  $('overlay').classList.remove('hidden');
  sim.paused = true;
  $('overlay').innerHTML =
    `<div class="dialog"><div class="eyebrow">A COMMANDER’S FIELD GUIDE</div><h2>Build. Defend. Expand.</h2><p><b>Camera:</b> drag with one finger; pinch or use + / − to zoom. On desktop, drag, scroll or use WASD. The little map moves your camera.</p><p><b>Economy:</b> tap a resource, then Assign 3 workers. They collect and deliver automatically. Numbers rise when goods reach a town or camp. Farms never run out.</p><p><b>Build:</b> open Build, choose a building, tap open ground and Confirm placement. Three workers build it. Houses add population. A market turns surplus into coin.</p><p><b>Recruit:</b> tap a completed barracks or workshop. Queue regiments, then tap a regiment and tap land to march or a red enemy to attack. Tap another blue regiment to change selection.</p><p><b>Fight:</b> blue diamonds are yours; red triangles are Redbank. Line fights well, column marches faster, skirmish reduces incoming fire. Flanks and high ground matter. Broken troops flee. Retreat home to recover morale and reinforce using food.</p><p><b>Win:</b> hold Highmeadow with an uncontested regiment for 18 seconds to earn coin and build forward. Destroy Redbank’s last town centre. Losing your last town centre ends the match.</p><p>Manpower is represented: 240 infantry are drawn as up to 24 soldier models. At wide zoom, banners replace models.</p><div class="button-stack" id="help-actions"></div></div>`;
  $('help-actions').append(
    button(
      intro ? 'Back' : 'Return to menu',
      intro ? showIntro : pause,
      'primary',
    ),
  );
}
function sources() {
  $('overlay').innerHTML =
    `<div class="dialog"><div class="eyebrow">BUILT FOR REUSE</div><h2>Sources & licences</h2><p><b>Runtime:</b> Three.js r170 (MIT). Rendering, camera, economy, navigation and combat are separate modules. Local A* navigation updates when buildings change.</p><p><b>Assets in use:</b> Kenney Nature Kit oak; Castle Kit watchtower, gate and wall. CC0 1.0 public-domain dedication, including commercial use. Other buildings, soldiers, terrain and audio are original procedural work.</p><p><a href="https://kenney.nl/assets/nature-kit" target="_blank" rel="noopener">Kenney Nature Kit</a> · <a href="https://kenney.nl/assets/castle-kit" target="_blank" rel="noopener">Kenney Castle Kit</a> · <a href="https://threejs.org" target="_blank" rel="noopener">Three.js</a></p><p>This is a fictional valley, not a historical reconstruction. Quaternius was evaluated but its download quota blocked retrieval. No Quaternius assets are included.</p><p><b>Prototype limits:</b> no multiplayer, no grand campaign, no naval combat. Physical iPhone performance and enjoyment require player testing. Source bundles and licences are retained with the game.</p><div id="source-actions"></div></div>`;
  $('source-actions').append(button('Back', pause, 'primary'));
}
function showBuild() {
  placement = null;
  preview = null;
  view.setGhost(null, null);
  const sheet = $('sheet');
  sheet.classList.remove('hidden');
  sheet.innerHTML = `<div class="sheet-head"><h2>Grow your settlement</h2><button id="close-build" aria-label="Close build menu">×</button></div><p class="hint">Choose a building, tap open ground, then confirm. Building continues during battle.</p><div class="build-grid" id="build-grid"></div>`;
  $('close-build').onclick = hideSheet;
  for (const [type, d] of Object.entries(BUILDINGS))
    $('build-grid').append(
      button(
        `<strong>${d.name}</strong><p>${d.desc}</p><small>${cost(d.cost)}</small>`,
        () => {
          placement = type;
          preview = null;
          hideSheet();
          notify(`Place ${d.name}: tap clear ground near your settlement.`);
          uiKey = '';
          updateUI(true);
        },
        'build-card',
        !sim.canPay(d.cost),
      ),
    );
}
function select(o) {
  selected = o;
  uiKey = '';
  audio.play('select');
  updateUI(true);
}
function setActions(items) {
  $('actions').replaceChildren(...items);
}
function updateUI(force = false) {
  $('clock').textContent =
    `${String(Math.floor(sim.time / 60)).padStart(2, '0')}:${String(Math.floor(sim.time % 60)).padStart(2, '0')}`;
  $('resources').innerHTML = Object.entries(RESOURCE)
    .map(
      ([k, d]) =>
        `<div class="res"><i class="res-dot" style="--color:${d.color}"></i><div><small>${d.name}</small><strong>${Math.floor(sim.stock[0][k])}</strong></div></div>`,
    )
    .join('');
  $('population').textContent =
    `${sim.population(0)} / ${sim.capacity(0)} people`;
  const barracks = sim.buildings.find(
      (b) => b.type === 'barracks' && b.side === 0 && b.hp > 0,
    ),
    army = sim.armies.filter((a) => a.side === 0 && a.hp > 0);
  let objective = !barracks
    ? 'Build a barracks to raise your first regiment.'
    : barracks.progress < 1
      ? 'Your builders are working. Watch your barracks take shape.'
      : !army.length
        ? 'Tap your barracks and recruit line infantry.'
        : sim.territories[1].owner !== 0
          ? 'Take a regiment across the southern bridge. Hold Highmeadow.'
          : 'Highmeadow is yours. Build forward and defeat Redbank.';
  $('mission').innerHTML =
    `<span>${sim.territories[1].owner === 0 ? '2 / 3 territories' : '1 / 3 territories'} · ${sim.time < 150 ? 'ESTABLISH YOUR FOOTHOLD' : 'THE VALLEY IS CONTESTED'}</span>${objective}`;
  if (selected?.hp === 0) selected = null;
  const s = selected;
  const key = placement
    ? `place${placement}${!!preview}`
    : s
      ? `${s.id}-${s.progress >= 1}-${s.kind}-${s.mode}-${s.queue?.length}`
      : 'default';
  if (placement) {
    $('selection-title').textContent = 'Place ' + BUILDINGS[placement].name;
    $('selection-detail').textContent = preview
      ? sim.placement(placement, preview.x, preview.z) ||
        'Site is clear. Confirm to begin construction.'
      : 'Tap clear ground. Drag still moves the camera.';
    $('selection-icon').textContent = '+';
  } else if (s) {
    $('selection-title').textContent =
      s.kind === 'army'
        ? `${s.number}${s.number === 1 ? 'st' : s.number === 2 ? 'nd' : s.number === 3 ? 'rd' : 'th'} ${TROOPS[s.type].name}`
        : s.kind === 'building'
          ? BUILDINGS[s.type].name
          : s.kind === 'worker'
            ? 'Village workers'
            : RESOURCE[s.type].name + ' deposit';
    $('selection-icon').textContent =
      s.kind === 'army'
        ? s.side === 0
          ? '◆'
          : '▲'
        : s.kind === 'worker'
          ? '♙'
          : s.kind === 'resource'
            ? '◇'
            : '⌂';
    $('selection-detail').textContent =
      s.kind === 'army'
        ? `${Math.ceil((TROOPS[s.type].men * s.hp) / s.maxHp)} represented men · ${view.span > 120 ? 0 : Math.ceil((TROOPS[s.type].models * s.hp) / s.maxHp)} models · Morale ${Math.round(s.morale)} · ${s.state}`
        : s.kind === 'worker'
          ? Object.keys(RESOURCE)
              .filter((k) => k !== 'coin')
              .map(
                (k) =>
                  `${sim.workers.filter((w) => w.side === 0 && w.resource === k && !w.task).length} ${k}`,
              )
              .join(' · ')
          : s.kind === 'resource'
            ? `${Math.ceil(s.amount)} remaining · ${sim.workers.filter((w) => w.source === s.id).length} workers assigned`
            : s.progress < 1
              ? `Construction ${Math.floor(s.progress * 100)}% · Builders on site`
              : s.queue?.length
                ? `${s.queue.length} in queue · ${s.queue[0].type} ready in ${Math.ceil(s.queue[0].left)}s`
                : `${Math.ceil(s.hp)} / ${s.maxHp} condition · ${BUILDINGS[s.type].desc}`;
  } else {
    $('selection-title').textContent = 'Willowmere';
    $('selection-icon').textContent = '⌂';
    $('selection-detail').textContent =
      'Tap a worker, building or regiment to command it.';
  }
  if (!force && uiKey === key) return;
  uiKey = key;
  const a = [];
  const act = (txt, fn, cls = '') => a.push(button(txt, fn, cls));
  if (placement) {
    act('Cancel', () => {
      placement = null;
      preview = null;
      view.setGhost(null, null);
      uiKey = '';
    });
    if (preview)
      act(
        'Confirm placement',
        () => {
          const result = sim.build(placement, preview.x, preview.z);
          if (result.error) {
            notify(result.error, true);
            return;
          }
          select(result.building);
          placement = null;
          preview = null;
          view.setGhost(null, null);
          uiKey = '';
          notify('Foundation placed. Builders are on the way.');
        },
        'primary',
      );
  } else if (s?.side === 1) {
    act('Observe enemy', () =>
      notify('Select one of your regiments, then tap this enemy to attack.'),
    );
    act('Deselect', () => select(null));
  } else if (s?.kind === 'army') {
    for (const mode of ['line', 'column', 'skirmish'])
      act(
        mode[0].toUpperCase() + mode.slice(1),
        () => {
          s.mode = mode;
          uiKey = '';
          notify(`${mode} formation.`);
        },
        s.mode === mode ? 'active' : '',
      );
    act('Retreat', () => {
      sim.retreat(s);
      notify('Retreating to your town centre.');
    });
    act('Hold', () => {
      s.path = [];
      s.target = null;
      s.hold = true;
      notify('Holding position.');
    });
    act('Build', showBuild, 'primary');
  } else if (s?.kind === 'resource' || s?.type === 'farm') {
    act(
      'Assign 3 workers',
      () => {
        sim.assignSource(s);
        notify('Three workers assigned to gather and deliver.');
      },
      'primary',
    );
    act('Workers', () =>
      select(sim.workers.find((w) => w.side === 0 && w.hp > 0)),
    );
    act('Build', showBuild);
  } else if (s?.kind === 'worker') {
    for (const k of ['food', 'wood', 'stone', 'iron'])
      act(`+3 ${RESOURCE[k].name}`, () => {
        sim.assign(k);
        notify('Workers reassigned to ' + k + '.');
      });
    act('Build', showBuild, 'primary');
  } else if (s?.kind === 'building') {
    if (s.progress >= 1) {
      const types =
        s.type === 'town'
          ? ['worker']
          : s.type === 'barracks'
            ? ['line', 'light', 'cavalry']
            : s.type === 'workshop'
              ? ['artillery']
              : [];
      for (const type of types) {
        const d =
          type === 'worker'
            ? { name: 'Worker', cost: { food: 40 } }
            : TROOPS[type];
        act(`${d.name}<small>${cost(d.cost)}</small>`, () => {
          const err = sim.recruit(s, type);
          notify(err || `${d.name} added to the queue.`, !!err);
          uiKey = '';
        });
      }
      if (s.queue.length)
        act('Cancel last', () => {
          sim.cancelQueue(s);
          uiKey = '';
        });
      if (s.type === 'market')
        for (const r of ['wood', 'food'])
          act(`Sell 50 ${r}<small>Receive 30 coin</small>`, () => {
            const error = sim.trade(r);
            notify(error || 'Trade complete: +30 coin.', !!error);
          });
      if (s.hp < s.maxHp)
        act('Repair', () => {
          sim.repair(s);
          notify('Repair crew assigned. Uses wood.');
        });
    }
    act('Build', showBuild, 'primary');
    act('Deselect', () => select(null));
  } else {
    act('Workers', () => {
      const w = sim.workers.find((w) => w.side === 0 && w.hp > 0);
      if (w) select(w);
    });
    act(`Army${army.length ? ' · ' + army.length : ''}`, () => {
      if (!army.length) {
        notify('Build a barracks, then recruit a regiment.');
        return;
      }
      const index =
        Math.max(0, army.findIndex((a) => a.id === selected?.id) + 1) %
        army.length;
      select(army[index]);
      view.focus(army[index]);
    });
    act('Town', () => {
      const town = sim.buildings.find(
        (b) => b.type === 'town' && b.side === 0 && b.hp > 0,
      );
      select(town);
      view.focus(town);
    });
    act('Build', showBuild, 'primary');
  }
  setActions(a);
}
function tap(x, y) {
  if (!started || sim.paused || over) return;
  const p = view.ground(x, y);
  if (!p) return;
  if (placement) {
    preview = p;
    const err = sim.placement(placement, p.x, p.z);
    view.setGhost(placement, p, !err);
    uiKey = '';
    updateUI(true);
    audio.play('select');
    return;
  }
  const hit = view.pick(x, y);
  if (selected?.kind === 'army' && selected.side === 0) {
    if (hit?.side === 0) {
      select(hit);
      return;
    }
    const target = hit?.side === 1 ? hit : null;
    const ok = sim.move(selected, p, target);
    notify(
      ok
        ? target
          ? 'Attack order received.'
          : 'March order received.'
        : 'No clear route. Choose another approach.',
      !ok,
    );
    return;
  }
  select(hit);
}
function bindInput() {
  const c = $('world'),
    points = new Map();
  let origin = null,
    moved = false,
    pinching = false,
    lastPinch = 0,
    lastTap = 0;
  c.onpointerdown = (e) => {
    audio.unlock();
    c.setPointerCapture(e.pointerId);
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (points.size === 1) {
      origin = { x: e.clientX, y: e.clientY };
      moved = false;
      pinching = false;
    }
    if (points.size === 2) {
      pinching = true;
      const p = [...points.values()];
      lastPinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    }
  };
  c.onpointermove = (e) => {
    if (!points.has(e.pointerId)) return;
    const old = points.get(e.pointerId);
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (points.size === 2) {
      const p = [...points.values()],
        d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (lastPinch > 0) view.zoom(lastPinch / d);
      lastPinch = d;
      pinching = true;
      moved = true;
    } else if (points.size === 1 && !pinching) {
      if (origin && Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 7)
        moved = true;
      if (moved) view.pan(e.clientX - old.x, e.clientY - old.y);
    }
  };
  c.onpointerup = (e) => {
    points.delete(e.pointerId);
    if (!moved && !pinching && origin) {
      const rect = c.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      if (performance.now() - lastTap < 280 && !selected && !placement) {
        const p = view.ground(x, y);
        if (p) view.focus(p);
      } else tap(x, y);
      lastTap = performance.now();
    }
    if (!points.size) {
      origin = null;
      pinching = false;
    }
  };
  c.onpointercancel = (e) => {
    points.delete(e.pointerId);
    origin = null;
    moved = true;
    pinching = true;
  };
  c.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      view.zoom(Math.exp(e.deltaY * 0.001));
    },
    { passive: false },
  );
  c.oncontextmenu = (e) => e.preventDefault();
  window.addEventListener('resize', () => view.resize());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (placement) {
        placement = null;
        preview = null;
        view.setGhost(null, null);
        uiKey = '';
      } else pause();
    }
    if (sim.paused) return;
    const dirs = {
      w: [0, 28],
      s: [0, -28],
      a: [28, 0],
      d: [-28, 0],
      ArrowUp: [0, 28],
      ArrowDown: [0, -28],
      ArrowLeft: [28, 0],
      ArrowRight: [-28, 0],
    };
    if (dirs[e.key]) {
      e.preventDefault();
      view.pan(...dirs[e.key]);
    }
  });
  $('zoom-in').onclick = () => view.zoom(0.8);
  $('zoom-out').onclick = () => view.zoom(1.25);
  $('home').onclick = () =>
    view.focus(
      sim.buildings.find(
        (b) => b.side === 0 && b.type === 'town' && b.hp > 0,
      ) || { x: 33, z: 101 },
    );
  $('menu').onclick = pause;
  $('minimap').onclick = (e) => {
    const r = e.target.getBoundingClientRect();
    view.focus({
      x: ((e.clientX - r.left) / r.width) * MAP.width,
      z: ((e.clientY - r.top) / r.height) * MAP.depth,
    });
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && started && !sim.paused) {
      save();
      pause();
    }
  });
}
function drawMap() {
  const c = $('minimap').getContext('2d');
  c.fillStyle = '#5f6b53';
  c.fillRect(0, 0, MAP.width, MAP.depth);
  for (let z = 0; z < MAP.depth/MAP.cell; z++)
    for (let x = 0; x < MAP.width/MAP.cell; x++) {
      const i = z * (MAP.width/MAP.cell) + x;
      if (!sim.explored[i]) {
        c.fillStyle = '#253c36';
        c.fillRect(x * 2, z * 2, 2, 2);
      }
    }
  c.strokeStyle = '#7eafb4';
  c.lineWidth = 6;
  c.beginPath();
  for (let z = 0; z <= MAP.depth; z += 4) c.lineTo(riverX(z), z);
  c.stroke();
  for (const z of (MAP.depth>160?[48,116,232,310]:[48,116])) {
    c.fillStyle = '#c3b99b';
    c.fillRect(riverX(z) - 7, z - 3, 14, 6);
  }
  for (const b of sim.buildings) {
    if (b.hp <= 0 || (b.side === 1 && !sim.seen(b))) continue;
    c.fillStyle = b.side === 0 ? '#9ad6ef' : '#f0aa88';
    c.fillRect(b.x - 2, b.z - 2, 4, 4);
  }
  for (const a of sim.armies) {
    if (a.hp <= 0 || (a.side === 1 && !sim.seen(a))) continue;
    c.fillStyle = a.side === 0 ? '#b2e6ff' : '#ff9c79';
    c.beginPath();
    c.arc(a.x, a.z, 2.5, 0, Math.PI * 2);
    c.fill();
  }
  for (const t of sim.territories) {
    c.strokeStyle =
      t.owner === 0 ? '#b2e6ff' : t.owner === 1 ? '#ff9c79' : '#f3e3b4';
    c.strokeRect(t.x - 4, t.z - 4, 8, 8);
  }
  c.strokeStyle = '#f5f0d7';
  const s = view.span * 0.5;
  c.strokeRect(view.center.x - s * 0.5, view.center.z - s * 0.45, s, s * 0.9);
}
function matchEnd() {
  over = true;
  sim.paused = true;
  save();
  $('overlay').classList.remove('hidden');
  const win = sim.winner === 0;
  $('overlay').innerHTML =
    `<div class="dialog"><div class="eyebrow">${win ? 'THE VALLEY IS YOURS' : 'WILLOWMERE HAS FALLEN'}</div><h1>${win ? 'You built this.' : 'A kingdom<br>worth rebuilding.'}</h1><p>${win ? 'Your army destroyed Redbank’s last town centre. Your economy sustained the advance.' : 'Your last town centre was destroyed. Defend the crossings, keep food flowing and retreat regiments before their morale breaks.'}</p><p>${Math.floor(sim.time / 60)} minutes · ${sim.buildings.filter((b) => b.side === 0).length} buildings raised · ${Math.floor(sim.delivered[0])} resources delivered · ${sim.losses[0]} regiments lost.</p><div class="report-list">${sim.events
      .slice(0, 7)
      .map(
        (e) =>
          `<div>${Math.floor(e.time / 60)}:${String(Math.floor(e.time % 60)).padStart(2, '0')} — ${e.text}</div>`,
      )
      .join('')}</div><div class="button-stack" id="end-actions"></div></div>`;
  $('end-actions').append(
    button('Build another kingdom', startNew, 'primary'),
    button('Back to GAME LAB', () => {
      location.href = './';
    }),
  );
}
try {
  view = new WorldView($('world'), $('labels'), sim);
  bindInput();
  showIntro();
  updateUI(true);
  let previous = performance.now(),
    accumulator = 0,
    uiAt = 0;
  function frame(now) {
    const delta = Math.min(0.08, (now - previous) / 1000);
    previous = now;
    accumulator += delta;
    while (accumulator >= 0.1) {
      sim.step(0.1);
      accumulator -= 0.1;
    }
    view.render(delta, selected);
    if (now > uiAt) {
      updateUI();
      drawMap();
      uiAt = now + 220;
      if (started && !sim.paused && sim.events[0]?.text !== lastEvent) {
        lastEvent = sim.events[0]?.text;
        notify(lastEvent);
      }
      if (started && sim.time - savedAt > 20) {
        save();
        savedAt = sim.time;
      }
    }
    if (now > toastUntil) $('toast').classList.add('hidden');
    if (sim.winner !== null && !over && started) matchEnd();
    const e = sim.effects.find(
      (e) => e.kind === 'shot' || e.kind === 'cannon' || e.kind === 'built',
    );
    if (e && !e.sounded) {
      audio.play(e.kind);
      e.sounded = true;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.rtsDebug = {
    get sim() {
      return sim;
    },
    get view() {
      return view;
    },
    snapshot: () => ({
      time: sim.time,
      population: sim.population(0),
      stock: { ...sim.stock[0] },
      drawCalls: view.renderer.info.render.calls,
      triangles: view.renderer.info.render.triangles,
      assets: Object.fromEntries(
        Object.entries(view.assets).map(([k, v]) => [k, !!v]),
      ),
      buildings: sim.buildings.length,
      armies: sim.armies.length,
    }),
  };
} catch (error) {
  $('error').style.display = 'block';
  $('error').innerHTML =
    '<h2>This browser could not start 3D graphics.</h2><p>Reload in an up-to-date Safari or Chrome browser.</p><p>' +
    String(error.message) +
    '</p><a href="./">Back to GAME LAB</a>';
  console.error(error);
}
