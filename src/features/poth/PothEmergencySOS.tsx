"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Copy, MapPin, Phone, ShieldCheck, Trash2 } from "lucide-react";

type EmergencyContact = { name: string; phone: string; address: string };
const storageKey = "prohor-poth-emergency-contact-v1";
const addressKey = "prohor-poth-emergency-address-v1";
const phonePattern = /^\+?[0-9][0-9\s()-]{5,19}$/;

function directionsToAddress(address: string): string {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
}

export function PothEmergencySOS() {
  const [contact, setContact] = useState<EmergencyContact>({ name: "", phone: "", address: "" });
  const [address, setAddress] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
    try {
      const savedContact = window.localStorage.getItem(storageKey);
      const savedAddress = window.localStorage.getItem(addressKey);
      if (savedContact) {
        const parsed: unknown = JSON.parse(savedContact);
        if (parsed && typeof parsed === "object" && "name" in parsed && "phone" in parsed && "address" in parsed &&
            typeof parsed.name === "string" && typeof parsed.phone === "string" && typeof parsed.address === "string") {
          setContact({ name: parsed.name.slice(0, 80), phone: parsed.phone.slice(0, 25), address: parsed.address.slice(0, 300) });
        }
      }
      if (savedAddress) setAddress(savedAddress.slice(0, 300));
    } catch { /* local storage can be unavailable in private mode */ }
    setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function save() {
    if (contact.phone && !phonePattern.test(contact.phone.trim())) {
      setStatus("Enter a valid contact phone number or clear the field.");
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        name: contact.name.trim(), phone: contact.phone.trim(), address: contact.address.trim(),
      }));
      window.localStorage.setItem(addressKey, address.trim());
      setEditing(false);
      setStatus("Emergency information saved on this device only. No message was sent.");
    } catch { setStatus("Could not save on this device. You can still use the national emergency number."); }
  }

  function clearSaved() {
    try { window.localStorage.removeItem(storageKey); window.localStorage.removeItem(addressKey); } catch { /* ignore */ }
    setContact({ name: "", phone: "", address: "" });
    setAddress("");
    setStatus("Saved emergency information cleared from this browser.");
  }

  async function copyMessage() {
    const message = [
      "URGENT HELP REQUEST / জরুরি সাহায্য প্রয়োজন",
      "I need urgent assistance. Please contact me directly.",
      address.trim() ? "My address or location: " + address.trim() : "My location: not provided; please ask me directly.",
      contact.name.trim() ? "Trusted contact: " + contact.name.trim() : "",
      contact.phone.trim() ? "Trusted contact phone: " + contact.phone.trim() : "",
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(message);
      setStatus("SOS text copied. Paste it into a message and send it yourself. No alert has been dispatched.");
    } catch { setStatus("Copy unavailable. Use the call buttons or manually share your address."); }
  }

  const phoneValid = phonePattern.test(contact.phone.trim());
  return (
    <section id="poth-sos" aria-labelledby="poth-sos-heading" className="mt-10 rounded-2xl border-2 p-4 sm:p-7"
      style={{ borderColor: "var(--pro-control-border)", background: "var(--pro-elevated)" }}>
      <h2 id="poth-sos-heading" className="flex items-center gap-2 text-2xl font-bold">
        <AlertTriangle aria-hidden="true" size={24} /> Emergency and SOS · জরুরি সহায়তা
      </h2>
      <p className="mt-3 leading-relaxed" lang="bn">জীবনঝুঁকি বা জরুরি মাতৃস্বাস্থ্য সমস্যায় ৯৯৯ নম্বরে কল করুন বা নিকটস্থ জরুরি বিভাগে যান। এই অ্যাপ অ্যাম্বুলেন্স পাঠায় না।</p>
      <p className="mt-2 text-sm">For severe bleeding, seizures, breathing difficulty, unconsciousness, or other urgent symptoms, seek emergency medical care immediately. Do not rely on community map tags to confirm emergency obstetric capability.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href="tel:999" className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 px-5 text-lg font-bold"
          style={{ borderColor: "var(--pro-control-border)" }}>
          <Phone size={22} aria-hidden="true" /> Call 999 · জরুরি কল
        </a>
        {ready && phoneValid && (
          <a href={"tel:" + contact.phone.replace(/[^+0-9]/g, "")} className="inline-flex min-h-14 items-center gap-2 rounded-xl border px-4 font-semibold"
            style={{ borderColor: "var(--pro-control-border)" }}>
            <Phone size={19} aria-hidden="true" /> Call saved contact
          </a>
        )}
      </div>
      <p className="mt-3 text-sm"><ShieldCheck size={16} className="mr-1 inline" aria-hidden="true" />999 connects to Bangladesh national emergency assistance (including ambulance coordination). A call is not a guaranteed ambulance dispatch. This page does not place calls automatically.</p>
      <p className="mt-2 text-sm">Health advice hotline 16263 has had reported service disruption in November 2026; it is not shown as a dependable emergency option.</p>
      <h3 className="mt-6 text-lg font-semibold">My SOS address and trusted contact · জরুরি ঠিকানা ও যোগাযোগ</h3>
      <p className="mt-2 text-sm">Optional. Saved in this browser only (not secure storage); avoid entering medical history. A shared or public device may expose this information.</p>
      {!editing && ready && (contact.name || contact.phone || contact.address || address) && (
        <div className="mt-3 space-y-1 rounded-xl border p-4" style={{ borderColor: "var(--pro-border)" }}>
          {address && <p><strong>My address:</strong> {address}</p>}
          {contact.name && <p><strong>Trusted contact:</strong> {contact.name}</p>}
          {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
          {contact.address && <p><strong>Contact address:</strong> {contact.address}</p>}
          {contact.address && <a href={directionsToAddress(contact.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 underline"><MapPin size={17} aria-hidden="true"/> Search contact address on map (unverified)</a>}
        </div>
      )}
      {(!ready || editing || !(contact.name || contact.phone || contact.address || address)) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block font-semibold">My emergency address / landmark
            <textarea value={address} maxLength={300} rows={2} onChange={e => setAddress(e.target.value)} placeholder="House, road, area, district, landmark"
              className="mt-2 block w-full rounded-lg border bg-transparent p-3" style={{ borderColor: "var(--pro-control-border)" }}/>
          </label>
          <label className="block font-semibold">Trusted contact name
            <input value={contact.name} maxLength={80} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} placeholder="Family or caregiver"
              className="mt-2 block min-h-12 w-full rounded-lg border bg-transparent p-3" style={{ borderColor: "var(--pro-control-border)" }}/>
          </label>
          <label className="block font-semibold">Trusted contact telephone
            <input type="tel" value={contact.phone} maxLength={25} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="01XXXXXXXXX or +880..."
              className="mt-2 block min-h-12 w-full rounded-lg border bg-transparent p-3" style={{ borderColor: "var(--pro-control-border)" }}/>
          </label>
          <label className="block font-semibold">Trusted contact address (optional)
            <input value={contact.address} maxLength={300} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} placeholder="Area, district, landmark"
              className="mt-2 block min-h-12 w-full rounded-lg border bg-transparent p-3" style={{ borderColor: "var(--pro-control-border)" }}/>
          </label>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {editing || !(contact.name || contact.phone || contact.address || address) ?
          <button type="button" onClick={save} disabled={!ready} className="min-h-12 rounded-lg border px-4 font-semibold disabled:opacity-50" style={{ borderColor: "var(--pro-control-border)" }}>Save on this device</button> :
          <button type="button" onClick={() => setEditing(true)} className="min-h-12 rounded-lg border px-4 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>Edit SOS details</button>}
        <button type="button" onClick={() => { void copyMessage(); }} className="inline-flex min-h-12 items-center gap-2 rounded-lg border px-4 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>
          <Copy size={17} aria-hidden="true" /> Copy SOS text
        </button>
        <button type="button" onClick={clearSaved} className="inline-flex min-h-12 items-center gap-2 rounded-lg border px-4" style={{ borderColor: "var(--pro-control-border)" }}>
          <Trash2 size={17} aria-hidden="true" /> Clear saved info
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm">{status}</p>
      <p className="mt-4 text-xs">Verified number source: <a className="underline" href="https://www.police.gov.bd/en/hot_line_number" target="_blank" rel="noopener noreferrer">Bangladesh Police hotline list</a>. Contacts entered by users are not verified by PROHOR. Emergency address is user-provided and has no verified geocode.</p>
    </section>
  );
}
