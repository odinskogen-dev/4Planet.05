(function romaCampaign() {
  'use strict';
  const $ = s => document.querySelector(s);
  const W = 2000;
  const H = 1300;
  const LON0 = -18;
  const LON1 = 70;
  const LAT0 = 10;
  const LAT1 = 61;
  const SAVE_KEY = 'roma_republic_campaign_stage01_v1';
  const cities = [
    {
      id: 'roma',
      name: 'Roma',
      lat: 41.9,
      lon: 12.5,
      faction: 'rome',
      region: 'Latium',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'canusium',
      name: 'Canusium',
      lat: 41.22,
      lon: 16.06,
      faction: 'rome',
      region: 'Apulia',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'cannae',
      name: 'Cannae',
      lat: 41.3,
      lon: 16.15,
      faction: 'carthage',
      region: 'Apulia',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'venusia',
      name: 'Venusia',
      lat: 40.96,
      lon: 15.82,
      faction: 'rome',
      region: 'Apulia',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'luceria',
      name: 'Luceria',
      lat: 41.51,
      lon: 15.34,
      faction: 'rome',
      region: 'Apulia',
      confidence: 'medium',
      playable: true,
    },
    {
      id: 'beneventum',
      name: 'Beneventum',
      lat: 41.13,
      lon: 14.78,
      faction: 'rome',
      region: 'Samnium',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'capua',
      name: 'Capua',
      lat: 41.08,
      lon: 14.25,
      faction: 'rome',
      region: 'Campania',
      confidence: 'medium',
      playable: true,
    },
    {
      id: 'tarentum',
      name: 'Tarentum',
      lat: 40.47,
      lon: 17.23,
      faction: 'neutral',
      region: 'Apulia',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'brundisium',
      name: 'Brundisium',
      lat: 40.64,
      lon: 17.94,
      faction: 'rome',
      region: 'Apulia',
      confidence: 'high',
      playable: true,
    },
    {
      id: 'syracusae',
      name: 'Syracusae',
      lat: 37.07,
      lon: 15.29,
      faction: 'rome',
      region: 'Sicilia',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'carthago',
      name: 'Carthago',
      lat: 36.85,
      lon: 10.32,
      faction: 'carthage',
      region: 'Africa',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'gades',
      name: 'Gades',
      lat: 36.53,
      lon: -6.29,
      faction: 'neutral',
      region: 'Iberia',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'carthago_nova',
      name: 'Carthago Nova',
      lat: 37.6,
      lon: -0.98,
      faction: 'carthage',
      region: 'Iberia',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'massalia',
      name: 'Massalia',
      lat: 43.3,
      lon: 5.37,
      faction: 'neutral',
      region: 'Gallia',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'athenae',
      name: 'Athenae',
      lat: 37.98,
      lon: 23.73,
      faction: 'neutral',
      region: 'Hellas',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'alexandria',
      name: 'Alexandria',
      lat: 31.21,
      lon: 29.92,
      faction: 'ptolemaic',
      region: 'Aegyptus',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'antiochia',
      name: 'Antiochia',
      lat: 36.2,
      lon: 36.16,
      faction: 'seleucid',
      region: 'Syria',
      confidence: 'high',
      playable: false,
    },
    {
      id: 'seleucia',
      name: 'Seleucia',
      lat: 33.1,
      lon: 44.52,
      faction: 'seleucid',
      region: 'Mesopotamia',
      confidence: 'medium',
      playable: false,
    },
    {
      id: 'merv',
      name: 'Margiana',
      lat: 37.66,
      lon: 62.18,
      faction: 'seleucid',
      region: 'East',
      confidence: 'low',
      playable: false,
    },
  ];
  const roads = [
    ['roma', 'capua', 5],
    ['capua', 'beneventum', 3],
    ['beneventum', 'venusia', 3],
    ['venusia', 'canusium', 2],
    ['canusium', 'cannae', 1],
    ['canusium', 'luceria', 3],
    ['venusia', 'tarentum', 4],
    ['tarentum', 'brundisium', 4],
    ['luceria', 'beneventum', 3],
    ['cannae', 'tarentum', 5],
  ];
  const cityById = Object.fromEntries(cities.map(c => [c.id, c]));
  const names = {
    rome: 'ROMAN REPUBLIC',
    carthage: 'CARTHAGE',
    neutral: 'INDEPENDENT',
    ptolemaic: 'PTOLEMAIC EGYPT',
    seleucid: 'SELEUCID REALMS',
  };
  const colors = {
    rome: '#dbbb8d',
    carthage: '#bd6760',
    neutral: '#bbbaa6',
    ptolemaic: '#9dc3cc',
    seleucid: '#baa3cb',
  };
  const initial = () => ({
    schema: 1,
    scenario: 'apulia-216',
    tick: 0,
    paused: true,
    speed: 1,
    treasury: 780,
    food: 960,
    wood: 260,
    stone: 170,
    iron: 130,
    manpower: 1650,
    senate: 62,
    grainSafeguarded: false,
    settlements: {
      canusium: {
        farms: 1,
        granaries: 1,
        fort: 0,
        loyalty: 79,
        grain: 380,
        owner: 'rome',
      },
      cannae: {
        farms: 2,
        granaries: 2,
        fort: 1,
        loyalty: 38,
        grain: 440,
        owner: 'carthage',
      },
      venusia: {
        farms: 1,
        granaries: 1,
        fort: 1,
        loyalty: 83,
        grain: 230,
        owner: 'rome',
      },
      luceria: {
        farms: 1,
        granaries: 0,
        fort: 0,
        loyalty: 72,
        grain: 170,
        owner: 'rome',
      },
      beneventum: {
        farms: 1,
        granaries: 0,
        fort: 0,
        loyalty: 82,
        grain: 230,
        owner: 'rome',
      },
      capua: {
        farms: 2,
        granaries: 1,
        fort: 0,
        loyalty: 64,
        grain: 250,
        owner: 'rome',
      },
      roma: {
        farms: 2,
        granaries: 1,
        fort: 1,
        loyalty: 85,
        grain: 480,
        owner: 'rome',
      },
      tarentum: {
        farms: 1,
        granaries: 0,
        fort: 1,
        loyalty: 55,
        grain: 170,
        owner: 'neutral',
      },
      brundisium: {
        farms: 1,
        granaries: 1,
        fort: 0,
        loyalty: 76,
        grain: 240,
        owner: 'rome',
      },
    },
    armies: [
      {
        id: 'roman-i',
        name: 'Consular Field Army',
        owner: 'rome',
        at: 'canusium',
        men: 3300,
        morale: 77,
        supply: 78,
        move: null,
      },
      {
        id: 'punic-i',
        name: 'Hannibal’s Army',
        owner: 'carthage',
        at: 'cannae',
        men: 4400,
        morale: 84,
        supply: 83,
        move: null,
      },
      {
        id: 'roman-ii',
        name: 'Lucerian Allies',
        owner: 'rome',
        at: 'luceria',
        men: 900,
        morale: 68,
        supply: 72,
        move: null,
      },
    ],
    blocked: ['canusium|cannae'],
    selected: 'canusium',
    selectedArmy: 'roman-i',
    pending: null,
    applied: [],
    encounterCounter: 0,
    history: [
      {
        tick: 0,
        kind: 'info',
        text: 'Summer 216 BCE. Carthaginian troops hold the grain depot at Cannae.',
      },
      {
        tick: 0,
        kind: 'info',
        text: 'Canusium is threatened. Protect the harvest and assemble the field army.',
      },
    ],
  });
  let state;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const loaded = raw ? JSON.parse(raw) : null;
    state =
      loaded &&
      loaded.schema === 1 &&
      loaded.scenario === 'apulia-216' &&
      Array.isArray(loaded.armies)
        ? loaded
        : initial();
  } catch {
    state = initial();
  }
  const canvas = $('#map');
  const ctx = canvas.getContext('2d', { alpha: false });
  let cw = 800,
    ch = 600,
    dpr = 1;
  let land = null,
    rivers = null,
    drag = null,
    touches = new Map(),
    needsDraw = false;
  const cam = { x: 0, y: 0, z: 1 };
  function merc(lat) {
    return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  }
  function xy(lon, lat) {
    return [
      ((lon - LON0) / (LON1 - LON0)) * W,
      ((merc(LAT1) - merc(lat)) / (merc(LAT1) - merc(LAT0))) * H,
    ];
  }
  function screen(x, y) {
    return [(x - cam.x) * cam.z + cw / 2, (y - cam.y) * cam.z + ch / 2];
  }
  function pos(lon, lat) {
    return screen(...xy(lon, lat));
  }
  function world(sx, sy) {
    return [(sx - cw / 2) / cam.z + cam.x, (sy - ch / 2) / cam.z + cam.y];
  }
  function clampCam() {
    cam.z = Math.max(Math.min(cw / W, ch / H) * 0.9, Math.min(28, cam.z));
    const hw = cw / (2 * cam.z),
      hh = ch / (2 * cam.z);
    cam.x = Math.max(-hw * 0.1, Math.min(W + hw * 0.1, cam.x));
    cam.y = Math.max(-hh * 0.1, Math.min(H + hh * 0.1, cam.y));
  }
  function focus(name) {
    const zWorld = Math.min(cw / W, ch / H) * 0.94;
    if (name === 'world') {
      cam.x = W / 2;
      cam.y = H / 2;
      cam.z = zWorld;
    } else if (name === 'italia') {
      const p = xy(15.2, 41.2);
      cam.x = p[0];
      cam.y = p[1];
      cam.z = Math.min(cw / 390, ch / 500);
    } else {
      const p = xy(16, 41.1);
      cam.x = p[0];
      cam.y = p[1];
      cam.z = Math.max(9, Math.min(cw / 85, ch / 90));
    }
    clampCam();
    drawSoon();
  }
  function showPoint(id) {
    const c = cityById[id];
    if (!c) return;
    const p = xy(c.lon, c.lat);
    cam.x = p[0];
    cam.y = p[1];
    cam.z = Math.max(cam.z, Math.min(cw / 220, ch / 240));
    clampCam();
    drawSoon();
  }
  function fitCanvas() {
    const r = canvas.getBoundingClientRect();
    cw = Math.max(1, r.width);
    ch = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clampCam();
    drawSoon();
  }
  function polygon(ring) {
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = pos(ring[i][0], ring[i][1]);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
  function drawGeography() {
    if (!land) return;
    ctx.save();
    ctx.fillStyle = '#b8b19b';
    ctx.strokeStyle = 'rgba(250,247,224,.32)';
    ctx.lineWidth = 0.8;
    for (const f of land.features) {
      const geom = f.geometry;
      if (!geom) continue;
      const polygons =
        geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const poly of polygons) {
        ctx.beginPath();
        for (const ring of poly) polygon(ring);
        ctx.fill('evenodd');
        if (cam.z > 1.1) ctx.stroke();
      }
    }
    if (rivers && cam.z > 1.15) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(77,119,138,.66)';
      ctx.lineWidth = 1.45;
      for (const f of rivers.features) {
        const g = f.geometry;
        if (!g) continue;
        const lines =
          g.type === 'LineString' ? [g.coordinates] : g.coordinates || [];
        for (const line of lines)
          for (let k = 0; k < line.length; k++) {
            const [x, y] = pos(line[k][0], line[k][1]);
            k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function paint() {
    needsDraw = false;
    const grd = ctx.createLinearGradient(0, 0, cw, ch);
    grd.addColorStop(0, '#536c72');
    grd.addColorStop(1, '#314e56');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, cw, ch);
    drawGeography();
    if (!land) {
      ctx.fillStyle = '#eee6d8';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading coastline data…', cw / 2, ch / 2);
    }
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.textAlign = 'center';
    ctx.font = 'italic 18px Georgia,serif';
    for (const [text, lon, lat] of [
      ['MARE NOSTRUM', 17, 35],
      ['ATLANTIC OCEAN', -12, 43],
      ['SAHARA', 13, 21],
    ]) {
      const [x, y] = pos(lon, lat);
      ctx.fillText(text, x, y);
    }
    ctx.restore();
    const showRoads = cam.z > 0.9;
    if (showRoads) {
      for (const [a, b] of roads) {
        const A = cityById[a],
          B = cityById[b],
          from = pos(A.lon, A.lat),
          to = pos(B.lon, B.lat);
        const blocked = isBlocked(a, b);
        ctx.beginPath();
        ctx.moveTo(...from);
        ctx.lineTo(...to);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = blocked ? 'rgba(185,76,64,.8)' : 'rgba(94,86,60,.75)';
        ctx.lineWidth = blocked ? 3 : 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    for (const city of cities) {
      const [x, y] = pos(city.lon, city.lat);
      if (x < -80 || x > cw + 80 || y < -40 || y > ch + 40) continue;
      if (
        cam.z < 0.6 &&
        !['roma', 'carthago', 'alexandria', 'antiochia', 'canusium'].includes(
          city.id
        )
      )
        continue;
      const settle = state.settlements[city.id];
      const owner = settle?.owner || city.faction;
      if (state.selected === city.id) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,239,194,.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, city.playable ? 5.4 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = colors[owner] || colors.neutral;
      ctx.fill();
      ctx.strokeStyle = 'rgba(40,40,35,.8)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      if (
        cam.z > 0.8 ||
        ['roma', 'carthago', 'alexandria', 'antiochia', 'canusium'].includes(
          city.id
        )
      ) {
        const f = cam.z > 2 ? 12 : 10;
        ctx.font = `${city.id === state.selected ? 'bold ' : ''}${f}px Arial,sans-serif`;
        ctx.textAlign = 'left';
        const labelY = y + (city.id === 'cannae' ? -14 : city.id === 'canusium' ? 20 : 3);
        ctx.fillStyle = 'rgba(23,32,34,.85)';
        ctx.fillText(city.name, x + 9, labelY + 1);
        ctx.fillStyle = '#f2e8d7';
        ctx.fillText(city.name, x + 8, labelY);
      }
    }
    for (const army of state.armies.filter(a => a.men > 0)) {
      const c = cityById[army.move?.to || army.at];
      if (!c) continue;
      const [x, y] = pos(c.lon, c.lat);
      if (x < -40 || x > cw + 40 || y < -40 || y > ch + 40) continue;
      const dx = army.owner === 'rome' ? -13 : 13;
      const yy = y + (army.owner === 'rome' ? -22 : 23);
      ctx.fillStyle = army.owner === 'rome' ? '#eee0c0' : '#9c443f';
      ctx.strokeStyle = '#233038';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + dx, yy - 11);
      ctx.lineTo(x + dx + 7, yy + 7);
      ctx.lineTo(x + dx - 7, yy + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (state.selectedArmy === army.id) {
        ctx.strokeStyle = '#ffecc5';
        ctx.beginPath();
        ctx.arc(x + dx, yy, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (cam.z > 2.2) {
        ctx.fillStyle = '#fff5e2';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(army.men / 100) / 10 + 'k', x + dx, yy - 17);
      }
    }
    ctx.save();
    ctx.fillStyle = 'rgba(255,243,217,.7)';
    ctx.textAlign = 'right';
    ctx.font = '10px Arial';
    ctx.fillText(
      'NATURAL EARTH / MODERN PHYSICAL GEOGRAPHY — ANTIQUE POLITICS RECONSTRUCTED',
      cw - 14,
      ch - 13
    );
    ctx.restore();
  }
  function drawSoon() {
    if (needsDraw) return;
    needsDraw = true;
    requestAnimationFrame(paint);
  }
  function key(a, b) {
    return [a, b].sort().join('|');
  }
  function isBlocked(a, b) {
    return state.blocked.includes(key(a, b));
  }
  function route(a, b) {
    return roads.find(
      r => (r[0] === a && r[1] === b) || (r[0] === b && r[1] === a)
    );
  }
  function routeInfo(a, b) {
    const r = route(a, b);
    if (!r)
      return {
        ok: false,
        message: 'No established route connects those places.',
      };
    if (isBlocked(a, b))
      return {
        ok: false,
        message: 'Enemy forces obstruct this route. Clear it through a battle.',
      };
    return { ok: true, days: r[2] };
  }
  function friendly(id) {
    return state.settlements[id]?.owner === 'rome';
  }
  function byArmy(id) {
    return state.armies.find(a => a.id === id);
  }
  function note(text, kind = 'info') {
    state.history.unshift({ tick: state.tick, kind, text });
    state.history = state.history.slice(0, 60);
    const toast = $('#toast');
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(note.timer);
    note.timer = setTimeout(() => toast.classList.remove('visible'), 3600);
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      $('#saveflag').textContent = 'SAVED';
      return true;
    } catch {
      note(
        'Browser storage is unavailable. This session may not persist.',
        'bad'
      );
      return false;
    }
  }
  function economicDay() {
    let foodProduction = 0;
    for (const [id, c] of Object.entries(state.settlements)) {
      if (c.owner === 'rome') {
        const produced = c.farms * 11 + (c.granaries ? 3 : 0);
        c.grain = Math.max(0, Math.min(1100, c.grain + produced - 4));
        foodProduction += produced;
      }
    }
    const romanMen = state.armies
      .filter(a => a.owner === 'rome')
      .reduce((s, a) => s + a.men, 0);
    const frontierBlockade = isBlocked('canusium', 'cannae');
    const consumption = Math.ceil(romanMen / 195) + 21 + (frontierBlockade ? 13 : 0);
    const income = 10;
    state.food = Math.max(
      0,
      state.food + Math.floor(foodProduction * 0.43) - consumption
    );
    state.treasury = Math.max(
      0,
      state.treasury + income - Math.ceil(romanMen / 600)
    );
    for (const a of state.armies) {
      if (a.men <= 0) continue;
      const secured =
        a.owner === 'rome' &&
        friendly(a.at) &&
        roads.some(
          r => (r[0] === a.at || r[1] === a.at) && !isBlocked(r[0], r[1])
        ) && !(frontierBlockade && a.at === 'canusium');
      const net = secured ? 2 : -4;
      a.supply = Math.max(0, Math.min(100, a.supply + net));
      if (a.supply < 22) a.morale = Math.max(12, a.morale - 1);
      if (a.supply === 0 && state.tick % 4 === 0)
        a.men = Math.max(0, a.men - Math.max(5, Math.floor(a.men * 0.009)));
    }
    if (state.food === 0) {
      state.senate = Math.max(10, state.senate - 1);
      if (state.tick % 3 === 0)
        note('Grain reserves are exhausted. The Senate demands action.', 'bad');
    }
  }
  function movementDay() {
    for (const a of state.armies) {
      if (!a.move) continue;
      a.move.left--;
      if (a.move.left <= 0) {
        a.at = a.move.to;
        a.move = null;
        note(
          a.name + ' reached ' + cityById[a.at].name + '.',
          a.owner === 'rome' ? 'good' : 'bad'
        );
        const enemy = state.armies.find(
          e => e.owner !== a.owner && e.at === a.at && e.men > 0
        );
        if (enemy && a.men > 0 && !state.pending) makeEncounter(a, enemy, a.at);
      }
    }
  }
  function enemyTurn() {
    const hannibal = byArmy('punic-i');
    if (!hannibal || hannibal.men <= 0 || hannibal.move || state.pending)
      return;
    if (state.tick >= 9 && state.tick % 5 === 4 && hannibal.at === 'cannae') {
      const roman = state.armies.find(
        a => a.owner === 'rome' && a.at === 'canusium' && a.men > 0
      );
      if (roman) {
        note(
          'Hannibal threatens Canusium. The grain road is in danger.',
          'bad'
        );
        hannibal.move = { to: 'canusium', left: 2, from: 'cannae' };
      }
    }
  }
  function advance(days = 1) {
    if (state.pending) {
      note('An encounter must be resolved before time can advance.', 'bad');
      return;
    }
    for (let i = 0; i < days; i++) {
      state.tick++;
      economicDay();
      movementDay();
      if (state.pending) break;
      enemyTurn();
    }
    save();
    renderUI();
    drawSoon();
  }
  function changeResources(cost) {
    for (const [name, amount] of Object.entries(cost))
      if ((state[name] || 0) < amount) return name;
    for (const [name, amount] of Object.entries(cost)) state[name] -= amount;
    return null;
  }
  function develop(kind) {
    const id = state.selected;
    const c = state.settlements[id];
    if (!c || c.owner !== 'rome') {
      note('This settlement is not under Roman control.', 'bad');
      return;
    }
    if (kind === 'farm') {
      const lacking = changeResources({ wood: 45, treasury: 45 });
      if (lacking) {
        note('Insufficient ' + lacking + ' for a farm.', 'bad');
        return;
      }
      c.farms++;
      note('New farmland established at ' + cityById[id].name + '.', 'good');
    } else if (kind === 'granary') {
      const lacking = changeResources({ wood: 65, stone: 25, treasury: 35 });
      if (lacking) {
        note('Insufficient ' + lacking + ' for a granary.', 'bad');
        return;
      }
      c.granaries++;
      state.food += 80;
      note('Granary completed. Eighty grain secured for the Republic.', 'good');
    } else if (kind === 'fort') {
      const lacking = changeResources({ wood: 70, stone: 60, treasury: 65 });
      if (lacking) {
        note('Insufficient ' + lacking + ' for fortifications.', 'bad');
        return;
      }
      c.fort++;
      c.loyalty = Math.min(100, c.loyalty + 3);
      note('Defences improved at ' + cityById[id].name + '.', 'good');
    } else if (kind === 'levy') {
      const army = state.armies.find(a => a.owner === 'rome' && a.at === id);
      if (!army) {
        note(
          'Move a Roman army into this settlement before recruitment.',
          'bad'
        );
        return;
      }
      const lacking = changeResources({
        treasury: 95,
        food: 65,
        iron: 28,
        manpower: 150,
      });
      if (lacking) {
        note('Recruitment requires additional ' + lacking + '.', 'bad');
        return;
      }
      army.men += 150;
      army.morale = Math.max(45, army.morale - 2);
      note('150 allied and Roman recruits joined ' + army.name + '.', 'good');
    }
    save();
    renderUI();
    drawSoon();
  }
  function chooseMove(destination) {
    const a = byArmy(state.selectedArmy);
    if (!a || a.owner !== 'rome' || a.men <= 0) {
      note('Select a Roman field army first.', 'bad');
      return;
    }
    if (a.move) {
      note('This army is already marching.', 'bad');
      return;
    }
    if (destination === a.at) {
      note('The army already occupies this settlement.', 'bad');
      return;
    }
    const r = route(a.at, destination);
    if (!r) {
      note('Choose a settlement connected by a route.', 'bad');
      return;
    }
    if (!cityById[destination].playable) {
      note('This regional expansion is not yet playable.', 'bad');
      return;
    }
    const enemy = state.armies.find(
      e => e.owner === 'carthage' && e.at === destination && e.men > 0
    );
    if (isBlocked(a.at, destination) && !enemy) {
      note('The road is blockaded and cannot be traversed.', 'bad');
      return;
    }
    if (state.food < 20) {
      note('An army requires grain before marching.', 'bad');
      return;
    }
    state.food -= 20;
    a.move = { from: a.at, to: destination, left: r[2] };
    note(
      a.name +
        ' marching to ' +
        cityById[destination].name +
        ' (' +
        r[2] +
        ' days).',
      'good'
    );
    save();
    renderUI();
    drawSoon();
  }
  function hash(seed) {
    let x = 2166136261;
    for (const ch of seed) {
      x = Math.imul(x ^ ch.charCodeAt(0), 16777619);
    }
    return ((x >>> 0) % 10000) / 10000;
  }
  function makeEncounter(a, b, where) {
    state.encounterCounter++;
    const id = 'enc-' + state.tick + '-' + state.encounterCounter;
    state.pending = {
      id,
      place: where,
      roman: a.owner === 'rome' ? a.id : b.id,
      punic: a.owner === 'carthage' ? a.id : b.id,
      seed: Math.floor(hash(id) * 2147483647),
      created: state.tick,
      terrainRef: 'geo:' + where,
      before: {
        roman: (a.owner === 'rome' ? a : b).men,
        punic: (a.owner === 'carthage' ? a : b).men,
      },
      mode: 'open',
    };
    note(
      'ENCOUNTER: ' + cityById[where].name + '. Resolve the confrontation.',
      'bad'
    );
    save();
    renderUI();
  }
  function calculateBattle(manual = null) {
    const e = state.pending;
    if (!e) return;
    if (state.applied.includes(e.id)) {
      note('This battle result has already been applied.', 'bad');
      return;
    }
    const roman = byArmy(e.roman),
      punic = byArmy(e.punic);
    if (!roman || !punic) {
      note('Missing army record; cannot resolve.', 'bad');
      return;
    }
    let romanLoss, punicLoss, winning;
    if (manual) {
      romanLoss = Math.floor(
        roman.men * Math.max(0, Math.min(0.85, manual.romanLoss))
      );
      punicLoss = Math.floor(
        punic.men * Math.max(0, Math.min(0.85, manual.punicLoss))
      );
      winning =
        manual.winner ||
        (roman.men - romanLoss > punic.men - punicLoss ? 'rome' : 'carthage');
    } else {
      const rScore = roman.men * (roman.morale * 0.008 + roman.supply * 0.002);
      const pScore = punic.men * (punic.morale * 0.008 + punic.supply * 0.002);
      const variable = 0.8 + hash(e.id + 'battle') * 0.4;
      winning = rScore * variable > pScore ? 'rome' : 'carthage';
      romanLoss = Math.ceil(
        roman.men * (winning === 'rome' ? 0.16 : 0.34 + hash(e.id + 'r') * 0.18)
      );
      punicLoss = Math.ceil(
        punic.men *
          (winning === 'carthage' ? 0.18 : 0.32 + hash(e.id + 'p') * 0.18)
      );
    }
    romanLoss = Math.min(roman.men, Math.max(0, romanLoss));
    punicLoss = Math.min(punic.men, Math.max(0, punicLoss));
    roman.men -= romanLoss;
    punic.men -= punicLoss;
    roman.morale = Math.max(
      18,
      Math.min(95, roman.morale + (winning === 'rome' ? 8 : -17))
    );
    punic.morale = Math.max(
      18,
      Math.min(95, punic.morale + (winning === 'carthage' ? 8 : -17))
    );
    roman.supply = Math.max(0, roman.supply - 15);
    punic.supply = Math.max(0, punic.supply - 15);
    if (winning === 'rome') {
      state.blocked = state.blocked.filter(
        r => r !== key('canusium', 'cannae')
      );
      state.settlements[e.place] && (state.settlements[e.place].owner = 'rome');
      if (punic.men > 0 && punic.at === e.place) punic.at = 'tarentum';
      state.senate = Math.min(100, state.senate + 6);
      state.grainSafeguarded = true;
    } else {
      if (roman.men > 0 && roman.at === e.place) roman.at = 'venusia';
      state.senate = Math.max(0, state.senate - 9);
    }
    state.applied.push(e.id);
    const result = `${winning === 'rome' ? 'Roman victory' : 'Carthaginian victory'} at ${cityById[e.place].name}. Roman losses ${romanLoss.toLocaleString()}, Punic losses ${punicLoss.toLocaleString()}.`;
    state.pending = null;
    note(result, winning === 'rome' ? 'good' : 'bad');
    save();
    renderUI();
    drawSoon();
  }
  function withdraw() {
    const e = state.pending;
    if (!e) return;
    const a = byArmy(e.roman);
    a.at = 'venusia';
    a.morale = Math.max(12, a.morale - 7);
    a.supply = Math.max(0, a.supply - 10);
    state.applied.push(e.id);
    state.pending = null;
    note(
      'Roman army withdrew to Venusia. The enemy retains the grain road.',
      'bad'
    );
    save();
    renderUI();
    drawSoon();
  }
  function reset() {
    if (
      !window.confirm(
        'Start a new 216 BCE campaign? Your existing campaign save will be replaced.'
      )
    )
      return;
    state = initial();
    save();
    focus('apulia');
    renderUI();
    note('A new Republic campaign has begun.', 'good');
  }
  const selectedCity = () => cityById[state.selected] || cityById.canusium;
  function renderUI() {
    $('#date').textContent = 'SUMMER 216 BCE · DAY ' + (state.tick + 1);
    $('#food').textContent = Math.floor(state.food).toLocaleString();
    $('#coin').textContent = Math.floor(state.treasury).toLocaleString();
    $('#manpower').textContent = Math.floor(state.manpower).toLocaleString();
    $('#senate').textContent = state.senate + '%';
    $('#objective').textContent = state.grainSafeguarded
      ? 'THE GRAIN ROAD IS SECURE. EXPAND AND CONSOLIDATE.'
      : 'SECURE THE GRAIN ROAD TO CANNAE';
    const c = selectedCity(),
      sett = state.settlements[c.id];
    $('#place-name').textContent = c.name;
    $('#place-region').textContent =
      c.region.toUpperCase() +
      ' · ' +
      (sett ? names[sett.owner] : names[c.faction] || 'REGIONAL POWER');
    $('#place-info').textContent = c.playable
      ? 'LOCATION ' +
        c.lat.toFixed(2) +
        '° N / ' +
        c.lon.toFixed(2) +
        '° E · APPROXIMATE LOCATION · SOURCE REVIEW PENDING'
      : 'SURVEY REGION · GEOGRAPHY VISIBLE · PLAYABLE CONTENT NOT YET BUILT';
    $('#settlement').innerHTML = sett
      ? `<div class="mini-stat"><span>FARMS</span><b>${sett.farms}</b></div><div class="mini-stat"><span>GRANARIES</span><b>${sett.granaries}</b></div><div class="mini-stat"><span>LOCAL GRAIN</span><b>${sett.grain}</b></div><div class="mini-stat"><span>LOYALTY</span><b>${sett.loyalty}%</b></div>`
      : '<p class="muted">Region mapped for future expansion.</p>';
    const owned = sett?.owner === 'rome';
    $('#city-actions').innerHTML = owned
      ? '<button data-action="farm">FARM · 45 WOOD / 45 COIN</button><button data-action="granary">GRANARY · 65 WOOD / 25 STONE</button><button data-action="fort">FORTIFY · 70 WOOD / 60 STONE</button><button data-action="levy">RECRUIT 150 · 95 COIN</button>'
      : c.playable
        ? '<p class="muted">This settlement is outside Roman administration.</p>'
        : '<p class="muted">Full regional simulation follows a later development stage.</p>';
    const roster = state.armies.filter(a => a.owner === 'rome');
    $('#army-list').innerHTML = roster
      .map(
        a =>
          `<button class="army ${a.id === state.selectedArmy ? 'selected' : ''}" data-army="${a.id}"><span>${a.name}</span><strong>${a.men.toLocaleString()} men</strong><small>${cityById[a.at]?.name || a.at}${a.move ? ' → ' + cityById[a.move.to].name + ' (' + a.move.left + ' d)' : ''} · ${a.supply}% supplies</small></button>`
      )
      .join('');
    const selectedArmy = byArmy(state.selectedArmy);
    $('#move-context').textContent = selectedArmy
      ? 'COMMAND: ' +
        selectedArmy.name +
        ' at ' +
        cityById[selectedArmy.at].name +
        '. Select a connected town to order a march.'
      : 'Select a Roman army to issue orders.';
    $('#recent').innerHTML = state.history
      .slice(0, 4)
      .map(h => `<p><span>DAY ${h.tick + 1}</span> ${escapeText(h.text)}</p>`)
      .join('');
    const e = state.pending;
    $('#encounter').classList.toggle('hidden', !e);
    if (e) {
      $('#enc-title').textContent =
        'THE BATTLE FOR ' + cityById[e.place].name.toUpperCase();
      $('#enc-desc').textContent =
        byArmy(e.roman).men.toLocaleString() +
        ' Roman soldiers face ' +
        byArmy(e.punic).men.toLocaleString() +
        ' Carthaginian soldiers. Campaign time is paused.';
    }
    $('#advance1').disabled = !!e;
    $('#advance7').disabled = !!e;
    $('#saveflag').textContent = 'SAVED';
    drawSoon();
  }
  function escapeText(x) {
    return String(x).replace(
      /[&<>"']/g,
      ch =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[ch]
    );
  }
  function chooseCity(id) {
    state.selected = id;
    renderUI();
    const a = byArmy(state.selectedArmy);
    if (a && a.owner === 'rome' && a.at !== id && cityById[id]?.playable) {
      $('#move').disabled = !route(a.at, id);
      $('#move').textContent = route(a.at, id)
        ? 'MARCH TO ' + cityById[id].name.toUpperCase()
        : 'NO DIRECT ROAD';
    } else {
      $('#move').disabled = true;
      $('#move').textContent = 'SELECT ADJACENT DESTINATION';
    }
    drawSoon();
  }
  function openBattle(mode) {
    const overlay = $('#tactical');
    overlay.classList.remove('hidden');
    $('#tactical-label').textContent =
      mode === 'battle'
        ? 'TACTICAL ENCOUNTER · ' +
          cityById[state.pending.place].name.toUpperCase()
        : 'SETTLEMENT VIEW · ORIGINAL ROMA CHALLENGER';
    $('#battle-complete').classList.toggle('hidden', mode !== 'battle');
    $('#battle-cancel').textContent =
      mode === 'battle' ? 'Return without resolving' : 'Return to campaign';
    $('#battle-status').textContent =
      'Initialising preserved Three.js battlefield…';
    const frame = $('#legacy');
    frame.onload = () => {
      const w = frame.contentWindow;
      let tries = 0;
      const ready = () => {
        if (overlay.classList.contains('hidden')) return;
        if (w?.ROMA?.app) {
          try {
            w.ROMA.app.newGame();
            window.__romaStartSnapshot = w.ROMA.state();
            window.__romaBattleStarted = Date.now();
            $('#battle-status').textContent =
              'Original Challenger 3D engine active. Control formations and construction below.';
          } catch (e) {
            $('#battle-status').textContent =
              'Battlefield initialisation failed: ' + e.message;
          }
        } else if (++tries < 80) setTimeout(ready, 200);
        else
          $('#battle-status').textContent =
            'Unable to load original tactical game. You can return safely.';
      };
      ready();
    };
    frame.src = './legacy.html?campaign=1';
    window.__romaMode = mode;
  }
  function closeBattle(apply) {
    const mode = window.__romaMode;
    const frame = $('#legacy');
    if (apply && mode === 'battle') {
      try {
        const now = frame.contentWindow?.ROMA?.state();
        const before = window.__romaStartSnapshot;
        if (!now || !before) {
          note(
            'Battlefield result unavailable; encounter remains unresolved.',
            'bad'
          );
          return;
        }
        const sum = (r, owner) =>
          r.regiments
            .filter(x => x.owner === owner)
            .reduce((n, x) => n + x.men, 0);
        const a0 = sum(before, 1),
          a1 = sum(now, 1),
          b0 = sum(before, 2),
          b1 = sum(now, 2);
        const rLoss = a0 ? Math.max(0, 1 - a1 / a0) : 0,
          pLoss = b0 ? Math.max(0, 1 - b1 / b0) : 0;
        if (rLoss < 0.01 && pLoss < 0.01) {
          note(
            'No casualties registered yet. Fight before recording a tactical result.',
            'bad'
          );
          return;
        }
        calculateBattle({
          romanLoss: rLoss,
          punicLoss: pLoss,
          winner:
            a1 / Math.max(1, a0) >= b1 / Math.max(1, b0) ? 'rome' : 'carthage',
        });
      } catch (e) {
        note('Result could not be read from Challenger: ' + e.message, 'bad');
        return;
      }
    }
    frame.src = 'about:blank';
    $('#tactical').classList.add('hidden');
    window.__romaStartSnapshot = null;
    window.__romaMode = null;
    renderUI();
  }
  function inspectMapClick(px, py) {
    let best = null,
      dist = 23;
    for (const c of cities) {
      const [x, y] = pos(c.lon, c.lat),
        d = Math.hypot(px - x, py - y);
      if (d < dist) {
        best = c;
        dist = d;
      }
    }
    if (best) chooseCity(best.id);
  }
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 1)
      drag = {
        x: e.clientX,
        y: e.clientY,
        sx: e.clientX,
        sy: e.clientY,
        mode: 'pan',
      };
    if (touches.size === 2) {
      const a = [...touches.values()];
      drag = {
        mode: 'pinch',
        dist: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y),
        zoom: cam.z,
        x: cam.x,
        y: cam.y,
      };
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!touches.has(e.pointerId)) return;
    const prev = touches.get(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const a = [...touches.values()],
        distance = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (drag?.mode !== 'pinch')
        drag = { mode: 'pinch', dist: distance, zoom: cam.z };
      cam.z = drag.zoom * (distance / Math.max(2, drag.dist));
      clampCam();
      drawSoon();
    } else if (drag?.mode === 'pan') {
      cam.x -= (e.clientX - prev.x) / cam.z;
      cam.y -= (e.clientY - prev.y) / cam.z;
      clampCam();
      drawSoon();
    }
  });
  canvas.addEventListener('pointerup', e => {
    const rect = canvas.getBoundingClientRect();
    const delta =
      drag?.mode === 'pan'
        ? Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy)
        : 100;
    touches.delete(e.pointerId);
    if (!touches.size && delta < 9)
      inspectMapClick(e.clientX - rect.left, e.clientY - rect.top);
    if (!touches.size) drag = null;
  });
  canvas.addEventListener('pointercancel', e => {
    touches.delete(e.pointerId);
    drag = null;
  });
  canvas.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const before = world(e.offsetX, e.offsetY);
      cam.z *= e.deltaY < 0 ? 1.15 : 1 / 1.15;
      clampCam();
      const after = world(e.offsetX, e.offsetY);
      cam.x += before[0] - after[0];
      cam.y += before[1] - after[1];
      clampCam();
      drawSoon();
    },
    { passive: false }
  );
  $('#worldbtn').onclick = () => focus('world');
  $('#italiabtn').onclick = () => focus('italia');
  $('#apuliabtn').onclick = () => focus('apulia');
  $('#zoom-in').onclick = () => {
    cam.z *= 1.35;
    clampCam();
    drawSoon();
  };
  $('#zoom-out').onclick = () => {
    cam.z /= 1.35;
    clampCam();
    drawSoon();
  };
  $('#advance1').onclick = () => advance(1);
  $('#advance7').onclick = () => advance(7);
  $('#save').onclick = () => {
    save();
    note('Republic campaign saved locally.', 'good');
  };
  $('#reset').onclick = reset;
  $('#city-actions').addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (b) develop(b.dataset.action);
  });
  $('#army-list').addEventListener('click', e => {
    const b = e.target.closest('[data-army]');
    if (!b) return;
    state.selectedArmy = b.dataset.army;
    const a = byArmy(state.selectedArmy);
    chooseCity(a.at);
    save();
    showPoint(a.at);
  });
  $('#move').onclick = () => chooseMove(state.selected);
  $('#inspect').onclick = () => openBattle('settlement');
  $('#resolve3d').onclick = () => openBattle('battle');
  $('#autoresolve').onclick = () => calculateBattle();
  $('#withdraw').onclick = withdraw;
  $('#battle-cancel').onclick = () => closeBattle(false);
  $('#battle-complete').onclick = () => closeBattle(true);
  $('#mobile-panel').onclick = () => $('#sidebar').classList.toggle('expanded');
  $('#close-panel').onclick = () => $('#sidebar').classList.remove('expanded');
  window.addEventListener('resize', fitCanvas);
  Promise.all([
    fetch('./land.geojson').then(r => {
      if (!r.ok) throw Error('Coastline data unavailable');
      return r.json();
    }),
    fetch('./rivers.geojson')
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null),
  ])
    .then(([a, b]) => {
      land = a;
      rivers = b;
      drawSoon();
      $('#geo-status').textContent =
        'GLOBAL COASTLINES LOADED · NATURAL EARTH 110M';
    })
    .catch(e => {
      $('#geo-status').textContent = 'MAP DATA UNAVAILABLE · ' + e.message;
      note(
        'Geographical layer failed to load. Map controls remain available.',
        'bad'
      );
      drawSoon();
    });
  const p = xy(16, 41.15);
  cam.x = p[0];
  cam.y = p[1];
  cam.z = 2;
  fitCanvas();
  focus('apulia');
  renderUI();
  window.ROMA_CAMPAIGN = {
    get state() {
      return JSON.parse(JSON.stringify(state));
    },
    advance,
    autoResolve: () => calculateBattle(),
    focus,
    save,
  };
})();
