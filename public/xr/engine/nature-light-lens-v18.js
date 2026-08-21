(() => {
  const PALETTES = ['green', 'ocean', 'amber'];

  const projectionMarkup = `
    <div class="light-lens-layer" aria-hidden="true">
      <div class="light-lens-room-grid"></div>
      <div class="light-lens-horizon"></div>
      <div class="light-lens-caption">
        <span class="light-lens-caption__mode">LIGHT LENS · INTERPRETIVE MODE</span>
        <strong>ORCA <em>PROJECTED</em></strong>
        <p>Same species identity and evidence. A different visual lens for form, relationships, place and pressure.</p>
      </div>
      <div class="light-lens-projection">
        <svg class="light-lens-orca" viewBox="0 0 960 460" focusable="false">
          <g class="light-lens-orca__body">
            <path class="major" d="M75 248 C120 211 188 184 268 170 C357 154 454 156 548 175 C640 194 711 224 774 234 C824 242 869 236 907 217 C883 248 848 271 799 282 C748 293 698 294 646 307 C577 324 514 350 436 356 C350 362 267 345 198 314 C142 289 101 267 75 248Z"/>
            <path class="major" d="M523 174 C512 125 531 77 579 42 C578 97 591 139 626 192"/>
            <path class="major" d="M337 169 C305 132 273 111 228 102 C248 132 252 157 247 184"/>
            <path class="major" d="M548 334 C585 369 628 387 682 386 C648 355 639 326 649 303"/>
            <path class="major" d="M78 248 C47 231 24 208 10 180 C42 193 70 210 96 230 M78 248 C48 268 26 292 14 322 C46 306 73 288 99 266"/>
          </g>
          <g class="light-lens-orca__volume">
            <path class="soft" d="M119 244 C183 207 273 182 370 177 C478 171 588 191 699 230"/>
            <path class="soft" d="M106 259 C210 225 317 211 427 215 C533 219 621 234 714 255"/>
            <path class="soft" d="M126 279 C233 263 337 260 438 269 C522 276 587 281 651 278"/>
            <path class="soft" d="M170 302 C251 304 335 315 426 314 C500 314 557 304 603 293"/>
          </g>
          <g class="light-lens-orca__markings">
            <path class="soft" d="M694 213 C716 201 741 202 758 215 C741 231 718 237 696 230 C687 225 687 219 694 213Z"/>
            <path class="soft" d="M596 190 C623 196 650 206 675 218 C650 222 626 219 606 210 C596 205 590 197 596 190Z"/>
            <path class="soft" d="M245 292 C337 306 437 307 527 294 C483 330 419 343 350 338 C303 335 268 319 245 292Z"/>
          </g>
          <g class="light-lens-orca__mesh">
            <path class="mesh" d="M180 208 C237 226 294 262 343 326 M251 183 C311 220 360 269 399 347 M334 169 C383 217 420 278 444 354 M430 160 C462 218 480 283 482 351 M526 171 C534 230 529 287 513 338 M615 191 C603 239 581 286 551 326"/>
            <path class="mesh" d="M118 241 C239 246 367 242 493 230 C612 219 704 227 801 249 M101 264 C241 279 378 286 513 280 C618 275 696 268 758 257 M153 300 C272 310 392 318 548 301"/>
          </g>
          <circle class="light-lens-orca__eye" cx="730" cy="224" r="3.1"/>
        </svg>
        <div class="light-lens-source-note">INTERPRETIVE FORM STUDY · JOURNEY EVIDENCE REMAINS AUTHORITATIVE</div>
      </div>
      <div class="light-lens-relationship" aria-hidden="true">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" focusable="false">
          <path class="light-lens-relationship__line" d="M210 360 C390 270 570 280 790 210" />
          <circle class="light-lens-relationship__anchor" cx="210" cy="360" r="4" />
          <circle class="light-lens-relationship__target" cx="790" cy="210" r="4" />
        </svg>
        <span class="light-lens-relationship__from">ORCA</span>
        <span class="light-lens-relationship__to">FOLLOW THE SYSTEM</span>
        <span class="light-lens-relationship__truth">CURRENT JOURNEY PATH · NOT LIVE DATA</span>
      </div>
      <div class="light-lens-scan"></div>
      <span class="light-lens-axis light-lens-axis--a">FORM / SCALE</span>
      <span class="light-lens-axis light-lens-axis--b">RELATION / SIGNAL</span>
      <span class="light-lens-axis light-lens-axis--c">PLACE / OCEAN</span>
    </div>`;

  const cleanLabel = (text = '') => text.replace(/\s+/g, ' ').trim();

  function syncJourneyProjection(root, detail = {}) {
    const state = detail.state || root.dataset.sceneState || 'identity';
    const index = Number(detail.index ?? root.dataset.journeyIndex ?? 0);
    root.dataset.lightLensScene = state;
    root.dataset.lightLensIndex = String(index);

    const active = root.querySelector('.nature-node[data-journey-role="active"]');
    const next = root.querySelector('.nature-node[data-journey-role="next"]');
    const from = root.querySelector('.light-lens-relationship__from');
    const to = root.querySelector('.light-lens-relationship__to');
    const captionMode = root.querySelector('.light-lens-caption__mode');
    const captionBody = root.querySelector('.light-lens-caption p');

    const activeLabel = cleanLabel(active?.querySelector('.nature-node__label')?.textContent || root.querySelector('.nature-journey-hud__stage')?.textContent || 'ORCA');
    const nextLabel = cleanLabel(next?.querySelector('.nature-node__label')?.textContent || 'RESPONSE');
    if (from) from.textContent = activeLabel;
    if (to) to.textContent = nextLabel;
    if (captionMode) captionMode.textContent = `LIGHT LENS · ${state.toUpperCase()} · INTERPRETIVE MODE`;

    if (captionBody) {
      const sceneCopy = {
        identity: 'Form is projected as an anatomical interpretation; species identity and evidence remain unchanged beneath the lens.',
        dependency: 'The line follows the current Journey relationship. It is a visual reading of the existing evidence path, not a new ecological claim.',
        habitat: 'Projection opens the spatial system around the animal while the real Journey remains the source of place and habitat context.',
        pressure: 'Signal geometry marks the current pressure chapter without implying live intensity, causation or measured condition.',
        response: 'The projection carries the Journey into response pathways; solution and actor claims remain evidence-gated.'
      };
      captionBody.textContent = sceneCopy[state] || 'Same Journey truth. A different presentation lens.';
    }
  }

  function install(root) {
    if (!root || root.dataset.lightLensInstalled === 'true') return;
    root.dataset.lightLensInstalled = 'true';
    root.dataset.lightLens = 'false';
    root.dataset.lightLensPalette = 'green';
    root.dataset.lightLensScene = root.dataset.sceneState || 'identity';

    const stage = root.querySelector('.nature-stage');
    if (stage) stage.insertAdjacentHTML('beforeend', projectionMarkup);

    const topbar = root.querySelector('.nature-topbar__right');
    if (!topbar) return;

    const colour = document.createElement('button');
    colour.type = 'button';
    colour.className = 'light-lens-colour';
    colour.textContent = 'LIGHT · 4PLANET';
    colour.setAttribute('aria-label', 'Change Light Lens projection colour');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'light-lens-toggle';
    toggle.textContent = 'LIGHT LENS';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Toggle Light Lens projection mode');

    topbar.insertBefore(colour, topbar.firstChild);
    topbar.insertBefore(toggle, topbar.firstChild);

    const setMode = (enabled) => {
      root.dataset.lightLens = enabled ? 'true' : 'false';
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      toggle.textContent = enabled ? 'REAL WORLD' : 'LIGHT LENS';
      document.body.dataset.lightLens = enabled ? 'true' : 'false';
      syncJourneyProjection(root);
      root.dispatchEvent(new CustomEvent('4planet:light-lens-change', { detail: { enabled, palette: root.dataset.lightLensPalette } }));
    };

    toggle.addEventListener('click', () => setMode(root.dataset.lightLens !== 'true'));

    colour.addEventListener('click', () => {
      const current = PALETTES.indexOf(root.dataset.lightLensPalette || 'green');
      const next = PALETTES[(current + 1) % PALETTES.length];
      root.dataset.lightLensPalette = next;
      colour.textContent = `LIGHT · ${next === 'green' ? '4PLANET' : next.toUpperCase()}`;
      root.dispatchEvent(new CustomEvent('4planet:light-lens-change', { detail: { enabled: root.dataset.lightLens === 'true', palette: next } }));
    });

    window.addEventListener('4planet:nature-journey-scene', (event) => {
      requestAnimationFrame(() => syncJourneyProjection(root, event.detail || {}));
    });

    window.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      if (event.key.toLowerCase() === 'l' && !event.metaKey && !event.ctrlKey && !event.altKey) setMode(root.dataset.lightLens !== 'true');
    });

    syncJourneyProjection(root);
  }

  window.addEventListener('DOMContentLoaded', () => install(document.getElementById('browser-experience')), { once: true });
  window.NatureLightLens = { install, syncJourneyProjection };
})();
