"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Moves focus to the new page heading after client-side Shonket navigation. */
export function ShonketFocusHeading() {
  const pathname = usePathname();
  useEffect(() => {
    document.getElementById("shonket-screen-title")?.focus();
  }, [pathname]);
  return null;
}
