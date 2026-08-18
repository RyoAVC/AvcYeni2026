import type { PackageId } from "./package-options.ts";
import { getPackageName, parseCatalogPackageId } from "./package-options.ts";

/**
 * Start / Scale / Enterprise için detaylı kapsam özeti.
 * Fiyatlar örnek banddır; güncel tutar teklifte netleşir.
 */

export type PackageScopeDetail = {
  id: PackageId;
  label: string;
  listPrice: string;
  salePrice: string;
  traffic: string;
  emailAccounts: string;
  summary: string;
  features: ReadonlyArray<string>;
  featured?: boolean;
};

export const PACKAGE_PRICE_DISCLOSURE =
  "Bu rakamlar örnek fiyat bandıdır; güncel tutar kapsam ve teklifte netleşir.";

export const PACKAGE_SCOPE_DETAILS: ReadonlyArray<PackageScopeDetail> = [
  {
    id: "start",
    label: "HIZLI BAŞLANGIÇ",
    listPrice: "79.000 TL",
    salePrice: "49.999 TL",
    traffic: "1.500 GB",
    emailAccounts: "20 adet",
    summary:
      "Kendi web mağazasıyla kontrollü bir başlangıç yapmak isteyen işletmeler için Start kapsamının detaylı özeti.",
    features: [
      "7/24 telefon ve ticket destek + eğitim",
      "Sınırsız ürün, kategori, marka ve medya alanı",
      "SSL, güvenlik ve kalite sertifikasyon çerçevesi",
      "Havale / EFT ve kapıda ödeme seçenekleri",
      "Anında sanal POS ve banka sanal POS entegrasyonu",
      "Ürün karşılaştırma, sıralama ve temel katalog yönetimi",
      "İçerik yönetimi ve mobil uyumlu yönetim paneli",
      "N11 / Hepsiburada tarzı standart pazaryeri bağlantıları",
      "Kargo entegrasyonu, premium pazaryeri ve mobil uygulama isteğe bağlı",
      "1.500 GB trafik kapasitesi · 20 e-posta hesabı",
    ],
    featured: false,
  },
  {
    id: "scale",
    label: "BÜYÜME ODAĞI",
    listPrice: "110.000 TL",
    salePrice: "74.999 TL",
    traffic: "3.000 GB",
    emailAccounts: "100 adet",
    summary:
      "Kataloğunu, satış kanallarını ve operasyonunu genişleten markalar için Scale kapsamının detaylı özeti.",
    features: [
      "Start paketindeki çekirdek mağaza ve ödeme kapsamı",
      "Gelişmiş kampanya, sepet ve ürün kişiselleştirme araçları",
      "Toplu ürün güncelleme ve Excel ile yükleme / güncelleme",
      "Ticket yönetimi ve sipariş sonrası süreç hatırlatmaları",
      "Standart + genişletilmiş pazaryeri bağlantı seçenekleri",
      "Kargo barkod / takip entegrasyonlarına daha geniş erişim",
      "B2B bayi satışı ve asorti gibi büyüyen operasyon modülleri",
      "Blog / içerik pazarlama ve özelleştirilebilir üyelik formu",
      "Güçlü raporlama (sipariş, ürün, ödeme, kâr-zarar)",
      "3.000 GB trafik kapasitesi · 100 e-posta hesabı",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    label: "KURUMA ÖZEL",
    listPrice: "170.000 TL",
    salePrice: "119.999 TL",
    traffic: "5.500 GB",
    emailAccounts: "250 adet",
    summary:
      "Yüksek hacim, çoklu kanal ve daha geniş entegrasyon ihtiyacı olan şirketler için Enterprise kapsamının detaylı özeti.",
    features: [
      "Scale paketindeki büyüyen operasyon kapsamının üst seti",
      "Premium pazaryeri (Trendyol, Amazon, Çiçeksepeti, Pazarama vb.)",
      "Sepeti taksit limitlerine göre bölme ve gelişmiş ödeme senaryoları",
      "Yönetici yetkilendirme ve çok kullanıcılı panel kontrolü",
      "Bayi / üye grubuna özel fiyat ve limit yönetimi",
      "XML ile fiyat karşılaştırma siteleri ve tedarikçi aktarımları",
      "Pazaryerine otomatik fiyat / stok / komisyon senaryoları",
      "Mobil uygulama (iOS & Android) ve geniş kargo entegrasyonları",
      "İstek listesi, kombin ürün, aksesuar ve gelişmiş katalog modülleri",
      "5.500 GB trafik kapasitesi · 250 e-posta hesabı",
    ],
    featured: false,
  },
];

/** Karşılaştırma: Start | Scale | Enterprise */
export const PACKAGE_SCOPE_COMPARISON_ROWS = [
  ["Trafik kapasitesi", "1.500 GB", "3.000 GB", "5.500 GB"],
  ["E-posta hesabı", "20 adet", "100 adet", "250 adet"],
  ["Standart pazaryeri", "Dahil", "Dahil", "Dahil"],
  ["Premium pazaryeri", "Opsiyonel", "Genişletilmiş", "Dahil"],
  ["Kargo entegrasyonu", "Opsiyonel", "Genişletilmiş", "Dahil"],
  ["Mobil uygulama", "Opsiyonel", "Opsiyonel", "Dahil / planlanır"],
  ["B2B bayi satışı", "Opsiyonel", "Dahil / planlanır", "Dahil"],
  ["Blog / içerik", "Sınırlı", "Opsiyonel / dahil", "Dahil"],
  ["Destek", "7/24", "7/24", "7/24 + öncelikli çerçeve"],
] as const;

export function packageScopeTitle(id: PackageId) {
  return getPackageName(id);
}

export function orderPriceNoteFromCatalog(catalogId: unknown) {
  const id = parseCatalogPackageId(catalogId);
  const detail = PACKAGE_SCOPE_DETAILS.find((item) => item.id === id);
  if (!detail) return "";
  return `${detail.salePrice} örnek band (teklif değildir)`;
}

export function packageDraftFromCatalog(catalogId: unknown) {
  const id = parseCatalogPackageId(catalogId);
  const detail = PACKAGE_SCOPE_DETAILS.find((item) => item.id === id);
  if (!id || !detail) return undefined;
  const sortOrder = id === "start" ? 10 : id === "scale" ? 20 : 30;
  return {
    name: getPackageName(id),
    slug: id,
    family: "eticaret",
    summary: detail.summary.slice(0, 280),
    features: detail.features.join("\n").slice(0, 2000),
    priceNote: orderPriceNoteFromCatalog(id),
    sortOrder,
    status: "live",
  };
}
