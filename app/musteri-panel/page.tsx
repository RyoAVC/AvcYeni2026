import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomerUser } from "../customer-auth";
import { loadCustomerPortalSnapshot } from "../customer-portal-data.mjs";
import { SiteBrand } from "../site-brand";
import { withBasePath } from "../base-path";
import {
  DemoPortalMobileDrawer,
  DemoPortalMobileToggle,
  DemoPortalNav,
  DemoPortalNavProvider,
  DemoPortalPanel,
  type DemoPortalNavItem,
} from "../demo-portal/demo-portal-nav";
import { PortalTofyPerformanceCenter } from "../demo-portal/portal-tofy-performance-center";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Paneli | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

const navItems: DemoPortalNavItem[] = [
  { id: "ozet", label: "Özet" },
  { id: "bildirimler", label: "Bildirimler" },
  { id: "operasyon", label: "Operasyon" },
  { id: "altyapi", label: "Altyapı" },
  { id: "tofy", label: "Tofy" },
  { id: "lisanslar", label: "Faturalar & Lisanslar" },
  { id: "erisim", label: "Erişimler" },
  { id: "destek", label: "Destek" },
  { id: "teslim", label: "Teslim" },
  { id: "sonraki", label: "Sonraki" },
];

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
  const displayName = snapshot.branding.companyName;
  const infrastructure = snapshot.infrastructure;
  const billingRecords = [
    ...snapshot.orders.map((item) => ({ ...item, label: `Lisans · ${item.label}` })),
    ...snapshot.invoices.map((item) => ({ ...item, id: item.id + 1_000_000, label: `Fatura · ${item.label}` })),
  ];

  return (
    <DemoPortalNavProvider defaultId="ozet" items={navItems}>
      <main className="demo-portal-page cp-page customer-portal-page" data-portal-theme={snapshot.branding.theme} data-portal-mode={snapshot.branding.colorMode}>
        <a className="skip-link" href="#ozet">
          Panele geç
        </a>

        <div className="cp-shell">
          <aside className="cp-sidebar" aria-label="Müşteri paneli menüsü">
            <SiteBrand href="/musteri-panel" subtitle="MÜŞTERİ PANELİ" label="Yazılım müşterisi paneli" />
            <div className="cp-real-customer-brand">
              <span>{snapshot.branding.logoUrl ? <img src={snapshot.branding.logoUrl} alt="" /> : snapshot.branding.monogram}</span>
              <div><small>ÇALIŞMA ALANI</small><strong>{snapshot.branding.companyName}</strong><em>{snapshot.branding.providerLabel}</em></div>
            </div>
            <p className="cp-sidebar-badge">SALT OKUNUR · güvenli oturum</p>
            <DemoPortalNav />
            <div className="cp-sidebar-foot">
              <small>AKTİF MÜŞTERİ OTURUMU</small>
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
                <DemoPortalMobileToggle />
                <h1>
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
              <strong>Güvenli salt okunur oturum.</strong>
              <span>Veri Avcı müşteri kaydınızdan okunur; yönetim işlemleri bu panelde açılmaz.</span>
            </div>

            <div className="cp-panels" aria-live="polite">
              <DemoPortalPanel aria-label="Panel özeti" className="cp-panel-ozet" id="ozet">
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

                <div className="cp-stats" aria-label="Panel özeti">
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
                </div>
                {snapshot.weeklyReport ? <section className="cp-real-weekly"><div><span className="kicker">HAFTALIK YÖNETİCİ ÖZETİ</span><h2>Son ölçüm dönemi</h2><p>{snapshot.weeklyReport.periodEnd || "Tarih bilgisi yok"}</p></div><ul>{snapshot.weeklyReport.highlights.map((item) => <li key={item.key}><small>{item.label}</small><strong>{item.unit === "basis_points" ? `%${(item.value / 100).toLocaleString("tr-TR")}` : item.value.toLocaleString("tr-TR")}</strong></li>)}</ul></section> : <p className="cp-card-lead cp-empty-note">Haftalık rapor için henüz yeterli gerçek ölçüm yok.</p>}
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="bildirimler">
                <div className="cp-card-head"><span className="kicker">AKILLI BİLDİRİMLER</span><b className="cp-pill">{snapshot.notifications.length} kayıt</b></div>
                <h2>Hesabınıza ait sinyaller</h2>
                {snapshot.notifications.length ? <ul className="cp-module-list">{snapshot.notifications.map((item) => <li key={item.id} className={`is-${item.tone}`}><div><strong>{item.title}</strong><span>{item.body}</span></div><a className="cp-pill" href={`#${item.targetSection}`}>İncele</a></li>)}</ul> : <p className="cp-card-lead cp-empty-note">Şu an yayınlanmış bir bildirim yok. Hesabınız için uydurma hareket gösterilmez.</p>}
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="operasyon">
                <div className="cp-card-head"><span className="kicker">SERVİS SAĞLIĞI</span><b className={`cp-pill ${snapshot.serviceHealth.tone === "healthy" ? "is-live" : ""}`}>{snapshot.serviceHealth.label}</b></div>
                <h2>Operasyon ve SLA görünümü</h2>
                <div className="cp-stats"><article><small>Sağlık puanı</small><strong>{snapshot.serviceHealth.score ?? "—"}</strong><span>{snapshot.serviceHealth.score === null ? "ölçüm verisi yok" : "100 üzerinden"}</span></article><article><small>Açık destek</small><strong>{snapshot.serviceHealth.openTickets}</strong><span>{snapshot.serviceHealth.criticalTickets} kritik</span></article><article><small>İlk yanıt</small><strong>{snapshot.serviceHealth.firstResponseMinutes === null ? "—" : `${snapshot.serviceHealth.firstResponseMinutes} dk`}</strong><span>{snapshot.serviceHealth.firstResponseMinutes === null ? "ölçüm verisi yok" : "son snapshot"}</span></article></div>
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-ops-checklist cp-panel-card" id="altyapi">
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
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="tofy">
                <div className="cp-card-head"><span className="kicker">TOFY PERFORMANS MERKEZİ</span><b className="cp-pill">Salt okunur</b></div>
                <h2>Öneri, kalite ve deney görünümü</h2>
                <PortalTofyPerformanceCenter snapshot={snapshot.tofy} mode="customer" />
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="lisanslar">
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
                  <RecordList emptyLabel="Henüz lisans veya fatura kaydı görünmüyor." items={billingRecords} />
                </div>
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="erisim">
                <div className="cp-card-head">
                  <span className="kicker">YAZILIM SİPARİŞLERİ</span>
                  <b className="cp-pill">Salt okunur</b>
                </div>
                <h2>Paket ve modül siparişleri</h2>
                <p className="cp-card-lead">
                  Müşteriye atanmış modül ve entegrasyon kapsamı burada listelenir; gizli anahtarlar hiçbir zaman panele gönderilmez.
                </p>
                {snapshot.moduleInstances.length ? <ul className="cp-module-list">{snapshot.moduleInstances.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>{item.coverage || "Kapsam notu yok"}</span></div><b className="cp-pill">{item.status}</b></li>)}</ul> : <p className="cp-card-lead cp-empty-note">Müşteriye atanmış modül bulunmuyor.</p>}
                {snapshot.integrationInstances.length ? <ul className="cp-module-list">{snapshot.integrationInstances.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>{item.lastSyncAt ? `Son senkron: ${item.lastSyncAt}` : "Henüz başarılı senkron yok"}</span></div><b className="cp-pill">{item.status} · %{item.setupProgress}</b></li>)}</ul> : <p className="cp-card-lead cp-empty-note">Müşteriye atanmış entegrasyon bulunmuyor.</p>}
                {snapshot.upgradeOpportunities.length ? <div className="cp-upgrade-scope"><span className="kicker">KAPSAM GÖRÜNÜMÜ</span><p>{snapshot.upgradeOpportunities.slice(0, 3).map((item) => item.name).join(" · ")} mevcut lisans kapsamına atanmadı.</p></div> : null}
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="destek">
                <div className="cp-card-head">
                  <span className="kicker">DESTEK</span>
                  <b className="cp-pill">Salt okunur</b>
                </div>
                <h2>Destek talepleri</h2>
                <p className="cp-card-lead">
                  Açık ve kapalı destek kayıtları yalnızca görüntülenir. Yeni talep destek merkezi üzerinden açılır.
                </p>
                <RecordList emptyLabel="Henüz destek kaydı görünmüyor." items={snapshot.tickets} />
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="teslim">
                <div className="cp-card-head">
                  <span className="kicker">FATURALAR</span>
                  <b className="cp-pill">Salt okunur</b>
                </div>
                <h2>Teslim, eğitim ve dokümanlar</h2>
                <p className="cp-card-lead">
                  Müşteriye atanmış güvenli doküman bağlantıları burada gösterilir. Dosya yükleme bu salt okunur panelde yapılmaz.
                </p>
                {snapshot.documents.length ? <ul className="cp-module-list">{snapshot.documents.map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.category}</span></div><a className="cp-pill" href={item.url} target="_blank" rel="noreferrer">Aç</a></li>)}</ul> : <p className="cp-card-lead cp-empty-note">Henüz paylaşılmış teslim veya eğitim dokümanı yok.</p>}
              </DemoPortalPanel>

              <DemoPortalPanel as="article" className="cp-card cp-panel-card" id="sonraki">
                <div className="cp-card-head"><span className="kicker">SONRAKİ ADIMLAR</span><b className="cp-pill">{snapshot.onboarding.progress}/{snapshot.onboarding.total}</b></div>
                <h2>Kurulum ve önerilen aksiyonlar</h2>
                <div className="cp-onboarding-progress" role="progressbar" aria-valuemin={0} aria-valuemax={snapshot.onboarding.total} aria-valuenow={snapshot.onboarding.progress}><span style={{ width: `${(snapshot.onboarding.progress / snapshot.onboarding.total) * 100}%` }} /></div>
                {snapshot.notifications.length ? <ul className="cp-module-list">{snapshot.notifications.map((item) => <li key={`next-${item.id}`}><div><strong>{item.title}</strong><span>{item.body}</span></div><a className="button button-ghost" href={`#${item.targetSection}`}>Şimdi başlat</a></li>)}</ul> : <p className="cp-card-lead cp-empty-note">Şu an önerilen bir aksiyon yok, her şey yolunda.</p>}
              </DemoPortalPanel>
            </div>
          </div>
        </div>

        <DemoPortalMobileDrawer />
      </main>
    </DemoPortalNavProvider>
  );
}
