"use client";

import { type ReactNode } from "react";
import { SampleTag } from "../product/ScreenFrame";

export function Preview({
  children,
  description,
}: {
  children: ReactNode;
  description: string;
}) {
  return (
    <div
      className="care-screen"
      role="img"
      aria-label={`Sample data. ${description}`}
    >
      <div className="care-screen-tag">
        <SampleTag />
      </div>
      <div className="care-static-screen" aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}
