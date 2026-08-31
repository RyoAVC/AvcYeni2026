ALTER TABLE packages ADD COLUMN sales_type TEXT NOT NULL DEFAULT 'teklif' CHECK (sales_type IN ('otomatik', 'teklif'));
ALTER TABLE packages ADD COLUMN price_amount_kurus INTEGER NOT NULL DEFAULT 0 CHECK (typeof(price_amount_kurus) = 'integer' AND price_amount_kurus BETWEEN 0 AND 1000000000);
ALTER TABLE packages ADD COLUMN price_includes_vat INTEGER NOT NULL DEFAULT 1 CHECK (price_includes_vat IN (0,1));
ALTER TABLE packages ADD COLUMN license_duration_days INTEGER NOT NULL DEFAULT 0 CHECK (typeof(license_duration_days) = 'integer' AND license_duration_days BETWEEN 0 AND 36500);
-- Temporary display prices from package-scope-details.ts, not runtime priceNote parsing.
-- Duration 0 deliberately requires the administrator to select the commercial term.
UPDATE packages SET sales_type = 'otomatik', price_amount_kurus = CASE slug WHEN 'start' THEN 4999900 WHEN 'scale' THEN 7499900 END WHERE slug IN ('start','scale');
