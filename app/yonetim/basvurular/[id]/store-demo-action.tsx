"use client";

import { useState } from "react";
import { withBasePath } from "../../../base-path";

type StoreDemoResult = {
  primaryDomain: string;
  activationToken: string | null;
  bootstrapCommand: string;
  enrollmentExpiresAt: string;
};

export function StoreDemoAction({ leadId }: { leadId: number }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StoreDemoResult | null>(null);

  async function createStoreDemo() {
    setSending(true);
    setError("");
    try {
      const response = await fetch(withBasePath(`/api/yonetim/basvurular/${leadId}/magaza-demosu`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await response.json()) as StoreDemoResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Mağaza demosu oluşturulamadı.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Mağaza demosu oluşturulamadı.");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    const until = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(result.enrollmentExpiresAt));
    return (
      <div className="store-demo-result">
        <strong>Kurulum işi oluşturuldu — {result.primaryDomain}</strong>
        <p>
          Aşağıdaki bilgiler yalnız şimdi gösteriliyor, bir daha görüntülenemez. Enrollment bağlantısı {until} tarihine
          kadar geçerlidir. Komutu, bu demo için ayırdığınız boş sunucuda çalıştırın.
        </p>
        {result.activationToken ? (
          <>
            <small>Lisans aktivasyon anahtarı (hedef sunucunun .env dosyasına COMMERCE_LICENSE_ACTIVATION_TOKEN olarak)</small>
            <pre>{result.activationToken}</pre>
          </>
        ) : null}
        <small>Kurulum komutu</small>
        <pre>{result.bootstrapCommand}</pre>
      </div>
    );
  }

  return (
    <div className="demo-access-action">
      <button type="button" disabled={sending} onClick={createStoreDemo}>
        {sending ? "Oluşturuluyor…" : "Mağaza demosu oluştur"}
      </button>
      {error ? (
        <small role="alert" className="error">{error}</small>
      ) : null}
    </div>
  );
}
