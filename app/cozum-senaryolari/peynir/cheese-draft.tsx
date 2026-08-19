"use client";

import { useEffect, useRef, useState } from "react";
import { StartIcon } from "../../start-icons";

const STEPS = [
  {
    id: "vitrin",
    label: "Vitrin",
    title: "Burası müşterinin sitesi.",
    talk: "Altyapı alan işletmenin vitrini böyle durur. Banner ve slayt burada döner. Avcı peynir satmaz; bu demo mağaza, satılan yazılımın ön yüzüdür.",
  },
  {
    id: "urun",
    label: "Ürün",
    title: "Müşteri ürünü böyle gezer.",
    talk: "Ezine 500 g ile Tulum 1 kg aynı aile; farkı gramaj. Ürüne bakılır, Sepete ekle denir. Katalog mağaza yazılımında yönetilir; alışverişçi yalnız vitrini görür.",
  },
  {
    id: "sepet",
    label: "Sepet",
    title: "Sepete eklenince böyle durur.",
    talk: "Ezine 500 g sepete düştü. Burası hâlâ alışveriş sitesi. Avcı’nın kendi iş paneli değil; müşterinin vitrinindeki sepet.",
  },
  {
    id: "odeme",
    label: "Ödeme",
    title: "Ödeme burada alınır.",
    talk: "Kart PayTR / iyzico örneğiyle vitrinde çekilir. Bu taslakta gerçek tahsilat yoktur. Başarılı sonuç sipariş kaydını üretir.",
  },
  {
    id: "panel",
    label: "Panel",
    title: "Sipariş panele böyle düşer.",
    talk: "#PYN-104 web’den geldi. Soğuk kutu bekliyor. Mağaza ekibi aynı kuyruğu görür. Avcı peynir satmaz; bu, altyapıyı alan işletmenin sipariş paneline düşüşüdür.",
  },
] as const;

const PRODUCTS = [
  { name: "Ezine 500 g", price: "₺210", hot: true },
  { name: "Tulum 1 kg", price: "₺380", hot: false },
  { name: "Lor 250 g", price: "₺95", hot: false },
  { name: "Çeçil 400 g", price: "₺165", hot: false },
] as const;

const BANNERS = [
  { kicker: "Kampanya slaytı", title: "Soğuk kutu ücretsiz", text: "İstanbul Avrupa · örnek banner" },
  { kicker: "Vitrin slaytı", title: "Yaz tadımı", text: "Ezine 500 g öne çıktı" },
] as const;

export function CheeseDraft() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [banner, setBanner] = useState(0);
  const [talking, setTalking] = useState(false);
  const [activeView, setActiveView] = useState(true);
  const active = STEPS[step];

  const go = (index: number) => {
    setHeld(true);
    setStep(index);
  };

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setActiveView(entry.isIntersecting && entry.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.5] },
    );
    observer.observe(node);
    const onVis = () => {
      if (document.hidden) setActiveView(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || held || !activeView) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [held, activeView]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !activeView) return undefined;
    const timer = window.setInterval(() => {
      setBanner((current) => (current + 1) % BANNERS.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [activeView]);

  useEffect(() => {
    setTalking(true);
    const timer = window.setTimeout(() => setTalking(false), 1400);
    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <div ref={rootRef} className={activeView ? "cheese-draft" : "cheese-draft is-idle"}>
      <aside className="cheese-guide" aria-live="polite">
        <GuideBot pointing={active.id} talking={talking} />
        <small>AVCI REHBER · İSTEĞE BAĞLI AI</small>
        <strong>{active.title}</strong>
        <p>{active.talk}</p>
        <p className="cheese-voice-note">Sağdaki Tofy maskotu yazıyla ve canlı sesle anlatır.</p>
        <button className="cheese-voice" type="button" onClick={() => window.dispatchEvent(new Event("avcai-open"))}>Tofy’ye sor</button>
        <div className="cheese-guide-steps" role="tablist" aria-label="Demo mağaza adımları">
          {STEPS.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`rehber-${item.id}`}
              key={item.id}
              aria-controls="peynir-vitrin"
              aria-selected={index === step}
              className={index === step ? "is-active" : undefined}
              onClick={() => go(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="product-stage cheese-store-stage">
        <div className="stage-glow" />
        <div id="peynir-vitrin" className="cheese-store" role="tabpanel" aria-labelledby={`rehber-${active.id}`}>
          {active.id === "panel" ? <PanelScene /> : (
            <ShopScene
              step={active.id}
              banner={BANNERS[banner]}
              onAdd={() => go(2)}
              onPay={() => go(3)}
              onFinish={() => go(4)}
            />
          )}
        </div>
        <p className="dashboard-caption">
          Demo vitrin · {active.label} · Tutarlar örnektir. Gerçek ödeme yoktur.
        </p>
      </div>
    </div>
  );
}

function GuideBot({ pointing, talking }: { pointing: string; talking: boolean }) {
  return (
    <div className={talking ? "cheese-bot is-talking" : "cheese-bot"} data-point={pointing} aria-hidden="true">
      <div className="cheese-bot-head">
        <span className="ai-icon">A</span>
        <i className="status-dot" />
        <i className="status-dot" />
      </div>
      <span className="cheese-bot-arm"><i /></span>
    </div>
  );
}

function ShopScene({
  step,
  banner,
  onAdd,
  onPay,
  onFinish,
}: {
  step: (typeof STEPS)[number]["id"];
  banner: (typeof BANNERS)[number];
  onAdd: () => void;
  onPay: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="start-shop cheese-shop">
      <div className="start-shop-screen">
        <div className="start-shop-bar">
          <i /><i /><i />
          <span>koypeyniri.avci.store</span>
        </div>
        <nav className="cheese-shop-nav" aria-label="Demo mağaza menüsü">
          <b>Köy Peyniri</b>
          <span>Peynirler</span>
          <span>Kampanya</span>
          <span>Sepet{step === "sepet" || step === "odeme" ? " (1)" : ""}</span>
        </nav>

        {(step === "vitrin" || step === "urun") && (
          <div className="cheese-shop-banner">
            <small>{banner.kicker}</small>
            <strong>{banner.title}</strong>
            <em>{banner.text}</em>
          </div>
        )}

        {step !== "odeme" && step !== "sepet" && (
          <div className="start-shop-grid cheese-shop-grid">
            {PRODUCTS.map((item) => (
              <article key={item.name} className={item.hot && step === "urun" ? "is-hot" : undefined}>
                <b />
                <small>{item.name}</small>
                <em>{item.price}</em>
                {item.hot && (step === "vitrin" || step === "urun") ? (
                  <button type="button" className="cheese-shop-add" onClick={onAdd}>
                    Sepete ekle
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {step === "sepet" && (
          <div className="cheese-shop-cart-page">
            <div className="card-head"><span>Sepet</span><small>1 ürün</small></div>
            <ul>
              <li>
                <strong>Ezine 500 g</strong>
                <small>Gramaj varyant · 1 adet</small>
                <b>₺210</b>
              </li>
            </ul>
            <button type="button" className="cheese-shop-add" onClick={onPay}>
              Ödemeye geç
            </button>
          </div>
        )}

        {step === "odeme" && (
          <div className="cheese-shop-pay">
            <div className="pos-card">
              <span className="start-banner-chip" />
              <small>PayTR · iyzico · örnek</small>
              <strong>Kart tahsilatı</strong>
              <em>**** 2841</em>
              <div className="start-banner-lines" />
              <StartIcon name="card" />
            </div>
            <button type="button" className="cheese-shop-add" onClick={onFinish}>
              Ödemeyi tamamla
            </button>
            <small>Gerçek çekim yok. Sonuç siparişi panele düşürür.</small>
          </div>
        )}
      </div>

      {(step === "urun" || step === "sepet") && (
        <div className="start-shop-cart">
          <StartIcon name="cart" />
          <div>
            <small>Sepete eklendi</small>
            <strong>Ezine 500 g · ₺210</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelScene() {
  return (
    <div className="hero-slide hero-slide--orders cheese-panel-slide">
      <div className="hero-slide-frame hero-orders-panel">
        <div className="hero-orders-top">
          <div>
            <small>Mağaza paneli · örnek</small>
            <strong>Sipariş kuyruğu</strong>
          </div>
          <b>Örnek veri</b>
        </div>
        <div className="hero-orders-stats">
          <div><small>Bekleyen</small><strong>1</strong></div>
          <div><small>Hazırlanan</small><strong>1</strong></div>
          <div><small>Kargoda</small><strong>1</strong></div>
        </div>
        <ul className="hero-orders-feed">
          <li className="is-fresh">
            <span className="status-dot" />
            <div>
              <small>Web · Yeni</small>
              <strong>#PYN-104</strong>
            </div>
            <em>₺210</em>
          </li>
          <li>
            <span className="status-dot" />
            <div>
              <small>Trendyol · Hazırlanıyor</small>
              <strong>#PYN-101</strong>
            </div>
            <em>₺860</em>
          </li>
          <li>
            <span className="status-dot" />
            <div>
              <small>Web · Kargoda</small>
              <strong>#PYN-098</strong>
            </div>
            <em>₺310</em>
          </li>
        </ul>
        <div className="hero-orders-toast" aria-live="polite">
          <span className="status-dot" />
          <div>
            <small>Vitrinden düştü</small>
            <strong>#PYN-104 · Soğuk kutu bekliyor</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
