(() => {
  const ALLOWED = {
    jaguar: '/journey/jaguar/premium-v17.json',
    orca: '/journey/orca/premium-v17.json'
  };
  const params = new URLSearchParams(location.search);
  const journey = ALLOWED[params.get('journey')] ? params.get('journey') : 'jaguar';
  const root = document.querySelector('.si');
  const text = (selector, value) => { const node = document.querySelector(selector); if (node && value) node.textContent = value; };

  const render = async () => {
    try {
      const response = await fetch(ALLOWED[journey], { credentials:'same-origin' });
      if (!response.ok) throw new Error(`Solutions config failed: ${response.status}`);
      const config = await response.json();
      const scene = config?.scenes?.response;
      if (!scene) throw new Error('Response scene missing');
      root.dataset.journey = journey;
      text('.si__journey', journey.toUpperCase());
      text('.si__title', scene.title);
      text('.si__intro', scene.body);
      text('.si__truth', scene.truthLabel || 'SOURCE-AWARE PROTOTYPE');

      const summary = document.querySelector('.si__summary');
      summary.innerHTML = '';
      (scene.items || []).slice(0,3).forEach((item) => {
        const node = document.createElement('div');
        node.innerHTML = `<b>${item.state || 'CONTEXT'}</b><span>${item.label}<br>${item.note || ''}</span>`;
        summary.appendChild(node);
      });

      const roles = document.querySelector('.si__roles');
      roles.innerHTML = '';
      (scene.actorRoles || []).forEach((role) => {
        const node = document.createElement('div');
        node.className = 'si__role';
        node.innerHTML = `<b>${role}</b><small>ROLE CATEGORY · NOT A PARTNER, ENDORSEMENT OR DELIVERY CLAIM</small>`;
        roles.appendChild(node);
      });

      const modules = document.querySelector('.si__modules');
      modules.innerHTML = '';
      (scene.modules || []).forEach((item, index) => {
        const node = document.createElement(item.href?.startsWith('/') ? 'a' : 'div');
        node.className = 'si__module';
        if (item.href?.startsWith('/')) node.href = item.href;
        node.innerHTML = `<span>${String(index+1).padStart(2,'0')} · PATHWAY</span><b>${item.label}</b><small>${item.state || 'REVIEW REQUIRED'} →</small>`;
        modules.appendChild(node);
      });

      const back = document.querySelector('.si__back');
      back.href = `/journey/${journey}/`;
      const species = document.querySelector('.si__species');
      species.href = `/species/${journey}`;
      document.body.dataset.ready = 'true';
    } catch (error) {
      document.body.dataset.ready = 'failed';
      document.querySelector('.si__modules').innerHTML = '<div class="si__empty">SOURCE-AWARE RESPONSE PATHWAY FAILED CLOSED.</div>';
      console.error('[4PLANET SOLUTIONS INTELLIGENCE]', error);
    }
  };
  render();
})();
