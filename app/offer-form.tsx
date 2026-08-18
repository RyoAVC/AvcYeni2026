"use client";

import { withBasePath } from "./base-path";
import { FormEvent, useRef, useState } from "react";
import { OFFER_INTEREST_GROUPS, type OfferInterest } from "./offer-options";

type FormStatus = { type: "idle" | "loading" | "success" | "error"; message: string };

type OfferFormProps = {
  defaultInterest?: string;
  defaultMessage?: string;
  locale?: "tr" | "en";
};

const ENGLISH_INTERESTS: Record<OfferInterest, string> = {
  "E-Ticaret altyapısı": "E-Commerce platform",
  "B2B / Bayi sistemi": "B2B / Dealer system",
  "C2C pazaryeri": "C2C marketplace",
  "E-İhracat": "Cross-border commerce",
  "E-Ticaret entegrasyonları": "E-commerce integrations",
  "Mobil uygulama": "Mobile application",
  "Sektörel yazılım": "Industry software",
  "Yapay zekâ modülleri": "AI modules",
  "Merkezi lisans platformu": "Central licensing platform",
  "Özel yazılım projesi": "Custom software project",
  "Web sitesi ve e-ticaret": "Website and e-commerce",
  "SEO ve görünürlük": "SEO and visibility",
  "Reklam ve büyüme": "Advertising and growth",
  "Bakım ve teknik destek": "Maintenance and technical support",
  "Alan adı, hosting ve yenileme": "Domain, hosting and renewal",
  "Bayi / partner iş birliği": "Dealer / partner collaboration",
};

export function OfferForm({ defaultInterest = "", defaultMessage = "", locale = "tr" }: OfferFormProps) {
  const [status, setStatus] = useState<FormStatus>({ type: "idle", message: "" });
  const submittingRef = useRef(false);
  const requestKeyRef = useRef("");
  const english = locale === "en";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    submittingRef.current = true;
    if (!requestKeyRef.current) requestKeyRef.current = crypto.randomUUID();
    const requestKey = requestKeyRef.current;
    const data = new FormData(form);
    const currentUrl = new URL(window.location.href);
    let referrerHost = "";
    try {
      if (document.referrer) {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.origin !== currentUrl.origin) referrerHost = referrerUrl.hostname;
      }
    } catch {
      referrerHost = "";
    }
    setStatus({ type: "loading", message: english ? "Submitting your request…" : "Talebiniz gönderiliyor…" });
    if (!english) window.dispatchEvent(new CustomEvent("avcai-form", { detail: { phase: "loading" } }));

    try {
      const response = await fetch(withBasePath("/api/teklif"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          company: data.get("company"),
          interest: data.get("interest"),
          message: data.get("message"),
          website: data.get("website"),
          consent: data.get("consent") === "on",
          utmSource: currentUrl.searchParams.get("utm_source"),
          utmMedium: currentUrl.searchParams.get("utm_medium"),
          utmCampaign: currentUrl.searchParams.get("utm_campaign"),
          referrerHost,
          landingPath: currentUrl.pathname,
          requestKey,
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(english ? "We could not submit your request. Please review the fields and try again." : result.error || "Talebiniz gönderilemedi.");

      form.reset();
      requestKeyRef.current = "";
      setStatus({ type: "success", message: english ? "Your request has been received." : result.message || "Talebiniz alındı." });
      if (!english) window.dispatchEvent(new CustomEvent("avcai-form", { detail: { ok: true } }));
    } catch (cause) {
      setStatus({
        type: "error",
        message: cause instanceof Error ? cause.message : english ? "We could not submit your request." : "Talebiniz gönderilemedi.",
      });
      if (!english) window.dispatchEvent(new CustomEvent("avcai-form", { detail: { ok: false } }));
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form
      className="lead-form"
      onSubmit={handleSubmit}
      onInput={() => { requestKeyRef.current = ""; }}
      aria-busy={status.type === "loading"}
      aria-describedby="offer-form-status"
    >
      <div className="form-grid">
        <label>
          <span>{english ? "Full name *" : "Ad soyad *"}</span>
          <input name="name" autoComplete="name" minLength={2} maxLength={100} required />
        </label>
        <label>
          <span>{english ? "Phone *" : "Telefon *"}</span>
          <input name="phone" type="tel" autoComplete="tel" minLength={10} maxLength={30} required />
        </label>
        <label>
          <span>{english ? "Email *" : "E-posta *"}</span>
          <input name="email" type="email" autoComplete="email" maxLength={180} required />
        </label>
        <label>
          <span>{english ? "Company" : "Firma"}</span>
          <input name="company" autoComplete="organization" maxLength={120} />
        </label>
      </div>
      <label>
        <span>{english ? "Solution of interest *" : "İlgilendiğiniz çözüm *"}</span>
        <select name="interest" defaultValue={defaultInterest} required>
          <option value="" disabled>{english ? "Select a solution" : "Bir çözüm seçin"}</option>
          {OFFER_INTEREST_GROUPS.map((group) => (
            <optgroup label={english ? group.label.en : group.label.tr} key={group.label.tr}>
              {group.interests.map((interest) => <option value={interest} key={interest}>{english ? ENGLISH_INTERESTS[interest] : interest}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        <span>{english ? "Briefly describe your project" : "Projenizden kısaca bahsedin"}</span>
        <textarea name="message" rows={4} maxLength={1500} defaultValue={defaultMessage} />
      </label>
      <label className="honeypot" aria-hidden="true">
        <span>{english ? "Website" : "Web sitesi"}</span><input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>{english ? <><a href={withBasePath("/en/privacy")} target="_blank" rel="noopener noreferrer">I have read the privacy information</a> and agree to be contacted about my request.</> : <><a href={withBasePath("/gizlilik")} target="_blank" rel="noopener noreferrer">Gizlilik ve kişisel veri bilgilendirmesini</a> okudum; talebim hakkında benimle iletişime geçilmesini kabul ediyorum.</>}</span>
      </label>
      <div className="form-submit-row">
        <button type="submit" disabled={status.type === "loading"}>
          {status.type === "loading" ? (english ? "Submitting…" : "Gönderiliyor…") : status.type === "success" ? (english ? "Received" : "Gönderildi") : (english ? "Request a consultation" : "Ücretsiz görüşme isteyin")}
        </button>
        <small>{english ? "Response timing depends on the scope and contact details provided." : "Yanıt süresi, talebin kapsamına ve paylaşılan iletişim bilgilerine bağlıdır."}</small>
      </div>
      <p
        id="offer-form-status"
        className={`form-status ${status.type}`}
        role={status.type === "error" ? "alert" : "status"}
        aria-live={status.type === "error" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {status.message}
      </p>
    </form>
  );
}
