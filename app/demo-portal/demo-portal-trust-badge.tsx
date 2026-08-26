export function DemoPortalTrustBadge() {
  return (
    <details className="cp-trust-badge">
      <summary>
        <span aria-hidden="true">✓</span>
        <span><b>Avcı Güven</b><small>Doğrulanmış panel kimliği</small></span>
      </summary>
      <div>
        <strong>Güvenli demo çerçevesi</strong>
        <p>Bu ekran örnek verilerle çalışır; parola, ödeme veya gerçek müşteri kaydı içermez.</p>
      </div>
    </details>
  );
}
