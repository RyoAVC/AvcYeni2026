"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page rendering failed", error);
  }, [error]);

  return (
    <main className="status-page">
      <div className="status-grid" aria-hidden="true" />
      <div className="status-code" aria-hidden="true">!</div>
      <section>
        <Link className="brand" href="/" aria-label="Avcı E-Ticaret ana sayfa">
          <span className="brand-mark">A</span>
          <span className="brand-copy"><strong>AVCI</strong><small>E-TİCARET</small></span>
        </Link>
        <span className="kicker kicker-light">BEKLENMEYEN BİR DURUM</span>
        <h1>Bu bölüm şu anda yüklenemedi.</h1>
        <p>Bilgileriniz gönderilmedi veya kaybolmadı. Birkaç saniye sonra tekrar deneyebilir ya da ana sayfaya dönebilirsiniz.</p>
        <div className="status-actions">
          <button className="button button-primary" type="button" onClick={reset}>Tekrar deneyin</button>
          <Link className="button button-ghost" href="/">Ana sayfaya dön</Link>
        </div>
      </section>
    </main>
  );
}
