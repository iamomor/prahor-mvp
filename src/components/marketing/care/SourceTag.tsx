"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { WHO_SOURCE } from "../product/content";

const WARNING_SOURCE =
  "https://www.cdc.gov/hearher/maternal-warning-signs/index.html";

export function SourceTag({ warning = false }: { warning?: boolean }) {
  return (
    <Link
      className="care-source font-tag"
      href={warning ? WARNING_SOURCE : WHO_SOURCE}
      target="_blank"
      rel="noreferrer"
      lang="en"
    >
      <BookOpen size={15} aria-hidden="true" />
      <span>
        {warning ? "CDC · Warning signs" : "WHO · Antenatal care, 2016"}
      </span>
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="home-sr-only">Opens in a new tab</span>
    </Link>
  );
}
