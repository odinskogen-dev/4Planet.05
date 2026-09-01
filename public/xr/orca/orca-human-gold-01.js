(() => {
  const copy = {
    kicker: 'OCE4N_ · ORCA JOURNEY',
    title: 'Meet the orca.',
    intro: 'Meet one life first. Then follow the living system around it — food, place, pressure, evidence and response.',
    cta: 'MEET THE ORCA',
  };

  const applyHumanFirstEntry = () => {
    const root = document.getElementById('browser-experience');
    if (!root || root.dataset.entered === 'true') return;
    const kicker = root.querySelector('.nature-entry__kicker');
    const title = root.querySelector('.nature-entry__title');
    const intro = root.querySelector('.nature-entry__intro');
    const cta = root.querySelector('.nature-entry__button');
    if (kicker) kicker.textContent = copy.kicker;
    if (title) title.textContent = copy.title;
    if (intro) intro.textContent = copy.intro;
    if (cta) cta.textContent = copy.cta;
  };

  const boot = () => {
    applyHumanFirstEntry();
    const root = document.getElementById('browser-experience');
    if (!root) return;

    const observer = new MutationObserver(() => {
      applyHumanFirstEntry();
      if (document.body.dataset.browserReady === 'true' || document.body.dataset.browserReady === 'failed') observer.disconnect();
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-browser-ready'] });

    root.dataset.humanGoldCandidate = '01';
    root.dataset.humanQualityAuthority = 'founder-first';
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();