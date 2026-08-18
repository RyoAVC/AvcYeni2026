# Avcı E-Ticaret — Canlı Site Bakım / Yakında Devir Promptu

Bu metni **başka bir Cursor sohbetine** olduğu gibi yapıştır.

---

## Yapıştırılacak prompt

```text
Görev: avcieticaret.com canlı sitesine profesyonel bir “Yakında / Bakımda” sayfası uygula.

ÖNEMLİ SINIRLAR
- Canlıya deploy etmeden önce bana onay sor.
- Mevcut müşteri paneli / lisans / ödeme akışlarını bozma.
- Gizli anahtar, parola, token yazma.
- Dekoratif ok/emoji süsleme kullanma (→ ↗ ↓ ✦ vb.).
- Siyah zemin + kırmızı vurgu marka dilini koru.

MARKA
- Ana marka: Avcı E-Ticaret / avcieticaret.com
- Telefon: 0850 308 68 37  (tel:+908503086837)
- E-posta: info@avcieticaret.com
- Diğer siteler:
  - https://adana360.com
  - https://hatay360.com
  - https://dijivio.com

LOGOLAR (hazır dosyalar — SVG, şeffaf zemin)
Bu projedeki klasör:
C:\Users\User\Desktop\lisans ön yüz\public\bakim\logos\

Dosyalar:
- avci-logo.svg       → ana logo (siyah zeminde kullan)
- avci-mark.svg       → favicon / küçük marka
- adana360.svg
- hatay360.svg
- dijivio.svg

Not: Eski PNG’lerde siyah arka plan gömülüydü; kötü duruyordu. SVG’ler şeffaf ve net.

HAZIR SAYFA ÖRNEĞİ
C:\Users\User\Desktop\lisans ön yüz\public\bakim\index.html
Bu dosyayı temel al; canlı ortama göre uyarla (WordPress / Hostinger / static).

İSTERİM
1) Tam ekran siyah “Yakında” sayfası
2) Üstte Avcı logosu
3) Net başlık + kısa açıklama
4) Telefon ve e-posta CTA
5) Altta adana360 / hatay360 / dijivio logoları (tıklanabilir, yeni sekmede, rel=noopener noreferrer)
6) Mobil uyumlu
7) noindex,nofollow
8) prefers-reduced-motion desteği

METİN ÖNERİSİ
Kicker: Site yenileniyor
Başlık: Yeni nesil e-ticaret altyapısı çok yakında.
Metin: Avcı E-Ticaret; mağaza, katalog, sipariş, ödeme ve operasyon süreçlerini tek merkezde toplayan yeni platform deneyimini hazırlıyor. Şimdilik bizimle doğrudan iletişime geçebilirsiniz.

CANLI BİLGİ (web doğrulaması)
- Canlı site şu an eski WordPress/e-ticaret yüzü: https://www.avcieticaret.com/
- İletişim telefonu sitede de 0850 308 6837
- Adana ofis: Gültepe Mah. 835 SK. Halil Aksu APT No:1 iç kapı No:13 Sarıçam / Adana
- Hatay ofis: Gülderen Mah. / Antakya-Hatay (sitede de var)

ÖNCE
1. Canlı ortamın ne olduğunu netleştir (WordPress mi, static mi, Hostinger mi)
2. Bakım sayfasını staging/local’de göster
3. Sonra canlıya alma adımını onay isteyerek anlat
```

---

## Bu klasörde hazır olanlar

| Dosya | Amaç |
|---|---|
| `public/bakim/index.html` | Hazır bakım/yakında sayfası |
| `public/bakim/logos/avci-logo.svg` | Ana logo (şeffaf, net) |
| `public/bakim/logos/avci-mark.svg` | Favicon / küçük marka |
| `public/bakim/logos/adana360.svg` | Adana360 |
| `public/bakim/logos/hatay360.svg` | Hatay360 |
| `public/bakim/logos/dijivio.svg` | Dijivio |

Not: Eski PNG’lerde siyah zemin vardı; bu yüzden kartlarda kötü görünüyordu. Yeni SVG logolar şeffaf ve keskin.

## Yerelde önizleme

Sunucu açıkken:

```text
http://127.0.0.1:4115/bakim/
```

## Not

Bu adım **yalnızca paket hazırlığıdır**. Canlı `avcieticaret.com` henüz değiştirilmedi.
Ana Vinext/Next proje dosyalarına (`app/`, `globals.css` vb.) dokunulmaz; sadece `public/bakim/` önizlemedir.
