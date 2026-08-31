# Migration denetimi — 2026-08-31

## Kanıt ve sınırlar

- Production bağlantısı başarısız: deploy-v2.yml içindeki root@186.240.158.199 hedefinde BatchMode ve StrictHostKeyChecking açık salt-okunur SSH denemesi Permission denied döndürdü. Herhangi bir SQL production üzerinde çalıştırılmadı.
- Bu yüzden production'da uygulanmış/eksik migration listesi BELİRLENEMEDİ. Aşağıdaki yerel dosyalar eksik kabul edilmemelidir.
- Yerel servis dosyası V2 için /home/avccom/yeni/data/avci-v2.sqlite gösteriyor; canlı süreçte doğrulanmadı. Node SQLite runner geçmiş tablosu __avci_migrations(name, applied_at). D1 alternatifi de mevcut; aktif ortam teyit edilmeli.
- Commerce ayrı MySQL veritabanıdır; schema_migrations tablosu migration_name, checksum, batch, applied_at, execution_ms alanlarını taşır. Merkezi SQLite dosyaları buraya uygulanmaz.
- Commerce legacy dosyaları arşivdir, otomatik eksik migration sayılmaz. Alt klasörlerdeki eski proje kopyaları aktif migration zincirine katılmadı.
- Merkezi runner 0014_tiny_crystal.sql dosyasını superseded olarak ledger'a kaydeder, SQL'ini çalıştırmaz. Ledger varlığı her dosyanın SQL'inin yürütüldüğü anlamına gelmez.
- node --test tests/migrations.test.mjs tests/customer-portal-migration.test.mjs: 4 PASS, 0 FAIL. Yerel bellek içi test; production kopyası/staging veya canlı E2E kanıtı değildir.

## 0034_module_runtime_packages.sql

Yerelde mevcut. modules tablosuna runtime, version, package_url, package_checksum, entrypoint, manifest_json, install_status alanlarını ekler. Production durumu bilinmiyor. Hem ledger hem PRAGMA table_info(modules) doğrulanmalı. Ledger kaydı olup alanların eksik olması ya da alanlar var ama ledger kaydı olmaması ayrı drift durumlarıdır; kör tekrar çalıştırılmamalı.

## Devam sırası

1. Doğru production SSH erişimi, aktif merkezi DB hedefi ve Commerce mağaza/DB kapsamını teyit et.
2. Salt-okunur geçmiş ve şema sorgularıyla karşılaştır; Commerce checksum farklarını ayrıca raporla.
3. Production yedeğini kullanıcı alsın, bütünlük/geri yüklenebilirlik kontrolü yapılsın.
4. Ayrı staging DB üzerinde yedek kopyasından eksik migration'ları sırayla dene; lisans/modül/müşteri sözleşmesi testlerini çalıştır.
5. Sonuçlar ve riskleri sun; production apply öncesinde açık kullanıcı onayı al. Servis restart/deploy çalıştırma: V2 ExecStartPre otomatik migration runner çağırıyor.
6. Onaydan sonra uygulama ve salt-okunur schema/E2E kanıtı. MySQL DDL kısmi commit riski: otomatik rollback varsayma. Gerçek modül aktivasyonu için mağaza ve modül kapsamı ayrıca belirlenmeli.

## Yerel tam envanter (SHA-256)

### Avcı E-Ticaret | drizzle (48)

| Dosya | SHA-256 | Production |
|---|---|---|
| 0000_glorious_scorpion.sql | 48636be3565ae5df547978e5557b1efc6660ece7aa7549f1e2c06e3d83dd459d | Sorgulanamadı |
| 0001_fast_bishop.sql | 4efb664650adfa3b072b369d5da834656a30daa8d69c2a3618833bf4811e9cac | Sorgulanamadı |
| 0002_majestic_frank_castle.sql | b24ae3cecf655a75ba427b077fb2b0e46946f2c38e6ebe669dafc763112f3443 | Sorgulanamadı |
| 0003_daily_lord_tyger.sql | 6185c6000819d60bbff5a348f6ab14768b5e0b7e17af678e293caa6d6c45c424 | Sorgulanamadı |
| 0004_light_mach_iv.sql | bc3953b174c29fbf158ff8c83572500d6ebe75196046379f06814564e64785ab | Sorgulanamadı |
| 0005_glorious_switch.sql | 56ac70e641d91306588f8be7ee8e7ec9e1678d00f6cb115ba5a84a7dc93f8762 | Sorgulanamadı |
| 0006_mysterious_la_nuit.sql | 02a7c98d333a559115c5c0dbbdf30265a9bdda67e61e288048dce09338ad8246 | Sorgulanamadı |
| 0007_normal_skullbuster.sql | 559ade2a3cf089f243dec0a3ce8c34f7bd27679840692a33e6f956fa1ea40e3b | Sorgulanamadı |
| 0008_mixed_wallop.sql | 6375e78758e0199ad30fd9b07c4196f51f9010bbce4d8a80ea83bcc0784f9945 | Sorgulanamadı |
| 0009_fat_krista_starr.sql | 4ec4c55ffa765e41648252c144ca5f87acc681341556c3c2830df21afe183b2a | Sorgulanamadı |
| 0010_remarkable_spacker_dave.sql | d3dc0e0d1ecf2d9acb8d4ba702295dca100559b6031e9c96301bbc13867444cb | Sorgulanamadı |
| 0011_friendly_hammerhead.sql | 8642b2f6df69abf991831bbb6092e8ef07612c52e0fab2c670d82c5677be9606 | Sorgulanamadı |
| 0012_new_diamondback.sql | c8666900d1b229aace9214cea21a9d68f949befc445b3965d52a3eeaf41789ad | Sorgulanamadı |
| 0013_customers.sql | c301b30e53ba994ef5eeabb40833750678a67651146602f4e289c30eecda6516 | Sorgulanamadı |
| 0014_tiny_crystal.sql | a16db7da2d48aa554c9080c68dd78ee4479090b6bc8454a667082fb26761a1fe | Sorgulanamadı |
| 0015_packages.sql | bcfc1f67694f8d9786ebd00313fb51f975a1874df113d4f5fae042e3158cdd65 | Sorgulanamadı |
| 0016_modules.sql | 6f1d9174c72c36b0647764705e73820e7edb8e0f34940d2b4d88fcd8bbdec03f | Sorgulanamadı |
| 0017_software_orders.sql | f489c01e8002d2cfe5b38f57a913698a164f1e1fdf363ad96a6da95966fb7f54 | Sorgulanamadı |
| 0018_support_tickets.sql | d78667d37031c3ac15469256483b984dc0632a285c52be99f753b87552e5b481 | Sorgulanamadı |
| 0019_software_invoices.sql | 637f2c48afea64be1a6702945a994cedfae5e56695b257159ccb6d8d68f72fb2 | Sorgulanamadı |
| 0020_vitrine_signals.sql | 8e31c222c0442e0697e2b03b8af1302233cad45edbe14624dea6d74f63ec4f38 | Sorgulanamadı |
| 0021_vitrine_toasts.sql | e8f92254b13192ef497acc5e194bccfa4e55e54ecfa4979692535230cea34101 | Sorgulanamadı |
| 0022_site_settings.sql | 5027b74ce6e949c83a2b8b6c0c4f82917d840c953b9abbc0b438fd37210270e5 | Sorgulanamadı |
| 0023_site_assets.sql | 067ab90f45d1c10ce28f3fa1e65ec5ea2cffd60522af91df814c1aa8dad9c0ad | Sorgulanamadı |
| 0024_customer_domains.sql | 1982d78099369f6e04e57b93670f3809f5ab9c51e920ea60f7b32f098eb7e2d2 | Sorgulanamadı |
| 0025_ecommerce_core.sql | f4a969f31c717b91f21683dee7bc3f6946a1331471752235e60ed0c3315177e9 | Sorgulanamadı |
| 0026_legal_franklin_storm.sql | 0c52bde8b87fcea9eb360cad1fe446e8b3d3ccef3bd5ce4e2f91e95ef13782fe | Sorgulanamadı |
| 0027_romantic_sebastian_shaw.sql | 021f92ceaece04b1d250ed437698ea459d429522ad74e9a483e37203bffd7e39 | Sorgulanamadı |
| 0028_skinny_blue_shield.sql | e1646c312d7bc75a4eee7cc83199c471ada8002ddaa28fcde51a6061cfd74136 | Sorgulanamadı |
| 0029_integration_catalog_seed.sql | 27a150b59ad32e7e9d050966537e792914a823871f4cc232be3be7ea23182265 | Sorgulanamadı |
| 0030_assignment_target_domains.sql | 69959677e37755da35f0a01195e82366ed5f3072e4ce492bbb7a33f993b51827 | Sorgulanamadı |
| 0031_secure_integration_catalog.sql | 052864bc9347005e30de62e4f0cc9e7f6082ce9735fcb0c11a6630fde5dc3dfd | Sorgulanamadı |
| 0032_commerce_special_modules.sql | 487f0f291287feea340499269f206291b6f8d26e9966e88546aeb2c809acab3e | Sorgulanamadı |
| 0033_commerce_module_category.sql | ac07d5639d58ca1f83b1a1df5a587e9621c5e3e09f4a244279be6d0884cbc8f2 | Sorgulanamadı |
| 0034_module_runtime_packages.sql | 1932f554139bbe6348a5b872e1aba7e6985ea073140a02b86dce5c94fdde36e3 | Sorgulanamadı |
| 0035_commerce_license_activation_control.sql | 049b994c77ec276e7922d9ebc9d297a6d1183708206bec43a9bc453a03e6faee | Sorgulanamadı |
| 0036_commerce_license_commercial_terms.sql | 87b51ebc05df69900634e5c50653563b4d397e37810e4afd534bc98701cdb7db | Sorgulanamadı |
| 0037_package_runtime_metadata.sql | 3e7e0a52a7d3800742aacad807ebe2afd0217110017e55693fdb270d59ad6c4e | Sorgulanamadı |
| 0038_customer_portal_passwords.sql | bf3642281f75638929acb4fedbf2667ed8c3be68806ea873868f158e1fea2475 | Sorgulanamadı |
| 0039_control_desk_install_jobs.sql | 7c77f291f5da3f0412fcedf486915e6ab66247fa21fe2566c31c644f180d8243 | Sorgulanamadı |
| 0040_control_desk_oauth.sql | b9bf9dc8cea41b0a946aa22ede64f12f9106a8b06946a85d4eaadf8d24632cd5 | Sorgulanamadı |
| 0041_control_desk_agent_sessions.sql | 364f576881622d02d740e9663c55c9d85f0f4d43c3ccf21a039effc43b83b1ac | Sorgulanamadı |
| 0042_commerce_solution_blueprints.sql | 91e5f4501b973f5571897aa0ff870b72ffe3c2b9a53058a67885f65b90b341c7 | Sorgulanamadı |
| 0043_control_desk_app_releases.sql | 3a4bc03092b62a62c587d236f9aa619d17ce174c75aeec188d07d1f41c523c09 | Sorgulanamadı |
| 0044_avci_mobile_apps.sql | 7b12a6d3fa502230c2c5e89b950f2c54cc779e81c9b4ebd6c0eeb24caa83ef83 | Sorgulanamadı |
| 0045_infrastructure_operations.sql | 18336e0e10c3e30e8ab006f35d35b0fa51f027457e4281edcefb61549f0b75b2 | Sorgulanamadı |
| 0046_mobile_push_devices.sql | 2ea43d7bad7bfb023cfd5c2b1a6ae33955318f9e559cb555367f14f534f103b5 | Sorgulanamadı |
| 0047_mobile_push_deliveries.sql | 852cb70694c59e6e8742f61000e8f0359903fefd446631db286df3e2789dd10e | Sorgulanamadı |

### Avcı Commerce | storage\database\migrations (14)

| Dosya | SHA-256 | Production |
|---|---|---|
| 20260811_000001_create_schema_migrations.sql | 476865c5f12e8ca72a80d30c6876f4fe83609e7bad343510b22667f718844eae | Sorgulanamadı |
| 20260811_000002_schema_v1.sql | 582e59d56e4e01ebb21308449355e466dabc76da88995d21c44d6965d2a872fe | Sorgulanamadı |
| 20260824_000001_commerce_module_foundation.sql | eb3a3d8d8372b89fb8f7d06563d297f984c1fe4ccc81d5c9d8fbe41a3acfbd70 | Sorgulanamadı |
| 20260824_000002_tofy_interaction_events.sql | a34fe1898c03fd7fff85971436d693b01884b3ee6284666ce4e33074a3127a86 | Sorgulanamadı |
| 20260824_000003_catalog_preset_installations.sql | fe06b7751d1bd8fe34a0ee5fb07f1d2d655184fd0aa010822a7aea70bf510331 | Sorgulanamadı |
| 20260824_000004_commerce_theme_profiles.sql | 0f056e7204467156f72fff67bc97b859a866729c3ed6980da1bfb0bfcb16a231 | Sorgulanamadı |
| 20260824_000005_commerce_integration_instances.sql | 7e18a0638513ee54b563923843cba1b7531e93769803fc6b2cd21a6fcec71963 | Sorgulanamadı |
| 20260824_000006_commerce_usage_counters.sql | b75c2fee80a9c27010995aad168e07a6b6f1ca7165d7ebae16af5af63f13b162 | Sorgulanamadı |
| 20260824_000007_commerce_update_deployments.sql | 8b033fef0babbd5841bf98f855813a3a5c54a08b2d41d3a450d15e79c6706ddd | Sorgulanamadı |
| 20260824_000008_commerce_update_evidence.sql | 7ea304b6370e7465027262d59f0448c337d94821cd4520b78d7a5592b5e7a2c6 | Sorgulanamadı |
| 20260824_000009_commerce_release_runtime.sql | 622e359ff90d283b94c39e05c1aa682137691d4915f6f67e306f325b13b7431a | Sorgulanamadı |
| 20260825_000010_commerce_store_module_instances.sql | c3f099317f9979151b09c49b46a0fe62bf272385ce737fcf1d37626584430d51 | Sorgulanamadı |
| 20260825_000011_commerce_store_module_audit_logs.sql | 0d083abf37ec99c1bb310cee663c72c229f87b26b8347277d7da86039552e59a | Sorgulanamadı |
| 20260825_000012_commerce_control_plane_commands.sql | 0a945a2b85e3e189f56fccdd2cef745c03dc907336305165a1f6af094fdfd714 | Sorgulanamadı |

### Avcı Commerce | storage\database\legacy (88)

| Dosya | SHA-256 | Production |
|---|---|---|
| 001_admin_foundation.sql | 64a1911e5d5b90191a70c2f07a670c4f28b1daa4d294ff393b7c6132229017ac | Sorgulanamadı |
| 002_localization.sql | 29227a7f265ffd08eff95aefcfa934f4f36d6c24a424678c821131d1d84c0d4a | Sorgulanamadı |
| 003_localization_region_identity.sql | c984bce4838bfa22f1236f3edc420ae4d65901cf7d31306fa27ef6f36377f014 | Sorgulanamadı |
| 004_frontend_analytics.sql | f5bf901cb98c4e0f176ff5932223aa1d4296f58a2a2d598b7b22e14495b41b99 | Sorgulanamadı |
| 005_admin_notes.sql | 57832494bd3de7e79bef8c0c16a11feb537d6957cb47b1bdd773b58b65eff308 | Sorgulanamadı |
| 006_support_tickets.sql | 5e48d0f6e48d78b0595859c479f31d9806e13d11c519b27e5e4d59276f60fc89 | Sorgulanamadı |
| 007_media_files.sql | e40b22565362512d0f7cb1023a8ce9be2f42a1a8ce2ac0914cc03c0dde08fbf5 | Sorgulanamadı |
| 008_contact_messages.sql | 6cb880f6e92f14915b0c25bc48e661c3921fd1481942a1cd05481533cd5cb159 | Sorgulanamadı |
| 009_content_management.sql | a5a1114d82d23a3890fea927143cf34941f575d1b871f5a60dc645f42cbd1e30 | Sorgulanamadı |
| 010_admin_profile.sql | 1cc6f9f08a8d06c2e1fb2820eeb853e7e78182af308930b181e1948cc297c91d | Sorgulanamadı |
| 011_site_settings.sql | 1a950d9bbd9aca605df6a7567844833c37cdbd9426eb7cca2f0b079ccbc2cb7a | Sorgulanamadı |
| 012_commerce_reporting.sql | a575a147e81d0f1f1e15f5f701691ce331622838c9adbb5346280f035236433c | Sorgulanamadı |
| 013_customer_management.sql | d74aa4349f72995a235eac78edf57af74888610dcaaf6895d9e1932334e08817 | Sorgulanamadı |
| 014_catalog_products.sql | c11dd23db9a5e6f00b24f25b99972b375a36cf5f31699c2c099d20772e8a6903 | Sorgulanamadı |
| 015_catalog_categories.sql | e32e8e6a5d42b9c9cbc546de86bb6af6f97cbeef5e98944cd4776766751f1a2d | Sorgulanamadı |
| 016_catalog_brands_options.sql | 472c378a77d2da547bc47e62484edb68d9457ea7e9c1ab37c652f7b4a40ad9dd | Sorgulanamadı |
| 017_catalog_features.sql | dcac0ec124760f991d38ce9fd54db4b4d201295f2d7c77aeeab3d99ed40cdd88 | Sorgulanamadı |
| 018_catalog_variant_groups.sql | 01d6032705741851dcc088008d582eaa0c5d19a3e737d69f5cd91be3cab988cb | Sorgulanamadı |
| 019_product_reviews.sql | 6ccd1e29495d7692736297eac7cecd9d05a34e3b167a8cca302bff5ddae8a1d4 | Sorgulanamadı |
| 020_admin_notifications.sql | 4b054054b88ccf237c2a073a6324854777118f21cb0227047852ac9e31429e6d | Sorgulanamadı |
| 021_admin_notification_updates.sql | 33955388c580c3929566e90d3d1480c365dc42b50bcce74590a422b541c3bf81 | Sorgulanamadı |
| 022_order_return_management.sql | 798c6d37aec51b8216e178727f835a091a90d68861a1ed90cc32133afea56ca8 | Sorgulanamadı |
| 023_integrations_smtp.sql | d2d113b8d3834d9203f4d8503f373450400b782be9249afdc5dccfcef393e5e2 | Sorgulanamadı |
| 024_integrations_netgsm.sql | d33c8cbd3214a01c9c970d09f7f12bd1d4f002da03e9670240f39b8b0fcc9609 | Sorgulanamadı |
| 025_integrations_shipping.sql | 3b265af9ce7d8879185c4b076311829caa4188bd5edf3b1a4383a65e8a14612f | Sorgulanamadı |
| 026_integrations_sitemap.sql | 8684f11439fc46bbd0b0af3f6026b1890a4111469c4bcdf4b717d180722d4ddd | Sorgulanamadı |
| 027_integrations_bank_transfer.sql | 3a75a4c22d0bfde0f213533b0d76b4556f2b6b4fcab62d43152fb05e42158da7 | Sorgulanamadı |
| 028_integrations_product_excel.sql | ce82d78074fda00a236bc70efcfe9a4939ec25d86bd2dc318d45c75823faa89e | Sorgulanamadı |
| 030_integrations_discounts.sql | 321ad0ad584c00e0e382383bad4b674a47b47a0650e8339ee11c5fda4cca9e23 | Sorgulanamadı |
| 031_integrations_coupons.sql | 670469330491b3186689b7d694f0700362d464e171b01c32688feac64eaaa686 | Sorgulanamadı |
| 031_storefront_cart.sql | 6c419f8ac4dc8452d1d36e57fab16083a33e0152a557544d5d031824ce71076e | Sorgulanamadı |
| 032_integrations_product_feeds.sql | c32e97249e3028d80c2d89cd198ec6cff55779196065cc4e30ab36002dac23b7 | Sorgulanamadı |
| 033_integrations_bulk_price_update.sql | afb103d915197ed4cd1b1ccfcaed60591e5272d086676e4036f5f963a1a6c1b8 | Sorgulanamadı |
| 034_integrations_recaptcha.sql | c9639efb36718d7cd42ab989b5a55b4855b8cc7ea19d5fb8654c2688777918e2 | Sorgulanamadı |
| 034_invoice_pdf_delivery.sql | 11e7e081921bf1a2a58e852ed2859d46ec221d9f7dae640cc0ece516ee48e93f | Sorgulanamadı |
| 035_integrations_popup.sql | b5a4e3ab75adb72bcd2cf57479464bf2f1baff31a3db0a890cbcba79022fb1cd | Sorgulanamadı |
| 035_theme_home_featured_products.sql | d3e27c8b702c3d30072ec19e8941f197f29d0f9ad3831a619c9220eb9128b3c3 | Sorgulanamadı |
| 036_integrations_virtual_pos.sql | 01267249e9ad0c62cfab9e39337db1ccaad1a722cef39b7fae55c37ef1317157 | Sorgulanamadı |
| 036_theme_home_layout_builder.sql | 04922f5028eae5cc90731e48ab55c33f69f50ca0473015135dfdc487198ff6c6 | Sorgulanamadı |
| 038_product_trash.sql | d2d8eeb461b846f1563be91dfbbf9ebbf0446923fee171fa6fce29924ad06497 | Sorgulanamadı |
| 039_category_images.sql | e50923c5311a1c02c5330adf9ab2c6624504c84d99d76033d443e412d4b8a109 | Sorgulanamadı |
| 040_customer_contract_acceptances.sql | 8f2351ff5b162f413a6984101aebb6f4028568e3678972ce9e20e5e8e95b9a70 | Sorgulanamadı |
| 041_customer_password_resets.sql | 0d7cbb52872ca5e792b3324b87ec860f331d7277a2fd423f5584bcf15567dcde | Sorgulanamadı |
| 042_integrations_basit_kargo.sql | 952c7a2d8286a3f1441a8d022e7e392c29eb8c35c16448e566facb13d3fce3cd | Sorgulanamadı |
| 043_order_notification_collation.sql | eb59c8a917aaca5018df9dbb9d7d9a80cd51b069b18bfcebfd3b426508c11c03 | Sorgulanamadı |
| 044_support_notification_collation.sql | 046df9324206c8b43813abf4052ced7bf83237a5336103c3dab2603e846e0525 | Sorgulanamadı |
| 045_membership_contract.sql | 8468ead310288a7a32b5ac5a65ab51c808e578f75202dddccdcfcf0c76206bd1 | Sorgulanamadı |
| 047_notification_delivery.sql | fc84962f6772afee15b83b26a54807d33960102c03f84771f0a5e2c0900bfcc2 | Sorgulanamadı |
| 048_product_badges.sql | 6413af314656a5743542f80757d9334fc24e0a21ec909de8e0c1e73d9c7f52ff | Sorgulanamadı |
| 049_integrations_product_badge_campaigns.sql | 892fdb4f207b0b20b040b24defd086863c51a64665888f3550d9d04c66c5fd15 | Sorgulanamadı |
| 050_product_badge_manual_policy.sql | 759da12335607acf67b3775e2cdcb3e3ddad3a92367bc10eb6f32180501a28b9 | Sorgulanamadı |
| 051_product_badge_status.sql | 627c39ce54cc073658641f5d0608ed1055cb1d20629cdc9260925e238c18d906 | Sorgulanamadı |
| 052_catalog_products_slug.sql | cd510661bb11d47c22cfe66ce0ee20208dfc1c6f7faac98114b955ded82c8aba | Sorgulanamadı |
| 052_standard_color_size_options.sql | 73550fd51e23ea907ee1ee24c859395ef2b54e2ec50959e8845a75c6801144a5 | Sorgulanamadı |
| 053_restore_open_option_management.sql | cf79d02cae41560e91ba0ab05a9ad214edf1bea8e5d735224bc56ee172394fb6 | Sorgulanamadı |
| 054_option_inventory.sql | 6712f68aa746bb4558d9600aa60e084c6823139af597a22e0009919ea0be741b | Sorgulanamadı |
| 055_customer_birthday_emails.sql | 288898e2f2e7f0a4d1f18c3fa9740dcbe4cdf80e3372d198366526f98350a163 | Sorgulanamadı |
| 056_theme_sliders.sql | b68d91a7e7ac67618ea5fc96fda44acc1271ed89b2dda0dd3c261fda2d70c7fe | Sorgulanamadı |
| 057_content_page_description.sql | 16cd3796725693b0c1553461a4e1dfb570cda1acad6b19bb00c855da036823d5 | Sorgulanamadı |
| 058_theme_footer_benefits.sql | b019c646c7ed527933c3584f19f69d3e832f40f8ea4bb058307a10e86eea1131 | Sorgulanamadı |
| 059_return_policy_contract.sql | 8209f8d2483cf781cc345c81985203fab07064bed2de734623991c6fa2d9fe83 | Sorgulanamadı |
| 060_theme_footer_menus.sql | db47a462dc3fc463182436282f8143ae2d546ede7541560e9a04f808e16c8fb8 | Sorgulanamadı |
| 061_return_policy_system_lock.sql | a56a478f5543ee23d9601b7d9ed808ba972cdc2cf2377a68c19a7d471c801c4d | Sorgulanamadı |
| 062_product_short_description.sql | 72541526384dd64d12cf887d04aed9fae4534c83b9a72479f5e014ed052d7ac1 | Sorgulanamadı |
| 063_product_guest_signup_prompt.sql | b9a04abd898a1e41cb9aca8a2d2b4d64322510a398397174039ef215a416e144 | Sorgulanamadı |
| 064_checkout_lifecycle.sql | 707986f986cf7fe5f13883364c13d839d9369cca9f31d814f3dc898be22f3e31 | Sorgulanamadı |
| 065_checkout_notification_collation.sql | 35ba2db7113ad9f45399d9f563cb0679cb5fbddeb0066650748af57f43f80640 | Sorgulanamadı |
| 066_payment_aware_order_preparation.sql | deb8917d773c282a97c1fdd0e5fee0096dcbfc1593f2b5993a60980bfc20479f | Sorgulanamadı |
| 067_card_payment_intents.sql | 7863e40a74983ddf08abcf7b4532757937dd592721602b1f72671edf204a3512 | Sorgulanamadı |
| 068_checkout_trigger_collations.sql | f63fdfe9264acb808a2dbafed67fbc53426479be431fe8de3764e8c9819484ef | Sorgulanamadı |
| 069_remove_duplicate_payment_status_notification.sql | 43003ee851c1f4e1aab11f3abb219633e02e617ab5ea57241bd85dc64a0f468c | Sorgulanamadı |
| 070_checkout_insert_trigger_collations.sql | a750a1ba9eb5ea705b8e623d70bd5b12f1fa908ba07dc15635091994359cb7c6 | Sorgulanamadı |
| 071_remove_premature_payment_notification.sql | aea8b1bc5c7029c69943a86c9d2c7ed3a9bd6bfe49701f5595f4b68ab67ceb23 | Sorgulanamadı |
| 072_simplify_admin_order_notifications.sql | a76c3b458e01a4ccca56bd0dee8032bb94aeeddad737471120c78197b0b28311 | Sorgulanamadı |
| 073_customer_notification_events.sql | 5df98f583b5032a7e8c2a092be9855950e0eeb225571343a6fa05b071f9ecc19 | Sorgulanamadı |
| 074_notification_trigger_collations.sql | 9f55d01309e02244530b33535734b36b54cf4ae98de78b28ef30154b54de547c | Sorgulanamadı |
| 075_order_number_sequence.sql | 06dbd63648db4bd9e360024987573a4a7c32ffd1915f7fef4550f11d5060ac6c | Sorgulanamadı |
| 076_backfill_order_item_option_prices.sql | d34202ffc80987894775097caf426d529699d5b7561a6452c3ebfc051e6c384b | Sorgulanamadı |
| 077_notification_delivery_reliability.sql | 8520d532d50c79a8e513de937691069876cdde9a9fa47d519dbe685f596ac217 | Sorgulanamadı |
| 077_theme_header_menus.sql | 23e8163a71c9ef3a833a00400931ac1842f4e4e0b4d20887c5dfc906823525d9 | Sorgulanamadı |
| 078_order_status_history_reliability.sql | e641eddf37d68b41090b239b6e90de0fb04685a4936910216d392c3fd84b0e53 | Sorgulanamadı |
| 079_bank_transfer_notification_workflow.sql | 5e52a60bf1acb60c27024f894368f91b9271b90f948770d2266cc886c523c935 | Sorgulanamadı |
| 080_theme_home_modules.sql | 4dcb33c4652adee959597b7d9778128e634b57e32cdc58c5234848da5c2795ff | Sorgulanamadı |
| 081_product_status_active_passive.sql | 80335a7d65022ff382f9e18bc29dfbfa7fdc2f5ea94cdf0b8ec5938b0870b770 | Sorgulanamadı |
| 081_theme_home_product_cards_v2.sql | b184ebe4dd4334d4cd13d3889c757560465d3cf2cae341ead1c6a456197a1f82 | Sorgulanamadı |
| 082_blog_short_description.sql | 9ffcb31a11b9aa1ef9b4fb3967b6cae7cf60d32be2e21cabea989e7955df6de9 | Sorgulanamadı |
| 082_integrations_birfatura.sql | d4206fe363c116252abc483877dc3c2897c524d89033fc76efe537dfdb8b0979 | Sorgulanamadı |
| 083_integrations_birfatura.sql | d4206fe363c116252abc483877dc3c2897c524d89033fc76efe537dfdb8b0979 | Sorgulanamadı |

