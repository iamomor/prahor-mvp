// Fixed source only; no user text is interpolated into executable markup.
// Apply saved appearance before the homepage paints. Locale changes only when
// translated React content is ready, so language metadata stays accurate.
export const homepagePreferenceBootstrap = `(() => {
  try {
    const root = document.documentElement;
    const p = JSON.parse(localStorage.getItem('prohor-access-preferences-v1') || 'null');
    if (p && typeof p === 'object') {
      if (['quiet-garden','original-rose','morning-mist'].includes(p.theme)) root.dataset.theme = p.theme;
      if (typeof p.highContrast === 'boolean') root.dataset.contrast = p.highContrast ? 'more' : 'normal';
      if (['default','large','extra-large'].includes(p.textScale)) root.dataset.textScale = p.textScale;
      if (typeof p.spaciousLayout === 'boolean') root.dataset.layout = p.spaciousLayout ? 'spacious' : 'comfortable';
      if (typeof p.reducedMotion === 'boolean') root.dataset.motion = p.reducedMotion ? 'reduce' : 'system';
    }
    const r = JSON.parse(localStorage.getItem('prohor-home-reading-v1') || 'null');
    if (r && typeof r === 'object') {
      if (['default','rubik','roboto-slab'].includes(r.font)) root.dataset.font = r.font;
      if (['standard','relaxed'].includes(r.textSpacing)) root.dataset.textSpacing = r.textSpacing;
      if (['comfortable','compact','spacious'].includes(r.density)) root.dataset.layout = r.density;
    }
  } catch { /* Blocked storage must not prevent public access. */ }
})();`;
