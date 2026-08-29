# Avcı E-Ticaret domain geçişi

## Mevcut sözleşme

- Aktif geçici kontrol düzlemi: `https://yeni.avcieticaret.com/v2`
- Gelecekteki ana domain: `https://avcieticaret.com`
- Ana domain durumu: bakım modu
- Otomatik domain geçişi: kapalı

Uygulamalar `AVCI_DOMAIN_STAGE=temporary` kaldığı sürece ana domaine kendiliğinden geçmez.

## Canlıya geçiş onay listesi

1. Ana domainde TLS, reverse proxy, OAuth callback ve `/api/v1/control-desk/discovery` doğrulanır.
2. Lisans, kurulum ajanı, release indirme ve müşteri kapsamı testleri tamamlanır.
3. Masaüstü uygulaması pilot kanalında ana domainle test edilir.
4. Bakım modu kaldırılır ve yetkili yayın onayı alınır.
5. Sunucu ortamında `AVCI_DOMAIN_STAGE=canonical` ayarlanıp servis yeniden başlatılır.
6. Geçici domain en az bir sürüm boyunca uyumluluk yönlendirmesi olarak korunur.

DNS, yönlendirme veya ortam değişikliği bu depo tarafından otomatik yapılmaz.
