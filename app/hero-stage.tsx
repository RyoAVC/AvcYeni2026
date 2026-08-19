"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: "sales",
    eyebrow: "Satış merkezi · örnek görünüm",
    titleLead: "E-ticaretin geleceğini",
    titleAccent: "tek panelden yönetin.",
    lead:
      "Satış, ürün ve dönüşümü aynı ekranda görün. Büyürken altyapı sizinle birlikte ölçeklensin.",
    caption: "Satış Merkezi",
  },
  {
    id: "orders",
    eyebrow: "Sipariş akışı · örnek görünüm",
    titleLead: "Siparişler düşerken",
    titleAccent: "kuyruk sakin kalsın.",
    lead:
      "Web ve pazaryerinden gelen siparişler tek kuyruğa düşer. Hazırlık, kargo ve iade aynı ritimde ilerler.",
    caption: "Sipariş Kuyruğu",
  },
  {
    id: "channels",
    eyebrow: "Kanal senkronu · örnek görünüm",
    titleLead: "Stok ve kanallar",
    titleAccent: "aynı anda hizalansın.",
    lead:
      "Web mağazası ile pazaryeri stokları eşzamanlı kalsın. Kritik SKU’ları erken görün, satış kaçırmayın.",
    caption: "Stok & Kanallar",
  },
] as const;

const ORDER_FEED = [
  { code: "#AVC-2841", channel: "Web", amount: "₺3.490", state: "Yeni" },
  { code: "#AVC-2848", channel: "Trendyol", amount: "₺890", state: "Hazırlanıyor" },
  { code: "#AVC-2852", channel: "Hepsiburada", amount: "₺2.140", state: "Kargoda" },
  { code: "#AVC-2856", channel: "N11", amount: "₺1.260", state: "Yeni" },
] as const;

const CHANNELS = [
  { name: "Web mağaza", stock: "842", sync: "Eşzamanlı" },
  { name: "Trendyol", stock: "842", sync: "Eşzamanlı" },
  { name: "Hepsiburada", stock: "841", sync: "Senkron" },
  { name: "N11", stock: "842", sync: "Eşzamanlı" },
] as const;

function WorkspaceBar({ label }: { label: string }) {
  return (
    <div className="window-bar hero-workspace-bar">
      <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
      <span>{label}</span>
      <b>Temsili panel</b>
    </div>
  );
}

function SlideSales() {
  return (
    <div className="hero-slide hero-slide--sales">
      <div className="hero-slide-frame hero-workspace hero-command-panel">
        <WorkspaceBar label="Avcı Commerce · Satış operasyonu" />
        <div className="hero-workspace-body hero-command-body">
          <header className="hero-command-head">
            <div><small>BUGÜNÜN OPERASYONU</small><strong>Satış komuta merkezi</strong></div>
            <span><i className="status-dot" /> Canlı görünüm</span>
          </header>
          <div className="hero-command-grid">
            <section className="hero-revenue-card">
              <div className="hero-card-label"><span>Net satış</span><em>Son 7 gün</em></div>
              <strong>₺284.920</strong>
              <p><b>+18,4%</b> önceki döneme göre</p>
              <div className="hero-revenue-chart" aria-hidden="true">
                {[42, 58, 49, 76, 64, 91, 72, 86, 68, 96].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </section>
            <div className="hero-kpi-stack">
              <article><span>Sipariş</span><strong>1.248</strong><em>+12,1%</em></article>
              <article><span>Dönüşüm</span><strong>%4,82</strong><em>+0,8%</em></article>
              <article><span>Sepet</span><strong>₺2.340</strong><em>Ort.</em></article>
            </div>
            <section className="hero-activity-card">
              <div className="hero-card-label"><span>Son hareketler</span><em>Şimdi</em></div>
              <ul>
                <li><i className="status-dot" /><span><small>Yeni sipariş</small><strong>#AVC-2841</strong></span><b>₺3.490</b></li>
                <li><i className="status-dot" /><span><small>Ödeme onaylandı</small><strong>#AVC-2839</strong></span><b>₺1.860</b></li>
                <li><i className="status-dot" /><span><small>Kargo etiketi</small><strong>#AVC-2834</strong></span><b>Hazır</b></li>
              </ul>
            </section>
            <aside className="hero-insight-card">
              <div className="ai-icon" aria-hidden="true" />
              <small>TOFY / SATIŞ SİNYALİ</small>
              <strong>3 fırsat önceliklendirildi.</strong>
              <p>Sepette bekleyen müşteriler ve stok hareketi birlikte değerlendirildi.</p>
              <span>İncelemeye hazır</span>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideOrders({ pulse }: { pulse: number }) {
  const highlighted = pulse % ORDER_FEED.length;
  const columns = [
    { title: "Yeni", count: "18", items: [ORDER_FEED[0], ORDER_FEED[3]] },
    { title: "Hazırlanıyor", count: "09", items: [ORDER_FEED[1]] },
    { title: "Kargoda", count: "27", items: [ORDER_FEED[2]] },
  ];

  return (
    <div className="hero-slide hero-slide--orders">
      <div className="hero-slide-frame hero-workspace hero-flow-panel">
        <WorkspaceBar label="Avcı Commerce · Sipariş akışı" />
        <div className="hero-workspace-body hero-flow-body">
          <header className="hero-command-head">
            <div><small>UÇTAN UCA AKIŞ</small><strong>Sipariş kontrol masası</strong></div>
            <span><i className="status-dot" /> 54 açık kayıt</span>
          </header>
          <div className="hero-order-board">
            {columns.map((column) => (
              <section key={column.title}>
                <header><span>{column.title}</span><b>{column.count}</b></header>
                <div>
                  {column.items.map((order) => {
                    const orderIndex = ORDER_FEED.findIndex((item) => item.code === order.code);
                    return (
                      <article key={order.code} className={orderIndex === highlighted ? "is-fresh" : undefined}>
                        <small>{order.channel}</small>
                        <strong>{order.code}</strong>
                        <div className="hero-order-card-footer"><span>{order.state}</span><b>{order.amount}</b></div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="hero-flow-footer">
            <span><i className="status-dot" /> Otomasyon kuralları çalışıyor</span>
            <strong>{ORDER_FEED[highlighted].code} sıradaki adıma hazır</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideChannels() {
  return (
    <div className="hero-slide hero-slide--channels">
      <div className="hero-slide-frame hero-workspace hero-network-panel">
        <WorkspaceBar label="Avcı Commerce · Kanal ağı" />
        <div className="hero-workspace-body hero-network-body">
          <header className="hero-command-head">
            <div><small>TEK KATALOG / ÇOK KANAL</small><strong>Senkronizasyon ağı</strong></div>
            <span><i className="status-dot" /> Tüm bağlantılar açık</span>
          </header>
          <div className="hero-network-map" aria-label="Katalog ve satış kanalları bağlantı görünümü">
            <div className="hero-network-axis hero-network-axis-x" aria-hidden="true" />
            <div className="hero-network-axis hero-network-axis-y" aria-hidden="true" />
            <div className="hero-network-core">
              <span>AVC</span>
              <strong>Ortak katalog</strong>
              <small>842 aktif SKU</small>
            </div>
            {CHANNELS.map((channel, index) => (
              <article key={channel.name} className={`hero-network-node hero-network-node-${index + 1}`}>
                <i className="status-dot" />
                <span><small>{channel.name}</small><strong>{channel.stock} SKU</strong></span>
                <em>{channel.sync}</em>
              </article>
            ))}
          </div>
          <div className="hero-network-footer">
            <span>Son eşitleme <strong>12 sn önce</strong></span>
            <span>Fiyat kuyruğu <strong>0 bekleyen</strong></span>
            <span>Stok sağlığı <strong>%99,8</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroStage({
  ctaPrimary = "Ücretsiz demo alın",
  ctaSecondary = "Yazılımları keşfedin",
  contactEmail = "info@avcieticaret.com",
}: {
  ctaPrimary?: string;
  ctaSecondary?: string;
  contactEmail?: string;
}) {
  const [index, setIndex] = useState(0);
  const [pulse, setPulse] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduce) return;

    const slideTimer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, coarse ? 8000 : 3000);

    const pulseTimer = window.setInterval(() => {
      setPulse((tick) => tick + 1);
    }, 2000);

    return () => {
      window.clearInterval(slideTimer);
      window.clearInterval(pulseTimer);
    };
  }, []);

  return (
    <>
      <div className="hero-copy">
        <div className="eyebrow reveal reveal-one" key={`eye-${slide.id}`}>
          <span className="pulse" /> {slide.eyebrow}
        </div>
        <h1 className="reveal reveal-two" key={`title-${slide.id}`}>
          {slide.titleLead}
          <span> {slide.titleAccent}</span>
        </h1>
        <p className="hero-lead reveal reveal-three" key={`lead-${slide.id}`}>
          {slide.lead}
        </p>
        <div className="hero-actions reveal reveal-four">
          <a className="button button-primary" href={`mailto:${contactEmail}?subject=Ücretsiz Demo Talebi`}>
            {ctaPrimary}
          </a>
          <a className="button button-ghost" href="#urunler">
            {ctaSecondary}
          </a>
        </div>
        <div className="hero-proof reveal reveal-four">
          <div className="avatar-stack" aria-hidden="true">
            <span>H</span><span>A</span><span>S</span>
          </div>
          <p>
            <strong>Tek ekip, tek teknoloji merkezi.</strong>
            <br />
            Hatay360, Adana360 ve SEOEksper deneyimiyle.
          </p>
        </div>
      </div>

      <div className="product-stage hero-stage reveal reveal-three">
        <div className="stage-glow" />
        <div className="hero-slider-shell">
          <div className="hero-slider" aria-roledescription="carousel" aria-label="Ürün görünümleri">
            <div
              className="hero-slider-track"
              style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
            >
              <div className="hero-slide-slot" aria-hidden={index !== 0}>
                <SlideSales />
              </div>
              <div className="hero-slide-slot" aria-hidden={index !== 1}>
                <SlideOrders pulse={pulse} />
              </div>
              <div className="hero-slide-slot" aria-hidden={index !== 2}>
                <SlideChannels />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stage-footer">
          <p className="dashboard-caption">
            {slide.caption} · Temsili arayüz · Tutarlar ve kayıtlar örnek veridir.
          </p>
          <div className="hero-stage-controls">
            <button
              type="button"
              className="hero-stage-nav"
              aria-label="Önceki görünüm"
              onClick={() => setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)}
            >
              ‹
            </button>
            <div className="hero-stage-dots" role="tablist" aria-label="Hero görünümleri">
              {SLIDES.map((item, slideIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  className={slideIndex === index ? "is-active" : undefined}
                  onClick={() => setIndex(slideIndex)}
                >
                  <span className="visually-hidden">{item.caption}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="hero-stage-nav"
              aria-label="Sonraki görünüm"
              onClick={() => setIndex((current) => (current + 1) % SLIDES.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
