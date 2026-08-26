import Link from "next/link";
import { withBasePath } from "../base-path";
import { SiteBrand } from "../site-brand";

export type AdminSection =
  | "panel"
  | "urunler"
  | "kategoriler"
  | "markalar"
  | "siparisler"
  | "basvurular"
  | "faturalar"
  | "musteriler"
  | "kampanyalar"
  | "kuponlar"
  | "istatistik"
  | "raporlar"
  | "entegrasyonlar"
  | "paketler"
  | "moduller"
  | "destek"
  | "vitrin"
  | "editor"
  | "ayarlar"
  | "loglar";

interface NavItem {
  id: AdminSection;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "GENEL BAKIŞ",
    items: [
      { id: "panel", label: "Kontrol Merkezi", href: "/yonetim", icon: "dashboard" },
    ],
  },
  {
    groupTitle: "ÜRÜNLEŞTİRME & LİSANSLAMA",
    items: [
      { id: "paketler", label: "Altyapı Paketleri", href: "/yonetim/paketler", icon: "layers" },
      { id: "moduller", label: "Eklenti & Modüller", href: "/yonetim/moduller", icon: "grid" },
      { id: "entegrasyonlar", label: "Entegrasyon Kataloğu", href: "/yonetim/entegrasyonlar", icon: "zap" },
    ],
  },
  {
    groupTitle: "MÜŞTERİ & TİCARİ OPERASYON",
    items: [
      { id: "basvurular", label: "Teklif & Başvurular", href: "/yonetim/basvurular", icon: "inbox" },
      { id: "musteriler", label: "Müşteri Portföyü", href: "/yonetim/musteriler", icon: "users" },
      { id: "siparisler", label: "Lisans & Hizmet Atamaları", href: "/yonetim/siparisler", icon: "cart" },
      { id: "faturalar", label: "Faturalar & Tahsilat", href: "/yonetim/faturalar", icon: "receipt" },
      { id: "destek", label: "Destek & SLA", href: "/yonetim/destek", icon: "life-buoy" },
    ],
  },
  {
    groupTitle: "SAĞLAYICI GÖRÜNÜMÜ",
    items: [
      { id: "raporlar", label: "Gelir & Lisans Raporu", href: "/yonetim/raporlar", icon: "pie-chart" },
      { id: "istatistik", label: "Avcı Site Trafiği", href: "/yonetim/istatistik", icon: "trending-up" },
      { id: "vitrin", label: "Portal Bildirimleri", href: "/yonetim/vitrin", icon: "bell" },
    ],
  },
  {
    groupTitle: "AVCI SİTESİ & SİSTEM",
    items: [
      { id: "editor", label: "Avcı Site İçerikleri", href: "/yonetim/editor", icon: "layout" },
      { id: "ayarlar", label: "Marka & Sistem Ayarları", href: "/yonetim/ayarlar", icon: "settings" },
      { id: "loglar", label: "Denetim Kayıtları", href: "/yonetim/loglar", icon: "shield" },
    ],
  },
];

function NavIcon({ type }: { type: string }) {
  switch (type) {
    case "dashboard":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <rect height="9" width="7" x="3" y="3" rx="1" />
          <rect height="5" width="7" x="14" y="3" rx="1" />
          <rect height="9" width="7" x="14" y="12" rx="1" />
          <rect height="5" width="7" x="3" y="16" rx="1" />
        </svg>
      );
    case "box":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" x2="12" y1="22.08" y2="12" />
        </svg>
      );
    case "tags":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" x2="7.01" y1="7" y2="7" />
        </svg>
      );
    case "building":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <rect height="18" width="16" x="4" y="3" rx="2" />
          <path d="M9 9h1" /><path d="M14 9h1" /><path d="M9 13h1" /><path d="M14 13h1" /><path d="M9 17h6" />
        </svg>
      );
    case "layers":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "grid":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <rect height="7" width="7" x="3" y="3" rx="1" /><rect height="7" width="7" x="14" y="3" rx="1" />
          <rect height="7" width="7" x="14" y="14" rx="1" /><rect height="7" width="7" x="3" y="14" rx="1" />
        </svg>
      );
    case "cart":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "inbox":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      );
    case "receipt":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
          <line x1="8" x2="16" y1="8" y2="8" /><line x1="8" x2="16" y1="12" y2="12" /><line x1="8" x2="12" y1="16" y2="16" />
        </svg>
      );
    case "life-buoy":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
          <line x1="4.93" x2="9.17" y1="4.93" y2="9.17" /><line x1="14.83" x2="19.07" y1="14.83" y2="19.07" />
          <line x1="14.83" x2="19.07" y1="9.17" y2="4.93" /><line x1="4.93" x2="9.17" y1="19.07" y2="14.83" />
        </svg>
      );
    case "users":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "sparkles":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "ticket":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
          <path d="M3 12h2a2 2 0 0 0 0-4H3" /><path d="M21 12h-2a2 2 0 0 0 0 4h2" />
        </svg>
      );
    case "bell":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "trending-up":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "pie-chart":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      );
    case "zap":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "layout":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <rect height="18" width="18" x="3" y="3" rx="2" />
          <line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" />
        </svg>
      );
    case "settings":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "shield":
      return (
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminShell({
  current,
  displayName,
  children,
}: {
  current: AdminSection;
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <main className="admin-page admin-page-modern">
      <aside className="admin-sidebar admin-sidebar-modern">
        <div className="admin-sidebar-header">
          <SiteBrand href="/yonetim" label="Avcı E-Ticaret Yönetim Paneli" />
          <div className="admin-health-badge">
            <span className="status-dot status-dot--pulse" />
            <span>SİSTEM AKTİF</span>
          </div>
        </div>

        <nav aria-label="Yönetim Menüsü" className="admin-nav-modern">
          {NAV_GROUPS.map((group, idx) => (
            <div className="admin-nav-group" key={idx}>
              <span className="admin-nav-group-title">{group.groupTitle}</span>
              <div className="admin-nav-group-items">
                {group.items.map((item) => {
                  const isActive = current === item.id;
                  return (
                    <Link
                      className={`admin-nav-link ${isActive ? "active" : ""}`}
                      href={item.href}
                      key={item.id}
                    >
                      <span className="admin-nav-icon"><NavIcon type={item.icon} /></span>
                      <span className="admin-nav-text">{item.label}</span>
                      {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="admin-nav-group admin-nav-group--bottom">
            <Link className="admin-nav-link admin-nav-link--external" href="/">
              <span className="admin-nav-icon">
                <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
                </svg>
              </span>
              <span className="admin-nav-text">Avcı E-Ticaret Sitesi</span>
            </Link>
          </div>
        </nav>

        <div className="admin-user-card">
          <div className="admin-user-avatar">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="admin-user-info">
            <strong title={displayName}>{displayName}</strong>
            <span className="admin-user-role">Süper Yönetici</span>
          </div>
          <a
            aria-label="Oturumu kapat"
            className="admin-logout-btn"
            href={withBasePath("/api/yonetim/cikis")}
            title="Güvenli Çıkış"
          >
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </a>
        </div>
      </aside>

      <div className="admin-content-wrap">
        <header className="admin-topbar">
          <div className="admin-topbar-search">
            <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
              <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input placeholder="Müşteri, teklif, lisans veya modül ara..." type="search" />
            <kbd>⌘K</kbd>
          </div>

          <div className="admin-topbar-actions">
            <Link className="admin-ai-badge" href="/avcai">
              <span className="admin-ai-sparkle">✨</span>
              <span>Avcı AI Asistan</span>
            </Link>

            <Link className="admin-quick-add-btn" href="/yonetim/musteriler/yeni">
              <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
                <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>Yeni Müşteri</span>
            </Link>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}

