import type { ReactNode } from "react";

type ScreenReaderOnlyProps = {
  children: ReactNode;
  /** When true renders as an inline span; default is div. */
  as?: "span" | "div" | "p";
};

/**
 * ScreenReaderOnly — renders children that are visually hidden but accessible
 * to screen readers. Use for supplementary context that sighted users get
 * from surrounding visual layout.
 *
 * Uses the standard CSS clip technique (not display:none or visibility:hidden).
 */
export function ScreenReaderOnly({
  children,
  as: Tag = "span",
}: ScreenReaderOnlyProps) {
  return (
    <Tag
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </Tag>
  );
}
