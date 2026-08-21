(() => {
  const NOAA_ORCA = {
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Orcinus_orca_NOAA.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Orcinus_orca_NOAA.jpg',
    credit: 'NOAA',
    rights: 'PUBLIC DOMAIN',
    note: 'REAL ORCA PHOTO BASE · PROJECTION TREATMENT IS INTERPRETIVE'
  };

  function installPhotoBase(root) {
    const projection = root?.querySelector('.light-lens-projection');
    if (!projection || projection.querySelector('.orca-lume-photo')) return;

    const frame = document.createElement('figure');
    frame.className = 'orca-lume-photo';
    frame.innerHTML = `
      <img src="${NOAA_ORCA.src}" alt="" referrerpolicy="no-referrer" />
      <span class="orca-lume-photo__wash" aria-hidden="true"></span>
      <span class="orca-lume-photo__contour" aria-hidden="true"></span>
      <figcaption>
        <a href="${NOAA_ORCA.source}" target="_blank" rel="noreferrer">${NOAA_ORCA.credit} · ${NOAA_ORCA.rights}</a>
        <span>${NOAA_ORCA.note}</span>
      </figcaption>`;
    projection.prepend(frame);

    const vector = projection.querySelector('.light-lens-orca');
    if (vector) {
      vector.classList.add('orca-lume-wireframe');
      vector.setAttribute('aria-hidden', 'true');
    }

    root.dataset.orcaLumePhoto = 'noaa-public-domain';
  }

  function install(root) {
    if (!root || root.dataset.orcaLumeInstalled === 'true') return;
    root.dataset.orcaLumeInstalled = 'true';
    installPhotoBase(root);

    root.addEventListener('4planet:light-lens-change', () => installPhotoBase(root));
    window.addEventListener('4planet:nature-journey-scene', () => requestAnimationFrame(() => installPhotoBase(root)));
  }

  window.addEventListener('DOMContentLoaded', () => install(document.getElementById('browser-experience')), { once:true });
  window.OrcaLume19 = { install, installPhotoBase, media: NOAA_ORCA };
})();
