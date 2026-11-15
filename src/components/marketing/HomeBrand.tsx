import Link from "next/link";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export function ProhorSymbol({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M7 29a17 17 0 0 1 34 0M13 29a11 11 0 0 1 22 0M7 35h34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 5v4M7 12l3 3M41 12l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="28" r="3" fill="currentColor" />
    </svg>
  );
}

export function HomeBrand() {
  const { t } = useHome();
  return (
    <Link className="home-brand" href="/" aria-label={t(copy("PROHOR home", "প্রহর প্রথম পাতা"))}>
      <ProhorSymbol />
      <span lang="en">PROHOR</span>
      <span className="home-brand-divider" aria-hidden="true">|</span>
      <span className="home-brand-bangla" lang="bn">প্রহর</span>
    </Link>
  );
}
