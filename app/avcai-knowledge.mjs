export const AVCAI_INTRO =
  "Merhaba, ben Tofy. Beni Avcı E-Ticaret geliştirdi. Avcı peynir, kıyafet veya mobilya satmaz; e-ticaret altyapısı, web sitesi ve modüller geliştirir. Paket, demo mağaza, fiyat veya yönetim panelini sorabilirsin.";

export const AVCAI_CHAT =
  "Merhaba, ben Tofy. Beni Avcı E-Ticaret geliştirdi; buradayım. Aklına takılanı yazabilir ya da sesli sorabilirsin. Şu an neyi netleştirelim?";

export const AVCAI_SUGGESTIONS = [
  { label: "Ne haber?", text: "Ne haber, nasıl gidiyor?" },
  { label: "Avcı nedir?", text: "Avcı nedir, ne satar?" },
  { label: "Paketler", text: "Start ve Scale farkı nedir?" },
];

export const AVCAI_TOPICS = [
  {
    id: "nedir",
    title: "Avcı E-Ticaret nedir?",
    keywords: ["nedir", "hakkında", "hakkinda", "geçmiş", "gecmis", "tarihçe", "tarihce", "kimsiniz", "ne iş", "ne satar", "satici", "sağlayıcı", "saglayici", "ikas", "ticimax", "hipotenüs", "hipotenus", "tsoft", "t-soft"],
    href: "/yazilimlar",
    label: "Yazılımlar",
    answer:
      "Avcı E-Ticaret bir mağaza değildir. İşletmeler için e-ticaret sitesi, yönetim altyapısı ve ihtiyaca göre yazılım modülleri geliştirir. Ürün ve katalogdan sipariş, ödeme, kargo, B2B ve e-ihracata kadar ticaret akışını tek yapıda planlar. Kuruluş tarihi gibi doğrulanmamış bir geçmiş bilgisi uydurmam; güncel kaynak bulunursa kısaca kaynaklarıyla anlatırım.",
  },
  {
    id: "iki-katman",
    title: "Mağaza ve Avcı paneli",
    keywords: ["yonetim", "yönetim", "iki katman", "musteri magaza", "müşteri mağaza", "avcı paneli", "yazılım müşterisi"],
    href: "/platform",
    label: "Platform",
    answer:
      "İki katman vardır. Müşterinin mağazası: sipariş, stok, kasa — satılan yazılımın içidir. /yonetim ise Avcı’nın kendi işidir: teklif, lisans, modül, yazılım müşterisi. Avcı panelinde butik kasası kurulmaz.",
  },
  {
    id: "demo",
    title: "Demo mağaza",
    keywords: ["demo", "peynir", "vitrin", "sepete", "banner", "slayt", "ornek magaza", "örnek mağaza", "koypeyniri"],
    href: "/cozum-senaryolari/peynir",
    label: "Peynir demosu",
    answer:
      "Peynir örneği canlı bir demo mağazadır: banner, ürün, sepete ekle, örnek ödeme, siparişin panele düşmesi. Avcı peynir satmaz. Tutarlar örnektir; gerçek kart çekilmez.",
  },
  {
    id: "paket",
    title: "Paketler",
    keywords: ["paket", "start", "scale", "enterprise", "lisans", "plan"],
    href: "/paketler",
    label: "Paketler",
    answer:
      "Üç başlangıç çerçevesi var: Start, Scale ve Enterprise. Doğru seçim işletmenin satış kanallarına, sipariş hacmine ve ihtiyaç duyduğu bağlantılara göre değişir. Bunları kısaca anlatırsan seçenekleri birlikte daraltabiliriz.",
  },
  {
    id: "fiyat",
    title: "Fiyat",
    keywords: ["fiyat", "ucret", "ücret", "ne kadar", "kaç para", "kac para", "maliyet", "komisyon"],
    href: "/fiyatlandirma",
    label: "Fiyatlandırma",
    answer:
      "Tek bir hazır fiyat söylemek doğru olmaz; lisans, kurulum, entegrasyon ve özel geliştirme ihtiyaca göre ayrılıyor. Satış kanallarını ve istediğin özellikleri söylersen maliyeti etkileyen kalemleri önce burada netleştirebiliriz.",
  },
  {
    id: "sure",
    title: "Süre",
    keywords: ["kaç gün", "kac gun", "teslim süresi", "teslim suresi", "ne zaman biter", "kurulum süresi", "kaç günde"],
    href: "/proje-sureci",
    label: "Proje süreci",
    answer:
      "Kaç günde biter diye bir süre vaat edilmez. Süre; paket, entegrasyon, içerik ve sizin onaylarınıza bağlıdır. Takvim teklifte yazılır.",
  },
  {
    id: "eticaret",
    title: "E-ticaret altyapısı",
    keywords: ["eticaret", "e-ticaret", "katalog", "sepet", "siparis", "sipariş", "odeme altyapisi", "ödeme altyapısı"],
    href: "/eticaret-altyapisi",
    label: "E-ticaret altyapısı",
    answer:
      "Altyapı; katalog, fiyat, sepet, sipariş, ödeme, teslimat ve operasyonu kapsar. Belirli bir ödeme veya kargo hazır ve otomatik dahil anlamına gelmez. Kesin kapsam sözleşmeyle belirlenir.",
  },
  {
    id: "odeme-demo",
    title: "Ödeme",
    keywords: ["kart", "paytr", "iyzico", "cekmez", "çekilmez", "tahsilat", "gerçek ödeme"],
    href: "/eticaret-altyapisi",
    label: "Ödeme kapsamı",
    answer:
      "Demo sahnelerde kart örneği vardır; gerçek tahsilat yoktur. Canlı mağazada ödeme, seçilen sağlayıcı ve sözleşmeye bağlıdır. Avcı’nın /yonetim paneli kart çekmez.",
  },
  {
    id: "ai",
    title: "Yapay zekâ",
    keywords: ["yapay zeka", "yapay zekâ", "avcai", "tofy", "ajan", "chatbot", "asistan", "ai katmanı", "ai katmani"],
    href: "/yapay-zeka",
    label: "Yapay zekâ",
    answer:
      "Avcı bir yapay zekâ modeli satıcısı değildir; bu yetenekler mağaza altyapısında isteğe bağlı modüllerdir. Ben Tofy’yim, beni Avcı E-Ticaret geliştirdi. Bu sitede ürünleri ve süreçleri anlatırım; katalog veya ödemenin yerini almam.",
  },
  {
    id: "entegrasyon",
    title: "Entegrasyon",
    keywords: ["entegrasyon", "trendyol", "hepsiburada", "n11", "pazaryeri", "erp"],
    href: "/entegrasyonlar",
    label: "Entegrasyonlar",
    answer:
      "Pazaryeri, ödeme, kargo ve ERP bağlantıları ihtiyaca göre kapsamlanır. Listede ad geçmesi hazır kurulum anlamına gelmez. Ana kayıt hangi sistemde olduğu proje başında yazılır.",
  },
  {
    id: "b2b",
    title: "B2B ve pazaryeri",
    keywords: ["b2b", "bayi", "c2c", "pazaryeri", "hakedis", "hakediş"],
    href: "/b2b-c2c",
    label: "B2B & C2C",
    answer:
      "B2B/bayi: grup fiyatı, vade, limit. C2C/pazaryeri: satıcı, komisyon, hakediş. İkisi aynı kalıp değildir. Kapsam iş modelinize göre ayrılır.",
  },
  {
    id: "eihracat",
    title: "E-ihracat",
    keywords: ["ihracat", "e-ihracat", "dil", "doviz", "döviz", "ulke", "ülke"],
    href: "/e-ihracat",
    label: "E-ihracat",
    answer:
      "E-ihracat; dil, para birimi, ülke kataloğu ve uluslararası gönderi kurallarını kapsayabilir. Tek tip mağaza her pazara yetmez. Kesin ülke listesi teklifle netleşir.",
  },
  {
    id: "giris",
    title: "Müşteri girişi",
    keywords: ["müşteri girişi", "musteri girisi", "demo portal", "şifre", "sifre", "parola", "lisans platformu"],
    href: "/musteri-merkezi",
    label: "Müşteri merkezi",
    answer:
      "Tanıtım sitesi müşteri parolası toplamaz. Demo örnek veridir. Ayrı lisans platformu bağlandıysa oraya gidilir; yoksa hazırlanıyor uyarısı çıkar.",
  },
  {
    id: "destek",
    title: "Destek",
    keywords: ["destek", "ticket", "sla", "7/24", "aynı gün", "ayni gun"],
    href: "/destek",
    label: "Destek",
    answer:
      "Yazılım müşterisi destek kaydı açabilir. 7/24 veya aynı gün dönüş, belirli bir SLA süresi vaat edilmez. Tofy destek kaydı açmaz; sizi ilgili sayfaya yönlendirir.",
  },
  {
    id: "referans",
    title: "Referans",
    keywords: ["referans", "müşteri listesi", "musteri listesi", "kimler kullanıyor", "kanıt"],
    href: "/referanslar",
    label: "Referanslar",
    answer:
      "Ekosistem markaları müşteri referansı veya satış kanıtı sayılmaz. Sahte vaka veya isim uydurmam. Referans sayfasındaki sınır geçerlidir.",
  },
  {
    id: "teklif",
    title: "Teklif",
    keywords: ["teklif", "gorusme", "görüşme", "iletisim", "iletişim", "basvuru", "başvuru", "form"],
    href: "/teklif",
    label: "Teklif formu",
    answer:
      "Formu şimdi doldurmana gerek yok; buradan yaz, bakayım. Mesai saati de bekletmem. Tofy kayıt açmaz. Kesin fiyat ve kapsam teklifle yazılır; 7/24 dönüş vaat etmem.",
  },
];

export const AVCAI_FALLBACK = {
  answer:
    "Bunu doğru yanıtlamak için biraz daha bağlam lazım. Ne kurmak istediğini ve bugün en çok nerede zorlandığını birer cümleyle anlat; sana uygun yolu birlikte çıkaralım.",
  href: "/teklif",
  label: "Teklif isteyin",
};
