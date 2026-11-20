import Link from "next/link";
import { ProhorMark } from "@/components/ui/ProhorMark";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export function ProhorSymbol({ className = "" }: { className?: string }) {
  return <ProhorMark className={className} />;
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
