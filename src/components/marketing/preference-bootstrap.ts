// Fixed source only; no user text is interpolated into executable markup.
// Apply saved appearance before the first paint. Contrast follows the OS until a
// version 2 preference explicitly records "more" or "standard".
export const homepagePreferenceBootstrap = `(() => {
  try {
    const root = document.documentElement;
    if (root.dataset.prohorBootstrapped === "true") return;
    root.dataset.prohorBootstrapped = "true";
    const p = JSON.parse(localStorage.getItem('prohor-access-preferences-v1') || 'null');

    // ── Appearance (theme) ──
    if (p && ['quiet-garden','original-rose','morning-mist'].includes(p.theme)) {
      root.dataset.theme = p.theme;
    }
    const path = window.location.pathname;
    const isMotherRoute = path === '/app' || path.startsWith('/app/') ||
      path === '/ask' || path.startsWith('/ask/') ||
      path === '/find-care' || path.startsWith('/find-care/');
    if (isMotherRoute) {
      root.lang = p && (p.language === 'en' || p.language === 'bn') ? p.language : 'bn';
    } else if (path === '/') {
      // The public homepage owns its locale through HomeContext; saved locale
      // is safe to apply before that client context hydrates.
      root.lang = p && (p.language === 'en' || p.language === 'bn') ? p.language : 'en';
    }

    // ── Contrast ──
    const contrastMedia = window.matchMedia?.('(prefers-contrast: more)');
    const applyContrast = () => {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem('prohor-access-preferences-v1') || 'null');
      } catch { /* Invalid or unavailable storage follows the OS preference. */ }

      const explicitVersionedChoice = saved && typeof saved._schemaVersion === 'number' &&
        saved._schemaVersion >= 2 &&
        typeof saved.highContrast === 'boolean';
      // Preserve the only unambiguous legacy selection (true). Version 1 false
      // was also the default, so migrate it as unset instead of overriding OS.
      const legacyMoreChoice = saved && saved._schemaVersion !== 2 && saved.highContrast === true;

      if (explicitVersionedChoice || legacyMoreChoice) {
        root.dataset.contrast = saved.highContrast ? 'more' : 'standard';
      } else if (contrastMedia?.matches) {
        root.dataset.contrast = 'more';
      } else {
        delete root.dataset.contrast;
      }
    };
    applyContrast();
    contrastMedia?.addEventListener('change', applyContrast);
    window.addEventListener('storage', event => {
      if (event.key === 'prohor-access-preferences-v1' || event.key === null) applyContrast();
    });

    // ── Text scale ──
    // Only set when non-default to avoid overriding CSS defaults.
    if (p && ['large','extra-large'].includes(p.textScale)) {
      root.dataset.textScale = p.textScale;
    }

    // ── Layout density ──
    // Write only non-default values; absent = comfortable.
    const hasCanonicalLayout = p &&
      ['comfortable','compact','spacious'].includes(p.layoutDensity);
    if (hasCanonicalLayout) {
      root.dataset.layout = p.layoutDensity;
    } else if (p && p.spaciousLayout === true) {
      root.dataset.layout = 'spacious';
    }

    // ── Motion ──
    // Write only when explicitly reduced; absent = follow OS prefers-reduced-motion.
    if (p && p.reducedMotion === true) {
      root.dataset.motion = 'reduce';
    }

    // ── Focused view ──
    if (p && p.focusedView === true) {
      root.dataset.focused = 'true';
    }

    // ── Reading sub-preferences (font, text spacing, density from reading store) ──
    const r = JSON.parse(localStorage.getItem('prohor-home-reading-v1') || 'null');
    if (r && typeof r === 'object') {
      if (['rubik','noto-serif','roboto-slab'].includes(r.font)) {
        // Only write non-default font presets; absent = default.
        root.dataset.font = r.font;
      }
      if (r.textSpacing === 'relaxed') root.dataset.textSpacing = 'relaxed';
      if (!hasCanonicalLayout && ['comfortable','compact','spacious'].includes(r.density)) {
        // Migrate the legacy reading-store density until the canonical access
        // preference has been written.
        root.dataset.layout = r.density;
      }
    }
  } catch { /* Blocked storage must not prevent public access. */ }
})();`;
