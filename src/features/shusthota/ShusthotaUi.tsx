import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./ShusthotaOverview.module.css";

/** Consistent section opening: icon tile, eyebrow, title, lead and an optional status badge. */
export function SectionHeader({
    id,
    eyebrow,
    title,
    lead,
    Icon,
    badge,
    level = 2,
}: {
    id: string;
    eyebrow?: string;
    title: string;
    lead?: ReactNode;
    Icon?: LucideIcon;
    badge?: ReactNode;
    level?: 2 | 3;
}) {
    const Heading = level === 2 ? "h2" : "h3";
    return (
        <header className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                {Icon && (
                    <span className="grid size-12 shrink-0 place-items-center rounded-card bg-pro-surface text-pro-primary">
                        <Icon size={22} aria-hidden="true" />
                    </span>
                )}
                <div className="grid min-w-0 gap-1">
                    {eyebrow && <p className="pro-eyebrow tracking-normal">{eyebrow}</p>}
                    <Heading
                        id={id}
                        className={`pro-display [overflow-wrap:anywhere] ${level === 2 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
                    >
                        {title}
                    </Heading>
                    {lead && <p className="pro-muted max-w-prose leading-relaxed">{lead}</p>}
                </div>
            </div>
            {badge}
        </header>
    );
}

/** Small honest status pill (text + icon, never colour alone). */
export function StatusPill({ Icon, children, tone = "neutral" }: { Icon?: LucideIcon; children: ReactNode; tone?: "neutral" | "warning" }) {
    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-semibold ${tone === "warning" ? "border-pro-warning bg-pro-warning-soft text-pro-warning" : "border-pro-border bg-pro-elevated text-pro-text"}`}
        >
            {Icon && <Icon size={15} aria-hidden="true" />}
            {children}
        </span>
    );
}

/** The round check that fills when its tile/chip is selected. Decorative; state lives on the input. */
export function CheckBadge({ className = "" }: { className?: string }) {
    return (
        <span className={`${styles.badge} ${className}`} aria-hidden="true">
            <Check size={14} strokeWidth={3} />
        </span>
    );
}

export const fieldClass =
    "min-h-12 w-full rounded-field border-[1.5px] border-pro-control-border bg-pro-elevated px-4 text-base text-pro-text placeholder:text-pro-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";
