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
        <svg class="light-lens-orca" viewBox="0 0 900 430" focusable="false">
          <g class="light-lens-orca__body">
            <path class="major" d="M84 242 C151 176 278 132 407 137 C526 142 601 164 678 194 C738 216 792 217 836 199 C804 232 766 252 714 258 C639 267 579 285 517 310 C430 346 326 344 239 316 C171 294 116 270 84 242Z"/>
            <path class="major" d="M427 138 C414 96 430 60 471 38 C470 86 486 115 522 146"/>
            <path class="major" d="M303 155 C260 118 233 96 184 94 C211 125 218 149 214 176"/>
            <path class="major" d="M522 310 C555 345 592 365 642 370 C617 337 613 311 622 281"/>
            <path class="major" d="M83 242 C49 221 37 194 31 166 C66 184 91 200 113 221 M83 242 C49 265 37 293 31 321 C67 302 92 283 116 263"/>
          </g>
          <g class="light-lens-orca__volume">
            <path d="M139 229 C205 184 306 157 408 159 C512 161 603 182 704 220"/>
            <path d="M124 244 C219 205 315 188 414 189 C513 190 594 205 676 231"/>
            <path d="M131 261 C229 238 327 226 425 228 C513 230 578 238 635 252"/>
            <path d="M159 281 C245 278 335 281 426 279 C495 278 548 274 590 266"/>
          </g>
          <g class="light-lens-orca__mesh">
            <path class="mesh" d="M189 190 C251 222 300 256 346 309 M249 160 C309 202 358 254 394 330 M332 142 C378 198 412 257 432 337 M427 139 C457 193 475 255 477 326 M513 150 C519 209 514 261 503 313 M590 168 C576 216 556 260 532 305"/>
            <path class="mesh" d="M129 229 C243 236 361 234 482 225 C596 216 681 221 769 236 M111 255 C244 268 369 275 497 269 C591 265 661 258 714 249 M166 292 C269 297 376 302 517 286"/>
            <path class="soft" d="M642 188 C657 174 677 169 698 174 M649 237 C672 248 696 246 715 236"/>
          </g>
          <circle class="light-lens-orca__eye" cx="684" cy="211" r="3.3"/>
        </svg>
        <div class="light-lens-source-note">INTERPRETIVE FORM · JOURNEY EVIDENCE REMAINS AUTHORITATIVE</div>
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
        identity: 'Form is projected; species identity and evidence remain unchanged beneath the lens.',
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

    // Keyboard access for exhibition / desktop testing. Does not intercept form fields.
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
