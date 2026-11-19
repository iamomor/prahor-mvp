/** Instant skeleton for every /app page: Next prefetches this boundary, so navigation responds immediately. */
export default function AppLoading() {
  const bar = "animate-pulse rounded-field bg-pro-surface-2 motion-reduce:animate-none";
  return (
    <div role="status" aria-live="polite" className="grid gap-6">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="grid gap-3">
        <div className={`${bar} h-5 w-32`} />
        <div className={`${bar} h-10 w-3/4 max-w-md`} />
        <div className={`${bar} h-5 w-full max-w-lg`} />
      </div>
      <div aria-hidden="true" className={`${bar} h-44 rounded-hero`} />
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
        <div className={`${bar} h-24`} />
        <div className={`${bar} h-24`} />
      </div>
    </div>
  );
}
