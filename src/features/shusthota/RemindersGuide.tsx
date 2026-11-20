"use client";

import { useId, useState } from "react";
import { Bell, Calendar, Download, Info, ShieldAlert, Smartphone } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";

const copy = {
  eyebrow: { en: "REMINDERS & CALENDAR", bn: "রিমাইন্ডার ও ক্যালেন্ডার" },
  title: { en: "Reminders & calendar export", bn: "রিমাইন্ডার ও ক্যালেন্ডার এক্সপোর্ট" },
  lead: {
    en: "Clear, honest information about reminder capabilities. We distinguish between one-time calendar files and automated background notifications.",
    bn: "রিমাইন্ডার সুবিধার স্পষ্ট ও সত্যনিষ্ঠ বিবরণ। আমরা এককালীন ক্যালেন্ডার ফাইল এবং স্বয়ংক্রিয় ব্যাকগ্রাউন্ড নোটিফিকেশনের পার্থক্য স্পষ্টভাবে তুলে ধরি।",
  },
  channelTitle: { en: "Delivery channel capabilities", bn: "নোটিফিকেশন চ্যানেলের অবস্থা" },
  calendarTitle: { en: "1. Device calendar export (.ics)", bn: "১. ডিভাইসের ক্যালেন্ডার এক্সপোর্ট (.ics)" },
  calendarDesc: {
    en: "Downloads a standard .ics calendar file that you can open in Google Calendar, Apple Calendar, or Outlook to schedule a quiet personal check-in. This is a manual one-time file export, NOT an active push reminder service.",
    bn: "একটি প্রমিত .ics ফাইল ডাউনলোড করে যা গুগল ক্যালেন্ডার, অ্যাপল ক্যালেন্ডার বা আউটলুকে খুলে নিজের জন্য শান্ত খোঁজখবরের সময় নির্ধারণ করা যায়। এটি এককালীন ফাইল ডাউনলোড, কোনো স্বয়ংক্রিয় পুশ নোটিফিকেশন নয়।",
  },
  downloadIcsBtn: { en: "Download .ics calendar event", bn: ".ics ক্যালেন্ডার ইভেন্ট ডাউনলোড" },
  browserTitle: { en: "2. Browser notifications", bn: "২. ব্রাউজার নোটিফিকেশন" },
  browserDesc: {
    en: "Requires active browser tab and explicit browser notification permission. Cannot fire when the device is locked or the browser is closed without background push infrastructure.",
    bn: "ব্রাউজার ট্যাব খোলা থাকা এবং ব্রাউজার অনুমতির প্রয়োজন। ব্যাকগ্রাউন্ড পুশ অবকাঠামো ছাড়া ফোন লক থাকলে বা ব্রাউজার বন্ধ থাকলে কাজ করতে পারে না।",
  },
  pushTitle: { en: "3. Background push notifications", bn: "৩. ব্যাকগ্রাউন্ড পুশ নোটিফিকেশন" },
  pushDesc: {
    en: "Currently unavailable. Requires service worker web-push server integration and verified scheduled background worker.",
    bn: "বর্তমানে অনুপলব্ধ। সার্ভিস ওয়ার্কার ওয়েব-পুশ সার্ভার এবং নির্ধারিত ব্যাকগ্রাউন্ড ওয়ার্কারের প্রয়োজন যা এই পরিবেশে সংযুক্ত নেই।",
  },
  unavailableTag: { en: "Unavailable in demo", bn: "ডেমোতে অনুপলব্ধ" },
  manualTag: { en: "Manual download only", bn: "শুধুমাত্র ম্যানুয়াল ডাউনলোড" },
} as const;

export function RemindersGuide() {
  const { language, t } = useLanguage();
  const id = useId();
  const [downloaded, setDownloaded] = useState(false);

  const downloadIcs = () => {
    const now = new Date();
    // Schedule for tomorrow 10:00 AM Asia/Dhaka
    const start = new Date(now.getTime() + 86400000);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 15 * 60000); // 15 mins

    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PROHOR//Maternal Wellness//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:prohor-wellness-${Date.now()}@prohor.care`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      "SUMMARY:PROHOR · Quiet Self-Care Moment",
      "DESCRIPTION:A gentle reminder to pause, notice how you feel, and drink water. Take what is useful, leave the rest.",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prohor-wellness-moment.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <section id="reminders" aria-labelledby={`${id}-title`} lang={language} className="grid gap-6 border-t border-pro-border pt-7 sm:pt-9">
      <header className="grid gap-2">
        <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl flex items-center gap-2">
            <Bell size={26} className="text-pro-primary" aria-hidden="true" />
            {t(copy.title)}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-muted">
            <Info size={14} className="text-pro-primary" aria-hidden="true" />
            {t({ en: "Transparent status", bn: "স্বচ্ছ বিবরণ" })}
          </span>
        </div>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.lead)}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Calendar .ics download */}
        <div className="grid content-between gap-4 rounded-hero border border-pro-border bg-pro-surface p-5">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-pro-elevated text-pro-primary">
                <Calendar size={18} aria-hidden="true" />
              </span>
              <span className="rounded-pill bg-pro-surface-2 px-2.5 py-0.5 text-xs font-medium text-pro-primary">
                {t(copy.manualTag)}
              </span>
            </div>
            <h3 className="font-semibold text-base text-pro-text">{t(copy.calendarTitle)}</h3>
            <p className="pro-muted text-xs leading-relaxed">{t(copy.calendarDesc)}</p>
          </div>
          <div>
            <AppButton
              type="button"
              variant="secondary"
              onClick={downloadIcs}
              className="w-full text-xs min-h-10"
            >
              <Download size={14} className="me-1.5" aria-hidden="true" />
              {t(copy.downloadIcsBtn)}
            </AppButton>
            {downloaded && (
              <p className="mt-1.5 text-xs text-pro-success font-medium text-center">
                {t({ en: ".ics file generated.", bn: ".ics ফাইল প্রস্তুত হয়েছে।" })}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Browser notification */}
        <div className="grid content-between gap-4 rounded-hero border border-pro-border bg-pro-surface p-5">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-pro-elevated text-pro-primary">
                <Smartphone size={18} aria-hidden="true" />
              </span>
              <span className="rounded-pill border border-pro-border px-2.5 py-0.5 text-xs font-medium text-pro-muted">
                {t({ en: "Active tab only", bn: "শুধু চালু ট্যাবে" })}
              </span>
            </div>
            <h3 className="font-semibold text-base text-pro-text">{t(copy.browserTitle)}</h3>
            <p className="pro-muted text-xs leading-relaxed">{t(copy.browserDesc)}</p>
          </div>
          <div className="rounded-control bg-pro-elevated p-2.5 text-xs text-pro-muted">
            {t({ en: "Requires browser window to remain open.", bn: "ব্রাউজার উইন্ডো খোলা থাকা প্রয়োজন।" })}
          </div>
        </div>

        {/* Card 3: Background Push */}
        <div className="grid content-between gap-4 rounded-hero border border-pro-border bg-pro-elevated p-5 opacity-90">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-pro-surface text-pro-muted">
                <ShieldAlert size={18} aria-hidden="true" />
              </span>
              <span className="rounded-pill bg-pro-warning-soft text-pro-warning px-2.5 py-0.5 text-xs font-semibold">
                {t(copy.unavailableTag)}
              </span>
            </div>
            <h3 className="font-semibold text-base text-pro-text">{t(copy.pushTitle)}</h3>
            <p className="pro-muted text-xs leading-relaxed">{t(copy.pushDesc)}</p>
          </div>
          <div className="rounded-control bg-pro-surface p-2.5 text-xs text-pro-muted">
            {t({ en: "Scheduled background workers are not configured.", bn: "নির্ধারিত ব্যাকগ্রাউন্ড ওয়ার্কার সংযুক্ত নেই।" })}
          </div>
        </div>
      </div>
    </section>
  );
}
