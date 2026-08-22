import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomerUser } from "../customer-auth";
import { loadCustomerPortalSnapshot } from "../customer-portal-data.mjs";
import { SiteBrand } from "../site-brand";
import { withBasePath } from "../base-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Paneli | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

const navItems = [
  { id: "ozet", label: "Özet" },
  { id: "altyapi", label: "Altyapı" },
  { id: "finans", label: "Finans" },
  { id: "siparisler", label: "Siparişler" },
  { id: "destek", label: "Destek" },
  { id: "faturalar", label: "Faturalar" },
] as const;

function RecordList({
  items,
  emptyLabel,
}: {
  items: { id: number; label: string; meta: string; createdAt: string; note?: string }[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className="cp-card-lead cp-empty-note">{emptyLabel}</p>;
  }
  return (
    <ul className="cp-module-list cp-readonly-list">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.label}</strong>
            <span>
              {item.meta}
              {item.note ? ` · ${item.note}` : ""}
            </span>
          </div>
          <b className="cp-pill">{item.createdAt}</b>
        </li>
      ))}
    </ul>
  );
}

export default async function CustomerPortalPage() {
  const { customer } = await requireCustomerUser("/musteri-panel");
  const snapshot = await loadCustomerPortalSnapshot(customer);
  const displayName = customer.company || customer.name;
  const infrastructure = snapshot.infrastructure;

  return (
    <main className="demo-portal-page cp-page customer-portal-page">
      <a className="skip-link" href="#ozet">
        Panele geç
      </a>

      <div className="cp-shell">
        <aside className="cp-sidebar" aria-label="Müşteri paneli menüsü">
          <SiteBrand href="/musteri-panel" subtitle="MÜŞTERİ PANELİ" label="Yazılım müşterisi paneli" />
          <p className="cp-sidebar-badge">SALT OKUNUR · yerel oturum</p>
          <nav aria-label="Panel bölümleri">
            {navItems.map((item) => (
              <a href={`#${item.id}`} key={item.id}>
                <span>§</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="cp-sidebar-foot">
            <small>YEREL TEST OTURUMU</small>
            <strong>{displayName}</strong>
            <span>{customer.email}</span>
            <Link href="/demo-portal">Demo portalı (örnek veri)</Link>
            <Link href={withBasePath("/api/musteri-panel/cikis")}>Oturumu kapat</Link>
          </div>
        </aside>

        <div className="cp-main">
          <header className="cp-topbar">
            <div className="cp-topbar-copy">
              <div className="cp-topbar-meta">
                <span className="kicker">AVCI MÜŞTERİ PANELİ</span>
                <span className="cp-account-chip">{customer.email}</span>
              </div>
              <h1 id="ozet">
                {displayName}
                <em>salt okunur görünüm</em>
              </h1>
              <p>
                Bu ekran yönetimdeki yazılım müşteri kaydınızdan okur. Sipariş, destek ve fatura listesi görüntülenir;
                kart çekimi, e-Fatura veya kayıt değiştirme burada yoktur.
              </p>
            </div>
            <div className="cp-topbar-actions">
              <Link className="button button-ghost" href="/musteri-merkezi">
                Portal kapsamı
              </Link>
              <Link className="button button-ghost" href="/destek">
                Destek merkezi
              </Link>
            </div>
          </header>

          <div className="cp-readonly-banner" role="status">
            <strong>Salt okunur yerel oturum.</strong>
            <span>Parola toplanmaz. Veri D1 üzerinden okunur; yönetim işlemleri bu panelde açılmaz.</span>
          </div>

          {infrastructure.domainName !== "—" ? (
            <div className="cp-workspace" aria-label="Alan adı özeti">
              <div>
                <small>ALAN ADI</small>
                <strong>{infrastructure.domainName}</strong>
                <span>yönetim kaydı</span>
              </div>
              <div>
                <small>HOSTING</small>
                <strong>
                  {infrastructure.items.find((item) => item.label === "Hosting yenileme")?.status ?? "—"}
                </strong>
                <span>salt okunur yenileme</span>
              </div>
              <div>
                <small>DESTEK</small>
                <strong>{snapshot.stats.tickets ? `${snapshot.stats.tickets} açık` : "Açık yok"}</strong>
                <span>salt okunur sayaç</span>
              </div>
            </div>
          ) : (
            <div className="cp-workspace" aria-label="Hesap özeti">
              <div>
                <small>YAZILIM MÜŞTERİSİ</small>
                <strong>{customer.name}</strong>
                <span>{customer.company || "işletme kaydı"}</span>
              </div>
              <div>
                <small>DESTEK</small>
                <strong>{snapshot.stats.tickets ? `${snapshot.stats.tickets} açık` : "Açık yok"}</strong>
                <span>salt okunur sayaç</span>
              </div>
              <div>
                <small>KAYIT</small>
                <strong>{snapshot.stats.orders} sipariş</strong>
                <span>{snapshot.stats.invoices} fatura satırı</span>
              </div>
            </div>
          )}

          <section className="cp-stats" aria-label="Panel özeti">
            <article>
              <small>Siparişler</small>
              <strong>{snapshot.stats.orders}</strong>
              <span>son kayıtlar</span>
            </article>
            <article>
              <small>Açık destek</small>
              <strong>{snapshot.stats.tickets}</strong>
              <span>kapalı hariç</span>
            </article>
            <article>
              <small>Faturalar</small>
              <strong>{snapshot.stats.invoices}</strong>
              <span>salt liste</span>
            </article>
          </section>

          <section className="cp-grid">
            <article className="cp-card cp-ops-checklist" id="altyapi">
              <div className="cp-card-head">
                <span className="kicker">ALTYAPI</span>
                <b className="cp-pill">Salt okunur</b>
              </div>
              <div className="cp-ops-head">
                <h2>Alan adı ve hosting yenileme</h2>
                <p>Yönetimdeki müşteri kartından okunur. DNS, SSL veya yedek müdahalesi bu panelde yapılmaz.</p>
              </div>
              <ul className="cp-ops-grid" aria-label="Altyapı yenileme özeti">
                {infrastructure.items.map((item) => (
                  <li className={item.tone === "watch" ? "cp-ops-item is-watch" : "cp-ops-item"} key={item.label}>
                    <div className="cp-ops-copy">
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </div>
                    <b className={item.tone === "watch" ? "cp-pill" : "cp-pill is-live"}>{item.status}</b>
                  </li>
                ))}
              </ul>
            </article>

            <article className="cp-card" id="finans">
              <div className="cp-finance-summary" aria-label="Finansal özet">
                <div className="cp-finance-head">
                  <span className="kicker">FİNANSAL ÖZET</span>
                  <h2>Lisans ve fatura görünümü</h2>
                  <p>
                    Tutar notları yönetim kaydından okunur. Kart çekimi, e-Fatura indirme veya tahsilat bu panelde
                    işlenmez.
                  </p>
                </div>
                <ul className="cp-finance-grid">
                  {snapshot.finance.highlights.map((item) => (
                    <li key={item.label}>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                      <span>{item.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="cp-card" id="siparisler">
              <div className="cp-card-head">
                <span className="kicker">YAZILIM SİPARİŞLERİ</span>
                <b className="cp-pill">Salt okunur</b>
              </div>
              <h2>Paket ve modül siparişleri</h2>
              <p className="cp-card-lead">Yönetimdeki yazılım sipariş satırları burada listelenir. Yeni sipariş veya durum değişikliği bu panelde yapılmaz.</p>
              <RecordList emptyLabel="Henüz yazılım siparişi kaydı görünmüyor." items={snapshot.orders} />
            </article>

            <article className="cp-card" id="destek">
              <div className="cp-card-head">
                <span className="kicker">DESTEK</span>
                <b className="cp-pill">Salt okunur</b>
              </div>
              <h2>Destek talepleri</h2>
              <p className="cp-card-lead">Açık ve kapalı destek kayıtları yalnızca görüntülenir. Yeni talep açma bu yerel panelde yoktur.</p>
              <RecordList emptyLabel="Henüz destek kaydı görünmüyor." items={snapshot.tickets} />
            </article>

            <article className="cp-card" id="faturalar">
              <div className="cp-card-head">
                <span className="kicker">FATURALAR</span>
                <b className="cp-pill">Salt okunur</b>
              </div>
              <h2>Yazılım faturaları</h2>
              <p className="cp-card-lead">Tutar notları ve durum bilgisi salt okunurdur. e-Fatura indirme veya ödeme bu ekranda işlenmez.</p>
              <RecordList emptyLabel="Henüz fatura kaydı görünmüyor." items={snapshot.invoices} />
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
