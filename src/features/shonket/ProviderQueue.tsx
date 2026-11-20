"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { shonketProviderQueueSchema, shonketRequestSchema, type ShonketRequest } from "@/lib/contracts/shonket-requests";
import { providerRequestSchema } from "@/lib/contracts/bondhon";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

export function ProviderQueue() {
  const { language, t } = useLanguage();
  const copy = translations.shonket;
  const [items, setItems] = useState<ShonketRequest[]>([]);
  const [opened, setOpened] = useState<Record<string, ShonketRequest>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/provider/requests?workflow=shonket&limit=50", { cache: "no-store" });
      const body = await response.json() as { data?: unknown; error?: { message?: string } };
      const parsed = shonketProviderQueueSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error(t(copy.provider.loadError));
      setItems(parsed.data);
      setOpened(current => Object.fromEntries(Object.entries(current).flatMap(([id, detail]) => {
        const latest = parsed.data.find(item => item.id === id);
        return latest ? [[id, { ...detail, status: latest.status, revision: latest.revision, updatedAt: latest.updatedAt }]] : [];
      })));
    } catch { setItems([]); setError(t(copy.provider.loadError)); }
    finally { setLoading(false); }
  }, [copy.provider.loadError, t]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function openRequest(id: string) {
    if (busyId) return;
    setBusyId(id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/provider/requests/${encodeURIComponent(id)}/open`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const body = await response.json() as { data?: unknown; error?: { message?: string } };
      const parsed = shonketRequestSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error(t(copy.provider.openError));
      setOpened(current => ({ ...current, [id]: parsed.data })); setItems(current => current.map(item => item.id === id ? parsed.data : item));
      setNotice(t(copy.provider.openConfirmed));
    } catch { setError(t(copy.provider.openError)); }
    finally { setBusyId(""); }
  }
  async function acknowledge(request: ShonketRequest) {
    if (busyId) return;
    setBusyId(request.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/provider/requests/${encodeURIComponent(request.id)}/acknowledge`, {
        method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ expectedRevision: request.revision }),
      });
      const body = await response.json() as { data?: unknown; error?: { message?: string } };
      const confirmed = providerRequestSchema.safeParse(body.data);
      if (!response.ok || !confirmed.success || confirmed.data.id !== request.id || confirmed.data.status !== "acknowledged")
        throw new Error(response.status === 409 ? t(copy.provider.changed) : t(copy.provider.ackError));
      setNotice(t(copy.provider.ackSaved));
      setOpened(current => ({ ...current, [request.id]: { ...request, status: "acknowledged", revision: confirmed.data.revision, updatedAt: confirmed.data.updatedAt } }));
      setItems(current => current.map(item => item.id === request.id
        ? { ...item, status: "acknowledged", revision: confirmed.data.revision, updatedAt: confirmed.data.updatedAt }
        : item));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t(copy.provider.ackError)); }
    finally { setBusyId(""); }
  }
  return <section className={`${styles.experience} border-y border-pro-border`} aria-labelledby="shonket-provider-title" lang={language}>
    <header className={styles.pageHeader}><p className={styles.eyebrow}>{t(copy.provider.eyebrow)}</p><h2 id="shonket-provider-title" className={styles.sectionTitle}>{t(copy.provider.title)}</h2><p className={styles.lead}>{t(copy.provider.lead)}</p></header>
    {notice && <p role="status" className="rounded-field bg-pro-success-soft p-3">{notice}</p>}
    {error && <p role="alert" className="rounded-field border border-pro-danger p-3 text-pro-danger">{error}</p>}
    {loading && <p role="status">{t(copy.provider.loading)}</p>}
    {!loading && !error && !items.length && <p className="rounded-card border border-pro-border p-4">{t(copy.provider.empty)}</p>}
    <ul className="grid max-w-3xl gap-3">{items.map(item => {
      const detail = opened[item.id];
      return <li key={item.id} className="grid gap-3 rounded-card border border-pro-border p-4">
        <p><strong>{t(copy.provider.requestId)}:</strong> <span className="break-all font-mono text-sm">{item.id}</span></p>
        <p><strong>{t(copy.provider.status)}:</strong> {t(copy.values.status[item.status])}</p>
        <p><strong>{t(copy.provider.submitted)}:</strong> <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka" })}</time></p>
        {!detail && <button type="button" className="pro-btn pro-btn-secondary w-fit" disabled={Boolean(busyId)} onClick={() => void openRequest(item.id)}>{busyId === item.id ? t(copy.provider.opening) : t(copy.provider.open)}</button>}
        {detail && <>
          <p><strong>{t(copy.provider.concernTypes)}:</strong> {detail.concernTypes.length ? detail.concernTypes.map(value => t(copy.values.concerns[value])).join(", ") : t(copy.form.noneSelected)}</p>
          <p><strong>{t(copy.provider.onset)}:</strong> {detail.onset ? t(copy.values.onset[detail.onset]) : t(copy.form.notSelected)}</p>
          <p><strong>{t(copy.provider.method)}:</strong> {t(copy.values.method[detail.method === "call" ? "callProvider" : detail.method])}</p>
          <div><strong>{t(copy.provider.message)}:</strong><p className="whitespace-pre-wrap">{detail.message}</p></div>
          {detail.status === "delivered" && <button type="button" className="pro-btn pro-btn-primary w-fit" disabled={Boolean(busyId)} onClick={() => void acknowledge(detail)}>{busyId === detail.id ? t(copy.provider.saving) : t(copy.provider.acknowledge)}</button>}
          {detail.status === "acknowledged" && <p role="status" className="font-semibold">{t(copy.provider.acknowledged)}</p>}
        </>}
      </li>;
    })}</ul>
    <button type="button" className="pro-btn pro-btn-secondary w-fit" disabled={loading} onClick={() => void load()}><RefreshCw size={16} aria-hidden="true" /> {t(copy.provider.refresh)}</button>
  </section>;
}
