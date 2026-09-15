(() => {
  'use strict';
  if (window.__4PLANET_MEANINGFUL_USE_BOOTED) return;
  window.__4PLANET_MEANINGFUL_USE_BOOTED = true;

  const productionHosts = new Set([
    '4planet.org','www.4planet.org','s4piens.com','www.s4piens.com','4species.com','www.4species.com','4planetmagazine.com','www.4planetmagazine.com','4planetmarket.com','www.4planetmarket.com','cre4tors.com','www.cre4tors.com'
  ]);
  const isProduction = productionHosts.has(location.hostname);
  const surface = location.pathname.startsWith('/journey/orca') ? 'orca_journey'
    : location.pathname.startsWith('/journey/jaguar') ? 'jaguar_journey'
    : location.pathname.startsWith('/ecosystem/bay-of-biscay') ? 'bay_of_biscay_ecosystem'
    : 'unknown';

  const emit = (name, detail = {}) => {
    const payload = { event_name: name, surface, path: location.pathname, ...detail };
    window.__4PLANET_LAST_MEANINGFUL_USE = payload;
    window.dispatchEvent(new CustomEvent('4planet:meaningful-use', { detail: payload }));
    if (!isProduction) return;
    if (typeof window.gtag === 'function') window.gtag('event', name, payload);
    else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name, ...payload });
  };

  const text = (node) => (node?.textContent || '').trim().replace(/\s+/g, ' ');
  const closestAction = (target) => target?.closest?.('button,a');

  document.addEventListener('click', (event) => {
    const action = closestAction(event.target);
    if (!action) return;
    const label = text(action).toLowerCase();
    const href = action.getAttribute('href') || '';

    if (label.includes('enter the living ocean') || label.includes('enter the living system')) {
      emit('journey_entry');
      return;
    }
    if (label.includes('how do we know')) {
      emit('evidence_open');
      return;
    }
    if (label.includes('follow the system') || label.includes('continue to solutions')) {
      const stage = document.querySelector('.nature-journey-hud__stage,#chapter-kicker');
      emit(label.includes('continue to solutions') ? 'journey_complete' : 'journey_advance', { stage: text(stage) || 'unknown' });
      return;
    }
    if (label === 'lume' || label.includes('lume room') || label.includes('real world')) {
      emit('lume_toggle', { target_state: label.includes('real world') ? 'real_world' : 'lume' });
      return;
    }
    if (href.includes('/ecosystem/bay-of-biscay')) {
      emit('ecosystem_handoff', { target: 'bay_of_biscay' });
      return;
    }
    if (href.includes('/journey/orca')) {
      emit('journey_handoff', { target: 'orca_journey' });
      return;
    }
    if (href.includes('/atlas')) {
      emit('atlas_handoff');
    }
  }, { capture: true });

  window.addEventListener('4planet:nature-journey-scene', (event) => {
    const d = event.detail || {};
    if (typeof d.index === 'number') emit('journey_scene_view', { scene_index: d.index + 1, scene_id: d.node?.id || d.id || 'unknown' });
  });
})();
