(() => {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('value', value);
  };

  const register = () => {
    if (!window.AFRAME || window.AFRAME.components['truth-hotspot']) return;
    window.AFRAME.registerComponent('truth-hotspot', {
      schema: {
        title: { type: 'string', default: 'TRUTH NODE' },
        body: { type: 'string', default: '' },
        source: { type: 'string', default: '' },
        boundary: { type: 'string', default: '' },
        href: { type: 'string', default: '' }
      },
      init() {
        this.el.addEventListener('mouseenter', () => this.el.setAttribute('scale', '1.18 1.18 1.18'));
        this.el.addEventListener('mouseleave', () => this.el.setAttribute('scale', '1 1 1'));
        this.el.addEventListener('click', () => {
          setText('panel-title', this.data.title);
          setText('panel-body', this.data.body);
          setText('panel-source', `SOURCE · ${this.data.source}`);
          setText('panel-boundary', `BOUNDARY · ${this.data.boundary}`);
          if (this.data.href) {
            window.setTimeout(() => { window.location.assign(this.data.href); }, 650);
          }
        });
      }
    });
  };

  if (window.AFRAME) register();
  else window.addEventListener('load', register, { once: true });

  window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('xr-status');
    if (!status) return;
    try {
      if (!navigator.xr || !navigator.xr.isSessionSupported) {
        status.textContent = '3D BROWSER MODE · WEBXR NOT AVAILABLE';
        return;
      }
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      status.textContent = supported ? 'WEBXR HEADSET READY' : '3D BROWSER MODE · NO IMMERSIVE-VR DEVICE';
    } catch {
      status.textContent = '3D BROWSER MODE · XR STATUS UNAVAILABLE';
    }
  });
})();
