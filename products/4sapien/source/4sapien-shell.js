/* FOUR_SAPIEN_SHELL_V1 — one stable shell across 4SAPIEN.
   AXE hardening of Claude candidate 2026-10-05:
   - document never drifts sideways; wide regions scroll inside themselves
   - one global world bar; legacy global navs are suppressed
   - each product's own fixed tab bar becomes a compact opaque top control
   - dialogs/overlays keep their intended translucency (never blanket-whitened)
   - ambient Embla stays above the world bar
   - Finance writes keep scroll position
   - Meg hash opens the existing Food profile until a dedicated account surface exists
*/
(function () {
  'use strict';
  var WORLDS = [
    ['today', 'I dag', '/', 'M3 11l9-8 9 8M5 10v10h14V10'],
    ['money', 'Penger', '/app/money/', 'M3 7h18v10H3zM3 11h18M7 15h3'],
    ['food', 'Mat', '/app/food/', 'M6 3v8a2 2 0 004 0V3M8 11v10M15 3c-1.5 2-2 4-2 6h4V3'],
    ['brain', 'Brain', '/brain/', 'M9 4a3 3 0 00-3 3 3 3 0 000 6 3 3 0 003 3V4zM15 4a3 3 0 013 3 3 3 0 010 6 3 3 0 01-3 3V4z'],
    ['me', 'Meg', '/app/food/#meg', 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0']
  ];

  function path() { return (location.pathname || '/').replace(/index\.html$/, ''); }
  function world() {
    var p = path();
    if (p.indexOf('/app/food') === 0 && location.hash === '#meg') return 'me';
    if (p.indexOf('/app/money') === 0 || p.indexOf('/finance') === 0) return 'money';
    if (p.indexOf('/app/food') === 0) return 'food';
    if (p.indexOf('/brain') === 0) return 'brain';
    return 'today';
  }

  function style() {
    if (document.getElementById('fs-shell-style')) return;
    var s = document.createElement('style');
    s.id = 'fs-shell-style';
    s.textContent = [
      'html,body{overflow-x:hidden;max-width:100%}',
      'body{padding-bottom:calc(68px + env(safe-area-inset-bottom,0px))!important}',
      'body.fs-has-subnav{padding-top:46px!important}',
      '[data-fs-scrollx]{overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;max-width:100vw!important}',
      '[data-fs-scrollx]::-webkit-scrollbar{display:none}',
      '#worlds,#fs-global-appnav{display:none!important}',
      'nav[data-fs-subnav]{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;z-index:88!important;',
      'display:flex!important;justify-content:center!important;overflow-x:auto!important;scrollbar-width:none!important;',
      'border-top:0!important;border-bottom:1px solid var(--line,rgba(10,10,10,.09))!important;',
      'padding:0 8px!important;background:var(--paper,#fff)!important;backdrop-filter:none!important;transform:none!important}',
      'nav[data-fs-subnav]::-webkit-scrollbar{display:none}',
      'nav[data-fs-subnav]>div{width:100%!important;max-width:760px!important;display:flex!important}',
      'nav[data-fs-subnav] button{flex:1 0 auto!important;min-width:max-content!important;padding:10px 12px!important;white-space:nowrap!important;',
      'flex-direction:row!important;gap:5px!important;font-size:11px!important}',
      'nav[data-fs-subnav] button svg{width:15px!important;height:15px!important}',
      '[data-theme="dark"] nav[data-fs-subnav]{background:#000!important;border-bottom-color:rgba(255,255,255,.14)!important}',
      '#fsWorlds{position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;justify-content:center;',
      'background:var(--paper,#fff)!important;backdrop-filter:none!important;border-top:1px solid var(--line,rgba(10,10,10,.09));',
      'padding-bottom:env(safe-area-inset-bottom,0px)}',
      '#fsWorlds .fsw{width:100%;max-width:1180px;display:flex}',
      '#fsWorlds a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;',
      'padding:9px 2px 10px;text-decoration:none;color:var(--faint,#8C867C);font-family:var(--body,"DM Sans"),system-ui;',
      'font-size:10.5px;font-weight:500;letter-spacing:.01em}',
      '#fsWorlds a[aria-current="page"]{color:var(--ink,#0A0A0A);font-weight:600}',
      '#fsWorlds a[aria-current="page"] svg{stroke:var(--money,#FF4D22)}',
      '#fsWorlds svg{stroke:var(--faint,#8C867C);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
      '#fsWorlds span{overflow:hidden;text-overflow:ellipsis;max-width:100%}',
      '[data-theme="dark"] #fsWorlds{background:#000!important;border-top-color:rgba(255,255,255,.14)}',
      '[data-theme="dark"] #fsWorlds a{color:#8C867C}',
      '[data-theme="dark"] #fsWorlds a[aria-current="page"]{color:#fff}',
      '.emblabar{bottom:calc(60px + env(safe-area-inset-bottom,0px))!important}',
      '@media(min-width:900px){#fsWorlds a{flex-direction:row;gap:8px;font-size:13px}#fsWorlds svg{width:18px;height:18px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function worldBar() {
    var old = document.getElementById('fsWorlds');
    if (old) old.remove();
    var here = world();
    var nav = document.createElement('nav');
    nav.id = 'fsWorlds';
    nav.setAttribute('aria-label', '4SAPIEN-verdener');
    nav.innerHTML = '<div class="fsw">' + WORLDS.map(function (w) {
      return '<a href="' + w[2] + '" data-world="' + w[0] + '"' + (w[0] === here ? ' aria-current="page"' : '') + '>' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="' + w[3] + '"/></svg>' +
        '<span>' + w[1] + '</span></a>';
    }).join('') + '</div>';
    document.body.appendChild(nav);
  }

  function subnav() {
    var legacy = document.getElementById('fs-global-appnav');
    if (legacy) legacy.setAttribute('aria-hidden', 'true');
    var rootWorlds = document.getElementById('worlds');
    if (rootWorlds) rootWorlds.setAttribute('aria-hidden', 'true');

    var navs = document.querySelectorAll('nav:not(#fsWorlds):not(#fs-global-appnav):not(#worlds)');
    var found = false;
    for (var i = 0; i < navs.length; i++) {
      var n = navs[i];
      if (n.closest('[role="dialog"]')) continue;
      var cs = getComputedStyle(n);
      if (n.hasAttribute('data-fs-subnav') || cs.position === 'fixed') {
        n.setAttribute('data-fs-subnav', '');
        found = true;
      }
    }
    document.body.classList.toggle('fs-has-subnav', found);
  }

  function contain(root) {
    var vw = document.documentElement.clientWidth;
    var all = (root || document.body).querySelectorAll('div,section,ul,table,header,main');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest('#fsWorlds') || el.closest('[role="dialog"]') || el.hasAttribute('data-fs-scrollx')) continue;
      var rect = el.getBoundingClientRect();
      if (el.scrollWidth > vw + 2 || rect.width > vw + 2) el.setAttribute('data-fs-scrollx', '');
    }
  }

  function opaque() {
    var all = document.querySelectorAll('body nav,body header');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.id === 'fsWorlds' || el.id === 'fs-global-appnav' || el.id === 'worlds') continue;
      var cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      var bg = cs.backgroundColor || '';
      var m = bg.match(/rgba?\(([^)]+)\)/);
      var alpha = m ? parseFloat((m[1].split(',')[3] || '1')) : 0;
      if (!m || alpha < 0.98) el.setAttribute('data-fs-opaque', '');
    }
  }

  function keepScroll() {
    var y = null;
    window.addEventListener('four-sapien-finance-record-changed', function () {
      y = window.scrollY;
      var tries = 0;
      (function restore() {
        if (y === null || tries++ > 12) return;
        if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
        requestAnimationFrame(restore);
      })();
      setTimeout(function () { y = null; }, 1200);
    });
  }

  function openHashTarget() {
    if (path().indexOf('/app/food') !== 0 || location.hash !== '#meg') return;
    var buttons = document.querySelectorAll('#root button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if ((b.textContent || '').trim() === 'Meg' && b.offsetParent !== null) {
        if (b.dataset.fsHashOpened !== '1') {
          b.dataset.fsHashOpened = '1';
          b.click();
        }
        break;
      }
    }
  }

  function landing() {
    if (path() !== '/') return;
    try {
      if (sessionStorage.getItem('fs-landed') === '1') return;
      var signedIn = false;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('sb-') === 0 && k.indexOf('auth-token') > -1 && localStorage.getItem(k)) signedIn = true;
      }
      sessionStorage.setItem('fs-landed', '1');
      if (signedIn) location.replace('/app/money/');
    } catch (e) {}
  }

  function pass() { subnav(); contain(); opaque(); openHashTarget(); }

  function boot() {
    style(); worldBar(); keepScroll(); pass();
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(pass, 140); })
      .observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(pass, 200); });
    window.addEventListener('hashchange', function () { worldBar(); setTimeout(pass, 0); });
    [400, 1200, 2500].forEach(function (ms) { setTimeout(pass, ms); });
  }

  landing();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.FourSapienShell = { pass: pass, worlds: WORLDS };
})();
