import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  BUILDINGS,
  TROOPS,
  MAP,
  height,
  riverX,
  water,
  rng,
} from './config.js';
const PALETTE = [0x3b8fbd, 0xc6644d];
const WHITE = 0xf2e6ca;
export class WorldView {
  constructor(canvas, labels, sim) {
    this.canvas = canvas;
    this.labels = labels;
    this.sim = sim;
    this.center = new T.Vector3(34, 0, 103);
    this.span = 65;
    this.objects = new Map();
    this.dom = new Map();
    this.assets = {};
    this.time = 0;
    this.lastFog = -2;
    this.renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.scene = new T.Scene();
    this.scene.background = new T.Color(0xb8cbd0);
    this.scene.fog = new T.Fog(0xb8cbd0, 230, 470);
    this.camera = new T.OrthographicCamera(-45, 45, 45, -45, 0.1, 650);
    this.sun = new T.DirectionalLight(0xffebcf, 3);
    this.sun.position.set(40, 110, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sun.shadow.camera, {
      left: -65,
      right: 65,
      top: 65,
      bottom: -65,
      near: 1,
      far: 230,
    });
    this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun, this.sun.target);
    this.scene.add(new T.HemisphereLight(0xc8e9f3, 0x766951, 2.3));
    this.materials = new Map();
    this.box = new T.BoxGeometry(1, 1, 1);
    this.cyl = new T.CylinderGeometry(1, 1, 1, 7);
    this.cone = new T.ConeGeometry(1, 1, 5);
    this.sphere = new T.IcosahedronGeometry(1, 0);
    this.makeTerrain();
    this.makeWater();
    this.makeNature();
    this.makeInstancedPeople();
    this.selectRing = new T.Mesh(
      new T.RingGeometry(3.6, 3.85, 48),
      new T.MeshBasicMaterial({
        color: 0xbdeaff,
        transparent: true,
        opacity: 0.95,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    this.selectRing.rotation.x = -Math.PI / 2;
    this.scene.add(this.selectRing);
    this.selectRing.visible = false;
    this.ghost = new T.Mesh(
      new T.BoxGeometry(1, 0.2, 1),
      new T.MeshBasicMaterial({
        color: 0x9de3c4,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    );
    this.scene.add(this.ghost);
    this.ghost.visible = false;
    this.effectPool = [];
    for (let i = 0; i < 40; i++) {
      const mesh = new T.Mesh(
        new T.SphereGeometry(0.2, 5, 4),
        new T.MeshBasicMaterial({ color: 0xffd298 }),
      );
      mesh.visible = false;
      this.scene.add(mesh);
      this.effectPool.push(mesh);
    }
    this.ray = new T.Raycaster();
    this.resize();
    this.loadAssets();
  }
  material(color) {
    if (!this.materials.has(color))
      this.materials.set(
        color,
        new T.MeshStandardMaterial({ color, roughness: 1 }),
      );
    return this.materials.get(color);
  }
  mesh(geo, color, x, y, z, sx = 1, sy = 1, sz = 1, parent = this.scene) {
    const m = new T.Mesh(geo, this.material(color));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  makeTerrain() {
    const g = new T.PlaneGeometry(MAP.width+320, MAP.depth+320, MAP.width===180?180:230, MAP.depth===160?170:210);
    g.rotateX(-Math.PI / 2);
    g.translate(MAP.width/2, 0, MAP.depth/2);
    const p = g.attributes.position;
    this.terrainBase = [];
    const colors = [];
    const random = rng(813);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      const river = Math.abs(x - riverX(z));
      let y = height(x, z);
      if (river < 5.6) y = -0.7;
      else if (river < 8) y *= 0.45;
      p.setY(i, y);
      let c = new T.Color(river < 8 ? 0xbeb494 : 0x9fa579);
      const noise = random() * 0.13;
      c.offsetHSL((random() - 0.5) * 0.025, -0.06, noise - 0.05);
      if (height(x, z) > 4) c.lerp(new T.Color(0xa59e7e), 0.35);
      this.terrainBase.push(c.clone());
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    this.terrain = new T.Mesh(
      g,
      new T.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        flatShading: true,
      }),
    );
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
    for (const z of (MAP.depth>160?[48,116,232,310]:[48,116])) {
      const x = riverX(z);
      this.mesh(this.box, 0xb6aa8b, x, 1.2, z, 15, 0.8, 8);
      for (const dz of [-4.2, 4.2]) {
        this.mesh(this.box, 0x817d6a, x, 1.9, z + dz, 15, 0.8, 0.5);
        for (let j = -5; j <= 5; j += 5)
          this.mesh(this.box, 0x817d6a, x + j, 0.3, z + dz, 1, 2.5, 1);
      }
    }
    const road = [];
    for (let z = 10; z < MAP.depth-5; z += 3)
      for (const x of [riverX(z) - 12, riverX(z) + 12])
        road.push({ x, z, y: height(x, z) + 0.03, sx: 2.3, sy: 0.05, sz: 3.1 });
    this.batch(this.box, 0xb8ac86, road);
  }
  makeWater() {
    const v = [],
      ix = [];
    for (let z = -150; z <= MAP.depth+150; z += 3) {
      const x = riverX(z);
      v.push(x - 5.6, 0.05, z, x + 5.6, 0.05, z);
      const i = v.length / 3 - 2;
      if (i > 0) ix.push(i - 2, i - 1, i, i - 1, i + 1, i);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
    g.setIndex(ix);
    g.computeVertexNormals();
    this.water = new T.Mesh(
      g,
      new T.MeshStandardMaterial({
        color: 0x669fa7,
        roughness: 0.33,
        metalness: 0.15,
        side: T.DoubleSide,
      }),
    );
    this.scene.add(this.water);
    const reeds = [];
    for (let z = 0; z < MAP.depth; z += 5)
      reeds.push({ x: riverX(z) - 6.6, z, scale: 0.6 });
    this.batch(
      this.cone,
      0x899566,
      reeds.map((p) => ({
        ...p,
        y: height(p.x, p.z),
        sx: 0.3,
        sy: 1.1,
        sz: 0.3,
      })),
    );
  }
  batch(geometry, color, list) {
    const m = new T.InstancedMesh(geometry, this.material(color), list.length);
    const o = new T.Object3D();
    list.forEach((p, i) => {
      o.position.set(p.x, p.y ?? height(p.x, p.z), p.z);
      o.rotation.y = p.angle || 0;
      o.scale.set(
        p.sx ?? p.scale ?? 1,
        p.sy ?? p.scale ?? 1,
        p.sz ?? p.scale ?? 1,
      );
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    this.scene.add(m);
    return m;
  }
  makeNature() {
    const random = rng(917);
    this.treePositions = [];
    for (const r of this.sim.resources.filter((r) => r.type === 'wood'))
      for (let j = 0; j < 24; j++) {
        const a = random() * 6.28,
          d = random() * r.radius;
        this.treePositions.push({
          x: r.x + Math.cos(a) * d,
          z: r.z + Math.sin(a) * d,
          scale: 2.5 + random() * 2.2,
          angle: random() * 6.28,
        });
      }
    for (let i = 0; i < 280; i++) {
      const x = random() * (MAP.width+180) - 90,
        z = random() * (MAP.depth+120) - 60;
      if (x > 7 && x < MAP.width-7 && z > 7 && z < MAP.depth-7) continue;
      if (Math.abs(x - riverX(z)) < 10) continue;
      this.treePositions.push({
        x,
        z,
        scale: 2 + random() * 4,
        angle: random() * 6.28,
      });
    }
    this.fallbackTrees = [
      this.batch(
        this.cyl,
        0x71634f,
        this.treePositions.map((p) => ({
          ...p,
          y: height(p.x, p.z) + p.scale * 0.4,
          sx: p.scale * 0.1,
          sy: p.scale * 0.8,
          sz: p.scale * 0.1,
        })),
      ),
      this.batch(
        this.cone,
        0x506e54,
        this.treePositions.map((p) => ({
          ...p,
          y: height(p.x, p.z) + p.scale,
          sx: p.scale * 0.6,
          sy: p.scale * 1.6,
          sz: p.scale * 0.6,
        })),
      ),
    ];
    const stones = [];
    for (const r of this.sim.resources.filter(
      (r) => r.type === 'stone' || r.type === 'iron',
    ))
      for (let i = 0; i < 8; i++) {
        const x = r.x + (random() - 0.5) * 5,
          z = r.z + (random() - 0.5) * 5;
        stones.push({
          x,
          z,
          y: height(x, z) + 0.6,
          sx: 0.8 + random() * 1.2,
          sy: 0.8 + random(),
          sz: 1 + random(),
          angle: random() * 6.28,
        });
      }
    this.batch(this.sphere, 0x8a8d86, stones);
    for (const r of this.sim.resources.filter((r) => r.type === 'food')) {
      for (let i = 0; i < 9; i++) {
        const x = r.x + (random() - 0.5) * 5,
          z = r.z + (random() - 0.5) * 5;
        this.mesh(
          this.sphere,
          0x6d8053,
          x,
          height(x, z) + 0.7,
          z,
          0.9,
          0.8,
          0.9,
        );
        this.mesh(
          this.sphere,
          0xb86b56,
          x + 0.3,
          height(x, z) + 1.2,
          z,
          0.18,
          0.18,
          0.18,
        );
      }
    }
  }
  async loadAssets() {
    const loader = new GLTFLoader();
    try {
      const g = await loader.loadAsync('./rts/assets/oak.glb');
      g.scene.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(g.scene),
        size = box.getSize(new T.Vector3()),
        scale = 1 / size.y;
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        const geometry = o.geometry.clone();
        geometry.applyMatrix4(o.matrixWorld);
        geometry.translate(0, -box.min.y, 0);
        geometry.scale(scale, scale, scale);
        const m = new T.InstancedMesh(
          geometry,
          o.material,
          this.treePositions.length,
        );
        const dummy = new T.Object3D();
        this.treePositions.forEach((p, i) => {
          dummy.position.set(p.x, height(p.x, p.z), p.z);
          dummy.rotation.y = p.angle;
          dummy.scale.setScalar(p.scale * 1.45);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
        });
        m.castShadow = true;
        m.receiveShadow = true;
        this.scene.add(m);
      });
      this.fallbackTrees.forEach((m) => {
        m.visible = false;
      });
      this.assets.oak = true;
    } catch {
      this.assets.oak = false;
    }
    for (const name of ['tower', 'gate', 'wall'])
      try {
        const gltf = await loader.loadAsync(`./rts/assets/${name}.glb`);
        this.assets[name] = gltf.scene;
      } catch {
        this.assets[name] = null;
      }
  }
  makeBuilding(b) {
    const group = new T.Group(),
      d = BUILDINGS[b.type],
      r = d.size,
      color = PALETTE[b.side],
      stone = 0xc1bba6,
      wood = 0x8d7256;
    group.position.set(b.x, height(b.x, b.z), b.z);
    this.scene.add(group);
    this.mesh(
      this.box,
      0xb7aa88,
      0,
      0.12,
      0,
      r * 2 + 0.8,
      0.25,
      r * 2 + 0.8,
      group,
    );
    if (['wall', 'gate', 'tower'].includes(b.type) && this.assets[b.type]) {
      const model = this.assets[b.type].clone(true);
      const box = new T.Box3().setFromObject(model),
        size = box.getSize(new T.Vector3());
      const scale = b.type === 'tower' ? 6 / size.y : 4 / size.x;
      model.scale.setScalar(scale);
      model.position.y = -box.min.y * scale;
      model.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      group.add(model);
    } else if (b.type === 'farm') {
      for (let i = -2; i <= 2; i++)
        this.mesh(this.box, 0xc1a966, i * 1.2, 0.23, 0, 0.6, 0.3, 5.8, group);
      this.mesh(this.box, wood, 0, 0.4, -3.4, 6.7, 0.4, 0.25, group);
    } else if (b.type === 'wall') {
      this.mesh(this.box, stone, 0, 1.7, 0, 4, 3.4, 2, group);
      for (let x = -1.5; x < 2; x++)
        this.mesh(this.box, stone, x, 3.7, 0, 0.6, 0.6, 2, group);
    } else if (b.type === 'gate') {
      for (const x of [-1.8, 1.8])
        this.mesh(this.box, stone, x, 2.5, 0, 1.1, 5, 2, group);
      this.mesh(this.box, wood, 0, 4.7, 0, 4.8, 0.8, 2, group);
    } else {
      const h = b.type === 'tower' ? 6 : b.type === 'town' ? 3.3 : 2.3;
      this.mesh(this.box, stone, 0, h / 2, 0, r * 1.7, h, r * 1.5, group);
      const roof = this.mesh(
        new T.ConeGeometry(1, 1, 4),
        b.side === 0 ? 0x738f91 : 0xa37361,
        0,
        h + 1,
        0,
        r * 1.55,
        2.4,
        r * 1.4,
        group,
      );
      roof.rotation.y = Math.PI / 4;
      this.mesh(this.box, wood, 0, 0.9, r * 0.76, 0.9, 1.8, 0.12, group);
      for (const x of [-r * 0.5, r * 0.5])
        this.mesh(
          this.box,
          0x5b655e,
          x,
          h * 0.55,
          r * 0.76,
          0.6,
          0.7,
          0.13,
          group,
        );
      if (b.type === 'town') {
        this.mesh(
          this.box,
          stone,
          -r * 0.6,
          h + 0.5,
          -r * 0.5,
          2.1,
          4,
          2.1,
          group,
        );
        this.mesh(
          this.cone,
          0x738f91,
          -r * 0.6,
          h + 3,
          -r * 0.5,
          1.8,
          1.4,
          1.8,
          group,
        );
      }
      if (b.type === 'workshop') {
        this.mesh(this.cyl, 0x665c50, r * 0.5, 3, -r * 0.5, 0.4, 6, 0.4, group);
      }
      if (b.type === 'market') {
        for (const x of [-2, 2])
          this.mesh(this.box, 0xd0a979, x, 1.1, 3, 1.8, 0.2, 2, group);
      }
    }
    if (b.type !== 'farm' && b.type !== 'wall') {
      const mast = b.type === 'tower' ? 7 : 5;
      this.mesh(this.cyl, wood, r * 0.65, mast / 2, 0, 0.07, mast, 0.07, group);
      this.mesh(
        this.box,
        color,
        r * 0.65 + 0.6,
        mast - 0.5,
        0,
        1.2,
        0.7,
        0.08,
        group,
      );
    }
    // Merge procedural pieces by shared material: one draw call per material per building.
    group.updateMatrixWorld(true);
    const groups = new Map();
    for (const child of [...group.children]) {
      if (!child.isMesh) continue;
      const geometry = child.geometry.clone();
      geometry.applyMatrix4(child.matrix);
      if (!groups.has(child.material)) groups.set(child.material, []);
      groups.get(child.material).push(geometry);
      group.remove(child);
    }
    for (const [material, geometries] of groups) {
      const mesh = new T.Mesh(mergeGeometries(geometries), material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.objects.set(b.id, group);
    return group;
  }
  makeInstancedPeople() {
    this.parts = {};
    const cap = 1700;
    for (const [name, g] of [
      ['body', new T.BoxGeometry(0.42, 0.65, 0.28)],
      ['head', new T.IcosahedronGeometry(0.21, 1)],
      ['legs', new T.BoxGeometry(0.3, 0.42, 0.23)],
      ['weapon', new T.BoxGeometry(0.07, 0.07, 0.9)],
      ['horse', new T.BoxGeometry(0.65, 0.65, 1.25)],
    ]) {
      const mat = this.material(
        name === 'head'
          ? 0xd1b28e
          : name === 'weapon'
            ? 0x514c43
            : name === 'horse'
              ? 0x78614a
              : 0xffffff,
      );
      const m = new T.InstancedMesh(g, mat, cap);
      m.instanceMatrix.setUsage(T.DynamicDrawUsage);
      m.castShadow = name === 'body' || name === 'horse';
      m.frustumCulled = false;
      this.scene.add(m);
      this.parts[name] = m;
    }
    this.dummy = new T.Object3D();
  }
  updatePeople() {
    const counts = { body: 0, head: 0, legs: 0, weapon: 0, horse: 0 };
    const add = (name, x, y, z, angle, scale, color) => {
      const i = counts[name]++;
      const o = this.dummy;
      o.position.set(x, y, z);
      o.rotation.set(0, angle, 0);
      o.scale.setScalar(scale);
      o.updateMatrix();
      this.parts[name].setMatrixAt(i, o.matrix);
      if (color !== undefined)
        this.parts[name].setColorAt(i, new T.Color(color));
    };
    const person = (x, z, angle, side, scale, walk, cavalry = false) => {
      const y =
          height(x, z) + Math.sin(this.time * 10 + x) * 0.08 * (walk ? 1 : 0),
        rise = cavalry ? 0.8 : 0;
      add('body', x, y + rise + 0.8 * scale, z, angle, scale, PALETTE[side]);
      add('head', x, y + rise + 1.35 * scale, z, angle, scale);
      add('legs', x, y + rise + 0.3 * scale, z, angle, scale, 0x424d52);
      add('weapon', x + 0.28, y + rise + 0.85 * scale, z + 0.3, angle, scale);
      if (cavalry) add('horse', x, y + 0.65, z, angle, 1.2);
    };
    for (const w of this.sim.workers)
      if (w.hp > 0 && (w.side === 0 || this.sim.seen(w)))
        person(
          w.x,
          w.z,
          w.angle,
          w.side,
          this.span > 110 ? 1.1 : 0.9,
          w.path.length > 0,
        );
    for (const a of this.sim.armies) {
      if (a.hp <= 0 || (a.side !== 0 && !this.sim.seen(a))) continue;
      const d = TROOPS[a.type];
      if (this.span > 120) continue;
      const count = Math.ceil((d.models * a.hp) / a.maxHp);
      const cols = a.mode === 'column' ? 3 : a.mode === 'skirmish' ? 5 : 8;
      const spacing = a.mode === 'skirmish' ? 1.9 : 1;
      for (let i = 0; i < count; i++) {
        const dx = ((i % cols) - (Math.min(cols, count) - 1) / 2) * spacing,
          dz = (Math.floor(i / cols) - 1) * spacing;
        const x = a.x + dx * Math.cos(a.angle) + dz * Math.sin(a.angle),
          z = a.z - dx * Math.sin(a.angle) + dz * Math.cos(a.angle);
        if (a.type === 'artillery') {
          add('horse', x, height(x, z) + 0.5, z, a.angle, 1.4, 0x554f47);
          person(x - 1, z, a.angle, a.side, 0.9, a.path.length > 0);
        } else
          person(
            x,
            z,
            a.angle,
            a.side,
            1,
            a.path.length > 0,
            a.type === 'cavalry',
          );
      }
    }
    for (const [name, m] of Object.entries(this.parts)) {
      m.count = counts[name];
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.updateCamera();
  }
  updateCamera() {
    const aspect = this.width / this.height;
    this.camera.left = (-this.span * aspect) / 2;
    this.camera.right = (this.span * aspect) / 2;
    this.camera.top = this.span / 2;
    this.camera.bottom = -this.span / 2;
    this.camera.position.copy(this.center).add(new T.Vector3(35, 90, 65));
    this.camera.lookAt(this.center);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.sun.position.copy(this.center).add(new T.Vector3(-40, 100, -25));
    this.sun.target.position.copy(this.center);
    this.sun.target.updateMatrixWorld();
  }
  zoom(factor) {
    this.span = Math.max(26, Math.min(210, this.span * factor));
    this.updateCamera();
  }
  focus(o) {
    this.center.set(o.x, 0, o.z);
    this.updateCamera();
  }
  pan(dx, dy) {
    const a = this.ground(this.width / 2, this.height / 2),
      b = this.ground(this.width / 2 + dx, this.height / 2 + dy);
    if (a && b) {
      this.center.x = Math.max(8, Math.min(MAP.width - 8, this.center.x + a.x - b.x));
      this.center.z = Math.max(8, Math.min(MAP.depth - 8, this.center.z + a.z - b.z));
      this.updateCamera();
    }
  }
  ground(x, y) {
    this.ray.setFromCamera(
      new T.Vector2((x / this.width) * 2 - 1, (-y / this.height) * 2 + 1),
      this.camera,
    );
    const hit = this.ray.intersectObject(this.terrain)[0];
    if (hit) return { x: hit.point.x, z: hit.point.z };
    return null;
  }
  screen(o, y = 2) {
    const v = new T.Vector3(o.x, height(o.x, o.z) + y, o.z).project(
      this.camera,
    );
    return {
      x: ((v.x + 1) * this.width) / 2,
      y: ((1 - v.y) * this.height) / 2,
    };
  }
  pick(x, y) {
    let best = null,
      score = Infinity;
    for (const o of [
      ...this.sim.armies,
      ...this.sim.workers,
      ...this.sim.buildings,
      ...this.sim.resources,
    ]) {
      if (o.hp === 0 || (o.side === 1 && !this.sim.seen(o))) continue;
      const visible =
        this.sim.explored[Math.floor(o.z / MAP.cell) * (MAP.width/MAP.cell) + Math.floor(o.x / MAP.cell)];
      if (!visible) continue;
      const p = this.screen(o, o.kind === 'building' ? 2 : 1),
        d = Math.hypot(p.x - x, p.y - y);
      const radius = Math.max(
        o.kind === 'army' ? 24 : 20,
        ((o.radius || 1) * this.height) / this.span,
      );
      const weight = d / (o.kind === 'army' ? 1.35 : 1);
      if (d < radius && weight < score) {
        best = o;
        score = weight;
      }
    }
    return best;
  }
  setGhost(type, p, valid) {
    this.ghost.visible = !!p;
    if (p) {
      this.ghost.position.set(p.x, height(p.x, p.z) + 0.3, p.z);
      this.ghost.scale.set(
        BUILDINGS[type].size * 2,
        1,
        BUILDINGS[type].size * 2,
      );
      this.ghost.material.color.set(valid ? 0x9de3c4 : 0xe37763);
    }
  }
  label(key, text, x, y, className) {
    let el = this.dom.get(key);
    if (!el) {
      el = document.createElement('div');
      this.labels.appendChild(el);
      this.dom.set(key, el);
    }
    el.className = className;
    if (el.innerHTML !== text) el.innerHTML = text;
    el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-50%)`;
    el.style.display =
      x < -60 || x > this.width + 60 || y < 0 || y > this.height ? 'none' : '';
    el.dataset.active = '1';
  }
  updateLabels() {
    for (const el of this.dom.values()) el.dataset.active = '0';
    for (const t of this.sim.territories) {
      const p = this.screen(t, 7);
      this.label(
        t.id,
        `<span>${t.name}</span>${t.progress ? `<i style="width:${(t.progress / 18) * 100}%"></i>` : ''}`,
        p.x,
        p.y,
        `rts-place side${t.owner}`,
      );
    }
    for (const a of this.sim.armies) {
      if (a.hp <= 0 || (a.side === 1 && !this.sim.seen(a))) continue;
      const p = this.screen(a, 4.8),
        d = TROOPS[a.type],
        state = a.state === 'steady' ? '' : a.state;
      this.label(
        a.id,
        `<b>${a.side === 0 ? '◆' : '▲'} ${d.short} · ${Math.ceil((d.men * a.hp) / a.maxHp)}</b><i style="width:${(a.hp / a.maxHp) * 100}%"></i>${state ? `<em>${state}</em>` : ''}`,
        p.x,
        p.y,
        `rts-regiment side${a.side} ${this.selected?.id === a.id ? 'selected' : ''}`,
      );
    }
    for (const b of this.sim.buildings) {
      if (b.hp <= 0 || (b.side === 1 && !this.sim.seen(b))) continue;
      if (
        b.progress >= 1 &&
        b.queue.length === 0 &&
        b.hp >= b.maxHp &&
        this.selected?.id !== b.id
      )
        continue;
      const p = this.screen(b, 7);
      this.label(
        'b' + b.id,
        `<b>${b.progress < 1 ? 'Building ' + Math.floor(b.progress * 100) + '%' : BUILDINGS[b.type].name}</b><i style="width:${b.progress < 1 ? b.progress * 100 : (b.hp / b.maxHp) * 100}%"></i>${b.queue.length ? `<em>${b.queue[0].type} · ${Math.ceil(b.queue[0].left)}s</em>` : ''}`,
        p.x,
        p.y,
        `rts-regiment side${b.side}`,
      );
    }
    for (const [key, el] of this.dom)
      if (el.dataset.active !== '1') {
        el.remove();
        this.dom.delete(key);
      }
  }
  updateFog() {
    const g = this.terrain.geometry,
      p = g.attributes.position,
      c = g.attributes.color;
    for (let i = 0; i < p.count; i++) {
      const x = Math.floor(p.getX(i) / 2),
        z = Math.floor(p.getZ(i) / 2);
      let light = 0.82;
      if (x >= 0 && x < MAP.width/MAP.cell && z >= 0 && z < MAP.depth/MAP.cell)
        light = this.sim.visible[z * (MAP.width/MAP.cell) + x]
          ? 1
          : this.sim.explored[z * (MAP.width/MAP.cell) + x]
            ? 0.68
            : 0.39;
      const b = this.terrainBase[i];
      c.setXYZ(i, b.r * light, b.g * light, b.b * light);
    }
    c.needsUpdate = true;
  }
  render(dt, selected) {
    this.time += dt;
    this.selected = selected;
    for (const b of this.sim.buildings) {
      let g = this.objects.get(b.id);
      if (b.hp <= 0) {
        if (g) g.visible = false;
        continue;
      }
      if (!g) g = this.makeBuilding(b);
      g.visible =
        b.side === 0 ||
        !!this.sim.explored[Math.floor(b.z / MAP.cell) * (MAP.width/MAP.cell) + Math.floor(b.x / MAP.cell)];
      g.scale.y = 0.15 + 0.85 * b.progress;
    }
    this.updatePeople();
    this.selectRing.visible = !!selected && selected.hp !== 0;
    if (selected) {
      this.selectRing.position.set(
        selected.x,
        height(selected.x, selected.z) + 0.12,
        selected.z,
      );
      this.selectRing.scale.setScalar((selected.radius || 3.4) / 3.5);
    }
    this.effectPool.forEach((m, i) => {
      const e = this.sim.effects[i];
      m.visible = !!e;
      if (e) {
        const t = 1 - e.life / 0.45;
        m.position.set(
          e.tx !== undefined ? e.x + (e.tx - e.x) * Math.max(0, t) : e.x,
          height(e.x, e.z) + 1.8,
          e.tz !== undefined ? e.z + (e.tz - e.z) * Math.max(0, t) : e.z,
        );
        m.scale.setScalar(
          e.kind === 'order' ? 2 : e.kind === 'built' ? 1 : 0.6,
        );
        m.material.color.set(e.kind === 'order' ? 0xc1f2ff : 0xffd49b);
      }
    });
    if (this.time - this.lastFog > 0.7) {
      this.updateFog();
      this.lastFog = this.time;
    }
    this.updateLabels();
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.renderer.dispose();
  }
}
