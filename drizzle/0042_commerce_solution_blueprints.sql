CREATE TABLE IF NOT EXISTS commerce_solution_blueprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blueprint_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  technology_json TEXT NOT NULL DEFAULT '[]',
  theme_key TEXT NOT NULL DEFAULT '',
  module_keys_json TEXT NOT NULL DEFAULT '[]',
  current_version TEXT NOT NULL DEFAULT '1.0.0',
  minimum_commerce_version TEXT NOT NULL DEFAULT '1.0.0',
  release_channel TEXT NOT NULL DEFAULT 'stable',
  artifact_manifest_url TEXT NOT NULL DEFAULT '',
  preview_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_commerce_solution_blueprints_status_sector ON commerce_solution_blueprints(status, sector);

CREATE TABLE IF NOT EXISTS customer_solution_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  blueprint_id INTEGER NOT NULL,
  license_id INTEGER NOT NULL,
  store_key TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  assigned_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  note TEXT NOT NULL DEFAULT '',
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activated_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blueprint_id, installation_id)
);
CREATE INDEX IF NOT EXISTS idx_customer_solution_assignment_customer ON customer_solution_assignments(customer_id, status);

INSERT OR IGNORE INTO commerce_solution_blueprints
  (blueprint_key, name, sector, summary, technology_json, theme_key, module_keys_json, current_version, minimum_commerce_version, release_channel, preview_url, status)
VALUES
  ('basbitir-print-commerce', 'BasBitir Matbaa Commerce', 'Matbaa ve Baskı', 'BasBitir için geliştirilen ofset tema, baskı yapılandırıcısı, tasarım stüdyosu ve üretim akışını birlikte kurar.', '["PHP 8.2","Avcı Commerce","Vanilla JS"]', 'basbitir-offset', '["print-commerce","design-studio","print-production-tracking"]', '1.0.0', '1.0.0', 'pilot', 'https://basbitir.com', 'active'),
  ('fashion-commerce-starter', 'Giyim Commerce Başlangıç', 'Giyim ve Moda', 'Beden, renk, koleksiyon ve varyant matrisi hazır gelen Avcı Commerce sektör profilidir.', '["PHP 8.2","Avcı Commerce"]', 'fashion-studio', '["catalog","variant-matrix","campaigns"]', '1.0.0', '1.0.0', 'pilot', '', 'draft');
