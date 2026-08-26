UPDATE `integrations` SET `config` = '{}';

UPDATE `integrations`
SET `status` = 'active'
WHERE `provider_key` IN (
  'paytr', 'iyzico', 'trendyol', 'hepsiburada', 'yurtici-kargo',
  'aras-kargo', 'parasut', 'logo-isbasi', 'netgsm', 'iletimerkezi'
);
