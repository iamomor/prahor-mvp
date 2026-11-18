import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

type AppButtonProps = SharedProps &
  (
    | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; type?: never })
    | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  );

const variantClasses: Record<NonNullable<SharedProps["variant"]>, string> = {
  primary:
    "bg-pro-primary text-pro-on-primary border border-transparent hover:bg-pro-primary-hover active:scale-[0.98] shadow-sm",
  secondary:
    "bg-pro-elevated text-pro-text border border-pro-border hover:bg-pro-surface hover:border-pro-control-border active:scale-[0.98]",
  ghost:
    "bg-transparent text-pro-primary border border-transparent hover:bg-pro-surface active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<SharedProps["size"]>, string> = {
  // Phase 1 P0: min-h-11 = 44px at 100% root font size — WCAG 2.5.8 minimum target size.
  // Was min-h-10 (40px) which fell below the 44px design rule.
  sm: "min-h-11 px-3 text-sm gap-1.5",
  md: "min-h-12 px-5 text-base gap-2",
  lg: "min-h-14 px-7 text-lg gap-2.5",
};

/**
 * AppButton — renders a semantic `<button>` for actions or `<a>` for navigation.
 * Never use a `<div>` with an onClick handler in PROHOR.
 *
 * Usage:
 *   <AppButton variant="primary" onClick={handleSave}>Save</AppButton>
 *   <AppButton href="/app/adapt">Open settings</AppButton>
 */
export function AppButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: AppButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-pill font-semibold font-control transition-all duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none";

  const classes = [base, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");

  if (typeof props.href === "string") {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
