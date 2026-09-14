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

export default function CustomerSetupPasswordPage() {
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
      <main className="customer-setup-page">
        <section>
          <h1>Bağlantı geçersiz</h1>
          <p>Bu sayfayı açmak için e-postanızdaki demo erişim bağlantısını kullanın.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="customer-setup-page">
      <section>
        <h1>Panel parolanızı belirleyin</h1>
        <p>Bu bağlantı tek kullanımlıktır. Parolanızı belirledikten sonra doğrudan panelinize yönlendirileceksiniz.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Parola
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Parola (tekrar)
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          {error ? <small role="alert" className="error">{error}</small> : null}
          <button type="submit" className="button button-primary" disabled={submitting || !token}>
            {submitting ? "Kaydediliyor…" : "Parolayı kaydet ve giriş yap"}
          </button>
        </form>
      </section>
    </main>
  );
}
