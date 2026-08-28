"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { withBasePath } from "../../base-path";

export function CustomerPortalLoginForm({
  nextPath,
  defaultEmail = "",
}: {
  nextPath: string;
  defaultEmail?: string;
}) {
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    event.currentTarget.submit();
  }

  return (
    <form
      action={withBasePath("/api/musteri-panel/giris")}
      className="customer-portal-login-form"
      method="post"
      onSubmit={onSubmit}
    >
      <input name="next" type="hidden" value={nextPath} />
      <label className="visually-hidden" htmlFor="customer-portal-email">
        Kayıtlı e-posta
      </label>
      <input
        autoComplete="email"
        defaultValue={defaultEmail}
        id="customer-portal-email"
        inputMode="email"
        name="email"
        placeholder="Kayıtlı e-posta adresiniz"
        required
        type="email"
      />
      <label className="visually-hidden" htmlFor="customer-portal-license">
        Lisans anahtarı
      </label>
      <input
        autoComplete="off"
        id="customer-portal-license"
        name="license_key"
        pattern="avc_live_[A-Za-z0-9_-]{20,}"
        placeholder="avc_live_... lisans anahtarınız"
        required
        spellCheck={false}
        type="password"
      />
      <input aria-hidden="true" autoComplete="off" className="visually-hidden" name="website" tabIndex={-1} type="text" />
      <button className="button button-primary" disabled={saving} type="submit">
        {saving ? "Kontrol ediliyor…" : "Müşteri paneline gir"}
      </button>
    </form>
  );
}
