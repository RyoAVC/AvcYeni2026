export const OFFER_INTERESTS = [
  "E-Ticaret altyapısı",
  "B2B / Bayi sistemi",
  "C2C pazaryeri",
  "E-İhracat",
  "E-Ticaret entegrasyonları",
  "Mobil uygulama",
  "Sektörel yazılım",
  "Yapay zekâ modülleri",
  "Merkezi lisans platformu",
  "Özel yazılım projesi",
  "Web sitesi ve e-ticaret",
  "SEO ve görünürlük",
  "Reklam ve büyüme",
  "Bakım ve teknik destek",
  "Alan adı, hosting ve yenileme",
  "Bayi / partner iş birliği",
] as const;

export type OfferInterest = (typeof OFFER_INTERESTS)[number];

export const OFFER_SOLUTION_SLUGS = {
  eticaret: "E-Ticaret altyapısı",
  b2b: "B2B / Bayi sistemi",
  c2c: "C2C pazaryeri",
  eihracat: "E-İhracat",
  entegrasyon: "E-Ticaret entegrasyonları",
  mobil: "Mobil uygulama",
  sektorel: "Sektörel yazılım",
  ai: "Yapay zekâ modülleri",
  lisans: "Merkezi lisans platformu",
  ozel: "Özel yazılım projesi",
  web: "Web sitesi ve e-ticaret",
  seo: "SEO ve görünürlük",
  reklam: "Reklam ve büyüme",
  destek: "Bakım ve teknik destek",
  hosting: "Alan adı, hosting ve yenileme",
  partner: "Bayi / partner iş birliği",
} as const satisfies Record<string, OfferInterest>;

export const OFFER_INTEREST_GROUPS: ReadonlyArray<{
  label: { tr: string; en: string };
  interests: ReadonlyArray<OfferInterest>;
}> = [
  {
    label: { tr: "E-ticaret çözümleri", en: "Commerce solutions" },
    interests: ["E-Ticaret altyapısı", "B2B / Bayi sistemi", "C2C pazaryeri", "E-İhracat", "E-Ticaret entegrasyonları", "Mobil uygulama"],
  },
  {
    label: { tr: "Modül ve özel yazılım", en: "Modules and custom software" },
    interests: ["Sektörel yazılım", "Yapay zekâ modülleri", "Merkezi lisans platformu", "Özel yazılım projesi"],
  },
  {
    label: { tr: "Dijital hizmetler ve iş ortaklığı", en: "Digital services and partnerships" },
    interests: ["Web sitesi ve e-ticaret", "SEO ve görünürlük", "Reklam ve büyüme", "Bakım ve teknik destek", "Alan adı, hosting ve yenileme", "Bayi / partner iş birliği"],
  },
];
