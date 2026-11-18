import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      prefetch={false}
      className="inline-flex items-center gap-3 font-bold tracking-tight text-pro-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-pro-focus"
    >
      {/* Sleek rounded icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pro-surface text-pro-primary shadow-xs border border-pro-border">
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-serif font-extrabold tracking-tight text-pro-text ${
              compact ? "text-lg" : "text-xl"
            }`}
            style={{
              fontFamily:
                'var(--font-roboto-slab, "Roboto Slab"), Georgia, serif',
            }}
          >
            PROHOR
          </span>
          <span
            lang="bn"
            className="text-xs font-normal text-pro-muted"
            style={{
              fontFamily:
                'var(--font-noto-sans-bn, "Noto Sans Bengali"), sans-serif',
            }}
          >
            প্রহর
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-pro-muted mt-1 leading-none">
          Bangla AI Maternal Care
        </span>
      </div>
    </Link>
  );
}
