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
            <path class="major" d="M56 241 C82 197 133 166 202 151 C296 131 407 136 513 157 C626 179 716 203 792 205 C842 206 886 192 925 166 C904 199 874 224 833 238 C879 249 908 272 927 302 C886 279 842 267 793 270 C716 275 638 301 545 325 C437 353 326 359 233 337 C154 318 95 286 63 256 C57 251 54 246 56 241Z"/>
            <path class="major" d="M507 157 C501 114 516 71 555 33 C562 84 580 126 616 174"/>
            <path class="major" d="M440 329 C468 367 506 390 557 402 C520 365 509 336 520 307"/>
            <path class="major" d="M63 246 C38 233 18 214 6 191 C31 201 55 216 79 234 M64 251 C39 267 19 288 8 312 C34 300 58 284 81 266"/>
          </g>
          <g class="light-lens-orca__markings">
            <path class="soft" d="M708 196 C725 181 750 177 772 188 C758 205 736 214 714 211 C704 208 701 202 708 196Z"/>
            <path class="soft" d="M614 181 C643 181 672 188 700 201 C675 209 649 209 625 202 C614 198 607 190 614 181Z"/>
            <path class="soft" d="M229 282 C305 306 387 316 475 308 C445 337 397 349 339 344 C287 340 250 319 229 282Z"/>
          </g>
          <g class="light-lens-orca__volume">
            <path class="soft" d="M99 234 C171 194 270 167 380 160 C493 153 603 173 724 208"/>
            <path class="soft" d="M86 251 C196 218 315 205 433 209 C548 214 647 230 744 248"/>
            <path class="soft" d="M101 273 C211 260 326 260 440 270 C536 279 625 281 708 266"/>
            <path class="soft" d="M149 302 C242 310 338 321 441 316 C513 313 574 300 626 282"/>
          </g>
          <g class="light-lens-orca__mesh">
            <path class="mesh" d="M155 190 C222 218 282 264 330 327 M230 161 C300 207 355 266 393 343 M318 145 C374 205 414 273 437 351 M411 143 C449 207 468 277 471 349 M501 155 C514 219 511 281 495 337 M590 172 C586 225 568 280 536 326"/>
            <path class="mesh" d="M93 231 C223 238 358 235 493 225 C621 215 723 222 824 241 M82 257 C224 274 368 283 511 278 C624 274 708 264 782 249 M139 298 C266 312 395 320 566 296"/>
          </g>
          <circle class="light-lens-orca__eye" cx="744" cy="203" r="3.1"/>
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
