import type { ElementType, ReactNode } from "react";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** If true, renders with a subtle shadow; default uses border only. */
  elevated?: boolean;
};

/**
 * AppCard — a semantic section wrapper using PROHOR design tokens.
 * Uses --pro-pad-card which adapts with the layout density preference.
 */
export function AppCard({
  children,
  className = "",
  as: Tag = "div",
  elevated = false,
}: AppCardProps) {
  const base = `rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] ${
    elevated ? "shadow-pro-3" : "shadow-pro-1"
  }`;
  return (
    <Tag className={[base, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
