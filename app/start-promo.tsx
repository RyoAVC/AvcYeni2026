"use client";

import { useEffect, useState } from "react";
import { StartIcon } from "./start-icons";
import { withBasePath } from "./base-path";

const SLIDES = [
  {
    id: "store",
    label: "E-Ticaret",
    title: "Herkes için",
    accent: "E-Ticaret",
    text: "Online mağazanı oluştur, sipariş ve kanalı tek omurgada yönet.",
    action: "Hızlı ve kolay e-ticaret",
  },
  {
    id: "pos",
    label: "Sanal POS",
    title: "Sanal POS’unuz",
    accent: "1 saatte aktif",
    text: "Hemen ödemelerinizi kart ile alın. PayTR, iyzico ve daha fazlası aynı omurgada.",
    action: "Hemen kart ile alın",
  },
] as const;

function ShopScene() {
  return (
    <div className="start-shop" aria-hidden="true">
      <div className="start-shop-screen">
        <div className="start-shop-bar"><i /><i /><i /><span>avci.store</span></div>
        <div className="start-shop-grid">
          <article><b /><small>Mint kupa</small><em>₺189</em></article>
          <article className="is-hot"><b /><small>Lime çanta</small><em>₺420</em></article>
          <article><b /><small>Cyan lamba</small><em>₺310</em></article>
          <article><b /><small>Set</small><em>₺990</em></article>
        </div>
        <div className="start-shop-cart">
          <StartIcon name="cart" />
          <div>
            <small>Sepete eklendi</small>
            <strong>Lime çanta · ₺420</strong>
          </div>
        </div>
      </div>
      <div className="start-shop-buyer">
        <img src={withBasePath("/story/elif.svg")} alt="" />
        <small>Alışveriş</small>
      </div>
      <span className="start-shop-cursor">
        <StartIcon name="cursor" />
        <i />
      </span>
    </div>
  );
}

function PosScene() {
  return (
    <div className="pos-banner-stage" aria-hidden="true">
      <div className="pos-card">
        <span className="start-banner-chip" />
        <small>PayTR · iyzico · daha fazlası</small>
        <strong>Kart tahsilatı</strong>
        <em>**** 2841</em>
        <div className="start-banner-lines" />
        <StartIcon name="card" />
      </div>
    </div>
  );
}

export function StartPromo() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="start-promo" aria-roledescription="carousel" aria-label="E-ticaret ve sanal POS">
      <div className="start-promo-viewport">
        <div
          className="start-promo-track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          <div className="start-banner start-promo-slide" aria-hidden={index !== 0}>
            <div className="start-banner-grid" />
            <div className="start-banner-glow" />
            <div className="start-banner-orb start-banner-orb-a" />
            <div className="start-banner-orb start-banner-orb-b" />
            <ShopScene />
            <div className="start-banner-copy">
              <h3>Herkes için <span>E-Ticaret</span></h3>
              <p>Online mağazanı oluştur, sipariş ve kanalı tek omurgada yönet.</p>
              <a className="button button-ghost" href="#iletisim">Hızlı ve kolay e-ticaret</a>
            </div>
          </div>

          <div className="start-banner start-promo-slide start-promo-slide--pos" aria-hidden={index !== 1}>
            <div className="start-banner-grid" />
            <div className="start-banner-glow" />
            <div className="start-banner-orb start-banner-orb-a" />
            <div className="start-banner-orb start-banner-orb-b" />
            <PosScene />
            <div className="start-banner-copy">
              <h3>Sanal POS’unuz <span>1 saatte aktif</span></h3>
              <p>Hemen ödemelerinizi kart ile alın. PayTR, iyzico ve daha fazlası.</p>
              <a className="button button-ghost" href="#iletisim">Hemen kart ile alın</a>
            </div>
          </div>
        </div>
      </div>

      <div className="start-banner-bar">
        <span>{slide.label}</span>
        <small>{slide.text}</small>
        <div className="start-promo-controls">
          <button
            type="button"
            className="hero-stage-nav"
            aria-label="Önceki şerit"
            onClick={() => setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)}
          >
            ‹
          </button>
          {SLIDES.map((item, slideIndex) => (
            <button
              key={item.id}
              type="button"
              className={slideIndex === index ? "is-active" : undefined}
              aria-label={item.label}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
          <button
            type="button"
            className="hero-stage-nav"
            aria-label="Sonraki şerit"
            onClick={() => setIndex((current) => (current + 1) % SLIDES.length)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
