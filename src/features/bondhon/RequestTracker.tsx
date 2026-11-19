"use client";
import { Check, Circle } from "lucide-react";
import type { SupportRequestStatus } from "@/lib/contracts/bondhon";
import { useLanguage } from "@/i18n/use-language";

const steps = [
  { status: "submitted", en: "Saved to PROHOR", bn: "প্রহরে সংরক্ষিত" },
  { status: "delivered", en: "Delivered to demo care queue", bn: "ডেমো সেবা তালিকায় পৌঁছেছে" },
  { status: "acknowledged", en: "A provider acknowledged it", bn: "একজন সেবাদাতা দেখেছেন" },
  { status: "responded", en: "A provider responded", bn: "সেবাদাতা উত্তর দিয়েছেন" },
] as const;
const order: Record<SupportRequestStatus, number> = { submitted: 0, delivered: 1, acknowledged: 2, responded: 3, closed: -1 };

/** Status text on every step (never colour alone). Only renders states the server returned. */
export function RequestTracker({ status, updatedAt }: { status: SupportRequestStatus; updatedAt: string }) {
  const { t } = useLanguage();
  const time = new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(updatedAt));
  if (status === "closed") return <p className="font-semibold">{t({ en: "Closed", bn: "বন্ধ" })} · <span className="font-normal text-pro-muted">{time}</span></p>;
  const reached = order[status];
  return <ol className="grid gap-2" aria-label={t({ en: "Request progress", bn: "অনুরোধের অগ্রগতি" })}>
    {steps.map((step, index) => {
      const done = index <= reached;
      return <li key={step.status} className="flex items-start gap-3">
        <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-pill border-2 ${done ? "border-pro-primary bg-pro-primary text-pro-on-primary" : "border-pro-control-border text-pro-muted"}`}>
          {done ? <Check size={14} aria-hidden="true" /> : <Circle size={8} aria-hidden="true" />}
        </span>
        <span>
          <span className={done ? "font-semibold" : "text-pro-muted"}>{t({ en: step.en, bn: step.bn })}</span>
          <span className="block text-sm text-pro-muted">{done ? (index === reached ? time : t({ en: "Done", bn: "সম্পন্ন" })) : t({ en: "Pending", bn: "অপেক্ষমাণ" })}</span>
        </span>
      </li>;
    })}
  </ol>;
}
