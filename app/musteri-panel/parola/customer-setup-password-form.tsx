"use client";

import { useState, useSyncExternalStore } from "react";
import { withBasePath } from "../../base-path";

function subscribeToHash() {
  return () => {};
}
function getHashSnapshot() {
  return window.location.hash.replace(/^#/, "");
}
function getServerHashSnapshot() {
  return "";
}

export function CustomerSetupPasswordForm() {
  const token = useSyncExternalStore(subscribeToHash, getHashSnapshot, getServerHashSnapshot);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Parolalar eşleşmiyor.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(withBasePath("/api/musteri-panel/parola"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Parola kaydedilemedi.");
      window.location.assign(withBasePath("/musteri-panel"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Parola kaydedilemedi.");
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <>
        <h2>Bağlantı geçersiz.</h2>
        <p>Bu sayfayı açmak için e-postanızdaki demo erişim bağlantısını kullanın.</p>
      </>
    );
  }

  return (
    <>
      <h2>Parolanızı belirleyin</h2>
      <p>Bu bağlantı tek kullanımlıktır. Parolanızı belirledikten sonra doğrudan panelinize yönlendirileceksiniz.</p>
      {error ? (
        <div className="portal-notice" role="alert">
          <strong>{error}</strong>
        </div>
      ) : null}
      <form className="customer-portal-login-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="customer-setup-password">
          Parola
        </label>
        <input
          id="customer-setup-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          placeholder="Yeni panel parolanız"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <label className="visually-hidden" htmlFor="customer-setup-password-confirm">
          Parola (tekrar)
        </label>
        <input
          id="customer-setup-password-confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          placeholder="Parolanızı tekrar yazın"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Kaydediliyor…" : "Parolayı kaydet ve giriş yap"}
        </button>
      </form>
    </>
  );
}
