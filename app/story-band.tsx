"use client";

import { useEffect, useState } from "react";
import { StartIcon } from "./start-icons";
import { withBasePath } from "./base-path";

const STORIES = [
  {
    id: "atlas",
    quote: "E-ticareti ciddiye alıyorum diyen her firma Avcı ile çalışmalı.",
    name: "Elif Demir",
    role: "Kurucu",
    brand: "Atlas Home",
    sector: "Ev & yaşam",
    strength: "Güçlü büyüme",
    photo: "/story/elif.svg",
    metrics: [
      ["%285", "Yıllık ciro"],
      ["%126", "Sipariş sayısı"],
      ["%247", "Organik trafik"],
    ],
  },
  {
    id: "void",
    quote: "Ziyaretçiler sitede takılmadan ilerliyor; sipariş kuyruğu da sakin kaldı.",
    name: "Mert Yılmaz",
    role: "Kurucu",
    brand: "Void Market",
    sector: "Gıda & market",
    strength: "Yüksek tempo",
    photo: "/story/mert.svg",
    metrics: [
      ["%264", "Yıllık ciro"],
      ["%272", "Sipariş sayısı"],
      ["%350", "Organik trafik"],
    ],
  },
  {
    id: "nord",
    quote: "E-ticaretteki en önemli yatırımımız Avcı altyapısı oldu.",
    name: "Aylin Koç",
    role: "E-Ticaret Yöneticisi",
    brand: "Nord Atelier",
    sector: "Moda",
    strength: "Sağlam omurga",
    photo: "/story/aylin.svg",
    metrics: [
      ["%190", "Yıllık ciro"],
      ["%227", "Sipariş sayısı"],
      ["%114", "Organik trafik"],
    ],
  },
] as const;

export function StoryBand() {
  const [index, setIndex] = useState(0);
  const story = STORIES[index];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % STORIES.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="story-band" id="basari" aria-labelledby="basari-baslik">
      <div className="story-band-copy">
        <span className="kicker">KULLANICI YORUMLARI</span>
        <h2 id="basari-baslik">
          Sıradaki başarı hikâyesi
          <em> sizinki olabilir.</em>
        </h2>
        <p>
          Sektör, yıldız ve büyüme gücüyle örnek vakalar. Operasyonun nasıl
          hızlandığını kendi ağızlarından dinleyin.
        </p>
        <a className="button button-primary" href="#iletisim">
          Başarı hikâyelerini görüntüle
        </a>
      </div>

      <div className="story-band-stage" aria-roledescription="carousel" aria-label="Başarı hikâyeleri">
        <div className="story-band-viewport">
          <div
            className="story-band-track"
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {STORIES.map((item, slideIndex) => (
              <blockquote
                key={item.id}
                className="story-band-quote"
                aria-hidden={slideIndex !== index}
              >
                <div className="story-band-tags">
                  <b>{item.sector}</b>
                  <em>
                    <StartIcon name="clap" />
                    {item.strength}
                  </em>
                </div>
                <div className="story-band-stars" aria-label="5 yıldız">
                  {Array.from({ length: 5 }, (_, star) => (
                    <StartIcon key={star} name="star" />
                  ))}
                </div>
                <p>{item.quote}</p>
                <footer>
                  <img src={withBasePath(item.photo)} alt="" width={56} height={56} />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.role} · {item.brand}</small>
                  </div>
                </footer>
                <dl className="story-band-metrics">
                  {item.metrics.map(([value, label]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </blockquote>
            ))}
          </div>
        </div>

        <div className="story-band-footer">
          <p>{story.name} · {story.sector} · örnek vaka · temsili rakamlar</p>
          <div className="story-band-controls">
            <button
              type="button"
              className="hero-stage-nav"
              aria-label="Önceki hikâye"
              onClick={() => setIndex((current) => (current - 1 + STORIES.length) % STORIES.length)}
            >
              ‹
            </button>
            <div className="hero-stage-dots" role="tablist" aria-label="Başarı hikâyeleri">
              {STORIES.map((item, slideIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  className={slideIndex === index ? "is-active" : undefined}
                  onClick={() => setIndex(slideIndex)}
                >
                  <span className="visually-hidden">{item.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="hero-stage-nav"
              aria-label="Sonraki hikâye"
              onClick={() => setIndex((current) => (current + 1) % STORIES.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
