import { words } from "./QuickAnswers";

export function WorkflowProgress({ language, current }: { language: "bn" | "en"; current: "add" | "check" | "learn" | "save" | "done" }) {
  const w = (bn: string, en: string) => words(language, bn, en);
  const steps = [
    ["add", w("রিপোর্ট", "Report")],
    ["check", w("যাচাই", "Check")],
    ["learn", w("বুঝুন", "Understand")],
    ["save", w("সংরক্ষণ", "Save")],
  ] as const;
  const activeIndex = current === "done" ? 3 : steps.findIndex(([step]) => step === current);
  return <ol className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4" lang={language} aria-label={w("রিপোর্টের ধাপ", "Report progress")}>
    {steps.map(([step, label], index) => <li key={step} aria-current={index === activeIndex ? "step" : undefined} className={index === activeIndex ? "min-w-0 font-semibold text-pro-text" : "min-w-0 text-pro-muted"}>
      <span aria-hidden="true" className={index <= activeIndex ? "mb-1 block h-1 rounded-control bg-pro-primary" : "mb-1 block h-1 rounded-control bg-pro-border"} />
      <span className="[overflow-wrap:anywhere]">{label}</span>
    </li>)}
  </ol>;
}
