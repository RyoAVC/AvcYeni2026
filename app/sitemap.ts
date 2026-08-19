import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "./base-path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_BASE_URL;
  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/platform`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/yazilimlar`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eticaret-altyapisi`,
      lastModified: new Date("2026-08-12"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/b2b-c2c`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/e-ihracat`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mobil-sektorel`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/paketler`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fiyatlandirma`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/yapay-zeka`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/avcai`,
      lastModified: new Date("2026-08-16"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/entegrasyonlar`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cozum-senaryolari`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cozum-senaryolari/peynir`,
      lastModified: new Date("2026-08-16"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/referanslar`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bayi-partner`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kaynaklar`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/musteri-merkezi`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/destek`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/alan-adi-hosting`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/proje-sureci`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hizmetler`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/teklif`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guvenlik`,
      lastModified: new Date("2026-08-19"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ozel-yazilim`,
      lastModified: new Date("2026-08-19"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gizlilik`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
