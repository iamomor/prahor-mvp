import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};
type ButtonProps = SharedProps & (
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
);

/** A link for navigation, a native button for an action; one visual treatment. */
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const classes = `home-button pro-button ${variant === "secondary" ? "home-button-secondary" : ""} ${className}`.trim();
  if (typeof props.href === "string") {
    return <a {...props as AnchorHTMLAttributes<HTMLAnchorElement>} className={classes}>{children}</a>;
  }
  return <button type="button" {...props as ButtonHTMLAttributes<HTMLButtonElement>} className={classes}>{children}</button>;
}
