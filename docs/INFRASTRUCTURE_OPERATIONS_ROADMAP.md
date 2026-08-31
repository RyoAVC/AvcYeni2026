# Avcı Altyapı Operasyon Merkezi yol haritası

## Hedef

Hostinger envanteri, lisanslı Commerce mağazaları ve Control Desk'i tek bir müşteri-kapsamlı operasyon merkezinde birleştirmek.

## Aşamalar

1. HTTP, TLS/SSL ve yanıt süresi sağlık kontrolleri
2. Tekrarlanan hataları birleştiren olay yaşam döngüsü
3. E-posta, SMS ve uygulama bildirim politikaları
4. Müşterinin yalnız kendi altyapısını gördüğü portal ekranı
5. VPS CPU, RAM, disk ve kapasite sinyalleri
6. İzinli görev kataloğuyla denetimli uzaktan müdahale
7. Hosting/domain yenileme ve maliyet merkezi

## Tamamlanan ikinci adım

- Hostinger web sitesi envanteri yalnız birebir eşleşen aktif/deneme Commerce lisansına bağlanır.
- Eşleşen domain için HTTP/SSL monitörü otomatik ve tekrarsız oluşturulur.
- Eşleşmeyen veya birden fazla müşteriye ait görünen domain otomatik atanmaz; güvenli inceleme listesine alınır.
- VPS kaynakları domain üzerinden tahmin edilmez; yalnız açıkça verilen müşteri kapsamıyla içeri alınır.

## Mobil bildirim cihaz kaydı

- `/api/v1/control-desk/devices` yalnız OAuth müşteri oturumuyla çalışır.
- `/api/v1/control-desk/push-notifications` yalnız `platform_owner` rolüyle müşteri/mağaza kapsamlı gönderim yapar; destek rolü yalnız teslim kayıtlarını okuyabilir.
- Tokenlar AES-GCM kasasından yalnız gönderim anında sunucu belleğine alınır. Control Desk, müşteri paneli ve denetim yanıtları token değerini hiçbir zaman içermez.
- Expo teslim bileti cihaz bazında `mobile_push_deliveries` tablosuna yazılır; sağlayıcı reddi başarılı gönderim gibi raporlanmaz.
- Cihaz kaydı aktif/deneme lisansındaki `store_key` ile sınırlandırılır.
- Expo push tokenı düz metin saklanmaz; AES-GCM ile şifrelenir ve SHA-256 özetiyle tekilleştirilir.
- `MOBILE_PUSH_ENCRYPTION_KEY` en az 32 karakter olmalı ve yalnız runtime secret olarak tutulmalıdır.
- Müşteri API yanıtı cihaz ve izin durumunu gösterir; token, şifreli değer ve nonce hiçbir yanıta çıkmaz.
- Oturum bazlı iptal, başka bir oturumun cihaz kaydını kapatamaz.

## Değişmez kurallar

- Her monitör ve olay `customer_id` kapsamındadır.
- Yalnız aktif veya deneme Commerce lisansındaki domain izlenir.
- Gizli anahtarlar ve Hostinger tokenı istemciye gönderilmez.
- Tek kesinti tek olay olarak tutulur; art arda üç başarısızlıktan önce alarm açılmaz.
- Sistem iyileştiğinde açık olay otomatik çözülür.
- Serbest terminal komutu çalıştırılmaz; uzaktan işlemler izinli ve denetimli görevlerden oluşur.
