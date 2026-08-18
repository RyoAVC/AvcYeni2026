# AVC E-Ticaret

AVC E-Ticaret; web mağazası, mobil uygulama, katalog, sipariş, ödeme, teslimat, müşteri ve çok kanallı satış operasyonlarını kapsayan modüler e-ticaret altyapısıdır.

Yapay zekâ ürünün tamamı değildir. Katalog içeriği, ürün keşfi, destek, talep tahmini veya raporlama gibi belirli mağaza ihtiyaçlarında etkinleştirilen isteğe bağlı modül katmanıdır.

Projenin güncel ve kronolojik teknik hafızası için önce [`PROJECT_DEBUG.md`](./PROJECT_DEBUG.md) dosyasını okuyun.

## Ürün kapsamı

- B2C web mağazası ve mobil ticaret deneyimleri.
- Ürün, varyant, kategori, fiyat, kampanya ve içerik yönetimi.
- Sepet, sipariş, ödeme, kargo, teslimat, iptal ve iade yaşam döngüsü.
- B2B/bayi, C2C/pazaryeri ve e-ihracat çözüm aileleri.
- Ödeme, kargo, pazaryeri, muhasebe, ERP ve özel API entegrasyonları.
- Merkezi plan, modül, lisans, fatura, güncelleme, destek ve audit operasyonları.
- İsteğe bağlı e-ticaret AI modülleri.

Belirli bir özellik veya entegrasyonun müşteri kurulumunda açık olması; paket, sağlayıcı, teknik doğrulama, sözleşme ve ortam yapılandırmasına bağlıdır.

## Mevcut uygulama yüzeyleri

Önemli herkese açık sayfalar:

- `/` — Türkçe ana sayfa.
- `/en` — İngilizce giriş.
- `/eticaret-altyapisi` — mağaza çekirdeği ve sipariş yaşam döngüsü.
- `/platform` — ticaret, lisans, güvenlik ve operasyon omurgası.
- `/yazilimlar` — çözüm aileleri.
- `/paketler` ve `/fiyatlandirma` — başlangıç çerçeveleri ve kalemli teklif modeli.
- `/yapay-zeka` — yalnızca isteğe bağlı e-ticaret AI modülleri.
- `/entegrasyonlar`, `/b2b-c2c`, `/e-ihracat`, `/mobil-sektorel` — özel çözüm alanları.
- `/teklif` — teklif başvurusu.
- `/musteri-merkezi`, `/destek`, `/kaynaklar` — müşteri yolculukları ve açıklamalar.

Korumalı yönetim yüzeyi:

- `/yonetim/basvurular` — satış başvurusu/lead listesi.
- Arama, durum, kaynak, çözüm ve tarih aralığı filtreleri.
- Başvuru detayı, ekip notları, durum geçmişi ve güvenli CSV dışa aktarma.

Yönetim alanı bugün mağaza kataloğu, stok, sipariş, ödeme, kargo veya iade yöneten tam bir e-ticaret back-office değildir.

## Teknik yapı

- Node.js `>=22.13.0`
- React 19 + Next.js uyumlu Vinext
- TypeScript
- Vite + Cloudflare Worker uyumlu ESM çıktı
- Cloudflare D1 mantıksal binding: `DB`
- Drizzle ORM ve SQL migration zinciri
- Dispatch-owned Sign in with ChatGPT kimliği ve sunucu tarafı yönetici izin listesi

`.openai/hosting.json`, Sites için mantıksal D1/R2 bildirimini tutar. Gerçek Cloudflare kaynaklarını veya gizli değerleri kaynak koda eklemeyin.

## Windows kurulumu

PowerShell ortamında npm komutlarında `npm.cmd` kullanın:

```powershell
npm.cmd ci
```

Projedeki bazı npm scriptleri Bash yardımcılarına bağlıdır. Windows'ta doğrudan komutlar daha güvenilirdir.

## Yerel geliştirme

4114 başka projeye ayrılmıştır. Bu proje için varsayılan yerel port 4115'tir ve sunucu dış ağa açılmamalıdır:

```powershell
npm.cmd exec -- vite --host 127.0.0.1 --port 4115 --strictPort
```

Yerel adres:

```text
http://127.0.0.1:4115/
```

4115 doluysa başka boş bir localhost portu seçin; `0.0.0.0` veya ağ arayüzlerine bind etmeyin.

## Doğrulama

```powershell
npm.cmd exec -- eslint . --ignore-pattern dist --ignore-pattern .next
npm.cmd exec -- vite build
node --test tests/*.test.mjs
```

Başarılı Sites artifact şu koşulları sağlamalıdır:

- `dist/server/index.js` ESM varsayılan export'unda `fetch` fonksiyonu bulunur.
- `dist/.openai/hosting.json` geçerli JSON'dur.
- D1 migration dosyaları kaynakla birlikte korunur.

## Ortam değerleri

Örnek anahtar adları `.env.example` içinde bulunur:

- `ADMIN_EMAILS` — yönetim izin listesi.
- `LICENSE_PORTAL_URL` — güvenli müşteri portalı hedefi.

Gerçek değerleri README, `PROJECT_DEBUG.md`, test dosyaları veya kaynak kod içine yazmayın.

## Veri ve güvenlik

- Gerçek müşteri, ödeme, lisans veya kimlik verisiyle yerel test yapmayın.
- Demo verileri sentetik ve açıkça temsili olmalıdır.
- Tanıtım sitesi parola işlemez ve ham lisans anahtarı göstermez.
- Yönetim API'leri kimlik, izin, same-origin, content type ve gövde sınırlarını sunucu tarafında doğrular.
- CSV dışa aktarma formül enjeksiyonuna karşı korunur ve 5.000 kayıtla sınırlıdır.
- Tarih filtreleri Europe/Istanbul gün sınırlarını kullanır.

## Git ve yayınlama

Bu klasör şu anda Git deposu değildir; remote veya otomatik deploy akışı yoktur. Kullanıcı açıkça istemeden:

- Git deposu oluşturmayın.
- Commit veya push yapmayın.
- Sites/Cloudflare/Vercel/Netlify yayını başlatmayın.
- Gerçek lisans platformuna veya dış servislere veri göndermeyin.

## Proje hafızası bakım kuralı

Her anlamlı kilometre taşından sonra `PROJECT_DEBUG.md` dosyasını kullanıcı sormadan güncelleyin. Ürün kararı, değişen dosyalar, sorun/çözüm, test sonucu, yerel sunucu ve açık işleri kısa fakat devralınabilir biçimde kaydedin.
