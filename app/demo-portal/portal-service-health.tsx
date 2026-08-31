import styles from "./demo-portal-intelligence.module.css";

export type PortalServiceHealth = {
  tone: string;
  score: number | null;
  openTickets: number;
  criticalTickets: number;
  firstResponseMinutes: number | null;
  label: string;
};

/**
 * Real-data counterpart to DemoPortalSlaCenter. Never invents a target or a score for a
 * metric that has no real threshold behind it (e.g. first-response time has no configured
 * SLA target in the schema, so it's shown as a plain figure, not a fabricated gauge).
 */
export function PortalServiceHealthCenter({ health }: { health: PortalServiceHealth }) {
  const scoreKnown = health.score !== null;
  const responseKnown = health.firstResponseMinutes !== null;
  const ticketsHealthy = health.criticalTickets === 0;
  const scoreTone = !scoreKnown ? "watch" : health.score! >= 80 ? "healthy" : health.score! >= 50 ? "watch" : "critical";
  const ticketsBar = ticketsHealthy ? 100 : Math.max(15, 100 - health.criticalTickets * 25);

  return (
    <section className={styles.slaCenter} aria-labelledby="service-health-title">
      <header className={styles.sectionHeader}>
        <div>
          <small>HİZMET SAĞLIĞI</small>
          <h3 id="service-health-title">Operasyon ve destek görünümü</h3>
          <p>Gerçek destek kayıtlarınızdan ve en son ölçüm anlık görüntüsünden okunur; hedef veya kıyaslama uydurulmaz.</p>
        </div>
        <div className={styles.slaScore}>
          <strong>{scoreKnown ? health.score : "—"}</strong>
          <span>{scoreKnown ? "100 üzerinden" : "ölçüm yok"}</span>
        </div>
      </header>
      <ul className={styles.slaGrid}>
        <li data-tone={scoreTone === "healthy" ? undefined : "watch"}>
          <small>Sağlık puanı</small>
          <strong>{scoreKnown ? health.score : "—"}</strong>
          <span>{scoreKnown ? "son ölçüm anlık görüntüsü" : "veri bekleniyor"}</span>
          {scoreKnown ? (
            <div role="progressbar" aria-label="Sağlık puanı" aria-valuemin={0} aria-valuemax={100} aria-valuenow={health.score!}>
              <i style={{ width: `${health.score}%` }} />
            </div>
          ) : null}
        </li>
        <li data-tone={ticketsHealthy ? undefined : "watch"}>
          <small>Açık destek</small>
          <strong>{health.openTickets}</strong>
          <span>{health.criticalTickets} kritik</span>
          <div role="progressbar" aria-label="Destek durumu" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ticketsBar}>
            <i style={{ width: `${ticketsBar}%` }} />
          </div>
        </li>
        <li>
          <small>İlk yanıt</small>
          <strong>{responseKnown ? `${health.firstResponseMinutes} dk` : "—"}</strong>
          <span>{responseKnown ? "son snapshot" : "ölçüm verisi yok"}</span>
        </li>
      </ul>
      <div className={styles.slaFooter}>
        <span aria-hidden="true">{ticketsHealthy ? "✓" : "!"}</span>
        <p>
          <strong>{ticketsHealthy ? "Açık kritik kayıt yok" : `${health.criticalTickets} kritik destek kaydı takipte`}</strong>
          {ticketsHealthy ? "Hesabınızda hizmet hedeflerini aşan bir sinyal bulunmuyor." : "Destek ekibi bu kayıtları önceliklendiriyor."}
        </p>
      </div>
    </section>
  );
}
