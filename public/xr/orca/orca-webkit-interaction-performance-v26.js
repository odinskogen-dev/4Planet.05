(() => {
  'use strict';

  const ua = navigator.userAgent || '';
  const isWebKit = /AppleWebKit/i.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR)/i.test(ua);
  const desktop = matchMedia('(min-width:761px)').matches;
  if (!isWebKit || !desktop) return;

  const install = () => {
    const root = document.getElementById('browser-experience');
    if (!root || root.dataset.orcaWebkitInteractionProfile === 'stable-v26') return;

    root.dataset.orcaWebkitInteractionProfile = 'stable-v26';

    const style = document.createElement('style');
    style.dataset.orcaWebkitInteractionPerformanceV26 = 'true';
    style.textContent = `
      /*
        ORCA desktop WebKit performance profile.
        Static room depth, Orca media, truth UI and direct interactions remain.
        Autonomous decorative motion is subordinate to reliable input.
      */
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] *,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] *::before,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] *::after{
        animation:none!important;
        transition:none!important;
      }

      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-world,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-subject,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .light-lens-layer,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .light-lens-projection,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-photo,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-wireframe,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-room21__volume{
        will-change:auto!important;
      }

      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-journey-hud__actions button,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-entry__button,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-echo-trigger,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-chapter__next,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-chapter__close{
        transform:none!important;
        translate:none!important;
        scale:none!important;
        rotate:none!important;
        filter:none!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        will-change:auto!important;
      }

      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .nature-particles,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .light-lens-scan,
      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-echo i{
        display:none!important;
      }

      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-photo{
        transform:none!important;
      }

      #browser-experience[data-orca-webkit-interaction-profile="stable-v26"] .orca-lume-wireframe{
        transform:translate3d(3%,4%,0) scale(.88)!important;
      }
    `;
    document.head.appendChild(style);

    window.__ORCA_WEBKIT_INTERACTION_PERFORMANCE_V26 = Object.freeze({
      profile: 'stable-v26',
      scope: 'ORCA_DESKTOP_WEBKIT_ONLY',
      policy: 'INTERACTION_AND_SUBJECT_BEFORE_DECORATIVE_MOTION',
      truthChanged: false
    });
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
