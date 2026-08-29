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

## Değişmez kurallar

- Her monitör ve olay `customer_id` kapsamındadır.
- Yalnız aktif veya deneme Commerce lisansındaki domain izlenir.
- Gizli anahtarlar ve Hostinger tokenı istemciye gönderilmez.
- Tek kesinti tek olay olarak tutulur; art arda üç başarısızlıktan önce alarm açılmaz.
- Sistem iyileştiğinde açık olay otomatik çözülür.
- Serbest terminal komutu çalıştırılmaz; uzaktan işlemler izinli ve denetimli görevlerden oluşur.
