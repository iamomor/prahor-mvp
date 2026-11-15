/**
 * Older PROHOR workers cached development bundles under stable URLs. A server
 * navigation gets fresh HTML but could still receive old JS and CSS. This fixed
 * bootstrap runs independently of those bundles and upgrades an existing worker.
 * It never creates a worker registration or reads private records.
 */
export const homepageAssetRecovery = `(() => {
  if (!('serviceWorker' in navigator)) return;
  const workerURL = new URL('/sw.js', location.origin).href;
  let hasUserInput = false;
  let reloading = false;
  document.addEventListener('input', () => { hasUserInput = true; }, { once: true, capture: true });

  function reloadAfterUpgrade() {
    if (reloading || hasUserInput) return;
    if (navigator.serviceWorker.controller?.scriptURL !== workerURL) return;
    try {
      if (sessionStorage.getItem('prohor-public-assets-v2') === 'ready') return;
      sessionStorage.setItem('prohor-public-assets-v2', 'ready');
    } catch { /* The controller change itself prevents a repeated upgrade. */ }
    reloading = true;
    location.reload();
  }

  navigator.serviceWorker.getRegistration('/').then(registration => {
    if (!registration) return;
    const worker = registration.active || registration.waiting || registration.installing;
    if (worker?.scriptURL !== workerURL) return;
    if (navigator.serviceWorker.controller?.scriptURL === workerURL) {
      navigator.serviceWorker.addEventListener('controllerchange', reloadAfterUpgrade, { once: true });
    }
    registration.update().catch(() => {});
  }).catch(() => {});
})();`;
