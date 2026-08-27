-- BasBitir pilotundan ürünleştirilen ortak modülleri yönetimde ayrı ve anlaşılır grupta göster.
UPDATE `modules`
SET `category` = 'commerce', `updated_at` = CURRENT_TIMESTAMP
WHERE `slug` IN (
  'print-commerce',
  'design-studio',
  'print-preview-3d',
  'print-approval',
  'growth-commerce',
  'customer-workspace',
  'community',
  'pro-page-builder',
  'whatsapp-support'
);
