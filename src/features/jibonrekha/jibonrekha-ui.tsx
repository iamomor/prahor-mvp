import type { ReactNode, RefObject } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

// One control grammar for every Jibonrekha view:
// filled pill = main action, outlined pill = other action, underlined text = link, flat tag = status (never clickable).
const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";
const pill = `inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-5 py-2 text-center font-semibold transition-colors duration-150 ${focus} disabled:cursor-not-allowed disabled:opacity-50`;
export const ui = {
  primary: `${pill} bg-pro-primary text-pro-on-primary hover:bg-pro-primary-hover`,
  secondary: `${pill} border-[1.5px] border-pro-control-border bg-pro-elevated text-pro-primary hover:bg-pro-surface`,
  danger: `${pill} border-[1.5px] border-pro-danger bg-pro-elevated text-pro-danger hover:bg-pro-danger-soft`,
  small: "min-h-11 px-4 text-sm",
  link: `inline-flex min-h-11 items-center gap-1.5 font-semibold text-pro-primary underline underline-offset-4 hover:text-pro-primary-hover ${focus}`,
  tag: "inline-flex w-fit max-w-full items-center gap-1.5 rounded-control bg-pro-surface px-2.5 py-0.5 text-sm font-semibold text-pro-text [overflow-wrap:anywhere]",
  limitedTag: "inline-flex w-fit items-center rounded-control bg-pro-warning-soft px-2.5 py-0.5 text-sm font-semibold text-pro-warning",
  input: `min-h-12 w-full min-w-0 rounded-field border-[1.5px] border-pro-control-border bg-pro-elevated px-3 py-2 text-pro-text ${focus}`,
  field: "grid gap-1.5 font-semibold",
  hint: "font-normal text-sm text-pro-muted",
  card: "rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-6",
};

/** Back link + page title shown at the top of every Jibonrekha sub-view. */
export function SubviewHeader({ title, eyebrow, description, onBack, headingRef }: {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  onBack: () => void;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  return <header className="grid gap-1">
    <nav aria-label="জীবনরেখার পথ">
      <button type="button" onClick={onBack} className={`${ui.link} -ml-1 pl-1`}>
        <ChevronLeft className="size-5" aria-hidden="true" />জীবনরেখা
      </button>
    </nav>
    {eyebrow && <p className="font-semibold text-pro-primary">{eyebrow}</p>}
    <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold leading-tight focus-visible:outline-3 focus-visible:outline-pro-focus">{title}</h1>
    {description && <p className="mt-1 max-w-[65ch] text-pro-muted">{description}</p>}
  </header>;
}

/** Large, obviously-clickable row: icon, title, hint, chevron. Renders a <button> or an <a>. */
export function ActionTile({ icon, title, hint, onClick, href, emphasis = false, external = false }: {
  icon: ReactNode;
  title: string;
  hint?: string;
  onClick?: () => void;
  href?: string;
  emphasis?: boolean;
  external?: boolean;
}) {
  const className = `group flex min-h-[4.75rem] w-full min-w-0 items-center gap-3.5 rounded-card border-[1.5px] p-3.5 text-left transition-colors duration-150 ${focus} ${emphasis
    ? "border-pro-primary bg-pro-primary text-pro-on-primary hover:bg-pro-primary-hover"
    : "border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface"}`;
  const body = <>
    <span className={`grid size-11 shrink-0 place-items-center rounded-field ${emphasis ? "bg-pro-elevated text-pro-primary" : "bg-pro-surface text-pro-primary"}`} aria-hidden="true">{icon}</span>
    <span className="grid min-w-0 flex-1">
      <span className="text-lg font-semibold leading-snug">{title}</span>
      {hint && <span className={`text-sm ${emphasis ? "text-pro-on-primary-muted" : "text-pro-muted"}`}>{hint}</span>}
    </span>
    {external
      ? <ArrowUpRight className="size-5 shrink-0 text-pro-primary" aria-hidden="true" />
      : <ChevronRight className={`size-5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none ${emphasis ? "" : "text-pro-primary"}`} aria-hidden="true" />}
  </>;
  return href ? <a href={href} className={className}>{body}</a> : <button type="button" onClick={onClick} className={className}>{body}</button>;
}

/** Native radio group drawn as a segmented pill. Keyboard: arrow keys, as any radio group. */
export function Segmented<T extends string>({ legend, name, value, options, onChange, disabled }: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return <fieldset className="grid gap-2" disabled={disabled}>
    <legend className="mb-2 font-semibold">{legend}</legend>
    <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-[1.75rem] border-[1.5px] border-pro-control-border bg-pro-elevated p-1">
      {options.map((option) => <label key={option.value} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill px-4 font-semibold transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pro-focus ${value === option.value ? "bg-pro-primary text-pro-on-primary" : "text-pro-primary hover:bg-pro-surface"}`}>
        <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="size-4 accent-pro-on-primary" />
        {option.label}
      </label>)}
    </div>
  </fieldset>;
}

/** Toggle-button row used as a view switcher (aria-pressed), e.g. the History sections. */
export function ViewSwitch<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return <div role="group" aria-label={label} className="flex flex-wrap gap-x-1 border-b-2 border-pro-border">
    {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`-mb-0.5 min-h-12 border-b-[3px] px-4 font-semibold transition-colors duration-150 ${focus} ${value === option.value ? "border-pro-primary text-pro-primary" : "border-transparent text-pro-muted hover:text-pro-text"}`}>{option.label}</button>)}
  </div>;
}
