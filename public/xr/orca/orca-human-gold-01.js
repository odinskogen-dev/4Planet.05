(() => {
  const copy = {
    kicker: 'OCE4N_ · ORCA JOURNEY',
    title: 'Meet the orca.',
    intro: 'Meet one life first. Then follow the living system around it — food, place, pressure, evidence and response.',
    cta: 'MEET THE ORCA',
  };
  const subjectAsset = '/assets/species/orca/lume-orca-v1.png';
  const subjectDisclosure = 'AI-GENERATED SPECIES VISUALISATION · NOT EVIDENCE / NOT A PHOTOGRAPH';

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

  const applyRecoveredSubject = () => {
    const root = document.getElementById('browser-experience');
    const image = root?.querySelector('.nature-subject__image');
    const boundary = root?.querySelector('.nature-subject__boundary');
    if (image && !image.src.endsWith(subjectAsset)) {
      image.src = subjectAsset;
      image.alt = 'Generated natural-history visualisation of a full-body Orca, Orcinus orca';
    }
    if (boundary) boundary.textContent = subjectDisclosure;
  };

  const applyOrcaFirstScene = () => {
    const root = document.getElementById('browser-experience');
    const stage = root?.querySelector('.nature-journey-hud__stage');
    const title = root?.querySelector('.nature-journey-hud__title');
    if (!stage || !title) return;
    if (stage.textContent?.trim().startsWith('01 /') && /meet one life/i.test(title.textContent || '')) {
      title.textContent = copy.title;
    }
  };

  const applyPlaceHandoff = () => {
    const root = document.getElementById('browser-experience');
    const bay = root?.querySelector('.nature-topbar__right > a[href="/ecosystem/bay-of-biscay/"]');
    if (!root || !(bay instanceof HTMLElement)) return;

    const compact = window.matchMedia('(max-width: 760px)').matches;
    if (compact && root.dataset.entered === 'true') {
      bay.style.setProperty('display', 'inline-flex', 'important');
      bay.style.setProperty('align-items', 'center');
    } else {
      bay.style.removeProperty('display');
      bay.style.removeProperty('align-items');
    }
  };

  const applyComposition = () => {
    applyHumanFirstEntry();
    applyRecoveredSubject();
    applyOrcaFirstScene();
    applyPlaceHandoff();
  };

  const boot = () => {
    applyComposition();
    const root = document.getElementById('browser-experience');
    if (!root) return;

    const observer = new MutationObserver(() => {
      applyComposition();
      if (document.body.dataset.browserReady === 'failed') {
        applyComposition();
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-browser-ready', 'data-entered', 'src'],
    });

    const journeyObserver = new MutationObserver(applyOrcaFirstScene);
    const hud = root.querySelector('.nature-journey-hud');
    if (hud) {
      journeyObserver.observe(hud, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-visible'],
      });
    }

    const compactQuery = window.matchMedia('(max-width: 760px)');
    compactQuery.addEventListener?.('change', applyPlaceHandoff);

    root.dataset.humanGoldCandidate = '01';
    root.dataset.humanQualityAuthority = 'founder-first';
    root.dataset.subjectSource = 'lume-orca-v1';
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();