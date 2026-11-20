"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { shonketRequestListSchema, shonketRequestSchema, type ShonketRequest } from "@/lib/contracts/shonket-requests";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

export function MyRequests() {
  const { language, t } = useLanguage();
  const copy = translations.shonket;
  const [items, setItems] = useState<ShonketRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/care-requests?workflow=shonket&limit=50", { cache: "no-store" });
      const body = await response.json() as { data?: unknown; error?: { message?: string } };
      const parsed = shonketRequestListSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error(t(copy.history.loadError));
      setItems(parsed.data);
    } catch { setError(t(copy.history.loadError)); }
    finally { setLoading(false); }
  }, [copy.history.loadError, t]);
  async function stopSharing(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/care-requests/${encodeURIComponent(id)}/shonket-revoke`, { method: "POST", cache: "no-store" });
      const body = await response.json() as { data?: unknown };
      const parsed = shonketRequestSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error("revoke");
      setItems(current => current.map(item => item.id === id ? parsed.data : item));
    } catch { setError(t(copy.history.revokeError)); }
  }
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return <div className={styles.experience} lang={language}>
    <header className={styles.pageHeader}><p className={styles.eyebrow}>{t(copy.history.eyebrow)}</p><h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{t(copy.history.title)}</h1><p className={styles.lead}>{t(copy.history.lead)}</p></header>
    <p className="rounded-field bg-pro-surface p-4 text-sm">{t(copy.history.demoProvider)}</p>
    {loading && <p role="status">{t(copy.history.loading)}</p>}
    {error && <p role="alert" className="rounded-field border border-pro-danger p-4 text-pro-danger">{error}</p>}
    {!loading && !error && items.length === 0 && <p className="rounded-card border border-pro-border p-5">{t(copy.history.empty)}</p>}
    <div className="grid max-w-3xl gap-4">{items.map(request => <article key={request.id} className="grid gap-3 rounded-card border border-pro-border p-4" aria-labelledby={`request-${request.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2"><h2 id={`request-${request.id}`} className="text-lg font-semibold">{t(copy.values.status[request.status])}</h2><time dateTime={request.createdAt}>{new Date(request.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka" })}</time></div>
      <p><strong>{t(copy.history.requestId)}:</strong> <span className="break-all font-mono text-sm">{request.id}</span></p>
      <p><strong>{t(copy.history.concernTypes)}:</strong> {request.concernTypes.length ? request.concernTypes.map(value => t(copy.values.concerns[value])).join(", ") : t(copy.form.noneSelected)}</p>
      <p><strong>{t(copy.history.contact)}:</strong> {t(copy.values.method[request.method])}</p>
      <div><strong>{t(copy.history.message)}:</strong><p className="whitespace-pre-wrap">{request.message}</p></div>
      {request.consent && <p role="status"><strong>{t(copy.history.sharing)}:</strong> {request.consent.revokedAt ? t(copy.history.stopped) : `${t(copy.history.endsOn)} ${new Date(request.consent.expiresAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka" })}`}</p>}
      {request.consent && !request.consent.revokedAt && <button type="button" onClick={() => void stopSharing(request.id)} className="pro-btn pro-btn-secondary w-fit">{t(copy.history.stopSharing)}</button>}
      {!request.consent && <p role="status">{t(copy.history.noPermission)}</p>}
      <ol className="grid gap-2 border-t border-pro-border pt-3" aria-label={t(copy.history.events)}>{request.events?.map(event => <li key={`${event.status}-${event.requestRevision}`}><strong>{t(copy.values.status[event.status])}</strong> · <time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString(language === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka" })}</time></li>)}</ol>
    </article>)}</div>
    <button type="button" onClick={() => void load()} disabled={loading} className="pro-btn pro-btn-secondary w-fit"><RefreshCw size={17} aria-hidden="true" /> {t(copy.history.refresh)}</button>
  </div>;
}
