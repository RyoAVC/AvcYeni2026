# AVC E-Ticaret — Kalıcı Proje Hafızası ve Debug/Devir Kaydı

Son güncelleme: 18 Ağustos 2026

Bu dosya projenin tek yetkili debug/devir kaydıdır. Yeni bir Codex/ChatGPT oturumu önce bu dosyayı okumalı, mevcut kaynakları korumalı ve yalnızca aktif iş için gerekli dosyalara hedefli bakmalıdır. Gizli anahtar, parola, token ve gerçek müşteri verisi bu dosyaya yazılmaz.

## 1. Hızlı başlangıç

Proje yolu:

```text
C:\Users\User\Desktop\lisans ön yüz
```

Yeni oturum için kısa talimat:

1. `PROJECT_DEBUG.md` dosyasını tamamen oku.
2. Projeyi sıfırdan oluşturma; mevcut dosyaları resetleme, geri alma veya topluca silme.
3. Bu klasör Git deposu değildir.
4. Windows PowerShell ortamında npm komutlarında `npm.cmd` kullan.
5. Bağımlılıklar yoksa `npm.cmd ci` çalıştır.
6. `.openai/hosting.json` bulunduğu için Sites çalışma kurallarını uygula.
7. Kullanıcı açıkça istemeden Git, deploy, alan adı, gerçek lisans platformu veya dış servis işlemi yapma.
8. Önce ilgili birkaç dosyayı incele; geniş ve baştan sona tarama yapma.
9. Her anlamlı kilometre taşından sonra bu dosyanın tarihini, değişiklik günlüğünü, doğrulama sonucunu ve açık işleri güncelle.

## 2. Ürün amacı ve kalıcı yön

AVC E-Ticaret'in ana ürünü, işletmelerin dijital ticaretini yöneten modüler e-ticaret altyapısıdır. Ürün yönü; T-Soft, IdeaSoft, Hipotenüs ve ikas benzeri bir sağlayıcı perspektifidir.

Kalıcı konum (v74): Avcı kıyafet, mobilya veya kendi vitrininde ürün satmaz. Avcı; e-ticaret altyapısı, web sitesi ve modül yazılımı satar. Ana sayfadaki sipariş/stok/POS sahneleri müşteriye verilen yazılımın temsili vitrinidir. `/yonetim` Avcı’nın kendi sağlayıcı işidir (teklif, ileride lisans/modül/müşteri). Mağaza sipariş/stok/POS yönetimi bu panelde kurulmaz; o, müşterinin kendi mağazasına aittir.

Bu mantık her oturumda geçerlidir: `.cursor/rules/avci-sirket-mantigi.mdc` (`alwaysApply`).

Ana kapsam:

- Web mağazası ve mobil uygulama deneyimleri.
- Ürün, varyant, kategori, marka, fiyat, stok, kampanya ve içerik yönetimi.
- Sepet, sipariş, ödeme, tahsilat, teslimat, kargo, iptal ve iade yaşam döngüsü.
- Müşteri, rol, izin, B2B/bayi, C2C/pazaryeri ve e-ihracat modelleri.
- ERP, muhasebe, ödeme, kargo, pazaryeri ve özel API entegrasyonları.
- Lisans, plan, modül, fatura, güncelleme, audit, destek ve platform sağlığı gibi merkezi operasyon hizmetleri.

AI yönü:

- AVC tek başına bir AI modeli veya AI servis sağlayıcısı değildir.
- AI; mağaza altyapısında ihtiyaca göre etkinleştirilen modül/eklenti katmanıdır.
- Örnek kullanım: ürün açıklaması, arama/öneri, destek asistanı, stok-talep yorumu ve doğal dille raporlama.
- AI katalog, sipariş, ödeme veya mağaza çekirdeğinin yerini almaz.

İçerik doğruluğu sınırları:

- Hazır entegrasyon, teslim süresi, mağaza onayı, komisyon, satış, SLA veya ticari sonuç garantisi verilmez.
- Belirli modül ve bağlantılar; ürün, paket, sağlayıcı, sözleşme ve ortam yapılandırmasına bağlıdır.
- Temsili panel tutarları, oranları ve kayıtları örnek veri olarak etiketlenir.
- Tanıtım sitesi parola işlemez ve ham lisans anahtarı göstermez.

## 3. Mevcut mimari

- Uygulama: Next.js uyumlu Vinext + React + TypeScript.
- Derleme: Vite üzerinden Cloudflare Worker uyumlu ESM çıktı.
- Kalıcı veri: Cloudflare D1 mantıksal binding adı `DB`.
- ORM/migration: Drizzle; migration zinciri `drizzle/0023_site_assets.sql` dahil güncel. Yerel şema SCHEMA_GEN 24.
- Dosya depolama: R2 kullanılmıyor (`r2: null`).
- Kimlik: Yönetim için şifreli oturum (`/yonetim/giris`, httpOnly çerez) ve isteğe bağlı ChatGPT + `ADMIN_EMAILS`. Yerel bypass `/yonetim` yollarına uygulanmaz.
- Yayın metadata: `.openai/hosting.json`; yalnızca mantıksal D1/R2 bildirimi içerir, `project_id` yoktur.
- Kaynak kontrolü: Klasör Git deposu değildir; remote, commit veya branch yoktur.

### Önemli alanlar

- `app/page.tsx`: Türkçe ana sayfa ve ürün konumlandırması.
- `app/en/page.tsx`: İngilizce giriş ve uluslararası ürün anlatımı.
- `app/eticaret-altyapisi/page.tsx`: Ana ticaret çekirdeği, sipariş yaşam döngüsü ve kanal kapsamı.
- `app/platform/page.tsx`: Ticaret platformu, modül, lisans, güvenlik ve operasyon omurgası.
- `app/yazilimlar/page.tsx`: Çözüm aileleri kataloğu.
- `app/cozum-senaryolari/page.tsx`: Gerçekçi sektör senaryoları ve çözüm bazlı teklif geçişleri.
- `app/cozum-senaryolari/peynir/page.tsx`, `app/cozum-senaryolari/peynir/cheese-draft.tsx`: Peynir senaryosunun demo mağaza vitrini (banner, sepet, örnek ödeme, panele düşüş; Avcı peynir satmaz).
- `app/paketler/page.tsx`: Start/Scale/Enterprise başlangıç çerçeveleri.
- `app/fiyatlandirma/page.tsx`: Kalemli teklif ve maliyet katmanları.
- `app/yapay-zeka/page.tsx`: Yalnızca e-ticaret için isteğe bağlı AI modülleri.
- `app/avcai/page.tsx`, `app/avcai-mascot.tsx`, `app/avcai-knowledge.mjs`, `app/avcai-answer.mjs`, `app/avcai-llm.mjs`, `app/api/avcai/route.ts`, `app/api/avcai/ses/route.ts`: AvcAI sağdaki maskot; kayıtlı metin + isteğe bağlı ücretsiz Gemini/Groq. D1 sohbet yok.
- `app/offer-form.tsx`, `app/api/teklif/route.ts`: Teklif formu, erişilebilir gönderim durumu ve D1 lead kaydı.
- `app/yonetim/giris/page.tsx`, `app/admin-session.mjs`, `app/api/yonetim/giris/route.ts`: Şifreli yönetim girişi.
- `app/yonetim/page.tsx`, `app/yonetim/admin-shell.tsx`, `app/yonetim/istatistik/page.tsx`: Sağlayıcı özeti, ortak kabuk, tanıtım ziyareti ve yazılım hunisi.
- `app/yonetim/musteriler/**`, `app/customer-record.mjs`: Yazılım müşterisi (ad, e-posta, telefon, firma) ve bağlı sipariş/destek/fatura özeti.
- `app/yonetim/paketler/**`, `app/package-admin.mjs`: Avcı yazılım paket kataloğu (Start/Scale/özel; kesin fiyat yok).
- `app/yonetim/moduller/**`, `app/module-admin.mjs`: Satılan eklentiler (pazaryeri, ödeme, kargo; kesin fiyat yok).
- `app/yonetim/siparisler/**`, `app/software-order-admin.mjs`: Yazılım siparişi (müşteri + paket/modül; ödeme çekilmez).
- `app/yonetim/destek/**`, `app/support-ticket-admin.mjs`: Destek kaydı (yazılım müşterisi; e-posta / SLA yok). Sipariş bağını iç nottaki `Sipariş #id` işareti taşır; şema sütunu yoktur.
- `app/yonetim/faturalar/**`, `app/software-invoice-admin.mjs`: Yazılım faturası (iç tahsil kaydı; e-Fatura / POS yok).
- `app/yonetim/vitrin/**`, `app/vitrine-signal-admin.mjs`, `app/live-strip.tsx`, `app/live-toast.tsx`: Ana sayfa şeridi + düzenlenebilir sayfa bildirimleri (örnek; `/yonetim` yok).
- `app/yonetim/ayarlar/**`, `app/yonetim/editor/**`, `app/site-settings.mjs`, `app/site-brand.tsx`, `app/site-logo.mjs`, `app/site-theme.mjs`, `app/theme-toggle.tsx`: İletişim, tasarım, gece/gündüz, çift logo ve form editörü.
- `app/site-visit.mjs`, `app/site-visit-beacon.tsx`, `app/api/istatistik/ziyaret/route.ts`: İlk taraf sayfa sayacı (IP yok, yönetim sayılmaz; onay sonrası).
- `app/cookie-notice.tsx`, `app/cookie-notice-choice.mjs`: Tanıtım sitesi çerez / KVKK bildirimi.
- `app/yonetim/basvurular/**`: Korumalı satış başvurusu yönetimi.
- `app/api/yonetim/basvurular/export/route.ts`: Filtrelenmiş güvenli CSV dışa aktarma.
- `app/lead-date-filter.mjs`: İstanbul gün sınırlarıyla ortak tarih filtresi.
- `app/lead-search.mjs`, `app/lead-contact.mjs`, `app/lead-attribution.mjs`: Arama, telefon ve kaynak normalizasyonu.
- `app/csv-utils.mjs`, `app/lead-export.mjs`: CSV formül enjeksiyonu koruması ve kayıt sınırı.
- `db/schema.ts`: Lead, aktivite ve ekip notu tabloları.
- `drizzle/`: D1 migration dosyaları ve snapshot kayıtları.
- `tests/*.test.mjs`: Güvenlik, migration, filtre, CSV ve render testleri.
- `app/sitemap.ts`, `app/robots.ts`: Arama motoru ve dahili rota görünürlüğü.

## 4. Bugünkü yönetim ve portal kapsamı

AVC yönetim panelinde bugün bulunanlar:

- Teklif/lead başvurusu listesi ve detay ekranı.
- Ad, firma, e-posta ve telefon araması.
- Durum, kaynak, çözüm ve İstanbul gün sınırlarına göre tarih aralığı filtreleri.
- Sayfalama, durum kartları, kaynak ve çözüm dağılımları.
- Başvuru durumu güncelleme, iyimser eşzamanlılık kontrolü ve hareket geçmişi.
- Ekip notları ve idempotent kayıt akışı.
- Filtreleri koruyan, formül enjeksiyonuna dayanıklı, en fazla 5.000 kayıtlık CSV dışa aktarma.
- ChatGPT kimliği ve yönetici izin listesiyle korunan sunucu tarafı erişim.

Dürüst sınır:

- Bu panel bugün teklif, yazılım müşterisi, paket, modül, sipariş, destek, fatura, vitrin, site ayarı (logo/tasarım) ve form editörünü karşılar.
- Sipariş kartı bağlı faturaları ve nottaki sipariş işaretine göre destek kayıtlarını gösterir. Aynı siparişe ikinci taslak fatura veya ikinci açık destek kaydı açılmaz. Destek kaydı müşteriye e-posta göndermez.
- Tekliften müşteri kaydı açılınca yeni/iletişim kuruldu başvuru fırsat olur.
- Henüz katalog, stok, sipariş, ödeme, kargo ve iade yöneten tam mağaza back-office paneli değildir.
- Müşteri girişi bu sitede parola toplamaz. Demo örnek veridir. Ayrı lisans platformu bağlandıysa `/musteri-portali` oraya gider; yoksa hazırlanıyor uyarısı görünür.
- Yönetimdeki yazılım müşterisi / sipariş / tahsil kaydı demo portalda açılmaz.
- Proje aşamaları, sözleşmeler ve yenileme işlemleri portalda uygulanmış değildir.

## 5. Kronolojik değişiklik günlüğü

### v1 — Temel kurumsal site ve ürün ailesi

- Vinext/Next tabanlı çok sayfalı kurumsal site oluşturuldu.
- E-ticaret, B2B, C2C, e-ihracat, paket, fiyatlandırma, entegrasyon ve AI sayfaları bağlandı.
- SEO metadata, canonical, sitemap, robots, manifest, gizlilik ve temel erişilebilirlik yapısı eklendi.

### v2 — Teklif ve lead altyapısı

- Teklif formu ve merkezi çözüm seçenekleri oluşturuldu.
- D1 lead kaydı, iletişim izni, kaynak/UTM/landing bağlamı ve veri minimizasyonu eklendi.
- Honeypot, origin/content-type/gövde sınırı, hız sınırı ve istek idempotency kontrolleri uygulandı.

### v3 — Korumalı başvuru yönetimi

- Yönetim listesi ve detay ekranı eklendi.
- SIWC/ChatGPT kimliği ile `ADMIN_EMAILS` izin listesi kullanıldı.
- Durum güncelleme, hareket geçmişi, ekip notları ve eşzamanlılık/idempotency koruması eklendi.

### v4 — Satış operasyonu görünürlüğü

- Arama, durum, kaynak ve çözüm filtreleri; özetler ve sayfalama eklendi.
- Telefonlar karşılaştırma için normalize edildi.
- Arama joker karakterleri literal hâle getirildi.
- CSV dışa aktarma, formül enjeksiyonu koruması ve 5.000 kayıt sınırı eklendi.

### v5 — İçerik doğruluğu ve müşteri yolculukları

- Müşteri Merkezi, destek, alan adı/hosting, proje süreci, bayi/partner, referanslar ve kaynaklar tamamlandı.
- Temsili tutar/oran etiketleri eklendi; doğrulanmamış popülerlik, stok ve entegrasyon garantileri kaldırıldı.
- Portalın gerçek lisans/fatura kapsamı ve bulunmayan özellikleri açıkça ayrıldı.

### v6 — Tarih filtreleri

- Yönetim listesi ve CSV için başlangıç/bitiş tarihi filtresi eklendi.
- İstanbul saatinde başlangıç dahil, bitiş gününün tamamı dahil olacak sınırlar ortak yardımcıya taşındı.
- Geçersiz veya ters aralıklar güvenli biçimde reddedildi.
- Filtreler sayfalama, kaynak/çözüm bağlantıları ve CSV URL'sinde korundu.

### v7 — Ana ürün yönü düzeltmesi

- AVC, AI ürünü yerine ana e-ticaret altyapı sağlayıcısı olarak yeniden konumlandırıldı.
- Ana sayfa ve platform; mağaza, katalog, sipariş, ödeme, teslimat, müşteri ve kanal odağına getirildi.
- AI sayfası bağımsız ürün değil, mağazaya eklenen modül/eklenti katmanı olarak düzeltildi.
- İngilizce giriş aynı konumlandırmayla güncellendi.

### v8 — E-ticaret altyapısı ayrıntı sayfası

- `/eticaret-altyapisi` oluşturuldu.
- Ticaret çekirdeği, sipariş yaşam döngüsü, web/mobil/B2B/pazaryeri kanalları ve kapsam sınırları açıklandı.
- Ana sayfa, yazılım kataloğu, İngilizce giriş, footer ve sitemap bağlandı.

### v9 — Paket ve fiyatlandırma hizalaması

- Start/Scale/Enterprise anlatımı mağaza, katalog, sipariş, ödeme, kanal ve operasyon kapsamına göre güncellendi.
- AI paket varsayılanı olmaktan çıkarılıp isteğe bağlı modül olarak işaretlendi.
- Paketlerin yalnızca başlangıç çerçevesi olduğu; entegrasyon ve modüllerin teklifte açıkça yazılması gerektiği eklendi.
- Fiyatlandırmada ticaret ürünü/lisans katmanı mağaza çekirdeğiyle ilişkilendirildi.
- Yerel `/paketler` ve `/fiyatlandirma` içerik kontrolleri, ESLint, üretim derlemesi, 10/10 test ve Sites artifact doğrulaması geçti.

### v10 — Kalıcı hafıza ve geliştirici girişi

- Projenin tek yetkili debug/devir kaydı olarak kökte `PROJECT_DEBUG.md` oluşturuldu.
- Eski mükerrer Codex devir notu bu dosyaya birleştirilip kaldırıldı.
- Starter ağırlıklı README; ürün amacı, mevcut kapsam, Windows kurulumu, localhost güvenliği, doğrulama, veri sınırları ve Git/deploy durumu ile değiştirildi.
- Kök dizinde başka `DEBUG`, `DEVIR` veya `HANDOFF` dosyası bulunmadığı doğrulandı.

### v11 — Ana ürün navigasyonu

- Türkçe ana sayfanın masaüstü ve mobil navigasyonunda ilk bağlantı doğrudan `/eticaret-altyapisi` olarak değiştirildi.
- Teknik platform sayfası footer ve ilgili mimari sayfalarda korunurken birincil ürün görünürlüğü e-ticarete verildi.
- HMR içerik kontrolü, ESLint, üretim derlemesi ve 10/10 test geçti.

### v12 — Karar rehberi hizalaması

- Kaynaklar sayfasındaki hızlı yönlendirmelerin ilk sırasına e-ticaret altyapısı eklendi.
- Rehber kartları veri dizisine taşınarak tekrar eden JSX sadeleştirildi.
- “AVC'nin ana ürünü yapay zekâ mı?” sorusu eklendi ve ana ürünün e-ticaret altyapısı olduğu açıklandı.
- Lisans dışı ticari model yanıtı AI merkezli ifadeler yerine modül aboneliği ve kullanım bazlı ek hizmet olarak düzeltildi.
- AI rehberi “isteğe bağlı AI” olarak yeniden adlandırıldı.
- Yerel `/kaynaklar` kontrolü, 14 SSS sayımı, ESLint, üretim derlemesi ve 10/10 test geçti.

### v13 — Hizmet hiyerarşisi

- Hizmetler sayfasındaki ilk hizmet “E-ticaret altyapısı ve mağaza” olarak yeniden tanımlandı.
- Mağaza, katalog, sipariş, müşteri, ödeme ve kargo kapsamı hizmet anlatımında öne çıkarıldı.
- Birincil hizmet CTA'sı doğrudan `cozum=eticaret` teklif akışına bağlandı.
- SEO, reklam, hosting, özel yazılım ve destek hizmetleri ayrı kapsamlar olarak korundu.
- Yerel `/hizmetler` kontrolü, ESLint, üretim derlemesi ve 10/10 test geçti.

### v14 — Teklif çözüm grupları

- Teklif formundaki düz çözüm listesi üç görünür gruba ayrıldı: e-ticaret çözümleri, modül/özel yazılım ve dijital hizmet/iş ortaklığı.
- Türkçe ve İngilizce grup etiketleri aynı merkezi yapıdan render edilirken gönderilen çözüm değerleri değiştirilmedi.
- API, yönetim filtreleri ve CSV için kullanılan `OFFER_INTERESTS` allowlist'i korundu.
- Yeni `offer-options.test.mjs`, grupların allowlist'i eksiksiz, aynı sırada ve benzersiz tuttuğunu doğruluyor.
- Türkçe/İngilizce yerel form kontrolü, ESLint, üretim derlemesi ve 11/11 test geçti.

### v15 — Yönetim çözüm filtresi grupları

- Yönetim başvuru listesindeki çözüm filtresi teklif formuyla aynı merkezi grup yapısına geçirildi.
- Durum, kaynak, çözüm, tarih, sayfalama ve CSV query değerleri değiştirilmedi.
- ESLint, üretim derlemesi ve 11/11 test geçti.

### v16 — Gıda/peynir mağazası senaryosu

- Çözüm senaryolarına e-ticaret çekirdeğini somutlaştıran bir gıda ve soğuk zincir örneği eklendi.
- Ürün gramajı/varyantı, stok ve sipariş, ödeme ile bölgesel teslimat aynı mağaza akışında anlatıldı.
- AI, ürünün bütünü gibi değil yalnızca isteğe bağlı içerik/öneri modülü olarak sınırlandı.
- Tüm senaryo CTA'ları ilgili merkezi teklif değeriyle ön seçimli hâle getirildi; mevcut çözüm değerleri korunarak yeniden numaralandırıldı.
- Render testi yeni senaryoyu ve `cozum=eticaret` teklif bağını korumaya aldı.
- Yerel `/cozum-senaryolari` kontrolü HTTP 200; ESLint, üretim derlemesi ve 11/11 test başarılı.

### v17 — Ana altyapıdan sektör örneğine geçiş

- Ana e-ticaret altyapısı sayfasının karar alanına gıda/peynir mağazası örneğine bağlamsal geçiş eklendi.
- Birincil teklif ve paket bağlantıları korunurken çözüm senaryosu ayrı bir ikincil seçenek olarak sunuldu.
- Render testi ana altyapı sayfasındaki senaryo bağlantısını ve görünen etiketini korumaya aldı.
- İlk paralel doğrulamada test eski `dist` çıktısını okuduğu için artifact yarışı görüldü; üretim derlemesi tamamlandıktan sonra test sıralı tekrarlandı.
- ESLint, üretim derlemesi ve güncel artifact üzerinde 11/11 test başarılı.

### v18 — Entegrasyon sistem sınırı

- Entegrasyon sayfasının ana navigasyonunda AI yerine ana e-ticaret altyapısı öne alındı.
- Hero anlatımı, bağlantıları AVC mağazasındaki katalog ve sipariş çekirdeğini genişleten akışlar olarak konumlandırdı.
- Ana kayıt sistemi kararı ile dış sağlayıcı kesintisi, kota, API sürümü ve erişim bağımlılıkları açıkça ayrıldı.
- AI bağlantılarının yalnızca açıkça kapsamlandırılmış isteğe bağlı modül olabileceği belirtildi.
- Ticaret çekirdeğine doğrudan geçiş eklendi ve yeni sınırlar render testiyle korundu.
- Yerel `/entegrasyonlar` HTTP 200; ESLint, üretim derlemesi ve 11/11 test başarılı.

### v19 — Ayrı entegrasyon teklif kategorisi

- `E-Ticaret entegrasyonları` çözümü merkezi teklif allowlist'ine ve e-ticaret çözüm grubuna eklendi.
- Türkçe form, İngilizce form, API doğrulaması ve yönetim çözüm filtresi aynı merkezi kaynaktan yeni kategoriyi kullanıyor.
- `/teklif?cozum=entegrasyon`, ilgili çözümü güvenli biçimde önceden seçiyor; entegrasyon sayfasındaki iki CTA bu sluga taşındı.
- Grup bütünlüğü, İngilizce etiket, CTA ve teklif ön seçimi testlerle doğrulandı.
- Yerel teklif rotası HTTP 200 ve doğru çözüm görünür; ESLint, üretim derlemesi ve 11/11 test başarılı.

### v20 — Teklif slug eşlemesinin merkezileştirilmesi

- `cozum` URL slug'ları ile izin verilen teklif çözümleri arasındaki eşleme `app/offer-options.ts` içindeki `OFFER_SOLUTION_SLUGS` kaynağına taşındı.
- Teklif sayfası yalnızca bu merkezi, tip güvenli eşlemede bulunan slug'ları ön seçim olarak kabul ediyor.
- Test; tüm slug değerlerinin API allowlist'ini eksiksiz, benzersiz ve fazlasız kapsadığını ve `entegrasyon` eşlemesini doğruluyor.
- ESLint, üretim derlemesi ve tam test paketi 12/12 başarılı.

### v21 — Teklif CTA slug bütünlüğü

- Test paketi `app` altındaki TypeScript/TSX kaynaklarını okuyarak statik `/teklif?cozum=` bağlantılarını merkezi slug sözleşmesiyle karşılaştırıyor.
- Tanımsız veya yazım hatalı yeni bir çözüm CTA'sı artık test aşamasında dosya yolu ve hatalı slug ile reddediliyor.
- Dinamik senaryo bağlantılarının mevcut merkezi veri akışı değişmedi.
- ESLint ve tam test paketi 13/13 başarılı; bu aşamada üretim kaynağı değişmediği için v20 artifact'i korunuyor.

### v22 — Ana sayfa paketlerinde AI kapsam düzeltmesi

- Hedefli paket incelemesinde ana sayfa kartlarında kalmış olan “Temel AI araçları” ve “AI otomasyon paketi” ifadeleri tespit edildi.
- Bu ifadeler, AI'ın her pakete dahil ana ürün gibi algılanmasını önlemek için “Temel raporlama” ve “Operasyon otomasyonları” ile değiştirildi.
- Ayrı AI sayfası ve açıkça kapsamlandırılan isteğe bağlı AI modülü yaklaşımı korunuyor.
- Render testi eski zorunlu-AI paket ifadelerinin geri gelmesini engelliyor.
- Yerel ana sayfa HTTP 200, eski ifadeler yok; ESLint, üretim derlemesi ve 13/13 test başarılı.

### v23 — Paket sorgu sözleşmesinin merkezileştirilmesi

- Start, Scale ve Enterprise paket kimlikleri ile görünen adları `app/package-options.ts` içindeki tek katalogda tanımlandı.
- Ana sayfa ve paketler sayfası geçerli paket kimliklerini tip düzeyinde kullanıyor; teklif sayfası paket ön seçimini aynı katalogdan çözüyor.
- Bilinmeyen `paket` URL değeri güvenli biçimde yok sayılıyor; paket kimliklerinin benzersizliği testle korunuyor.
- Ana sayfa artık başlıktan `toLowerCase()` ile URL üretmek yerine açık paket kimliği kullanıyor; iki sayfadaki üç paket CTA'sı render testiyle korunuyor.
- Yerel ana sayfa ve Enterprise teklif ön seçimi HTTP 200; ESLint, üretim derlemesi ve tam test paketi 14/14 başarılı.

### v24 — Paket adlarının tek otoritesi

- Ana sayfa ve paketler sayfasındaki Start, Scale ve Enterprise adları artık `app/package-options.ts` içindeki merkezi katalogdan okunuyor.
- Sayfa bağlamına özgü kapsam metinleri korunurken paket adı veya URL kimliği değişikliğinde teklif ön seçimiyle oluşabilecek sapma azaltıldı.
- Hedefli ESLint, üretim derlemesi ve ilgili render testleri 2/2 başarılı.

### v25 — Yazılım kataloğu navigasyon hiyerarşisi

- Hedefli AI kapsam taraması, paketlerde başka zorunlu AI vaadi olmadığını doğruladı.
- Yazılım kataloğunun üst menüsündeki bağımsız “Yapay Zekâ” bağlantısı ana “E-Ticaret” bağlantısıyla değiştirildi.
- AI çözüm sayfası ve footer erişimi korunurken yazılım ailesinin birincil ürün hiyerarşisi ticaret altyapısına bağlandı.
- Render testi katalog menüsünde E-Ticaret bağlantısını zorunlu, AI bağlantısını yasaklı tutuyor.
- Yerel `/yazilimlar` HTTP 200 ve doğru menü görünür; ESLint, üretim derlemesi ve 14/14 test başarılı.

### v26 — AI modül sayfasından ana ürüne dönüş

- AI modül sayfasının üst menüsüne doğrudan “E-Ticaret” ana ürün bağlantısı eklendi.
- AI sayfasının aktif modül durumu korunurken hizmet bağlantısı yerine ürün bağlamı ve paket geçişi öne alındı.
- “Bağımsız model veya ayrı ana ürün değildir” kapsam sınırı ve AI teklif akışı değişmedi.
- Render testi AI sayfasındaki ana altyapı bağlantısını koruyor.
- Yerel `/yapay-zeka` HTTP 200, ana ürün bağlantısı ve kapsam sınırı görünür; ESLint, üretim derlemesi ve 14/14 test başarılı.

### v27 — Bot yanıtında önbellek sınırı

- Teklif API'sindeki honeypot/bot başarı yanıtı, normal başarı ve hata yanıtlarıyla aynı biçimde açık `Cache-Control: no-store` başlığı kullanıyor.
- Botları yanıtlama, D1'e kayıt atmama ve istemciye 201 döndürme davranışı değiştirilmedi.
- Render/API testi bu başlığın geri alınmasını engelliyor.
- ESLint, üretim derlemesi ve 14/14 test başarılı.

### v28 — Yönetim ve kimlik yanıtlarında özel önbellek sınırı

- Worker güvenlik katmanı yönetim, yönetim API, ChatGPT giriş/çıkış/callback ve müşteri portalı yönlendirmelerini `private, no-store` olarak işaretliyor.
- Yetkisiz yönetim 307 yönlendirmesinin tarayıcı veya ara önbellekte tutulması engellendi; mevcut aynı-origin, CSP, frame ve HSTS başlıkları korundu.
- Yerel yönetim yönlendirmesi 307, doğru giriş hedefi ve `private, no-store` ile doğrulandı.
- Testler liste/detay yönetim yönlendirmeleri ile yapılandırılmış/yapılandırılmamış müşteri portalı yönlendirmelerinin önbellek sınırını koruyor.
- ESLint, üretim derlemesi ve 14/14 test başarılı.

### v29 — E-ticaret ekosistemi teklif katmanları

- AVC E-Ticaret; mağaza, katalog, sipariş, ödeme ve operasyon çekirdeği olarak ana sayfa, paketler ve fiyatlandırmada öne alındı.
- Adana360 yalnız gerektiğinde Laravel odaklı özel geliştirme; SEOEksper yalnız gerektiğinde WordPress, SEO ve içerik desteği için ayrı çözüm katmanları olarak konumlandı.
- Ana sayfaya ekosistem karar alanı, paketlere müşteri yolculuğu ve fiyatlandırmaya ayrı sorumluluklu teklif katmanı eklendi; dar ekranda bu alanlar tek sütuna iner.
- Ortak API, ortak giriş, otomatik veri paylaşımı veya otomatik paket dahil olma iddiası açıkça reddedildi; her işin sınırının teklifte belirleneceği belirtildi.
- Hedefli ESLint, üretim derlemesi ve güncel render testi başarılı.

### v30 — Paket ve fiyatlandırmadan mağaza teklifine geçiş

- Paketler ve fiyatlandırma sayfalarındaki ana CTA'lar, genel form yerine `cozum=eticaret` ön seçili AVC mağaza kapsamı görüşmesine bağlandı.
- Kullanıcı paket veya maliyet katmanından başlasa da teklif formunda ana ticaret çekirdeği seçili gelir; bağlı marka katmanları ise teklif görüşmesinde ayrı kapsam olarak değerlendirilir.
- CTA sözleşmesi mevcut merkezi çözüm allowlist'i ve render testiyle doğrulandı.
- Hedefli ESLint, üretim derlemesi ve güncel render testi başarılı.

### v31 — Kurumsal iletişim numarası tutarlılığı

- Ana sayfa yapılandırılmış verisi, ana iletişim alanı, Türkçe/İngilizce gizlilik ve İngilizce iletişimde ortak kullanılan `0850 308 68 37` kurumsal numarası teklif sayfasına da uygulandı.
- Teklif sayfasında tek başına kalmış farklı mobil numara kaldırıldı; e-posta adresi ve form akışı değişmedi.
- Render testi kurumsal telefon bağlantısını doğruluyor ve eski numaranın geri gelmesini engelliyor.
- Yerel `/teklif` HTTP 200, kurumsal numara görünür; ESLint, üretim derlemesi ve güncel kaynak üzerinde tam paket 14/14 test başarılı.

### v32 — Kurumsal iletişim regresyon denetimi

- Yeni `tests/contact-consistency.test.mjs`, public kaynaklardaki statik telefon ve e-posta bağlantılarını tarıyor.
- Tüm kurumsal telefon bağlantıları `+908503086837`, tüm statik kurumsal e-postalar `info@avcieticaret.com` olmak zorunda.
- Yönetim panelindeki dinamik müşteri telefon/e-posta bağlantıları bu kurumsal kontrolden bilinçli olarak ayrı tutuluyor.
- Eski mobil numaranın herhangi bir uygulama kaynağına geri dönmesi ayrıca engelleniyor.
- ESLint ve tam test paketi 15/15 başarılı; üretim kaynağı değişmediği için v31 artifact'i korunuyor.

### v33 — Merkezi başvuru durum sözleşmesi

- `new`, `contacted`, `qualified` ve `closed` değerleri ile Türkçe etiketleri yeni `app/lead-statuses.ts` kaynağında merkezileştirildi.
- Yönetim filtresi, durum değiştirme bileşeni, detay aktivite geçmişi, PATCH API allowlist'i ve CSV etiketi aynı sözleşmeyi kullanıyor.
- Mevcut durum değerleri, D1 kayıtları, filtre query değerleri ve görünen etiketler değiştirilmedi.
- Bilinmeyen eski durum değeri aktivite/CSV gösteriminde kaybolmadan ham değere güvenli biçimde düşüyor; API yeni bilinmeyen değeri reddetmeye devam ediyor.
- Yeni birim testi sıra, benzersizlik, doğrulama ve etiket fallback davranışını koruyor.
- ESLint, üretim derlemesi ve tam test paketi 16/16 başarılı.

### v34 — E-posta normalizasyonunda Türkçe locale düzeltmesi

- Teklif ve yönetici izin listesi e-postaları yeni `app/email-normalization.mjs` yardımcısıyla aynı biçimde normalize ediliyor.
- Türkçe locale dönüşümünde ASCII `I` harfinin noktasız `ı` karakterine dönüşerek adresi bozması engellendi; e-posta katlama `en-US` ile locale bağımsız hâle getirildi.
- Teklif e-postası için mevcut 180 karakter sınırı, trim ve küçük harf davranışı korundu; yönetici e-postaları güvenli varsayılan 254 karakter sınırını kullanıyor.
- Yeni test ASCII büyük harf, boşluk, sınır, geçersiz tip ve özellikle `I → i` davranışını doğruluyor.
- ESLint, üretim derlemesi ve tam test paketi 17/17 başarılı.

### v35 — Kimlik dönüş yolu güvenlik sözleşmesi

- ChatGPT giriş/çıkış `return_to` üretimi framework bağımlılığından ayrılarak saf `app/auth-return-path.mjs` modülüne taşındı.
- Geçerli yerel yol, query ve hash korunurken dış URL, protokol-göreli URL, ters eğik çizgili origin kaçışı, giriş/çıkış/callback döngüsü ve normalize edilmiş auth yolu köke düşüyor.
- Yönetim sayfalarının mevcut giriş/çıkış URL'leri ve 307 yönlendirme davranışı değişmedi.
- Yeni birim testi yerel dönüşü ve açık yönlendirme sınırlarını doğrudan doğruluyor.
- ESLint, üretim derlemesi ve tam test paketi 18/18 başarılı.

### v36 — Statik iç bağlantı bütünlüğü

- Yeni `tests/internal-links.test.mjs`, `app` altındaki gerçek `page.tsx` rotalarını otomatik çıkarıyor.
- Kaynaklardaki statik kök-relative bağlantılar var olan sayfa veya açıkça tanımlı kimlik/portal sistem rotasıyla karşılaştırılıyor.
- Query ve hash parçaları doğru sayfa yoluna indirgeniyor; dinamik kayıt bağlantıları ve dış bağlantılar kapsam dışında tutuluyor.
- Silinmiş, yanlış yazılmış veya tanımsız bir iç sayfaya eklenecek statik bağlantı artık dosya yolu ve hedefiyle testte hata veriyor.
- ESLint ve tam test paketi 19/19 başarılı; üretim kaynağı değişmediği için v35 artifact'i korunuyor.

### v37 — Sitemap kapsam bütünlüğü

- Yeni `tests/sitemap-consistency.test.mjs`, gerçek public `page.tsx` rotalarını dosya sisteminden çıkarıp sitemap çıktısıyla karşılaştırıyor.
- Dinamik yönetim detayı, yönetim paneli ve robots ile dışlanan müşteri girişi sitemap dışında kalıyor.
- Her indexlenebilir public sayfa sitemap'te tam bir kez bulunmalı; fazladan, silinmiş veya unutulmuş rota testte hata veriyor.
- Tüm sitemap URL'lerinin `https://avcieticaret.com` origin'ini kullanması ayrıca doğrulanıyor.
- ESLint ve tam test paketi 20/20 başarılı; üretim kaynağı değişmediği için v35 artifact'i korunuyor.

### v38 — Robots kimlik rotası kapsamı

- Robots politikasına eksik olan `/signout-with-chatgpt` çıkış rotası eklendi.
- Render testi API, yönetim, müşteri girişi, müşteri portalı, ChatGPT giriş/çıkış ve callback rotalarının tamamının taramaya kapalı olduğunu doğruluyor.
- Public sayfalar için `allow: /`, sitemap ve host bildirimi değişmedi.
- Yerel `/robots.txt` HTTP 200; çıkış ve portal yasakları görünür.
- ESLint, üretim derlemesi ve tam test paketi 20/20 başarılı.

### v39 — Manifest ürün yönü ve ikon bütünlüğü

- Web manifest açıklaması AI/lisans çözüm listesi yerine mağaza, katalog, sipariş, ödeme ve operasyon odaklı ana e-ticaret altyapısını anlatacak biçimde düzeltildi.
- Yeni `tests/manifest-assets.test.mjs`, manifestin ana ürün anlatımını, start/scope değerlerini ve en az bir ikon bildirmesini doğruluyor.
- Bildirilen her yerel ikon yolu `public` altında var olan, boş olmayan bir dosya olmak zorunda.
- Yerel manifest doğru açıklamayı ve `/favicon.svg` ikonunu döndürüyor.
- ESLint, üretim derlemesi ve tam test paketi 21/21 başarılı.

### v40 — Sosyal görsel metadata boyut doğruluğu

- Public `og.png` dosyasının PNG başlığından gerçek boyutu `1731×909` olarak ölçüldü.
- Layout metadata'sında hatalı ilan edilen `1792×1024` değeri, görsel dosyasını değiştirmeden gerçek `1731×909` boyutuyla eşleştirildi.
- Test; Open Graph ve Twitter'ın aynı `/og.png` dosyasını, favicon metadata'sının `/favicon.svg` dosyasını kullandığını doğruluyor.
- PNG imzası, gerçek piksel boyutu, anlamlı dosya büyüklüğü ve SVG/viewBox varlığı regresyon testine alındı.
- Yerel ana sayfa HTTP 200 ve doğru `og:image:width/height` değerlerini yayımlıyor.
- ESLint, üretim derlemesi ve tam test paketi 22/22 başarılı.

### v41 — Sayfa bazlı Open Graph URL doğruluğu

- Alt sayfalarda doğru kanonik URL bulunmasına rağmen kök layout'tan `https://avcieticaret.com/` Open Graph URL'sinin miras alındığı SEO uyumsuzluğu tespit edildi.
- Ortak sosyal paylaşım başlığı, açıklaması, site bilgisi ve görsel tanımı yeni `app/site-social-metadata.ts` dosyasında merkezileştirildi.
- `app/layout.tsx` artık bütün sayfalara yanlış kök `og:url` değeri atamıyor; `app/page.tsx` ana sayfa için kök Open Graph URL'sini açıkça koruyor.
- Alt sayfalar yanlış kök Open Graph URL'sini yayımlamıyor; `/eticaret-altyapisi` kanonik URL'si değişmeden doğru kalıyor.
- `tests/manifest-assets.test.mjs` ortak sosyal metadata sözleşmesini ve gerçek `1731×909` görsel boyutunu; `tests/rendered-html.test.mjs` ana sayfa ile bütün mevcut public alt sayfaların URL davranışını regresyon kontrolüne aldı.
- Yerel ana sayfa ve e-ticaret sayfası HTTP 200; ana sayfa kök `og:url` değerini taşıyor, e-ticaret sayfası yanlış kök değeri taşımıyor ve doğru kanonik URL'yi koruyor.
- ESLint, üretim derlemesi, tam test paketi 22/22 ve Sites artifact kontrolü başarılı.

### v42 — Yönetim listesi sayfalama bütünlüğü

- Yönetim listesinin `page` query değeri daha önce `parseInt` ile kısmen geçerli sayılıyor, toplam sayfa sayısını aşan değerler boş ve yanıltıcı sonuç ekranı üretebiliyordu.
- Yeni `app/lead-pagination.mjs`, sayfa değerini katı biçimde doğruluyor; toplam sayfa sayısını tek sözleşmeyle hesaplıyor ve istenen sayfayı gerçek aralığa sınırlıyor.
- `app/yonetim/basvurular/page.tsx`, toplam eşleşme sayısını belirledikten sonra geçerli sayfayı hesaplıyor ve yalnız o sayfanın 30 kaydını getiriyor.
- Mevcut arama, durum/kaynak/çözüm/tarih filtreleri, CSV dışa aktarımı ve query koruma davranışı değiştirilmedi.
- Yeni `tests/lead-pagination.test.mjs`; eksik, sıfır, negatif, kısmen sayısal, güvenli tam sayı sınırını aşan ve toplam sayfadan büyük değerleri kapsıyor.
- ESLint, üretim derlemesi, tam test paketi 23/23, Sites artifact ve yalnız `127.0.0.1:4115` yerel listener kontrolü başarılı.

### v43 — Yönetim dağılımlarında filtre bağlamı

- Yönetim panelindeki durum, kaynak ve çözüm dağılımları daha önce arama/tarih ve diğer aktif filtrelerden bağımsız olarak bütün veritabanı sayılarını gösteriyordu.
- `app/yonetim/basvurular/page.tsx` filtreleri ortak koşullar ile durum, kaynak ve çözüm facet koşullarına ayırıyor.
- Her dağılım kendi facet filtresini hariç tutarken diğer bütün aktif filtreleri koruyor; böylece alternatif seçenekler görünür kalıyor ve sayılar mevcut kayıt bağlamını doğru yansıtıyor.
- Liste, toplam eşleşme, sayfalama ve CSV sorgusu bütün filtrelerin tamamını uygulamaya devam ediyor.
- Yeni `tests/admin-facet-query.test.mjs`, üç facet sorgusunun doğru filtre bileşimini ve grup alanını kullandığını korumaya aldı.
- ESLint, üretim derlemesi, tam test paketi 24/24 ve Sites artifact kontrolü başarılı.

### v44 — Salt-okunur demo müşteri portalı

- `/demo-portal` eklendi; örnek mağaza, lisans ve fatura görünümüyle gerçek müşteri kaydı gerektirmeden portal deneyimi test edilebilir.
- Demo sayfası parola, lisans anahtarı, ödeme bilgisi, indirme veya kayıt değiştirme özelliği içermez; gerçek portal erişimine bağlı değildir.
- Müşteri giriş sayfasına demo bağlantısı eklendi; gerçek giriş yönlendirmesi ve merkezi lisans platformu sınırı korunuyor.
- Demo rotası arama motorlarına kapatıldı; hedefli ESLint, üretim derlemesi ve render testi başarılı.

### v45 — Liste ve CSV için ortak filtre sorgusu

- Yönetim listesi ile CSV dışa aktarımı aynı arama, telefon, durum, kaynak, çözüm ve İstanbul tarih kurallarını iki ayrı kod bloğunda uyguluyordu; sonuçlar uyumlu olsa da ileride ayrışma riski vardı.
- Yeni `app/lead-query.ts`, hazırlanmış Drizzle koşullarını tek yerde üretiyor; SQLite joker karakter kaçışı ve normalize telefon eşleştirmesi burada korunuyor.
- `app/yonetim/basvurular/page.tsx` ortak facet sorgularını, `app/api/yonetim/basvurular/export/route.ts` aynı ortak tam filtre sorgusunu kullanıyor.
- `tests/admin-facet-query.test.mjs`, yönetim listesi ve CSV rotasının ortak sözleşmeye bağlı olduğunu ve facetlerin diğer aktif filtreleri koruduğunu doğruluyor.
- Eşzamanlı eklenen salt-okunur `/demo-portal` sayfası korundu; `noindex, nofollow`, robots engeli ve sitemap dışı kapsamı testlerle uyumlu hâle getirildi.
- ESLint, üretim derlemesi, tam test paketi 24/24, Sites artifact, demo portal HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v46 — Özel rotalarda HTTP indeksleme sınırı

- HTML metadata'sı ve robots.txt kapsamına ek olarak yanıt türünden bağımsız bir arama motoru sınırı eklendi.
- `worker/index.ts`, müşteri girişi, demo portal, gerçek portal yönlendirmesi, yönetim/API ve ChatGPT kimlik rotalarına `X-Robots-Tag: noindex, nofollow, noarchive` başlığını ekliyor.
- Özel yönetim, kimlik ve gerçek portal rotalarının mevcut `private, no-store` önbellek politikası değişmedi; statik demo sayfası hassas veri varmış gibi işaretlenmedi.
- `tests/rendered-html.test.mjs`, müşteri girişi, demo portal ve portal yönlendirmesinin Worker başlığını doğrudan doğruluyor.
- Yerel müşteri girişi ve demo portal HTTP 200; ikisi de doğru `X-Robots-Tag` başlığını yayımlıyor.
- ESLint, üretim derlemesi, tam test paketi 24/24, Sites artifact ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v47 — Yönetim geçmişinde toplam kayıt doğruluğu

- Başvuru detayındaki ekip notları ve durum hareketleri performans için son 100 kayıtla sınırlıydı; arayüz görünen satır sayısını yanlış biçimde toplam sayı gibi sunuyordu.
- `app/yonetim/basvurular/[id]/page.tsx`, not ve hareket toplamlarını mevcut `lead_id + created_at` indeksleri üzerinden ayrıca hesaplıyor; yeni indeks veya migration gerekmedi.
- Toplam 100'ü aştığında arayüz `Son 100 / toplam` ifadesini gösteriyor; sınır aşılmadığında sade toplam sayı korunuyor.
- Yeni `app/history-count-label.mjs`, eksik/geçersiz sayılarda güvenli etiket üretiyor; `tests/history-count-label.test.mjs` normal, sınırlı ve sınır değerlerini kapsıyor.
- Liste, not ekleme, durum güncelleme ve audit kayıtlarının mevcut veri davranışı değiştirilmedi.
- ESLint, üretim derlemesi, tam test paketi 25/25, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v48 — Tüm API yanıtlarında indeksleme koruması

- Robots politikası `/api/` alanının tamamını taramaya kapatırken Worker `X-Robots-Tag` başlığı yalnız yönetim API'lerine uygulanıyordu.
- `worker/index.ts`, public teklif uç noktası dâhil `/api` ve `/api/` altındaki bütün yanıtları `noindex, nofollow, noarchive` olarak işaretliyor.
- Yönetim API'lerinin mevcut `private, no-store` önbellek politikası korunuyor; public teklif API'sinin mevcut `no-store` JSON yanıtları değişmedi.
- `tests/rendered-html.test.mjs`, public teklif doğrulama hatasını ve durum/not/CSV yönetim API'lerinin yetkisiz yanıtlarını HTTP başlığıyla birlikte doğruluyor.
- Yerel teklif API'si beklenen HTTP 400 doğrulama yanıtını ve doğru `X-Robots-Tag` değerini döndürüyor.
- ESLint, üretim derlemesi, tam test paketi 25/25 ve Sites artifact kontrolü başarılı.

### v49 — Müşteri Merkezi'nden demo portal yolculuğu

- Salt-okunur demo portal daha önce yalnız müşteri giriş ekranından bulunabiliyordu; portal kapsamını açıklayan Müşteri Merkezi'nde doğrudan demo yolu yoktu.
- `app/musteri-merkezi/page.tsx` ana aksiyon alanına `Demo portalı inceleyin` bağlantısı eklendi.
- Metin, gerçek hesapla güvenli giriş ile gerçek veri içermeyen salt-okunur demo seçeneğini açıkça ayırıyor.
- Gerçek müşteri girişi birincil aksiyon olarak kaldı; proje süreci, yenileme rehberi ve destek yönlendirmeleri korunuyor.
- Mevcut responsive buton düzeni kullanıldı; yeni stil veya istemci durumu eklenmedi.
- `tests/rendered-html.test.mjs`, Müşteri Merkezi'ndeki demo bağlantısını ve açıklayıcı sınır metnini doğruluyor.
- ESLint, üretim derlemesi, tam test paketi 25/25, Sites artifact, Müşteri Merkezi HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v50 — Tablo erişilebilirlik sözleşmesi

- Demo portal, fiyatlandırma, B2B/C2C, paket karşılaştırması ve yönetim başvuru listesinde toplam altı tablo programatik bir tablo adına sahip değildi.
- Her tabloya yalnız yardımcı teknolojilerin okuyacağı açıklayıcı `caption` eklendi; ortak `.visually-hidden` sınıfı görünen tasarımı değiştirmeden bu metni erişilebilir kılıyor.
- Bütün sütun başlıklarına `scope="col"`, karşılaştırma tablolarındaki satır başlıklarına `scope="row"` eklendi.
- Yeni `tests/table-accessibility.test.mjs`, uygulama dosyalarını otomatik tarıyor; bütün tabloların dolu caption ve kapsamı tanımlı başlıklar içermesini zorunlu tutuyor.
- Demo portalda iki tablo caption'ı ve fiyatlandırmada karşılaştırma caption'ı yerel HTML üzerinden doğrulandı.
- ESLint, üretim derlemesi, tam test paketi 26/26, Sites artifact, ilgili sayfalar HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v51 — Demo satır başlıkları ve genişleyebilir tablo denetimi

- Demo portal tablolarındaki ilk hücreler kayıt adını taşımasına rağmen sıradan veri hücresi olarak işaretlenmişti; ürün/fatura adı ile diğer hücrelerin programatik ilişkisi eksikti.
- Her demo satırının ilk hücresi `scope="row"` taşıyan satır başlığına çevrildi; istemci anahtarları hücre konumuyla benzersiz hâle getirildi.
- `tests/table-accessibility.test.mjs`, demo tablolarında satır başlığı bulunmasını ayrıca doğruluyor.
- Tablo sayısı kontrolü sabit eşitlikten alt sınır kontrolüne geçirildi; yeni ve tamamen erişilebilir bir tablo eklendiğinde yalnız toplam sayı değiştiği için test hata vermiyor, semantik kuralları yine uyguluyor.
- Yerel demo portal HTTP 200 ve dört gerçek satır başlığı yayımlıyor.
- ESLint, üretim derlemesi, tam test paketi 26/26, Sites artifact ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v52 — Yeni sekme bağlantı güvenliği

- Yeni sekmede açılan ekosistem ve gizlilik bağlantıları `noreferrer` taşıyor, ancak açılan sayfanın kaynak pencereye erişimini engelleyen `noopener` kodda açıkça belirtilmiyordu.
- Ana sayfa, çözüm senaryoları, referanslar ve teklif formundaki bütün `target="_blank"` bağlantılar `rel="noopener noreferrer"` sözleşmesine alındı.
- Yeni `tests/external-link-security.test.mjs`, uygulamadaki bütün TSX dosyalarını otomatik tarıyor ve her yeni sekme bağlantısında iki korumanın birlikte bulunmasını zorunlu tutuyor.
- Bağlantı hedefleri, görünen metinler ve mevcut müşteri yolculukları değiştirilmedi.
- Yerel ana sayfa HTTP 200 ve altı güvenli yeni-sekme bağlantısı yayımlıyor.
- ESLint, üretim derlemesi, tam test paketi 27/27, Sites artifact ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v53 — Açık düğme türü sözleşmesi

- Uygulamadaki düğmeler denetlendi; mevcut beş düğmenin tamamının amaçlanan `button` veya `submit` türünü açıkça belirttiği doğrulandı.
- Yeni `tests/button-type.test.mjs`, uygulamadaki bütün TSX dosyalarını otomatik tarıyor ve her düğmenin geçerli bir `type` değeri taşımasını zorunlu tutuyor.
- Bu koruma, yeni bir kontrol forma taşındığında veya form içine eklendiğinde tarayıcının varsayılan `submit` davranışıyla istemeden işlem başlatmasını önler.
- Üretim kaynağı değişmedi; v52 üretim artifact'i geçerliliğini koruyor.
- ESLint, tam test paketi 28/28, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v54 — Temsili panelde etkileşim dürüstlüğü

- Ana sayfadaki temsili Commerce OS panelinde `Fırsatları göster` metni gerçek bir düğme olarak klavye odağı alıyor, ancak örnek arayüz olduğu için hiçbir işlem gerçekleştirmiyordu.
- Çalışmayan düğme, aynı görsel tasarımı koruyan etkileşimsiz `.ai-card-action` göstergesine çevrildi.
- Bütün ürün mockup'ı `role="img"` ve mevcut açıklayıcı `aria-label` ile tek bir temsili görsel olarak tanımlandı; iç dekoratif ayrıntılar yardımcı teknolojilere sahte kontroller olarak sunulmuyor.
- `tests/rendered-html.test.mjs`, mockup rolünü, statik göstergeyi ve eski çalışmayan düğmenin bulunmadığını doğruluyor.
- Yerel ana sayfa HTTP 200; mockup rolü ve statik gösterge mevcut, sahte düğme yok.
- ESLint, üretim derlemesi, tam test paketi 28/28, Sites artifact ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v55 — Azaltılmış hareket erişilebilirlik koruması

- Ana sayfadaki giriş, panel, kayan entegrasyon, orbit ve dekoratif animasyonların `prefers-reduced-motion` davranışı hedefli denetlendi.
- Mevcut CSS'in azaltılmış hareket tercihinde yumuşak kaydırmayı kapattığı, animasyonları tek yinelemeye ve animasyon/geçiş sürelerini `.01ms` değerine indirdiği doğrulandı.
- Yeni `tests/reduced-motion.test.mjs`, media query'yi ve sekizden fazla mevcut keyframe'i kapsayan bu sözleşmeyi otomatik korumaya aldı.
- Üretim kaynağı değişmedi; v54 üretim artifact'i geçerliliğini koruyor.
- ESLint, tam test paketi 29/29, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v56 — Asenkron form geri bildirimlerinin erişilebilirliği

- Teklif gönderimi, başvuru durumu güncellemesi ve ekip notu kaydı işlem sürerken `aria-busy` ile açıkça bildiriliyor.
- Durum seçimi ile ekip notu alanı, kendi canlı geri bildirim bölgelerine `aria-describedby` üzerinden bağlandı.
- Görsel metinler, API davranışı, kayıt akışları ve veri yapısı değiştirilmedi.
- Yeni `tests/async-feedback.test.mjs`, üç asenkron kontrolün busy-state ve canlı geri bildirim sözleşmesini korumaya aldı.
- ESLint, üretim derlemesi, tam test paketi 30/30, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v57 — İşlem ve hata duyurularının ayrıştırılması

- Teklif formu, durum kontrolü ve ekip notu formunda normal ilerleme/başarı mesajları `status` ve `polite`; hatalar `alert` ve `assertive` semantiğiyle ayrıldı.
- Canlı bölgeler `aria-atomic="true"` ile mesajın tamamını tutarlı biçimde duyuruyor.
- Mevcut görsel hata sınıfları, API çağrıları ve veri akışları korunuyor.
- `tests/async-feedback.test.mjs` yeni hata/ilerleme duyuru sözleşmesini de doğruluyor.
- ESLint, üretim derlemesi, tam test paketi 30/30, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v58 — Form kontrolleri ile geri bildirim ilişkisi

- Teklif formu, sonuç canlı bölgesine `aria-describedby` ile bağlandı.
- Başvuru durum seçimi ve ekip notu alanı, hata halinde `aria-invalid` ile programatik olarak işaretleniyor.
- Mevcut HTML doğrulama, görsel tasarım, API ve kayıt davranışı korunuyor.
- `tests/async-feedback.test.mjs`, kimlik–açıklama eşleşmelerini ve geçersizlik durumunu da koruyor.
- ESLint, üretim derlemesi, tam test paketi 30/30, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v59 — Yönetim filtrelerinin semantik gruplaması

- Başvuru filtreleri açıklayıcı bir `fieldset` ve görünmez `legend` altında gruplandı.
- Başlangıç ve bitiş tarihi alanları, ortak tarih aralığı açıklamasına bağlandı.
- Fieldset varsayılan tarayıcı boşluklarının mevcut grid düzenini değiştirmemesi için stil sıfırlandı; görünür yerleşim ve filtre sorguları korundu.
- Yeni `tests/admin-filter-accessibility.test.mjs`, filtre amacı, tarih açıklaması ve hata duyurusu sözleşmesini korumaya aldı.
- ESLint, üretim derlemesi, tam test paketi 31/31, Sites artifact, korumalı yönetim rotasının 307 kimlik yönlendirmesi ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v60 — Başvuru tablosunda satır başlıkları

- Yönetim listesindeki başvuru adı hücresi `th scope="row"` olarak tanımlandı; çözüm, iletişim, durum ve tarih hücreleri doğru kayıtla semantik olarak ilişkilendi.
- Tablo stilleri başlık ve veri satırı kapsamlarına ayrıldı; mevcut görünüm, bağlantılar ve durum kontrolü korundu.
- `tests/table-accessibility.test.mjs`, demo tablolarına ek olarak yönetim başvuru tablosunda da satır başlığı bulunmasını zorunlu kılıyor.
- ESLint, üretim derlemesi, tam test paketi 31/31, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v61 — Kayıt bağlamlı durum seçicileri

- Başvuru durum seçicisi artık dışarıdan zorunlu bir erişilebilir etiket alıyor.
- Liste ve detay görünümlerinde etiket ilgili başvuru adını içeriyor; birden fazla durum kontrolü yardımcı teknolojilerde birbirinden ayırt edilebiliyor.
- Durum güncelleme API'si, eşzamanlılık koruması, görünür başlık ve görsel tasarım değişmedi.
- `tests/async-feedback.test.mjs` etiket bağlantısını, `tests/table-accessibility.test.mjs` liste ve detay kullanımındaki kayıt adını doğruluyor.
- ESLint, üretim derlemesi, tam test paketi 32/32, Sites artifact, ana sayfa HTTP 200 ve yalnız `127.0.0.1:4115` listener kontrolü başarılı.

### v63 — Tipografi, efekt ve süsleme temizliği

- Başlıklar ve alt yazılar merkezi CSS değişkenleriyle büyütüldü (`--hero-title`, `--page-title`, `--section-title`, `--hero-copy`, `--lead-copy`).
- Body yazı tipi Arial yerine layout’taki Geist ailesine bağlandı; hero/katalog başlıklarında kontrollü gradyan ve aurora hareketi eklendi.
- CTA ve metinlerdeki dekoratif ok/emoji süslemeleri (`→` `↗` `↓` `←` `✦` `↻`) kaldırıldı; liste `✓` işaretleri içerik işareti olarak korundu.
- `prefers-reduced-motion` koruması ve ilgili testler geçti.
- Yedek: `yedekler/2026-08-14-v63-tipografi-efekt/`.

### v64 — Kalıcı marka renkleri (siyah + #E7000A)

- Logo PNG’leri sitede kalıcı (`BrandLogo`); mint/cyan palet kaldırıldı.
- `:root` token’ları logo kırmızısına alındı (`--mint` uyumluluk için `#e7000a`).
- Hero, CTA, footer ve koyu yüzeyler siyah + kırmızı glow; buton metinleri beyaz (kontrast).
- `?onizleme=logo` önizleme banner’ı kaldırıldı; tema artık varsayılan.
- Yedek referansı: `yedekler/15.08 AVC E-Ticaret`.

### v65 — Editöryal ana sayfa yeniden tasarımı

- Siyah-kırmızı “boyama” yaklaşımı bırakıldı; ana sayfa modern editöryal e-ticaret yönüne alındı.
- Font: Fraunces (başlık) + Manrope (gövde); token’lar `--paper #F2F4F7`, `--accent #E7000A` (yalnız CTA).
- Hero: full-bleed açık atmosfer, büyük logo + tek başlık/CTA; dashboard `#vitrin` bölümüne taşındı.
- Stiller: `app/editorial-home.css` (`.home-page`); global polish `globals.css` sonunda.
- Yedek: `yedekler/15.08-editorial-oncesi`.

### v66 — Atölye / mimari ana sayfa (üçüncü görsel dil)

- Önceki açık editöryal ve koyu charcoal denemeleri bırakıldı.
- Font: Syne (başlık) + DM Sans (gövde). Zemin: taş rengi `#F4F1EA`.
- Hero: dergi yayını — sol metin / sağ çerçeveli ürün; kırmızı yalnız CTA ve ince üst şerit.
- Yedek hâlâ: `yedekler/15.08-editorial-oncesi`.

### v67 — Ana sayfa sıfırdan yeni iskelet

- Eski hero/platform/card sınıfları ana sayfada kullanılmıyor.
- Yeni yapı: `avc-top`, `avc-open` + tam genişlik `avc-shelf`, indeks listesi, ops, planlar, form.
- Stiller: `app/editorial-home.css` (yeni `avc-*` sistemi).
- Metin, logo, teklif formu ve SEO korundu.

### v68 — Ticaretin Operasyon Haritası

- Ana sayfa SaaS/dashboard şablonundan çıktı; ticaret ağı diyagramı (`commerce-map.tsx`) eklendi.
- Kırmızı yalnız CTA/sinyal; uydurma müşteri sayısı/logo yok.
- Yeni rota: `/pazarla` (sitemap’e eklendi). Hazır pazaryeri vaadi yok.

### v69 — Tasarım denemeleri geri alındı

- Kullanıcı isteğiyle `yedekler/15.08 AVC E-Ticaret` yedeğinden `app/` ve `public/` geri yüklendi.
- Operasyon haritası / atölye / koyu-kırmızı denemeleri kaldırıldı.
- Ana sayfa klasik hero + mint/cyan token’lara döndü.

### v70 — Görsel kimlik kuralı sabitlendi

- `.cursor/rules/avci-visual-identity.mdc` eklendi (`alwaysApply`).
- Palet/tipografi/animasyon (`globals.css`) değiştirilmez; referans siteler yalnız IA/özellik için.
- Tam sayfa redesign yasak; küçük adım + onay zorunlu.

### v71 — Hero slider + canlı sipariş

- `app/hero-stage.tsx`: gerçek yatay slider — 3 tam sahne (Satış paneli / Sipariş kuyruğu / Kanal senkronu) kayarak değişir.
- Sol yazılar (eyebrow, başlık, lead) sahneyle birlikte değişir; ‹ › ve noktalarla elle geçiş.
- Renk paleti aynı; `dashboardFloat` / `pulse` / mevcut token’lar korunur.

### v72 — Ana sayfa ikas IA karşılığı

- `trust-strip` sonrası: hikâye bandı (`story-band.tsx`), 3 avantaj, koyu kapanış bandı.
- Uydurma ciro/logo yok; CTA mevcut `#iletisim` / `OfferForm` formuna gider.

### v73 — Yönetim satış merkezi (adım 1)

- `/yonetim` artık ortak kabuk + gerçek başvuru sayıları + son 5 lead.
- Sol menü ilk hali Satış merkezi + sipariş/stok/POS “yakında” idi; v74’te sağlayıcı diline çevrildi.
- Mevcut başvuru listesi ve detay aynı kabuğu kullanır; tablo yeniden tasarlanmadı.

### v74 — Yönetim sağlayıcı diline alındı

- Kullanıcı düzeltmesi: Avcı mağaza değil, altyapı/modül yazılımı sağlayıcısıdır.
- `/yonetim` menü ve kartlar: Panel, Teklifler, Lisanslar, Modüller, Müşteriler.
- Sipariş / stok / POS / Commerce OS dili yönetimden çıkarıldı.

### v75 — Tanıtım sitesi istatistik ekranı

- `/yonetim/istatistik`: bugün/7 gün kişi ve sayfa, teklif oranı, en çok açılan sayfalar, dış kaynak.
- İlk taraf sayaç: rastgele `avci_vid` çerezi; IP/ad saklanmaz; `/yonetim` ve botlar sayılmaz.
- Yeni tablo: `site_visits` (`drizzle/0011_friendly_hammerhead.sql`). Yerel D1 mevcutsa tablo ayrıca oluşturulur.
- Bu, müşteri mağazasının analitiği değildir.

### v76 — Güvenli yönetim girişi

- `/yonetim/giris`: e-posta + şifre. Oturum httpOnly çerez, 12 saat, HMAC imza.
- 5 hatalı deneme / 15 dakika kilit (`admin_login_attempts`). Aynı hata metni (e-posta sızdırılmaz).
- Yerel otomatik giriş `/yonetim` ve `/api/yonetim` için kapalı. Şifre `.dev.vars` içinde; dosyaya yazılmaz.

### v77 — Yazılım müşterileri

- `/yonetim/musteriler`: ad, e-posta, telefon, firma, şehir, paket/modül notu, durum.
- Eski `uye` tablosundan fikir alındı; gerçek kayıt ve MD5 şifre taşınmadı.
- Bu, mağaza alışveriş müşterisi değil; altyapı alan işletmedir.

### v78 — Yazılım paketleri

- `/yonetim/paketler`: Avcı’nın sattığı altyapı çerçeveleri (ad, aile, kapsam satırları, fiyat notu, durum).
- Start / Scale / Enterprise yerelde boş tabloya sentetik katalog olarak eklenir; kesin tutar yazılmaz.
- Kamu `/paketler` sayfası bu adımda otomatik bağlanmadı. Mağaza SKU / POS yok.

### v79 — Yazılım modülleri

- `/yonetim/moduller`: Avcı’nın sattığı eklentiler (ad, kategori, kapsam, fiyat notu, durum).
- Trendyol / PayTR / Yurtiçi Kargo / iyzico yerelde boş tabloya sentetik katalog olarak eklenir.
- API anahtarı, gerçek entegrasyon veya kamu `/entegrasyonlar` bağlanmadı. Mağaza stoğu yok.

### v80 — Yazılım siparişleri

- `/yonetim/siparisler`: müşteri + paket veya modül kaydı. Durum, fiyat notu, iç not.
- Ödeme, fatura, POS veya mağaza sepeti yok. Gerçek sipariş içe aktarılmadı.

### v81 — Destek kayıtları

- `/yonetim/destek`: yazılım müşterisine bağlı iç ticket (konu, talep, durum, iç not).
- E-posta gönderimi, müşteri portalı ticket’ı veya SLA yok. Mağaza iadesi değil.

### v82 — Yazılım faturaları

- `/yonetim/faturalar`: müşteri + isteğe bağlı sipariş, başlık, tutar notu, durum.
- Kart çekimi, e-Fatura / e-Arşiv veya mağaza fişi yok. Gerçek fatura içe aktarılmadı.

### v83 — Çerez / KVKK bildirimi

- Tanıtım sitesinde alt bildirim: ilk taraf `avci_vid` (IP yok). Anladım / Reddet.
- Sayaç yalnızca Anladım sonrası çalışır. `/yonetim` bildirim ve sayaç dışı.
- `/gizlilik` ve `/en/privacy` ziyaret çerezini açıklar. Yeni renk / yeni animasyon yok.

### v84 — Müşteri kartı bağlantıları

- Müşteri detayında son sipariş, destek ve fatura özeti.
- “Yeni” linki `?musteri=` ile formu o işletmeye açar. Kamu sitesi değişmedi.

### v85 — Ana sayfa vitrin şeridi

- Hero altında ince, mint noktalı, mevcut `pulse` efektli örnek şerit.
- Satırlar: Müşteri Çevrimiçi, Destekte, Yeni kayıt, Müşteri sitesi canlıda.
- `/yonetim/vitrin` her satırı açar/kapatır ve metin/değer düzenler. Satılan `/yonetim/moduller` ile karışmaz.
- Sayılar örnek vitrindir; gerçek müşteri / destek / CRM sayısı değildir. Yeni renk / yeni keyframe yok.

### v86 — Vitrin hareketi ve bildirim

- Şerit rakamları admin tabanının etrafında periyodik oynar; `canlıda` gibi metin sabit kalır.
- Sağdan kayan örnek bildirim (sipariş, ödeme, pazaryeri, yayına alma). `heroOrderIn` timing’iyle `liveToastIn`.
- Yeni tohum: Bugün sipariş, Aktif mağaza. `prefers-reduced-motion` hareketi kapatır.

### v87 — Vitrin bildirimi sağ/sol

- Bildirim sabit kalmaz: sağdan çıkar, geri kayar, kısa boşluk, soldan çıkar, tekrar kaybolur.

### v88 — Bildirim tüm sayfalarda, sol alt

- Bildirim hero’dan çıktı; `layout` ile tüm tanıtım sayfalarında sabit sol/sağ alt (ekran köşesi).
- `/yonetim` göstermez. Çerez çubuğu açıkken bildirim yukarı kayar. Ana sayfa şeridi yerinde.

### v89 — Bildirim admin + yeni örnekler

- `/yonetim/vitrin` içinde bildirim listesi: aç/kapa, başlık/metin düzenle, yeni kart.
- Tohum: B2B, e-ihracat, POS, WhatsApp, kupon, stok, iyzico, toplu ürün. Sitede yalnız `live` olanlar kayar.

### v90 — Genel / site ayarları

- `/yonetim/ayarlar`: e-posta, telefon, destek e-postası; müşteri girişi, portal hazır, demo portal, destek sayfası aç/kapa.
- Bağlanan yerler: ana sayfa iletişim/menü, `/musteri-girisi`, `/destek`, `/demo-portal`, `/musteri-merkezi`, `/teklif`, `/gizlilik`.
- Mağaza / POS ayarı yok. Ana sayfa JSON-LD iletişim bilgisi ayarlardan okunur.

### v91 — Tasarım, logo ve site editörü

- `/yonetim/ayarlar`: genel tasarım (marka adı / alt yazı / yazı işareti / logo açık / boyut) + logo yükle / çıkar.
- Logo `site_assets` tablosunda (kind=logo, base64). JSON ayar PATCH’ine konmaz (8 KB sınırı). `GET /api/site-logo` ile servis edilir.
- `SiteBrand` kamu sayfalarındaki A + AVCI işaretini ayarlardan okur. Yönetim menüsü A + YÖNETİM olarak kaldı.
- `/yonetim/editor`: hero düğme metinleri, footer cümlesi, canlı şerit / marka şeridi aç-kapa. Kaydet = PATCH. Elementor tuvali yok.
- Kısmi kayıt mevcut iletişim değerlerini silmez. SVG içinde script reddedilir. Yeni renk / yeni font yok.

### v92 — Gece / gündüz ve çift logo

- Tanıtım sitesinde Gece (varsayılan, mevcut görünüm) ve Gündüz. Yalnız mevcut token’lar (`--ink`, `--paper`, `--mint`…). Yeni hex yok.
- Tercih `avci_theme` çerezinde. `/yonetim` düğmeyi göstermez.
- `/yonetim/ayarlar`: gece logosu + gündüz logosu. Gündüz yoksa gece logosu kullanılır. Eski tek `logo` gece yedeğidir.

### v93 — Paket kapsamı ve örnek fiyat bandı

- `/paketler`: Start / Scale / Enterprise kartlarında örnek liste/satış fiyatı (tek kaynak: `package-scope-details.ts`).
- Altta detaylı özellik listesi + kapasite karşılaştırması. “Eski paket” dili yok.
- Fiyatlar örnek banddır; teklif taahhüdü değildir. TypeScript `featured` alanı üç pakette de tanımlı.

### v94 — Fiyatlandırma sayfası örnek band

- `/fiyatlandirma`: aynı Start / Scale / Enterprise örnek satış bandı, paket sayfasıyla tek kaynaktan.
- Kartlar kısa (trafik + e-posta); tam özellik listesi `/paketler` detayına gider.
- Scale rozeti `KAPSAMI GENİŞ`. Yeni renk yok.

### v95 — İngilizce ve 404 iletişim ayarları

- `/en`, `/en/privacy` ve 404 sayfası telefon/e-postayı `/yonetim/ayarlar` kaynağından okur.
- Sabit `info@…` / `tel:+90…` bu üç sayfada kalktı. Görünen varsayılan aynı kalır.

### v96 — Üç katman bağlantısı (site / yönetim / müşteri paneli)

- `/yonetim` panel özetine yazılım işi sayıları eklendi: müşteri, sipariş, açık destek, fatura.
- `/demo-portal` lisans ve örnek fatura satırları Start / Scale / Enterprise kataloğundan gelir; gerçek müşteri kaydı gösterilmez.
- Ana sayfa JSON-LD e-posta/telefonu site ayarlarından okur.

### v97 — Gündüz teması kontrastı

- Açık zeminde soluk mint/beyaz yazılar `--ink`, `--muted` ve `color-mix(ink, mint)` ile okunur hale getirildi. Yeni hex yok.
- `/musteri-girisi`: özellik listesi, demo/destek linkleri, footer.
- Ana sayfa hero başlığı, katalog hero `em` metinleri, teklif sayfası adımları ve form etiketleri.
- Koyu vitrin bölümlerindeki (platform, AI, CTA) mint yazılara dokunulmadı.

### v98 — Tekliften yazılım müşterisine

- `/yonetim/basvurular/{id}`: siteden gelen teklifi yazılım müşterisine çevirir (veya aynı e-postadaki mevcut kartı açar).
- `/yonetim/musteriler/yeni?basvuru=` formu doldurur; çift e-posta açılmaz. Durum varsayılanı `trial`.
- Mağaza müşterisi / kasa yok. Yeni hex yok.

### v99 — Müşteriye paket çerçevesi bağlama

- Müşteri kartında sipariş yoksa Start / Scale / Enterprise kısayolu görünür.
- Kart varsa sipariş formu örnek fiyat bandıyla dolar; yoksa aynı kaynaktan paket kartı formu açılır.
- Kamu `/paketler` otomatik değişmez. Kasa / POS yok.

### v100 — Siparişten fatura taslağı

- Sipariş detayı ve müşteri kartı, bağlı yazılım siparişinden iç tahsil taslağı açar.
- Başlık ve tutar notu siparişten dolar. e-Fatura / kart çekimi yok.

### v101 — Siparişten destek taslağı ve fatura geri bağlantısı

- Sipariş detayı bağlı faturaları listeler; fatura kartından siparişe dönülür.
- Sipariş ve müşteri kartı, yazılım siparişinden iç destek taslağı açar.
- Paket siparişi `lisans`, modül siparişi `entegrasyon` konusu doldurur. E-posta gitmez; mağaza iadesi değildir.

### v102 — Müşteri süzgeçli listeler

- Sipariş, fatura ve destek listeleri `?musteri=` ile bir işletmeye iner.
- Fatura satırında bağlı sipariş görünür. Müşteri kartından tümünü gör / sipariş / fatura / destek açılır.
- Başvuru listesinde “Müşteriye çevir” kısayolu vardır. Panel özetinde iş akışı ve son siparişler durur.

### v103 — Dürüst müşteri girişi metni

- Demo örnek veridir; yönetim kaydı orada açılmaz.
- `/musteri-portali` worker yönlendirmesi durur: lisans URL’si varsa oraya, yoksa hazırlanıyor uyarısına.
- Bu site parola / kart / e-Fatura işlemez. 404 geçiş sayfası eklenmedi (mevcut yönlendirmeyi bozmamak için).

### v104 — Listeden zincir kısayolları

- Müşteri listesinden sipariş / fatura / destek süzülmüş listeler açılır.
- Sipariş listesinden fatura ve destek taslağı açılır.
- Destek kartından müşterinin sipariş ve faturalarına geçilir.

### v105 — Kaynaklar SSS portal dürüstlüğü

- Demo örnek veridir. Ayrı lisans platformu bağlandıysa geçiş oraya gider. Bu site parola / ham anahtar işlemez.

### v106 — Paket / modül sipariş süzgeci

- Sipariş listesi `paketId` / `modulId` ile paket veya modül kartına iner. Fatura listesi `siparis` ile siparişe iner.
- Paket ve modül kartında bağlı siparişler görünür; karttan sipariş açılır.
- Yeni sipariş formu yönetim paket/modül kimliğiyle dolar. Kamu katalog `paket=` yolu durur.

### v107 — Panel bekleyen iş

- Panel özeti yeni teklif, deneme müşteri, taslak sipariş ve taslak fatura sayılarını süzgeçli listelere bağlar.

### v108 — Teklif-müşteri eşlemesi ve çift sipariş

- Başvuru listesi aynı e-postadaki yazılım müşterisini gösterir; varsa kart açılır.
- Aynı işletmede iptal edilmemiş aynı paket/modül siparişi ikinci kez açılmaz.

### v109 — Müşteri kartında ek modül

- Paket siparişi olan işletmeye yayındaki modül kısayolları çıkar. Mağaza stoğu değil.

### v110 — Teklif fırsat, çift taslak fatura, yazılım hunisi

- Tekliften müşteri kaydı (`?basvuru=`) kaydedilince yeni/iletişim kuruldu başvuru fırsat olur; hareket geçmişine yazılır. Müşteri yazımı başarısız olmaz.
- Aynı siparişe ikinci taslak fatura API ve formda durur; mevcut taslak açılır. Gönderilmiş/ödendi kayıttan sonra yeni taslak serbesttir.
- Açık aynı paket/modül siparişi formda da mevcut kayda yönlendirilir. Tahmin edilen (interest) paket bu kilidi yanlış uygulamaz.
- İstatistikte yazılım hunisi: müşteri, sipariş, tahsil, açık destek. Mağaza fişi değildir.
- Müşteri kartında eşleşen teklif linki vardır. Sipariş kartında taslak fatura varsa o kayıt açılır.
- Müşteri kartında taslağı olmayan siparişler için fatura kısayolu listenin yanında durur.
- Sipariş listesinde taslak fatura varsa doğrudan o kayıt açılır.
- Hedefli helper testleri geçti (müşteri, fatura, sipariş, müşteri sorgusu).

### v111 — Açık destek mükerreri (şemasız)

- Destek kaydında sipariş sütunu yok. Taslak nottaki `Sipariş #id` işareti aynı işletmede ikinci açık kaydı durdurur; kapandıktan sonra yenisi serbesttir.
- Sipariş kartı / listesi mevcut açık desteği açar. Destek listesi `?siparis=` ile not işaretine iner; satırda sipariş linki vardır.
- Panel Bekleyen’e fırsat sayısı eklendi. İstatistikte toplam fırsat görünür. E-posta gitmez.
- Hedefli helper testleri geçti (destek, müşteri sorgusu, fatura, müşteri).

### v112 — Fatura yeni sayfası import yolu

- `/yonetim/faturalar/yeni` şema importu `app/db` diye yanlış çözülüyordu. Taslak araması `order-options` yardımcısına alındı (doğru `../../../db`).
- Müşteri listesi ve kartına “Sipariş ekle” kısayolu eklendi.

### v113 — Zincir kısayolları

- Paket / modül listesinden sipariş eklenir (`paketId` / `modulId`).
- Müşteri kartında fatura ve destek eklenir. Başvuru listesi ve detayında eşleşen müşteriye sipariş eklenir.
- Panel Bekleyen’de “İletişim kuruldu” vardır. Fatura listesinde Gönderildi yerine Taslak sayısı durur.
- Katalog kartında sipariş varsa “Başka işletmeye bağla” çıkar.
- Taslak sipariş / taslak fatura / deneme müşteri sayıları ilgili listeye gider.

### v114 — Hunideki kopuk kayıtlar

- Müşteri listesi `?eksik=siparis` ile siparişi olmayan işletmeleri gösterir. Panel Bekleyen ve istatistik hunisi bu listeye gider.
- Fatura listesi `?eksik=siparis` ile siparişe bağlı olmayan tahsil kayıtlarını gösterir. Listede “Sipariş bağla”, kartta sipariş yoksa “Sipariş ekle” durur.
- Destek sayısı açık ve yanıt bekleyen olarak ayrıldı. Panel “Açık destek” linki yalnızca açık kaydı gösterir; bekleyen ayrıdır. İstatistik hunisi ikisini de gösterir.
- Ödenmiş siparişte yeni fatura taslağı kısayolu sipariş kartında kalır (çift taslak yine durur).
- Müşteri listesinde fatura / destek ekle kısayolu vardır.

### v115 — Faturasız yazılım siparişi

- Sipariş listesi `?eksik=fatura` ile tahsil kaydı olmayan siparişleri gösterir. Panel Bekleyen ve istatistik hunisi bu listeye gider.
- Müşteri Aktif / Deneme sayıları mevcut siparişsiz filtresini korur.

### v116 — Sipariş işareti olmayan destek

- Destek listesi `?eksik=siparis` notta `Sipariş #` olmayan kayıtları gösterir. Panel Bekleyen kapanmamışları sayar. Şema sütunu yoktur; işaret nottadır.
- Destek satırında ve kartında sipariş yoksa “Sipariş bağla / ekle” durur.

### v117 — Müşteri kaydı olmayan başvuru

- Başvuru listesi `?eksik=musteri` ile e-postası yazılım müşterisinde olmayan kayıtları gösterir. Panel Bekleyen kapanmamışları sayar. CSV aynı süzgeci taşır.

### v118 — Tekliften müşteriye, sonra siparişe

- Başvurudan müşteri kaydı kaydedilince paket sipariş formu açılır; ilgi metninden çerçeve tahmin edilir. Çift e-postada sipariş ekle de durur.
- Başvuru başlığında çevir / sipariş ekle görünür. Panel son tekliflerde müşterisiz kayıt doğrudan çevir formuna gider.
- İstatistik teklif oranında müşterisiz sayı vardır.

### v119 — Siparişten taslak faturaya

- Yeni yazılım siparişi kaydedilince fatura taslağı formu açılır (`musteri` + `siparis`). Taslak zaten varsa mevcut kayıt açılır; ikinci taslak durur.
- Aynı açık sipariş tekrar yazılırsa da fatura taslağına gidilir. Kart çekilmez; e-Fatura üretilmez.
- Fatura kartında sipariş varsa destek ekle durur.

### v120 — Peynir senaryosu canlı taslak

- `/cozum-senaryolari/peynir` müşteri yazılımının Avcı dilli vitrinidir; Avcı peynir satmaz. Veri örnektir (`#PYN-104`, gramaj, soğuk zincir).
- Rehber robot (mint `A`) katalog / sipariş / teslimat / stok bölgelerini anlatır; tıklanınca durur, `prefers-reduced-motion` otomatik turu kapatır.
- Senaryo 01 ve e-ticaret CTA bu taslağa gider. Palet ve keyframe `globals.css` dilindedir; yeni hex yok.

### v121 — Demo mağaza vitrini (banner → sepet → ödeme → panel)

- Peynir sayfası yönetim kartı değil; üç boyutlu **demo e-ticaret sitesi**. Adımlar: vitrin slaytı, ürün, sepete ekle, örnek ödeme, siparişin mağaza paneline düşmesi.
- Ana sayfadaki `start-shop` / `hero-orders-panel` / `pos-card` dili kullanılır. Gerçek kart çekilmez. `/yonetim` kasa değildir.
- Rehber robot bu vitrin adımlarını anlatır. Kurumsal SaaS şablonu yok.

### v122 — Daha geniş demo + sesli AI rehber

- Peynir demosu daha büyük/geniş vitrin (yüksek mağaza penceresi, büyük banner ve ürün kartı).
- Rehber robot eliyle bölgeyi gösterir; **Sesli anlat** tarayıcının `tr-TR` konuşmasını kullanır. Ayrı model çağrılmaz, gerçek kart çekilmez.
- Konum: isteğe bağlı AI modülü demosu. Avcı bir AI şirketi değildir.

### v123 — Kötü tarayıcı sesi kapandı, demo hafifledi

- Windows / tarayıcı TTS kaldırıldı (ses kötüydu). Rehber yazı + el ile anlatır. Asıl ses yolu sonraki **AvcAI / AvcAjan** adımıdır; şimdi ürün kurulmaz.
- Demo: sekme/görünür değilken zamanlayıcı durur, ağır 3D animasyon sade `float` olur, tıklayan imleç kalkar. Gerçek kart çekilmez.

### v124 — AvcAI tanıtım asistanı

- `/avcai` müşteri sorularına sitedeki kayıtlı metinlerle yanıt verir. Ad: **AvcAI**. Dış LLM, D1 sohbet kaydı, IP günlüğü ve ses/TTS yoktur.
- Motor: `avcai-knowledge.mjs` + `avcai-answer.mjs`; API aynı origin JSON, 400 karakter sınırı. Kesin fiyat, süre, SLA veya sahte referans uydurmaz; teklife yönlendirir.
- Peynir demosundaki bekleyen ses düğmesi `/avcai` bağlantısı oldu. Footer, yapay zekâ CTA, gizlilik notu ve sitemap eklendi. Palet `globals.css` dilindedir.

### v125 — AvcAI sağdaki maskot, ücretsiz Gemini

- AvcAI menüde durmaz; tanıtım sayfalarında sağda canlı maskottur (`breathe`/`float`/`pulse`). `/yonetim` ve İngilizce sayfalarda gizlenir.
- Sohbet: kayıtlı metin her zaman yedek. `GEMINI_API_KEY` varsa Google Gemini hem konuşur hem Türkçe ses üretir. `GROQ_API_KEY` yalnız metin. Windows `speechSynthesis` yok.
- Anahtar `.dev.vars` içine yazılır, commit edilmez. Sohbet D1’e gitmez. Gizlilik notu anahtar varsa Google’a gidişi söyler.

### v126 — AvcAI şahin, canlı sohbet, Gemini ses kilidi

- Maskot yeşil “A” değil; mint şahin ikonu (`float`/`breathe`/`pulse`, `--mint` `--ink` `--lime`).
- Sohbet canlı destek gibi: kısa balon, tek satır yazı, “Ne haber?” sohbeti, duvar metin yok.
- Sayfa ipucu: paket/fiyat, teklif/iletişim/destek, peynir demosu. İletişimde telefon-adres dökülmez; “formu şimdi doldur, buyurun iletişim” yok. Mesai beklemeden yaz denir; 7/24 SLA vaat edilmez.
- Tarayıcı autoplay kilidi: tıklanınca sessiz WAV ile ses açılır, Gemini yalnız ilk cümleyi okur. Windows TTS yok.

### v127 — AvcAI ikon, zıplama, daha akıllı cevap, kesin ses

- Şahin kalktı. Küçük mint AvcAI ikonu (`avcaiHop` / `avcaiRoam` / `float` / `pulse`). Sohbet açıkken sağa yapışır. AvcAI yazısı aynı kicker/rozet dilinde kaldı.
- Cevap 3-5 cümle; omuz silkmez, fiyat/SLA uydurmaz. Çay/kola gibi sohbet 1 cümle, sonra işe bağlar.
- Ses: tıklanınca AudioContext açılır; “Ses açık” basınca hemen okur. Gelmezse yazıda hata görünür. Windows TTS yok.
- Teklif/iletişim formu gönderilince AvcAI açılır ve tepki verir. Buton “Gönderildi” olur.

### v128 — AvcAI işaret, tam ses, Konuş

- Maskot: mürekkep daire + mint işaret (hayvan/A kutusu değil). Açılan alan daha geniş, kicker’lı bilet sohbeti; composer’da Konuş + Gönder.
- Ses cümle ortasında kesilmez; Gemini TTS parça parça tam cümle okur.
- Konuş: mikrofonla soru. Dinle açıkken yalnız dinlersin. Windows speechSynthesis yok.

### v129 — Karakter maskot, anlaşılır ses paneli, kesintisiz cümle

- Eski soyut işaret kaldırıldı. AvcAI; yüz, göz, gülümseme, anten, yan parçalar ve küçük jet izi olan CSS karakterine dönüştü. Kapalıyken kısa zıplama/uçuş rotasıyla dikkat çeker; hareket azaltma tercihini korur.
- Açılan panel genişletildi ve görsel hiyerarşisi yenilendi. Başlık “Sesli ve yazılı asistan”, anahtar “Yanıt sesi açık/kapalı” olarak netleştirildi; ayrı kapatma düğmesi ve daha açık kullanım metni eklendi.
- Tarayıcı ses tanıma `continuous` ve ara sonuçlarla çalışır. Konuşma ilk kısa durakta gönderilmez; 1,6 saniyelik doğal durak veya kullanıcının “Dur” eylemiyle tamamlanır. Gemini yedek kayıt sınırı 7 saniyeden 18 saniyeye çıkarıldı.
- Sesli yanıt parçaları 315 karaktere kadar birleştirildi ve geçici üretim hatasında bir kez yeniden denenir; böylece çok parçalı cevapların ortada kesilme olasılığı azaltıldı.
- Değişen kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-knowledge.mjs`, `app/globals.css`, `tests/avcai-answer.test.mjs`.
- Doğrulama: AvcAI hedefli testleri 2/2 başarılı; Vite production build başarılı; `http://127.0.0.1:4115/` HTTP 200 ve yeni maskot/ses metni mevcut.

### v130 — İkon ses denetimi, garantili ses yedeği, adsız sektör örneği

- “Yanıt sesi açık/kapalı” yazılı düğmesi kaldırıldı; durum artık CSS hoparlör/açık-kapalı ikonu ile gösterilir. Metin yalnız erişilebilir ad, ekran okuyucu ve üzerine gelme açıklaması olarak korunur.
- Gemini TTS yerel veya ağ koşullarında yanıt vermezse AvcAI sessiz kalmaz; Türkçe tarayıcı sesi otomatik yedek olarak devreye girer. Tarayıcı yedeği 180 karakterlik parçalarla okunur ve uzun cevapta kesilme riski azaltılır.
- Gemini sohbet/TTS/transkripsiyon isteklerindeki ağ hataları yakalanır; rota kontrolsüz 500 yerine güvenli yedeğe veya açıklamalı 503 yanıtına düşer.
- “Avcı nedir?” yanıtı ürün kapsamını doğrudan ve daha yardımcı biçimde anlatır. Aynı sektördeki firma adları kayıtlı yanıttan kaldırıldı; üretken model kuralı yalnız “X Firma” örneğine izin verir ve bilinen sektör adları son yanıtta otomatik “X Firma” olarak temizlenir.
- Değişen kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-knowledge.mjs`, `app/avcai-llm.mjs`, `app/globals.css`, `tests/avcai-answer.test.mjs`.
- Doğrulama: AvcAI testleri 2/2 başarılı; Vite production build başarılı; yerel `/api/avcai` “Avc nedir?” için HTTP 200, yardımcı ürün cevabı ve sıfır adlandırılmış sektör rakibi döndürdü.

### v131 — Bağlamlı AvcAI, doğal konuşma, ilgi algılama, kompakt mobil panel

- Bozuk CSS hoparlör şekli kaldırıldı; sistemin standart `🔊` / `🔇` sembolleri erişilebilir düğme içinde kullanılıyor.
- Tarayıcı ses yedeği Türkçe sesleri bekleyerek yükler; varsa Natural/Online/Google/Emel/Yelda/Tolga adlarını önceliklendirir. Konuşma hızı `0.96`, perde `1.0` ile daha doğal akışa çekildi.
- Yerel cevap motoru Türkçe ek alan kelimeleri daha iyi eşler, aynı sorudaki iki konuyu ilişkilendirir, son 8 konuşma öğesinden kısa devam sorularının bağlamını taşır ve sayfa/bölüm bağlamıyla açıklayıcı cevap kurar.
- Üretken model istemi kalıp girişleri, kullanıcı cümlesini tekrar etmeyi ve her turda baştan tanıtımı yasaklayacak biçimde güncellendi; çoğunlukla 2-4 cümlelik doğal Türkçe ve gerektiğinde tek netleştirme sorusu ister.
- Masaüstünde aynı içerik bölümünde 5 saniye kalan işaretçi, bölüm başlığını yerel bağlam olarak alır ve maskotu işaretçinin yakınına getirir. Bağlam yalnız kullanıcı soru gönderirse API isteğine eklenir; D1’e yazılmaz. Dokunmatik/mobil cihazlarda fare takibi çalışmaz.
- İlk sayfa ipucundan sonra 10. saniyede başlayan ve 15 saniye arayla en fazla üç kez gösterilen kibar hatırlatma/“tık tık” hareketi eklendi. Panel açıkken veya sekme görünür değilken hatırlatma yapılmaz.
- Panel masaüstünde `24.5rem` genişliğe ve daha kısa konuşma alanına indirildi. Mobilde güvenli alt boşluk, `72dvh` üst sınırı, yatay öneri şeritleri ve tam genişlikte ses/gönder denetimleri kullanılıyor.
- Resmî OpenAI Realtime rehberine göre sonraki ses mimarisi adayı: tarayıcıda WebRTC üzerinden düşük gecikmeli `gpt-realtime-2.1`; uygulama anahtarı/bütçesi onaylanmadan entegrasyon yapılmadı.
- Değişen kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-answer.mjs`, `app/avcai-knowledge.mjs`, `app/avcai-llm.mjs`, `app/api/avcai/route.ts`, `app/globals.css`, `tests/avcai-answer.test.mjs`.
- Doğrulama: AvcAI testleri 2/2 başarılı; Vite production build başarılı; yerel API paket + fiyat sorusunda iki konuyu birlikte yanıtladı ve adlandırılmış sektör rakibi döndürmedi; ana sayfa HTTP 200.

### v132 — gpt-realtime-2.1 canlı sesli görüşme

- AvcAI konuşma düğmesi öncelikle resmî OpenAI Realtime WebRTC akışını başlatır: mikrofon yalnız kullanıcı tıklamasıyla açılır, uzak ses doğrudan tarayıcıda çalınır ve `oai-events` veri kanalı kullanıcı/AvcAI transkriptlerini sohbet alanına taşır.
- Canlı oturum modeli tam olarak `gpt-realtime-2.1`, ses `marin`, giriş transkripsiyonu Türkçe ve konuşma sırası `server_vad` olarak yapılandırıldı. Doğal Türkçe, kayıtlı ürün bilgisi ve aynı sektörden yalnız `X Firma` politikası canlı istemde de korunur.
- Yeni `/api/avcai/realtime/token` rotası yalnız aynı-origin JSON POST kabul eder, 8 KB gövde sınırı uygular ve `OPENAI_API_KEY` ile sunucuda kısa ömürlü istemci anahtarı üretir. Standart anahtar tarayıcıya dönmez; yanıtlar `no-store` olur.
- `OPENAI_API_KEY` yoksa veya Realtime bağlantısı kurulamazsa mevcut SpeechRecognition/Gemini/tarayıcı ses yolu otomatik yedek olarak sürer. Görüşme bitince veri kanalı, WebRTC bağlantısı, mikrofon izleri ve uzak ses nesnesi kapatılır; eski TTS aynı anda çalmaz.
- `.env.example` sunucu tarafı OpenAI anahtarını belgeliyor; gerçek anahtar repoya eklenmedi.
- Değişen kaynaklar: `app/avcai-realtime.mjs`, `app/api/avcai/realtime/token/route.ts`, `app/avcai-mascot.tsx`, `.env.example`, `tests/avcai-realtime.test.mjs`, `tests/avcai-html.test.mjs`.
- Doğrulama: AvcAI hedefli testleri 6/6 başarılı; Vite production build başarılı; yerel token rotası anahtar yokken beklenen HTTP 503 + `no-store` yanıtını verdi ve arayüz yedek ses yolunu korudu. Geçerli OpenAI anahtarı olmadığı için ücretli canlı uçtan uca çağrı yapılmadı.

### v133 — Tofy kimliği, kaynaklı şirket bilgisi ve yetkili bakım komutları

- Asistanın görünen ve konuşulan adı **Tofy** oldu. Tanıtımı “Ben Tofy’yim, beni Avcı E-Ticaret geliştirdi” biçimindedir; `AVC`, `AVC E-Ticaret` ve eski `AvcAI` metinleri ses öncesi sırasıyla “Avcı”, “Avcı E-Ticaret” ve “Tofy” olarak normalize edilir.
- “Avcı E-Ticaret hakkında bilgi/geçmiş” soruları, sunucuda `OPENAI_API_KEY` varsa resmî Responses API `web_search` aracıyla güncel kaynak araştırmasına gider. Yanıt kısa ve doğrulanabilir kalır; kuruluş tarihi/kurucu/müşteri uydurmaz, aynı sektör şirket adlarını göstermez ve bulunan URL’leri tıklanabilir `Kaynak 1..3` olarak sunar. Anahtar yoksa kayıtlı dürüst şirket özeti kullanılır.
- Tofy yönetim alanında gösterilir; `/yonetim/giris` üzerinde gösterilmez. Yönetim yolundan gelen sıradan personel konuşması ancak sunucunun doğruladığı yetkili yönetici için personel bağlamı alır.
- Tam komutlar `Tofy kahveye gel` (bakımı aç) ve `Tofy afiyet olsun` (bakımı kapat) olarak tanımlandı. Komutun bilinmesi yetki değildir: `/api/avcai/personel` ve normal sohbet akışı aynı-origin JSON ister, `getAdminUser()` ile sunucu tarafında oturum + yetki doğrular ve yalnız sonra D1 `site_settings.maintenanceMode` değerini değiştirir.
- Bakım açıkken halka açık HTML istekleri HTTP 503, `Retry-After`, `no-store` ve noindex başlıklarıyla sade bakım ekranı alır. `/yonetim` ve `/api` yolları kurtarma için açık kalır. Aynı ayar `/yonetim/ayarlar` içinde elle de açılıp kapatılabilir.
- Daha önce sesi engelleyen güvenlik başlıkları düzeltildi: `Permissions-Policy` mikrofonu aynı origin için açar; CSP `connect-src` OpenAI WebRTC/Responses bağlantısına izin verir.
- Tofy ve ilgili peynir demo/yapay zekâ/gizlilik metinleri yeni ada geçirildi. Web arama kaynakları için kompakt, mobil uyumlu bağlantı stili eklendi.
- Değişen ana kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-knowledge.mjs`, `app/avcai-ui.mjs`, `app/avcai-llm.mjs`, `app/avcai-realtime.mjs`, `app/tofy-personnel.mjs`, `app/tofy-personnel-command.ts`, `app/api/avcai/route.ts`, `app/api/avcai/personel/route.ts`, `app/api/avcai/realtime/token/route.ts`, `app/site-settings.mjs`, `app/yonetim/ayarlar/settings-form.tsx`, `worker/index.ts`, `app/globals.css` ve ilgili sayfa/testler.
- Doğrulama: hedefli mantık/güvenlik testleri 10/10 başarılı; Tofy sayfa testi ve peynir demo testi ayrı ayrı başarılı; Vite production build başarılı. Yerel HTTP kontrolünde Tofy sayfası 200, mikrofon/CSP başlıkları doğru, şirket sorusu anahtar yokken güvenli yerel cevaba düştü ve benzer ama yanlış personel cümlesi 400 aldı.
- Açık kontrol: gerçek `OPENAI_API_KEY` bulunmadığı için canlı `gpt-realtime-2.1` ve Responses `web_search` ücretli uçtan uca denenmedi. Bakım modunu aç-kapat yerel testi kullanıcı tarafından kesildi; kesilmeden sonra `127.0.0.1:4115` bağlantıyı reddetti. Yeni oturum önce sunucuyu başlatmalı, `maintenanceMode` durumunu kontrol etmeli ve gerekirse yetkili oturumdan “Tofy afiyet olsun” veya `/yonetim/ayarlar` ile kapatmalıdır. Test sırasında bakımda bırakıldığı doğrulanmamıştır.

### v134 — Tofy final doğrulama ve bakım kurtarma zinciri

- Yerel Vite sunucusu `127.0.0.1:4115` üzerinde yeniden başlatıldı. İlk kontrol HTTP 200 verdi; bakım kapalı, Tofy görünür ve `Permissions-Policy` mikrofonu aynı origin için açık durumdaydı.
- Yerel yönetim oturumu gizli değerleri çıktıya yazmadan açıldı. `Tofy kahveye gel` yetkili komutu HTTP 200 döndürdü; halka açık ana sayfa HTTP 503 bakım ekranına geçti, aynı anda `/yonetim` HTTP 200 ile kurtarma için açık kaldı.
- `finally` adımında `Tofy afiyet olsun` HTTP 200 ile çalıştı. Son halka açık ana sayfa kontrolü HTTP 200 ve bakım metni yok sonucunu verdi; site bakımda bırakılmadı.
- Hedefli Tofy/Realtime/personel/site ayarı testleri 10/10, Tofy ve peynir HTML testleri 2/2 başarılı. Son Tofy rol etiketi değişikliğini içeren Vite production build 5/5 aşamada exit 0 ile tamamlandı.
- Yerel sunucu bu kayıt sonunda çalışır durumdadır. `OPENAI_API_KEY` hâlâ yapılandırılmadığından ücretli Realtime ve web arama uçtan uca doğrulaması açık kalır; Gemini ve yerel/tarayıcı yedekleri korunur.

### v135 — Ana sayfa kurumsal sistem alanları ve yoğun alt bölüm

- `#basla` içindeki sekiz mağaza özelliği; kategori etiketi, sıra numarası, tutarlı ikon yüzeyi ve 4×2 kurumsal sistem ızgarasıyla yeniden tasarlandı. Tablet iki, mobil tek sütuna düşer; mevcut ürün kapsamı ve görsel kimlik korunur.
- `#yapay-zeka` görseli Tofy merkezli hareketli operasyon konsoluna dönüştürüldü. İçerik, satış, destek ve rapor düğümleri; dönen sinyal halkaları ve canlı durum çizgileriyle gösterilir. AI'ın mağaza çekirdeğine bağlı isteğe göre etkinleşen modül olduğu açıkça korunur; reduced-motion kuralı tüm hareketleri durdurur.
- `#iletisim` bölümü ihtiyaç → kapsam → teklif akışı, okunaklı doğrudan iletişim kartları ve çerçeveli proje formuyla dengeli iki sütuna geçirildi. Dekoratif `cta-noise` katmanının yanlışlıkla grid hücresi kapladığı hata giderildi; masaüstü bölüm yüksekliği yaklaşık 1739 px'den 948 px'e indi.
- Ana sayfa footer'ı platform, çözümler, planlama ve kurumsal başlıkları altında dört okunaklı sütuna ayrıldı; marka/iletişim alanı ve alt yasal satır eklendi. Yalnız mevcut rotalar kullanıldı; mobilde iki sütunlu menü korunur.
- Değişen kaynaklar: `app/page.tsx`, `app/globals.css`, `tests/rendered-html.test.mjs`. Render testindeki eski hero metni ve eski carousel işaretlemesi beklentileri güncel kaynakla hizalandı.
- Doğrulama: Vite production build 5/5 başarılı; Tofy/Realtime/personel/site ayarı hedefli testleri 10/10 başarılı. Masaüstü 1934×1280 ve mobil 390×844 tarayıcı kontrolünde yatay taşma yok, özellik gridleri sırasıyla 4/1 sütun, footer 4/2 sütun ve AI düğümleri merkezle çakışmıyor. Ana `rendered-html` sayfa/kapsam kontrolleri geçiyor; aynı uzun testin daha sonraki müşteri portalı yönlendirme beklentisi HTTP 307 beklerken mevcut uygulama HTTP 200 verdiği için ayrı, önceden var olan bir açık iş olarak kalıyor.

### v136 — Logo uyumlu pastel kimlik ve gelişmiş kurumsal footer

- Gerçek Avcı E-Ticaret logosundaki kırmızı-siyah karakter temel alınarak genel renk değişkenleri sakin kırmızı, pudra, krem ve sıcak nötr tonlara geçirildi. Eski belirgin yeşil vurgular marka kırmızısına bağlandı; gece/gündüz davranışı ve mevcut bileşen hiyerarşisi korundu.
- Ana sayfa footer'ı ortak `SiteFooter` bileşenine taşındı. Koyu proje CTA bandı, satış hattı, gerçek logo, iletişim ve kapsam etiketleri; Platform, Satış Modelleri, Planlama, Rehberler ve Destek & Kurumsal olmak üzere beş konu grubu ile yasal alt satır eklendi. IdeaSoft, Ticimax, Hipotenüs, ikas ve T-Soft sınıfındaki yoğun bilgi mimarisi örnek alındı; hiçbir tasarım birebir kopyalanmadı ve gerçek olmayan metrik/sertifika eklenmedi.
- Footer masaüstünde beş, tablette üç, mobilde iki sütunlu çalışır. Mobil alt satıra Tofy ve geçici bildirim katmanlarının yasal bağlantıları kapatmaması için güvenli alt boşluk eklendi.
- Değişen kaynaklar: `app/site-footer.tsx`, `app/page.tsx`, `app/globals.css`, `PROJECT_DEBUG.md`.
- Doğrulama: hedefli Tofy/Realtime/personel/site ayarı testleri 10/10 başarılı; doğrudan Vite production build 5/5 aşamada exit 0 ile tamamlandı. Tarayıcıda masaüstü 1934×1280 ve mobil 390×844 kontrol edildi; yatay taşma yok, mobil footer iki sütun ve yasal alt alan erişilebilir. Standart `npm.cmd run build` betiği bu Windows oturumunda Bash E_ACCESSDENIED verdiği için proje kuralına uygun `npm.cmd exec -- vite build` kullanıldı.

### v137 — Proje geneli kurumsal renk sistemi ve çözüm erişim bandı

- v136'daki yoğun pudra etkisi azaltıldı. Proje renk sistemi gerçek logo yönünde kömür siyahı, sıcak kırık beyaz, nötr taş yüzeyleri ve kontrollü Avcı kırmızısı olarak yeniden kuruldu; pastel karakter yalnız destek yüzeyleri ve yumuşak geçişlerde bırakıldı.
- Eski sabit yeşil-mavi koyu yüzeylerin oluşturduğu çift kimlik giderildi. Ana sayfa, katalog kahraman alanları, koyu kurumsal bloklar, kartlar, paketler, tablolar, formlar, CTA ve footer aynı token/yüzey sistemiyle hizalandı. Gündüz ve gece temalarında okunaklılık ayrımı korundu.
- Büyük e-ticaret altyapısı sağlayıcılarındaki hızlı ürün erişimi yaklaşımından esinlenen, fakat özgün olarak tasarlanan `Çözüm Haritası` bandı ana sayfaya eklendi. E-Ticaret Altyapısı, B2B & Bayi, Entegrasyonlar ve Paketler bağlantıları masaüstünde dört, tablette iki, mobilde tek sütun çalışır.
- Bölüm başlıklarında kurumsal vurgu rayı, kartlarda sıcak nötr yüzey/gölge, paketlerde ölçülü kırmızı odak ve katalog kahramanlarında ortak koyu kompozisyon kullanıldı. Uygulama ve manifest tema rengi yeni kömür tonuna güncellendi.
- Değişen kaynaklar: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`, `app/manifest.ts`, `PROJECT_DEBUG.md`.
- Doğrulama: Vite production build 5/5 aşamada exit 0; hedefli Tofy/Realtime/personel/site ayarı testleri 10/10 başarılı; yerel ana sayfa HTTP 200, çözüm bandı ve ortak footer sunucu çıktısında mevcut. Kullanıcı yerel çalışma istediği için deploy yapılmadı.

### v138 — Kurumsal renk denetimi ve ikon sistemi onarımı

- Projedeki eski yeşil-mavi rozet, link, açık yüzey ve koyu panel kalıntıları yeniden tarandı. Ana sayfa ile destek, hosting, proje, mobil, İngilizce, paket, entegrasyon, senaryo, referans ve partner bloklarının vurgu/yüzey renkleri Avcı kırmızısı, kömür, sıcak beyaz ve taş nötrleriyle hizalandı.
- Ürün kartlarındaki üç dekoratif kareden oluşan soyut işaret kaldırıldı. Altı ürün için mevcut, erişilebilir `StartIcon` ailesinden mağaza, katman, hedef, uçuş, mobil ve ayar ikonları kullanıldı; tümü aynı 1.7 çizgi kalınlığı, 66 px kabuk, 18 px köşe ve ortak hover davranışına bağlandı.
- Üç başlangıç adımının birbirinden kopuk pastel daireleri kırmızı, sıcak beyaz ve kömürden oluşan tek ikon sistemine çevrildi. Sekiz özellik ikonu aynı ölçü, çerçeve, gölge ve kırmızı çizgi dilini kullanır; sürekli ikon salınımı kaldırılarak daha kurumsal ve stabil görünüm sağlandı.
- Boş `ai-icon` yüzeyi CSS tabanlı tek bir elmas/düğüm işaretine dönüştürüldü. Kahraman paneli, canlı bildirim, durum noktaları, pano rozetleri, banner ve ürün önizlemelerindeki eski turkuaz/yeşil vurgular marka paletine bağlandı. Gündüz/gece ve reduced-motion davranışı korundu.
- Değişen kaynaklar: `app/page.tsx`, `app/globals.css`, `PROJECT_DEBUG.md`.
- Doğrulama: Vite production build 5/5 aşamada exit 0; hedefli Tofy/Realtime/personel/site ayarı testleri 10/10 başarılı; yerel ana sayfa HTTP 200. Sunucu çıktısında 6 yeni ürün ikon kabuğu mevcut ve eski `product-icon > i` kare yapısı yok.

### v139 — İşaretli renk alanları, kurumsal adımlar ve AVCVERİ şeridi

- `/paketler` kart sahnesindeki eski yeşil/pembe çakışması kaldırıldı. Start ve Enterprise sıcak beyaz/taş yüzeylere, Scale kömür–Avcı kırmızısı odağa alındı; detay, kapsam, bilgi bandı ve CTA alanları aynı kurumsal renk sistemine bağlandı.
- `/musteri-merkezi` alt bilgi bandı pudra-kırmızı destek yüzeyine, portal sınırı sıcak griye ve ana CTA kömür–kırmızı geçişe çevrildi. CTA düzeni grid ile dengelenerek masaüstü yatay taşması giderildi.
- Ana sayfadaki üç başlangıç adımı büyük soluk numaralar ve dağınık ikon yüzeyleri yerine; ortak ikon kabuğu, küçük sıra numarası, tutarlı tipografi ve alt bağlantı çizgisi kullanan üç kurumsal yatay karta dönüştürüldü.
- `Çözüm Haritası` bağlantılarındaki platforma göre mavi kutu gibi görünen `↗` karakteri kaldırıldı; çizgi ve ok ucu tamamen CSS ile, mevcut marka renginde üretildi.
- Canlı vitrin başlığı `AVCVERİ` oldu ve görünür “Örnek” metinleri kaldırıldı. Masaüstünde üç, tablette iki, mobilde bir ayrı veri kartı gösterilir; grup 4,8 saniyede yenilenip yavaşça sağa kayar ve durum noktaları yanıp sönmeye devam eder. Erişilebilir etikette verinin temsili olduğu açıkça korunur.
- Değişen kaynaklar: `app/live-strip-pulse.tsx`, `app/page.tsx`, `app/globals.css`, `PROJECT_DEBUG.md`.
- Doğrulama: hedefli testler 10/10 başarılı; doğrudan Vite production build 5/5 aşamada exit 0 ile tamamlandı. Tarayıcıda masaüstü ve 390×844 mobil kontrolünde işaretli alanlar doğrulandı; paketler, müşteri merkezi, üç adım ve AVCVERİ alanlarında yatay taşma yok. Masaüstünde tam üç AVCVERİ kartı, mobilde tek kart görünür; görünür “Örnek” metni ve mavi emoji ok bulunmaz. Deploy yapılmadı.

### v140 — Hero üçlü paneli gece/gündüz ortak tasarım sistemi

- Ana sayfa hero carousel içindeki Satış Merkezi, Sipariş Merkezi ve Kanal Senkronu sahneleri yeniden tasarlandı. Üç görünüm artık aynı Avcı Commerce pencere üst çubuğunu, köşe oranını, çizgi kalınlığını, durum rozetini ve kırmızı sinyal dilini kullanır; içerik yapıları satış özeti, canlı sipariş kuyruğu ve çok kanallı stok olarak ayrı kalır.
- Eski açık panel / mavi-lacivert kuyruk / yeşilimsi kanal kartı karışımı kaldırıldı. Gece temasında kömür ve kontrollü Avcı kırmızısı; gündüz temasında sıcak beyaz, taş ve aynı kırmızı vurgu kullanılır. Sipariş seçimi, stok eşzamanlılığı, grafikler, bildirimler ve carousel denetimleri ortak tema değişkenlerine bağlandı.
- Sipariş ve kanal sahnelerine kurumsal çalışma alanı çerçevesi eklendi; dürüst temsili panel etiketi korundu. Satış sahnesinin metrik, grafik ve AI kartları da aynı yüzey sistemine geçirildi.
- Mobilde eski grid min-content davranışının paneli 390 px ekranda yaklaşık 854 px genişliğe zorladığı gizli kırpılma giderildi. Hero sütunu `minmax(0, 1fr)` ve panel zinciri gerçek ekran genişliğiyle sınırlandı; 390×844 kontrolde panel 333 px, yatay taşma 0 ve kompakt içerik yüksekliği doğrulandı.
- Değişen kaynaklar: `app/hero-stage.tsx`, `app/globals.css`, `PROJECT_DEBUG.md`.
- Doğrulama: hedefli Tofy/Realtime/site ayarı testleri 11/11 başarılı; hedefli ESLint başarılı; Vite production build 5/5 aşamada exit 0. Tarayıcıda 1934×1280 gece ve gündüz temaları ile 390×844 mobil görünüm kontrol edildi; üç panel mevcut, renk tokenları temaya göre değişiyor ve yatay taşma yok. Önizleme sonunda özgün gece teması ve normal masaüstü viewport'una döndürüldü. Deploy yapılmadı.

### v141 — Hero ürün sahneleri ve bağımsız teknoloji ekosistemi

- v140'taki üç benzer panel düzeni içerik mimarisiyle birlikte kaldırıldı. Hero artık üç farklı profesyonel ürün sahnesi gösterir: büyük satış grafiği, KPI ve hareket akışından oluşan Satış Komuta Merkezi; üç kolonlu kart tabanlı Sipariş Kontrol Masası; ortak katalog çekirdeğini dört kanala bağlayan Senkronizasyon Ağı.
- Üç sahnenin ortak Avcı Commerce pencere kabuğu, gece/gündüz tokenları, otomatik carousel, klavye erişimli kontrolleri ve temsili veri açıklaması korunur. Satış sahnesindeki yüzen kart kalabalığı kaldırıldı; Tofy sinyali panel içine kontrollü bir içgörü kartı olarak alındı.
- Ana sayfa başındaki dar “Marka ekosistemimiz” şeridi kaldırıldı; Çözüm Haritası artık bu şeritle birleşik görünmez. Ekosistem, Platform bölümünden sonra bağımsız ve geniş bir anlatım alanına taşındı.
- Yeni ekosistem alanında Hatay360, Adana360, SEOEksper ve AvcıLabs marka ağı ayrı satırda; Google, Yandex, Google Ads, Meta, Hostinger, Cloudflare, PayTR ve iyzico teknoloji/kanal kartları ayrı 4×2 gridde gösterilir. Markalar için doğrulanmamış resmî partnerlik veya hazır entegrasyon iddiası kurulmadı; sağlayıcı ve hesap doğrulaması gerektiğini belirten açık kapsam notu eklendi.
- Ana sayfa ekosistemi, çözüm senaryoları sayfasındaki mevcut `.ecosystem-section` bileşeniyle CSS çakışmaması için bağımsız `.home-ecosystem` sınıfına alındı. Masaüstü panel kırpılması ve 1100 px altındaki iki kolon kalıntısı giderildi.
- Değişen kaynaklar: `app/hero-stage.tsx`, `app/page.tsx`, `app/globals.css`, `PROJECT_DEBUG.md`.
- Doğrulama: hedefli ESLint başarılı; Tofy/Realtime/site ayarı testleri 11/11 başarılı; Vite production build 5/5 aşamada exit 0. Tarayıcıda 1934×1280 gündüz/gece ve 390×844 mobil kontrol yapıldı; masaüstü hero paneli sağ sınır içinde, mobil panel 333 px, ekosistem masaüstünde 4×2 ve mobilde tek kolon, yatay taşma 0. Deploy yapılmadı.

### v142 — Tofy mikrofon, JSON hata ve Gemini sesi

- Mikrofon Chrome `onend` sonrası senkron `start()` hatasında kapanmıyor. Tanıma kısa gecikmeyle yeniden açılır; izin yoksa Türkçe uyarı verilir. SpeechRecognition varken Gemini kayıt yedeğine düşülmez.
- Soru/dinleme cevapları HTML (`<!DOCTYPE...`) gelirse JSON parse hatası gösterilmez; “Tofy şu an cevap veremedi” denir. `/api/avcai`, `/ses` ve `/dinle` beklenmeyen hatada JSON döner.
- Asıl kırılma: `/api/alan-adi/sorgula` yanlış `db/schema` yolunu import ediyordu; Vite worker HTML hata sayfası dönünce Tofy `Unexpected token '<'` gösteriyordu. Import `../../../../db/schema` olarak düzeltildi.
- Windows/tarayıcı TTS yedeği kapatıldı. Tofy önce Gemini `gemini-2.5-flash-preview-tts` / `Kore` (önceki ses) dener; kota doluysa `gemini-3.1-flash-tts-preview` yedeği konuşur.
- Değişen kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-llm.mjs`, `app/api/avcai/route.ts`, `app/api/avcai/ses/route.ts`, `app/api/avcai/dinle/route.ts`, `app/api/alan-adi/sorgula/route.ts`, `tests/avcai-answer.test.mjs`, `PROJECT_DEBUG.md`.

### v143 — Tofy ses kaydı gönderimi ve daha hızlı yanıt

- Kareye basınca dinleme kapanıp boş kalmıyor. Mikrofon açılınca ses kaydı da tutulur; kare hem yazıyı hem kaydı gönderir. Yazı yoksa kayıt okunup yine gider.
- Sesli soru sohbette “Siz · Sesli soru” balonu olarak durur; play ile kendi sesi tekrar dinlenir.
- Yazılı cevap daha hızlı: Gemini önce ve kısa zaman aşımı ile çalışır; dolu kota bekletmesi TTS’te öne alınmaz.
- Değişen kaynaklar: `app/avcai-mascot.tsx`, `app/avcai-llm.mjs`, `app/globals.css`, `tests/avcai-answer.test.mjs`, `PROJECT_DEBUG.md`.

### v144 — Gündüz katalog menüsü ve teklif header

- Katalog header menüsü gündüzde 9px açık gri olmaktan çıktı; ana sayfadaki gibi okunaklı mürekkep rengi, `clamp()` punto ve beyaz hap zemin kullanır.
- `/teklif` header’ına aynı sayfa menüsü eklendi. “Ana sayfaya dön” tek başına menünün yerini tutmuyordu.
- 1100 px altında teklif menüsü de katalogdaki gibi gizlenir; logo ve ana sayfa CTA kalır.
- Değişen kaynaklar: `app/teklif/page.tsx`, `app/globals.css`, `tests/rendered-html.test.mjs`, `PROJECT_DEBUG.md`.

## 6. Güvenlik ve veri bütünlüğü kararları

- Yönetim mutasyonları aynı-origin, JSON content type ve sınırlı nesne gövdesi gerektirir.
- Yetki yalnızca kullanıcı arayüzüne bırakılmaz; API ve sunucu sayfalarında tekrar doğrulanır.
- Durum güncellemede `updatedAt` ile çakışma kontrolü vardır.
- Teklif ve ekip notu tekrarlarında idempotency anahtarı kullanılır.
- Ham `requestKey`, normalize telefon ve diğer iç alanlar CSV'ye çıkarılmaz.
- CSV hücreleri spreadsheet formülü olarak çalışmayacak biçimde güvenli hâle getirilir.
- D1 sorgularında hazırlanmış/parametreli Drizzle ifadeleri kullanılır.
- Gerçek müşteri verisiyle yerel test yapılmaz.

## 7. Yerel sunucu ve güvenli test bilgileri

Aktif yerel önizleme:

```text
http://127.0.0.1:4115/
```

- Sunucu yalnızca `127.0.0.1:4115` üzerinde dinler.
- 4114 portu başka projeye aittir ve kullanılmamalıdır.
- Son doğrulamada HTTP 200 ve yalnız localhost listener doğrulandı.
- Başlatma komutu mantığı: `npm.cmd exec -- vite --host 127.0.0.1 --port 4115 --strictPort`.

Güvenli demo/test ilkeleri:

- Temsili yönetim paneli verileri “örnek veri” olarak etiketlidir.
- Gerçek müşteri kaydı, parola, token, lisans anahtarı veya ödeme bilgisi kullanılmaz.
- Yerel D1 için test gerekiyorsa yalnız sentetik ad/e-posta/telefon ve açıkça demo amaçlı kayıt kullanılır.
- Yönetim yetkisi testi gerçek izin listesi paylaşılmadan yapılmalıdır.

## 8. Doğrulama komutları ve son sonuçlar

Windows için güvenilir komutlar:

```powershell
npm.cmd ci
npm.cmd exec -- eslint . --ignore-pattern dist --ignore-pattern .next
npm.cmd exec -- vite build
node --test tests/*.test.mjs
```

Artifact kontrolü; `dist/server/index.js` varsayılan ESM export'unda `fetch` fonksiyonunu ve `dist/.openai/hosting.json` geçerli JSON yapısını doğrulamalıdır.

Son tamamlanmış doğrulama (v61):

- Hedefli ESLint: başarılı.
- Üretim derlemesi: başarılı.
- Node testleri: 32/32 başarılı.
- Sites artifact: geçerli.
- Son bilinen yerel önizleme: HTTP 200, yalnız `127.0.0.1:4115`.

## 9. Karşılaşılan sorunlar ve çözümler

- Bozuk `node_modules` ve yarım kurulum klasörü daha önce temizlendi; `npm.cmd ci` ve `npm.cmd ls --depth=0` başarılı oldu.
- Proje npm scriptlerinin bazıları Bash yardımcılarına bağlıdır. PowerShell oturumunda `bash` görünmezse doğrudan Vite/ESLint/Node komutları kullanılır.
- Türkçe karakter ve boşluk içeren proje yolu Git Bash yardımcılarında `HOME`/runtime klasörü sorunlarına yol açabilir. Artifact kontrolü gerektiğinde doğrudan Node ile aynı koşullar doğrulanabilir.
- PowerShell `Start-Process`, ortamda hem `Path` hem `PATH` bulunduğunda sözlük anahtarı hatası verdi. Yerel sunucu `.NET ProcessStartInfo` ve `UseShellExecute=true` ile güvenli biçimde başlatıldı.
- PowerShell değişken adları büyük/küçük harfe duyarsız olduğu için yerel kontrolde `$home` adı ayrılmış `$HOME` ile çakıştı; kontrol değişkeni `$homeResponse` olarak değiştirildi. Kaynak veya ortam ayarı etkilenmedi.
- Yerel Vite sunucusu düz HTTP çalışırken bir kontrol isteği yanlışlıkla HTTPS ile gönderildi ve Windows TLS istemcisi bağlantıyı reddetti; doğru HTTP kontrolleri ve tam test paketi başarıyla tekrarlandı.
- İlk yerel manifest kontrolünde `Invoke-WebRequest` çıktısındaki JSON ikon dizisi PowerShell tarafından beklenen nesne biçiminde açılmadı; `Invoke-RestMethod` ile doğru alanlar doğrulandı. Kaynak veya artifact etkilenmedi.
- `Get-NetTCPConnection` bazı oturumlarda erişim reddetti. Listener doğrulaması için `netstat.exe -ano` kullanıldı.
- README'nin starter ağırlıklı olması sorunu v10'da çözüldü; proje hafızası için `PROJECT_DEBUG.md` esas alınır.

## 10. Açık durumlar ve mantıklı sonraki adımlar

- Görsel kimlik kuralı (v70) geçerli; tam sayfa redesign yok.
- Hero hareketi (v71) ve ikas IA blokları (v72) kullanıcı onayı bekliyor.
- Paket kimlikleri merkezileştirildi; pazarlama metinleri sayfa bağlamına göre ayrı kalıyor. Yeni paket eklenirse her iki görünümün içerik kapsamı birlikte gözden geçirilmelidir.
- Bağlı marka katmanları teklif ve çözüm bağlamındadır; gerçek teknik entegrasyon, ortak kimlik veya veri paylaşımı ancak ayrı kabul kriteriyle ele alınabilir.
- Katalog üst menülerinde AI yalnız kendi modül sayfasında görünür; yeni katalog rotalarında E-Ticaret ana ürün hiyerarşisi korunmalıdır.
- Müşteri kartı bağlantıları (v84) ve ana sayfa vitrin hareketi (v86) onay bekliyor.
- Mağaza back-office (katalog, sipariş, ödeme, kargo, iade) bu proje içinde henüz uygulanmış bir yönetim ürünü değildir; yapılmış gibi gösterilmemelidir.
- Yeni işlev geliştirmeden önce ürünün gerçek veri kaynağı, kullanıcı rolü, kabul kriteri ve güvenlik sınırı belirlenmelidir.
- AvcAI canlı konuşması öncelikle sunucudaki `OPENAI_API_KEY` ile `gpt-realtime-2.1` kullanır. Anahtar yoksa Gemini TTS + tarayıcı SpeechRecognition yedeğine düşer; Windows `speechSynthesis` kullanılmaz. Hiçbir standart API anahtarı istemciye gönderilmez.
- Kullanıcı durdurana kadar küçük, doğrulanabilir ve mevcut ürün yönüyle uyumlu kilometre taşlarıyla devam edilir.
- Şifreli müşteri oturumu, e-Fatura ve kart çekimi açılmaz; LICENSE_PORTAL_URL yoksa hazırlanıyor uyarısı yeterlidir.
- Destek kaydında sipariş sütunu yoktur; sipariş iç nottaki `Sipariş #id` işaretiyle eşlenir. Sütun eklemek ayrı migration ister.

## 11. Git, deploy ve dış sistem durumu

- Bu klasör Git deposu değildir.
- `.github/workflows` yoktur.
- Git remote yoktur.
- `package.json` içinde deploy/publish komutu yoktur.
- Vercel, Netlify, GitHub Pages veya otomatik Cloudflare deploy akışı yoktur.
- `.openai/hosting.json` yalnızca `d1: "DB"` ve `r2: null` bildirir; site `project_id` içermez.
- Git commit/push, deploy, dış servise veri gönderme veya gerçek lisans platformunda değişiklik yapılmadı.

## 12. Bu dosyanın bakım kuralı

Her anlamlı kilometre taşında:

1. “Son güncelleme” tarihini koru/güncelle.
2. Kronolojik değişiklik günlüğüne yeni sürüm maddesi ekle veya aktif maddeyi tamamla.
3. Değişen önemli dosyaları ve nedenlerini belirt.
4. Test/lint/build/artifact/yerel sunucu sonuçlarını güncelle.
5. Yeni kullanıcı kararlarını ve kapsam sınırlarını kaydet.
6. Çözülen/açık sorunları güncelle.
7. Gizli bilgi ve gerçek müşteri verisi yazılmadığını kontrol et.
