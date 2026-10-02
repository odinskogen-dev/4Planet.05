/* FOUR_SAPIEN_MONEY_NOW_V1 — Penger nå + handlingsrom til lønning.
   Reads ONLY public.four_sapien_finance_control_read (Finance Twin control contract).
   No new engine, no local recomputation of truth. UKJENT stays UKJENT — never 0.
   FACTS, NOT ADVICE: every number carries state + source + observed time. */
(function () {
  'use strict';
  var MOUNT = 'fsMoneyNow', EV = 'four-sapien-finance-record-changed';
  var STATE_TEXT = {
    KNOWN_RECORDED: 'Registrert av deg',
    UNKNOWN: 'Ukjent',
    STALE: 'Ikke oppdatert',
    NO_ACCOUNTS: 'Ingen konto registrert',
    UNRESOLVED_OVERDUE: 'Uavklart forfalt',
    NEXT_INCOME_UNKNOWN: 'Neste inntekt ukjent',
    MODELLED_NOT_AVAILABLE_CASH: 'Modellert, ikke bankdekning',
    TWIN_UNAVAILABLE: 'Tvillingen svarer ikke',
    UNAUTHENTICATED: 'Ikke innlogget'
  };

  function client() {
    if (window.FourSapienFinanceRuntime && window.FourSapienFinanceRuntime.controlRead) return 'runtime';
    return null;
  }
  function kr(n) {
    if (n === null || n === undefined || n === '') return null;
    var v = Number(n);
    if (!isFinite(v)) return null;
    return v.toLocaleString('nb-NO') + ' kr';
  }
  function dt(d) {
    if (!d) return null;
    var p = String(d).slice(0, 10).split('-');
    if (p.length !== 3) return null;
    return p[2] + '.' + p[1] + '.' + p[0];
  }
  function label(state) { return STATE_TEXT[state] || (state ? String(state) : 'Ukjent'); }

  function css() {
    if (document.getElementById('fs-money-now-style')) return;
    var s = document.createElement('style');
    s.id = 'fs-money-now-style';
    s.textContent = [
      '#' + MOUNT + '{margin:0 0 18px;border:1px solid var(--line,rgba(10,10,10,.09));border-radius:14px;padding:16px 16px 14px;background:transparent}',
      '#' + MOUNT + ' .mnHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px}',
      '#' + MOUNT + ' .mnTitle{font-family:var(--disp,"Instrument Sans"),system-ui;font-weight:600;letter-spacing:-.02em;font-size:1.0625rem}',
      '#' + MOUNT + ' .mnMeta,#' + MOUNT + ' .mnLab,#' + MOUNT + ' .mnChip{font-family:var(--mono,"Fragment Mono"),ui-monospace,monospace;font-size:.68rem;letter-spacing:.02em;text-transform:uppercase;color:var(--faint,#8C867C)}',
      '#' + MOUNT + ' .mnGrid{display:grid;grid-template-columns:1fr;gap:12px}',
      '@media(min-width:760px){#' + MOUNT + ' .mnGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 28px}}',
      '#' + MOUNT + ' .mnCell{border-top:1px solid var(--line,rgba(10,10,10,.09));padding-top:10px}',
      '#' + MOUNT + ' .mnVal{font-family:var(--disp,"Instrument Sans"),system-ui;font-weight:600;letter-spacing:-.03em;font-size:1.5rem;margin:4px 0 2px;color:var(--ink,#0A0A0A)}',
      '#' + MOUNT + ' .mnVal[data-truth="UNKNOWN"]{color:var(--faint,#8C867C)}',
      '#' + MOUNT + ' .mnChip{display:inline-flex;align-items:center;gap:6px}',
      '#' + MOUNT + ' .mnChip:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--money,#FF4D22)}',
      '#' + MOUNT + ' .mnChip[data-truth="UNKNOWN"]:before{background:var(--faint,#8C867C)}',
      '#' + MOUNT + ' .mnList{margin:6px 0 0;padding:0;list-style:none}',
      '#' + MOUNT + ' .mnList li{display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:.9rem;border-bottom:1px solid var(--line,rgba(10,10,10,.09));color:var(--ink,#0A0A0A)}',
      '#' + MOUNT + ' .mnNote{margin-top:12px;font-size:.8rem;color:var(--soft,#565048)}',
      '[data-theme="dark"] #' + MOUNT + '{border-color:rgba(255,255,255,.14)}',
      '[data-theme="dark"] #' + MOUNT + ' .mnVal,[data-theme="dark"] #' + MOUNT + ' .mnList li{color:var(--ink,#F4F0E8)}',
      '[data-theme="dark"] #' + MOUNT + ' .mnChip:before{background:var(--money-dark,#FF6A47)}',
      '[data-theme="dark"] #' + MOUNT + ' .mnCell,[data-theme="dark"] #' + MOUNT + ' .mnList li{border-color:rgba(255,255,255,.14)}',
      '@media(max-width:430px){#' + MOUNT + ' .mnHead{align-items:flex-start;flex-direction:column;gap:5px}#' + MOUNT + ' .mnMeta{line-height:1.35}#' + MOUNT + ' .mnList li{flex-direction:column;gap:2px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function cell(lab, value, truth, meta) {
    var v = value === null || value === undefined ? 'Ukjent' : value;
    var t = value === null || value === undefined ? 'UNKNOWN' : (truth || 'KNOWN');
    return '<div class="mnCell"><div class="mnLab">' + lab + '</div>' +
      '<div class="mnVal" data-truth="' + t + '">' + v + '</div>' +
      '<div class="mnChip" data-truth="' + t + '">' + (meta || label(truth)) + '</div></div>';
  }

  function safeText(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function view(d) {
    var money = d.money_now || {}, before = d.before_next_income || {}, overdue = d.overdue_unconfirmed || [];
    var mAmount = money.state === 'KNOWN_RECORDED' ? kr(money.amount) : null;
    var freeRoom = before.projected_without_income === null || before.projected_without_income === undefined
      ? null : kr(before.projected_without_income);
    var html = '<div class="mnHead"><div class="mnTitle">Penger nå</div>' +
      '<div class="mnMeta">Observert ' + safeText(dt(d.as_of) || 'ukjent') + ' · kilde: det du selv har ført</div></div><div class="mnGrid">';
    html += cell('Tilgjengelig nå', mAmount, money.state, money.state === 'KNOWN_RECORDED'
      ? 'Sist ført ' + safeText(dt(money.oldest_account_as_of) || 'ukjent') : label(money.state));
    html += cell('Reservert', null, 'UNKNOWN', 'Ingen bankkobling');
    html += cell('Båndlagt', null, 'UNKNOWN', 'Ingen bankkobling');
    html += cell('Neste inntekt', safeText(dt(d.next_income_date)), d.next_income_date ? 'SCHEDULED_MODELLED' : 'UNKNOWN',
      d.next_income_date ? 'Planlagt, ikke bekreftet' : 'Ukjent');
    html += cell('Handlingsrom til lønning', freeRoom, before.state,
      freeRoom ? 'Modellert · ikke bankdekning' : label(before.state));
    html += '</div>';
    if (overdue.length) {
      html += '<div class="mnCell" style="margin-top:14px"><div class="mnLab">Forfalt, ikke bekreftet betalt (' + overdue.length + ')</div><ul class="mnList">';
      overdue.slice(0, 5).forEach(function (o) {
        html += '<li><span>' + safeText(o.name || 'Uten navn') + '</span><span>' + safeText(kr(o.amount) || 'Ukjent') + ' · ' + safeText(dt(o.due_date) || 'ukjent dato') + '</span></li>';
      });
      html += '</ul><div class="mnNote">Disse er ikke trukket fra handlingsrommet før du bekrefter hva som er betalt.</div></div>';
    }
    html += '<div class="mnNote">Tall er ført av deg og ikke avstemt mot bank. Ukjent forblir ukjent — det regnes aldri som null.</div>';
    return html;
  }

  function unavailable(msg) {
    return '<div class="mnHead"><div class="mnTitle">Penger nå</div><div class="mnMeta">Ukjent</div></div>' +
      '<div class="mnCell"><div class="mnVal" data-truth="UNKNOWN">Ukjent</div>' +
      '<div class="mnChip" data-truth="UNKNOWN">' + safeText(msg) + '</div></div>';
  }

  function placeInMain(el, main) {
    if (!el || !main) return;
    var head = main.querySelector(':scope > header');
    if (head && head.nextSibling) main.insertBefore(el, head.nextSibling);
    else if (head) main.appendChild(el);
    else main.insertBefore(el, main.firstChild);
  }
  function mount() {
    var main = document.querySelector('.fs-money-main');
    var axe = document.getElementById('axeFin');
    var host = main || axe;
    if (!host) return null;
    var el = document.getElementById(MOUNT);
    if (!el) {
      el = document.createElement('section');
      el.id = MOUNT;
      el.setAttribute('aria-label', 'Penger nå');
      if (main) placeInMain(el, main);
      else axe.insertBefore(el, axe.firstChild);
    } else if (main && !main.contains(el)) {
      placeInMain(el, main);
    }
    return el;
  }

  var seq = 0;
  async function refresh() {
    var el = mount();
    if (!el || !client()) return;
    var my = ++seq;
    try {
      var d = await window.FourSapienFinanceRuntime.controlRead(30);
      if (my !== seq) return;
      if (!d || d.state !== 'AVAILABLE') {
        el.innerHTML = unavailable(label(d && (d.twin_state || d.state)));
        el.setAttribute('data-truth', 'UNKNOWN');
        return;
      }
      el.innerHTML = view(d);
      el.setAttribute('data-truth', (d.money_now && d.money_now.state) || 'UNKNOWN');
    } catch (e) {
      if (my !== seq) return;
      el.innerHTML = unavailable('Kunne ikke hentes. Prøv igjen.');
      el.setAttribute('data-truth', 'UNKNOWN');
    }
  }

  function boot() {
    css();
    refresh();
    window.addEventListener(EV, function () { setTimeout(refresh, 160); });
    window.addEventListener('four-sapien-finance-twin', function () { setTimeout(refresh, 0); });
    var root=document.getElementById('root'), remountTimer=null;
    if(root)new MutationObserver(function(){
      var el=document.getElementById(MOUNT), main=document.querySelector('.fs-money-main');
      if(el && (!main || main.contains(el)))return;
      clearTimeout(remountTimer);
      remountTimer=setTimeout(refresh,60);
    }).observe(root,{childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 200); });
  else setTimeout(boot, 200);
  window.FourSapienMoneyNow = { refresh: refresh, render: view, mount: mount };
})();
