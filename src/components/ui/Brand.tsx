import Link from "next/link";
import { ProhorMark } from "./ProhorMark";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      prefetch={false}
      className="inline-flex items-center gap-3 font-bold tracking-tight text-pro-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-pro-focus"
    >
      <ProhorMark size={compact ? 36 : 44} />

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
