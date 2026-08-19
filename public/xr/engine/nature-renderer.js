(() => {
  const A = window.AFRAME;
  if (!A) throw new Error('A-Frame must load before NatureRenderer');

  const el = (tag, attrs = {}) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    return node;
  };
  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.setAttribute('value', value);
  };

  const activateTruthNode = (node) => {
    setText('panel-title', node.title);
    setText('panel-body', node.body);
    setText('panel-source', `${node.truthState ? `${node.truthState} · ` : ''}SOURCE · ${node.source.label}`);
    setText('panel-boundary', `BOUNDARY · ${node.boundary}`);
    if (node.href) window.setTimeout(() => window.location.assign(node.href), 650);
  };

  const renderPanel = (scene, manifest) => {
    const panel = el('a-entity', { id: 'truth-panel', position: manifest.panel?.position || '0 3.8 -4.2' });
    panel.append(
      el('a-plane', { width: '6.6', height: '1.45', color: '#061009', opacity: '0.88' }),
      el('a-text', { id: 'panel-title', value: 'SELECT A NODE', color: '#3AE86F', width: '5.9', position: '-3 0.42 0.02' }),
      el('a-text', { id: 'panel-body', value: 'Truth stays attached to the experience.', color: '#FFFFFF', width: '5.7', 'wrap-count': '72', position: '-3 0.12 0.02' }),
      el('a-text', { id: 'panel-source', value: 'SOURCE · 4PLANET SPECIES_', color: '#9ccfa9', width: '5.7', 'wrap-count': '82', position: '-3 -0.30 0.02' }),
      el('a-text', { id: 'panel-boundary', value: `BOUNDARY · ${manifest.truthBoundary}`, color: '#a9b5ad', width: '5.7', 'wrap-count': '88', position: '-3 -0.55 0.02' })
    );
    scene.appendChild(panel);
  };

  const renderEnvironment = (scene, manifest) => {
    const assets = scene.querySelector('a-assets');
    const environmentId = `environment-${manifest.id}`;
    const subjectId = `subject-${manifest.id}`;
    assets.append(
      el('img', { id: environmentId, src: manifest.environment.src, crossorigin: 'anonymous' }),
      el('img', { id: subjectId, src: manifest.subject.mediaSrc, crossorigin: 'anonymous' })
    );

    const env = `#${environmentId}`;
    scene.append(
      el('a-entity', { light: 'type: ambient; color: #91b79a; intensity: 0.55' }),
      el('a-entity', { light: 'type: directional; color: #d9ffe2; intensity: 0.75', position: '-2 6 1' }),
      el('a-plane', { src: env, position: '0 3 -11', width: '21', height: '13', material: 'shader: flat; opacity: 0.92' }),
      el('a-plane', { src: env, position: '-9 3 -2', rotation: '0 90 0', width: '18', height: '13', material: 'shader: flat; opacity: 0.52' }),
      el('a-plane', { src: env, position: '9 3 -2', rotation: '0 -90 0', width: '18', height: '13', material: 'shader: flat; opacity: 0.52' }),
      el('a-plane', { color: '#06170b', position: '0 0 -3', rotation: '-90 0 0', width: '26', height: '26', material: 'roughness: 1' })
    );

    const subject = el('a-entity', { position: manifest.subject.position || '0 1.9 -5' });
    subject.append(
      el('a-plane', { src: `#${subjectId}`, width: manifest.subject.width || '5.2', height: manifest.subject.height || '3.35', material: 'shader: flat', position: '0 0 0' }),
      el('a-text', { value: `${manifest.entity.commonName.toUpperCase()} · ${manifest.entity.scientificName.toUpperCase()}`, align: 'center', color: '#FFFFFF', width: '5.2', position: '0 -1.92 0.03' }),
      el('a-text', { value: manifest.subject.boundaryLabel || 'SPECIES MEDIA · NOT AN OCCURRENCE RECORD', align: 'center', color: '#9ccfa9', width: '4.2', position: '0 -2.18 0.03' })
    );
    scene.appendChild(subject);
  };

  const renderNode = (scene, node) => {
    const primitive = node.shape === 'box' ? 'a-box' : 'a-sphere';
    const attrs = {
      class: 'hotspot',
      position: node.position,
      color: node.color || '#3AE86F',
      'data-node-id': node.id,
      'data-kind': node.kind,
      'data-relation-class': node.relationClass || '',
      'data-truth-state': node.truthState || '',
      'data-hotspot-ready': 'true'
    };
    if (primitive === 'a-sphere') attrs.radius = node.radius || '0.16';
    else Object.assign(attrs, { width: node.width || '3.8', height: node.height || '1', depth: node.depth || '0.18' });

    const hotspot = el(primitive, attrs);
    hotspot.addEventListener('mouseenter', () => hotspot.setAttribute('scale', '1.18 1.18 1.18'));
    hotspot.addEventListener('mouseleave', () => hotspot.setAttribute('scale', '1 1 1'));
    hotspot.addEventListener('click', () => activateTruthNode(node));
    scene.appendChild(hotspot);
    scene.appendChild(el('a-text', {
      value: node.label,
      color: node.labelColor || node.color || '#3AE86F',
      width: node.labelWidth || '3',
      position: node.labelPosition,
      rotation: node.labelRotation || '0 0 0',
      align: node.align || 'left'
    }));
  };

  const renderRig = (scene) => {
    const rig = el('a-entity', { id: 'rig', position: '0 0 2.3' });
    const camera = el('a-camera', { position: '0 1.6 0', 'look-controls': 'pointerLockEnabled: false', 'wasd-controls': 'acceleration: 18' });
    camera.appendChild(el('a-cursor', { fuse: 'true', 'fuse-timeout': '850', raycaster: 'objects: .hotspot', color: '#3AE86F', opacity: '0.9' }));
    rig.append(
      camera,
      el('a-entity', { 'laser-controls': 'hand: left', raycaster: 'objects: .hotspot' }),
      el('a-entity', { 'laser-controls': 'hand: right', raycaster: 'objects: .hotspot' })
    );
    scene.appendChild(rig);
  };

  const hydrateShell = (manifest) => {
    document.title = `${manifest.entity.commonName} XR — 4PLANET SPECIES_`;
    const brand = document.querySelector('.brand');
    if (brand) brand.setAttribute('href', manifest.returnHref || `/species/${manifest.entity.slug}`);
    const eyebrow = document.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = `${manifest.entity.commonName.toUpperCase()} · ${manifest.entity.scientificName.toUpperCase()} · IMMERSIVE LENS ${manifest.version}`;
    const heading = document.querySelector('.intro h1');
    if (heading) heading.textContent = manifest.title;
    const intro = document.querySelector('.intro p');
    if (intro) intro.textContent = manifest.intro;
    const boundary = document.querySelector('.boundary');
    if (boundary) boundary.textContent = manifest.truthBoundary;
  };

  const loadManifest = async (manifestUrl) => {
    const response = await fetch(manifestUrl, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`XR manifest failed: ${response.status}`);
    return response.json();
  };

  const render = async ({ scene, manifest: providedManifest, manifestUrl }) => {
    const manifest = providedManifest || await loadManifest(manifestUrl);
    hydrateShell(manifest);
    renderEnvironment(scene, manifest);
    renderPanel(scene, manifest);
    manifest.nodes.forEach((node) => renderNode(scene, node));
    renderRig(scene);
    scene.dataset.sceneId = manifest.id;
    scene.dataset.entityId = manifest.entity.id;
    scene.dataset.manifestVersion = manifest.version;
    scene.dataset.truthFeed = manifest.canonical ? 'canonical-adapter' : 'layout-manifest';
    window.dispatchEvent(new CustomEvent('4planet:xr-scene-ready', { detail: { manifest } }));
    return manifest;
  };

  window.NatureRenderer = { render };
})();
