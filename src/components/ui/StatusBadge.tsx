/**
 * StatusBadge — a reusable status indicator that communicates meaning through
 * icon + text label + colour. Never relies on colour alone (WCAG 1.4.1).
 *
 * Usage:
 *   <StatusBadge status="working" />
 *   <StatusBadge status="prototype" />
 */

import {
  CheckCircle2,
  FlaskConical,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatusValue = "working" | "prototype" | "limited" | "future";

type StatusConfig = {
  icon: LucideIcon;
  label: string;
  /** Bangla label used in aria-label for bilingual SR experience */
  labelBn: string;
  badgeCls: string;
};

const STATUS_MAP: Record<StatusValue, StatusConfig> = {
  working: {
    icon: CheckCircle2,
    label: "Working",
    labelBn: "কার্যকর",
    badgeCls: "bg-pro-success-soft text-pro-success",
  },
  prototype: {
    icon: FlaskConical,
    label: "Prototype",
    labelBn: "প্রোটোটাইপ",
    badgeCls: "bg-pro-info-soft text-pro-info",
  },
  limited: {
    icon: AlertTriangle,
    label: "Limited",
    labelBn: "সীমিত",
    badgeCls: "bg-pro-warning-soft text-pro-warning",
  },
  future: {
    icon: Clock,
    label: "Future",
    labelBn: "ভবিষ্যৎ",
    badgeCls: "bg-pro-surface text-pro-muted",
  },
};

type StatusBadgeProps = {
  status: StatusValue;
  /** Suppress the icon for very compact inline contexts; defaults to true */
  showIcon?: boolean;
  className?: string;
};

/**
 * StatusBadge communicates status through icon, text, and colour.
 * Colour alone is never the sole indicator (WCAG 1.4.1 / design.md §4.2).
 *
 * aria-label includes the English label for screen readers.
 * The icon is aria-hidden; the text span carries the visible + SR meaning.
 */
export function StatusBadge({
  status,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const cfg = STATUS_MAP[status];
  const Icon = cfg.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold",
        cfg.badgeCls,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`Status: ${cfg.label}`}
    >
      {showIcon && (
        <Icon
          size={12}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      <span>{cfg.label}</span>
    </span>
  );
}
