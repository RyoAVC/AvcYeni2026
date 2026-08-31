import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isLocalAdminBypassEnabled } from "./local-admin-identity.mjs";
import { isCustomerPortalPreviewEnabled } from "./customer-portal-preview.mjs";

const SCHEMA_GEN = 39;
let appliedGen = 0;
let pending = null;

function splitSqlStatements(sql) {
  return sql
    .replaceAll("--> statement-breakpoint", ";")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function tableExists(db, name) {
  const row = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").bind(name).first();
  return Boolean(row);
}

async function seedDemoLeads(db) {
  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM leads").first();
  if (Number(countRow?.total ?? 0) > 0) return;

  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO leads (
      name, email, phone, phone_normalized, company, interest, message, status, source,
      utm_source, utm_medium, utm_campaign, referrer_host, landing_path, request_key,
      consent_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', '', '', ?, ?, ?, ?, ?)
  `).bind(
    "Demo Başvuru",
    "demo.basvuru@example.com",
    "+90 555 000 00 01",
    "905550000001",
    "Örnek Peynir Atölyesi",
    "E-Ticaret entegrasyonları",
    "Yerel test kaydı. Gerçek müşteri verisi değildir.",
    "new",
    "direct",
    "/entegrasyonlar",
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    now,
    now,
    now,
  ).run();

  await db.prepare(`
    INSERT INTO leads (
      name, email, phone, phone_normalized, company, interest, message, status, source,
      utm_source, utm_medium, utm_campaign, referrer_host, landing_path, request_key,
      consent_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', '', '', ?, ?, ?, ?, ?)
  `).bind(
    "Demo Mağaza Talebi",
    "demo.magaza@example.com",
    "+90 555 000 00 02",
    "905550000002",
    "Örnek Gıda Marketi",
    "E-Ticaret altyapısı",
    "Yerel test kaydı. Gerçek müşteri verisi değildir.",
    "contacted",
    "direct",
    "/eticaret-altyapisi",
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    now,
    now,
    now,
  ).run();
}

async function ensureSiteVisitsTable(db) {
  if (await tableExists(db, "site_visits")) return;

  await db.prepare(`
    CREATE TABLE site_visits (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      day text NOT NULL,
      path text NOT NULL,
      referrer_host text DEFAULT '' NOT NULL,
      visitor_key text NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX idx_site_visits_day ON site_visits (day)").run();
  await db.prepare("CREATE INDEX idx_site_visits_day_path ON site_visits (day, path)").run();
  await db.prepare("CREATE INDEX idx_site_visits_day_visitor ON site_visits (day, visitor_key)").run();
}

async function ensureAdminLoginAttemptsTable(db) {
  if (await tableExists(db, "admin_login_attempts")) return;
  await db.prepare(`
    CREATE TABLE admin_login_attempts (
      attempt_key text PRIMARY KEY NOT NULL,
      fail_count integer DEFAULT 0 NOT NULL,
      window_start text NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
}

async function ensureCustomersTable(db) {
  if (await tableExists(db, "customers")) return;
  await db.prepare(`
    CREATE TABLE customers (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      phone_normalized text DEFAULT '' NOT NULL,
      company text DEFAULT '' NOT NULL,
      city text DEFAULT '' NOT NULL,
      interest text DEFAULT '' NOT NULL,
      note text DEFAULT '' NOT NULL,
      domain_name text DEFAULT '' NOT NULL,
      domain_expires_at text DEFAULT '' NOT NULL,
      hosting_expires_at text DEFAULT '' NOT NULL,
      status text DEFAULT 'active' NOT NULL,
      created_by_email text DEFAULT '' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
  await db.prepare("CREATE UNIQUE INDEX idx_customers_email ON customers (email)").run();
  await db.prepare("CREATE INDEX idx_customers_status_created_at ON customers (status, created_at)").run();
  await db.prepare("CREATE INDEX idx_customers_phone_normalized ON customers (phone_normalized)").run();
}

async function addColumnIfMissing(db, statement) {
  try {
    await db.prepare(statement).run();
  } catch (cause) {
    const message = String(cause?.message || cause);
    if (!/duplicate column name/i.test(message)) throw cause;
  }
}

async function ensureCustomerDomainColumns(db) {
  if (!(await tableExists(db, "customers"))) return;
  await addColumnIfMissing(db, "ALTER TABLE customers ADD COLUMN domain_name text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE customers ADD COLUMN domain_expires_at text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE customers ADD COLUMN hosting_expires_at text DEFAULT '' NOT NULL");
}

async function ensurePackagesTable(db) {
  if (!(await tableExists(db, "packages"))) {
    await db.prepare(`
      CREATE TABLE packages (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        family text DEFAULT 'eticaret' NOT NULL,
        summary text DEFAULT '' NOT NULL,
        features text DEFAULT '' NOT NULL,
        price_note text DEFAULT '' NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'draft' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX idx_packages_slug ON packages (slug)").run();
    await db.prepare("CREATE INDEX idx_packages_status_sort ON packages (status, sort_order)").run();
  }

  // Older installations contain the commercial package catalogue but predate
  // the deployable runtime metadata now represented by the shared schema.
  // Drizzle selects every declared column, so upgrade these databases before
  // any package list/read operation without replacing existing catalogue data.
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN runtime text DEFAULT 'node' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN version text DEFAULT '1.0.0' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN package_url text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN package_checksum text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN entrypoint text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN manifest_json text DEFAULT '{}' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE packages ADD COLUMN install_status text DEFAULT 'not_installed' NOT NULL");

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM packages").first();
  if (Number(countRow?.total ?? 0) > 0) return;

  const now = new Date().toISOString();
  const seeds = [
    {
      name: "Start",
      slug: "start",
      family: "eticaret",
      summary: "Kendi web mağazasıyla kontrollü başlangıç. Katalog, ödeme ve temel pazaryeri.",
      features: "Sınırsız ürün ve kategori\nHavale / EFT ve sanal POS\nStandart pazaryeri bağlantıları\n7/24 destek ve eğitim",
      priceNote: "Kesin tutar teklifle belirlenir. Sitedeki rakamlar örnek banddır.",
      sortOrder: 10,
    },
    {
      name: "Scale",
      slug: "scale",
      family: "eticaret",
      summary: "Kanal ve operasyonu büyüyen markalar için genişletilmiş e-ticaret çerçevesi.",
      features: "Start kapsamının üst seti\nToplu ürün / Excel güncelleme\nGenişletilmiş pazaryeri ve kargo\nB2B bayi satışı seçenekleri",
      priceNote: "Kesin tutar teklifle belirlenir. Sitedeki rakamlar örnek banddır.",
      sortOrder: 20,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      family: "ozel",
      summary: "Yüksek hacim, çoklu kanal ve kuruma özel yazılım ihtiyacı.",
      features: "Scale kapsamının üst seti\nÖzel entegrasyon ve süreç\nDaha geniş trafik / e-posta kapasitesi\nKuruma özel teslim planı",
      priceNote: "Kesin tutar teklifle belirlenir. Sitedeki rakamlar örnek banddır.",
      sortOrder: 30,
    },
  ];

  for (const seed of seeds) {
    await db.prepare(`
      INSERT INTO packages (name, slug, family, summary, features, price_note, sort_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'live', ?, ?)
    `).bind(
      seed.name,
      seed.slug,
      seed.family,
      seed.summary,
      seed.features,
      seed.priceNote,
      seed.sortOrder,
      now,
      now,
    ).run();
  }
}

async function ensureModulesTable(db) {
  if (!(await tableExists(db, "modules"))) {
    await db.prepare(`
      CREATE TABLE modules (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        category text DEFAULT 'pazaryeri' NOT NULL,
        summary text DEFAULT '' NOT NULL,
        features text DEFAULT '' NOT NULL,
        price_note text DEFAULT '' NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'draft' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX idx_modules_slug ON modules (slug)").run();
    await db.prepare("CREATE INDEX idx_modules_status_sort ON modules (status, sort_order)").run();
  }

  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN runtime text DEFAULT 'node' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN version text DEFAULT '1.0.0' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN package_url text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN package_checksum text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN entrypoint text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN manifest_json text DEFAULT '{}' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE modules ADD COLUMN install_status text DEFAULT 'not_installed' NOT NULL");

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM modules").first();
  if (Number(countRow?.total ?? 0) > 0) return;

  const now = new Date().toISOString();
  const seeds = [
    {
      name: "Trendyol",
      slug: "trendyol",
      category: "pazaryeri",
      summary: "Ürün, stok ve sipariş senkronu için satılan pazaryeri eklentisi.",
      features: "Katalog ve stok eşitleme\nSipariş çekme\nİade / iptal bildirimi",
      priceNote: "Lisans ve kurulum teklifle yazılır. Hazır bağlantı garantisi değildir.",
      sortOrder: 10,
    },
    {
      name: "PayTR",
      slug: "paytr",
      category: "odeme",
      summary: "Kartlı tahsilat için satılan ödeme eklentisi.",
      features: "Sanal POS tahsilatı\nTaksit seçenekleri\nİade akışı",
      priceNote: "Lisans ve kurulum teklifle yazılır. Banka / sağlayıcı onayı ayrıdır.",
      sortOrder: 20,
    },
    {
      name: "Yurtiçi Kargo",
      slug: "yurtici-kargo",
      category: "kargo",
      summary: "Barkod ve takip için satılan kargo eklentisi.",
      features: "Gönderi oluşturma\nBarkod / etiket\nTakip numarası",
      priceNote: "Lisans ve kurulum teklifle yazılır. Kargo sözleşmesi müşteriye aittir.",
      sortOrder: 30,
    },
    {
      name: "iyzico",
      slug: "iyzico",
      category: "odeme",
      summary: "Alternatif kartlı tahsilat eklentisi.",
      features: "Sanal POS tahsilatı\nÖdeme formu\nİade akışı",
      priceNote: "Lisans ve kurulum teklifle yazılır. Sağlayıcı onayı ayrıdır.",
      sortOrder: 40,
    },
  ];

  for (const seed of seeds) {
    await db.prepare(`
      INSERT INTO modules (name, slug, category, summary, features, price_note, sort_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'live', ?, ?)
    `).bind(
      seed.name,
      seed.slug,
      seed.category,
      seed.summary,
      seed.features,
      seed.priceNote,
      seed.sortOrder,
      now,
      now,
    ).run();
  }
}

async function ensureSoftwareOrdersTable(db) {
  if (await tableExists(db, "software_orders")) return;
  await db.prepare(`
    CREATE TABLE software_orders (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      customer_id integer NOT NULL,
      kind text NOT NULL,
      package_id integer,
      module_id integer,
      status text DEFAULT 'draft' NOT NULL,
      price_note text DEFAULT '' NOT NULL,
      note text DEFAULT '' NOT NULL,
      created_by_email text DEFAULT '' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX idx_software_orders_customer ON software_orders (customer_id, created_at)").run();
  await db.prepare("CREATE INDEX idx_software_orders_status ON software_orders (status, created_at)").run();
}

async function ensureSupportTicketsTable(db) {
  if (await tableExists(db, "support_tickets")) return;
  await db.prepare(`
    CREATE TABLE support_tickets (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      customer_id integer NOT NULL,
      topic text DEFAULT 'diger' NOT NULL,
      subject text NOT NULL,
      message text DEFAULT '' NOT NULL,
      note text DEFAULT '' NOT NULL,
      status text DEFAULT 'open' NOT NULL,
      created_by_email text DEFAULT '' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX idx_support_tickets_customer ON support_tickets (customer_id, created_at)").run();
  await db.prepare("CREATE INDEX idx_support_tickets_status ON support_tickets (status, created_at)").run();
}

async function ensureSoftwareInvoicesTable(db) {
  if (await tableExists(db, "software_invoices")) return;
  await db.prepare(`
    CREATE TABLE software_invoices (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      customer_id integer NOT NULL,
      order_id integer,
      title text NOT NULL,
      amount_note text DEFAULT '' NOT NULL,
      status text DEFAULT 'draft' NOT NULL,
      note text DEFAULT '' NOT NULL,
      created_by_email text DEFAULT '' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX idx_software_invoices_customer ON software_invoices (customer_id, created_at)").run();
  await db.prepare("CREATE INDEX idx_software_invoices_status ON software_invoices (status, created_at)").run();
}

async function ensureVitrineSignalsTable(db) {
  if (!(await tableExists(db, "vitrine_signals"))) {
    await db.prepare(`
      CREATE TABLE vitrine_signals (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug text NOT NULL,
        label text NOT NULL,
        value text NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'live' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX idx_vitrine_signals_slug ON vitrine_signals (slug)").run();
    await db.prepare("CREATE INDEX idx_vitrine_signals_status_sort ON vitrine_signals (status, sort_order)").run();
  }

  const now = new Date().toISOString();
  const seeds = [
    { slug: "cevrimici", label: "Müşteri Çevrimiçi", value: "48", sortOrder: 10 },
    { slug: "destekte", label: "Destekte", value: "6", sortOrder: 20 },
    { slug: "yeni-kayit", label: "Yeni kayıt müşteri", value: "12", sortOrder: 30 },
    { slug: "canli-site", label: "Müşteri sitesi", value: "canlıda", sortOrder: 40 },
    { slug: "bugun-siparis", label: "Bugün sipariş", value: "27", sortOrder: 50 },
    { slug: "aktif-magaza", label: "Aktif mağaza", value: "18", sortOrder: 60 },
  ];

  for (const seed of seeds) {
    const existing = await db.prepare("SELECT id FROM vitrine_signals WHERE slug = ?").bind(seed.slug).first();
    if (existing) continue;
    await db.prepare(`
      INSERT INTO vitrine_signals (slug, label, value, sort_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'live', ?, ?)
    `).bind(seed.slug, seed.label, seed.value, seed.sortOrder, now, now).run();
  }
}

async function ensureVitrineToastsTable(db) {
  if (!(await tableExists(db, "vitrine_toasts"))) {
    await db.prepare(`
      CREATE TABLE vitrine_toasts (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug text NOT NULL,
        title text NOT NULL,
        text text NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'live' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX idx_vitrine_toasts_slug ON vitrine_toasts (slug)").run();
    await db.prepare("CREATE INDEX idx_vitrine_toasts_status_sort ON vitrine_toasts (status, sort_order)").run();
  }

  const now = new Date().toISOString();
  const seeds = [
    { slug: "yeni-siparis", title: "Yeni sipariş", text: "Müşteri mağazasında 1.240 ₺ tahsilat", sortOrder: 10 },
    { slug: "site-canlida", title: "Site canlıda", text: "Yeni vitrin yayına alındı", sortOrder: 20 },
    { slug: "pazaryeri", title: "Pazaryeri", text: "Trendyol stok eşitlendi", sortOrder: 30 },
    { slug: "yeni-kayit", title: "Yeni kayıt", text: "Bir işletme demo sonrası kayıt oldu", sortOrder: 40 },
    { slug: "odeme-gecisi", title: "Ödeme geçti", text: "PayTR ile sipariş kapandı", sortOrder: 50 },
    { slug: "destek", title: "Destek", text: "Modül talebi yanıtlandı", sortOrder: 60 },
    { slug: "kargo", title: "Kargo", text: "Yurtiçi Kargo barkodu oluştu", sortOrder: 70 },
    { slug: "b2b-siparis", title: "B2B sipariş", text: "Bayi 14 kalem toplu sipariş geçti", sortOrder: 80 },
    { slug: "e-ihracat", title: "E-ihracat", text: "Almanya’ya yeni sipariş düştü", sortOrder: 90 },
    { slug: "magaza-pos", title: "Mağaza POS", text: "Kasada 890 ₺ satış kapandı", sortOrder: 100 },
    { slug: "whatsapp", title: "WhatsApp", text: "Yazılımdan sipariş mesajı alındı", sortOrder: 110 },
    { slug: "kampanya", title: "Kampanya", text: "Kupon kullanıldı, sepet kapandı", sortOrder: 120 },
    { slug: "stok-uyari", title: "Stok uyarısı", text: "Kritik stok eşiği bildirildi", sortOrder: 130 },
    { slug: "iyzico", title: "3D Secure", text: "iyzico ile ödeme doğrulandı", sortOrder: 140 },
    { slug: "toplu-urun", title: "Toplu ürün", text: "Excel ile 120 ürün yüklendi", sortOrder: 150 },
  ];

  for (const seed of seeds) {
    const existing = await db.prepare("SELECT id FROM vitrine_toasts WHERE slug = ?").bind(seed.slug).first();
    if (existing) continue;
    await db.prepare(`
      INSERT INTO vitrine_toasts (slug, title, text, sort_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'live', ?, ?)
    `).bind(seed.slug, seed.title, seed.text, seed.sortOrder, now, now).run();
  }
}

async function ensureSiteSettingsTable(db) {
  if (!(await tableExists(db, "site_settings"))) {
    await db.prepare(`
      CREATE TABLE site_settings (
        key text PRIMARY KEY NOT NULL,
        value text DEFAULT '' NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
  }

  const now = new Date().toISOString();
  const seeds = [
    ["contactEmail", "info@avcieticaret.com"],
    ["contactPhone", "0850 308 68 37"],
    ["supportEmail", "info@avcieticaret.com"],
    ["customerLoginEnabled", "on"],
    ["demoPortalEnabled", "on"],
    ["supportEnabled", "on"],
    ["portalReady", "on"],
    ["brandTitle", "AVCI"],
    ["brandSubtitle", "E-TİCARET"],
    ["showWordmark", "on"],
    ["logoEnabled", "on"],
    ["logoScale", "medium"],
    ["footerTagline", "İşletmeler için yazılım, e-ticaret ve yapay zekâ çözümleri."],
    ["heroCtaPrimary", "Ücretsiz demo alın"],
    ["heroCtaSecondary", "Yazılımları keşfedin"],
    ["showLiveStrip", "on"],
    ["showTrustStrip", "on"],
    ["tofyPopupEnabled", "on"],
    ["tofyPopupTitle", "Hey, bir dakika"],
    ["tofyPopupText", "Gitmeden bakın: demo, teklif veya güncel kampanya için Tofy ve ekip yardımcı olur."],
    ["tofyPopupButton", "Daha fazla bilgi"],
    ["tofyPopupHref", "/teklif"],
  ];

  for (const [key, value] of seeds) {
    const existing = await db.prepare("SELECT key FROM site_settings WHERE key = ?").bind(key).first();
    if (existing) continue;
    await db.prepare("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)").bind(key, value, now).run();
  }
}

async function ensureSiteAssetsTable(db) {
  if (await tableExists(db, "site_assets")) return;
  await db.prepare(`
    CREATE TABLE site_assets (
      kind text PRIMARY KEY NOT NULL,
      mime text NOT NULL,
      data text NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `).run();
}

async function ensureCategoriesTable(db) {
  if (!await tableExists(db, "categories")) {
    await db.prepare(`
      CREATE TABLE categories (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        parent_id integer,
        description text DEFAULT '' NOT NULL,
        image_url text DEFAULT '' NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        seo_title text DEFAULT '' NOT NULL,
        seo_description text DEFAULT '' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug)").run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM categories").first();
  if (Number(countRow?.total ?? 0) === 0) {
    const defaultCats = [
      ["Elektronik & Akıllı Cihazlar", "elektronik", "Akıllı telefon, bilgisayar ve çevre birimleri"],
      ["Giyim & Moda", "giyim-moda", "Kadın, erkek ve çocuk giyim koleksiyonları"],
      ["Gıda & Gurme Lezzetler", "gida-gurme", "Doğal peynir, zeytinyağı ve organik ürünler"],
      ["Ev & Yaşam", "ev-yasam", "Mobilya, aydınlatma ve ev dekorasyonu"],
    ];
    for (let i = 0; i < defaultCats.length; i++) {
      const [name, slug, desc] = defaultCats[i];
      await db.prepare(`
        INSERT INTO categories (name, slug, description, sort_order, status)
        VALUES (?, ?, ?, ?, 'active')
      `).bind(name, slug, desc, i + 1).run();
    }
  }
}

async function ensureBrandsTable(db) {
  if (!await tableExists(db, "brands")) {
    await db.prepare(`
      CREATE TABLE brands (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        logo_url text DEFAULT '' NOT NULL,
        website text DEFAULT '' NOT NULL,
        description text DEFAULT '' NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_slug ON brands (slug)").run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM brands").first();
  if (Number(countRow?.total ?? 0) === 0) {
    const defaultBrands = [
      ["Avcı Teknoloji", "avci-tech", "https://avcieticaret.com", "Yerli ve kurumsal yazılım altyapıları"],
      ["Atölye Gurme", "atolye-gurme", "", "Geleneksel ve organik lezzet üreticisi"],
      ["Vortex Labs", "vortex-labs", "", "İleri seviye donanım ve akıllı cihazlar"],
      ["Luna Studio", "luna-studio", "", "Minimalist ev ve yaşam tasarımları"],
    ];
    for (let i = 0; i < defaultBrands.length; i++) {
      const [name, slug, web, desc] = defaultBrands[i];
      await db.prepare(`
        INSERT INTO brands (name, slug, website, description, sort_order, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `).bind(name, slug, web, desc, i + 1).run();
    }
  }
}

async function ensureProductsTable(db) {
  if (!await tableExists(db, "products")) {
    await db.prepare(`
      CREATE TABLE products (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        sku text DEFAULT '' NOT NULL,
        barcode text DEFAULT '' NOT NULL,
        category_id integer,
        brand_id integer,
        short_description text DEFAULT '' NOT NULL,
        description text DEFAULT '' NOT NULL,
        price integer DEFAULT 0 NOT NULL,
        discounted_price integer,
        cost_price integer DEFAULT 0 NOT NULL,
        vat_rate integer DEFAULT 20 NOT NULL,
        stock integer DEFAULT 0 NOT NULL,
        critical_stock integer DEFAULT 5 NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        is_featured integer DEFAULT 0 NOT NULL,
        images text DEFAULT '[]' NOT NULL,
        variants text DEFAULT '[]' NOT NULL,
        seo_title text DEFAULT '' NOT NULL,
        seo_description text DEFAULT '' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug)").run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM products").first();
  if (Number(countRow?.total ?? 0) === 0) {
    const demoProducts = [
      {
        name: "Avcı Pro E-Ticaret Lisans Paketi",
        slug: "avci-pro-e-ticaret-lisansi",
        sku: "AVC-PRO-001",
        barcode: "868000100101",
        price: 24900,
        discountedPrice: 19900,
        costPrice: 8000,
        stock: 50,
        criticalStock: 5,
        isFeatured: 1,
        categoryId: 1,
        brandId: 1,
        shortDescription: "Sınırsız ürün, çoklu dil, pazaryeri ve SEO modülü dahil kurumsal altyapı.",
        description: "B2C ve B2B odaklı, yüksek performanslı Cloudflare Worker destekli e-ticaret yönetim platformu lisansı.",
      },
      {
        name: "Akıllı B2B Bayi Portalı Eklentisi",
        slug: "akilli-b2b-bayi-portali",
        sku: "AVC-B2B-002",
        barcode: "868000100102",
        price: 12500,
        discountedPrice: null,
        costPrice: 3500,
        stock: 25,
        criticalStock: 3,
        isFeatured: 1,
        categoryId: 1,
        brandId: 1,
        shortDescription: "Bayiye özel fiyat, cari hesap ve vadeli sipariş yönetimi.",
        description: "Bayi ağınızı dijitalleştirin, toptan siparişleri ve hakedişleri tek merkezden yönetin.",
      },
      {
        name: "Tofy AI Sesli & Yazılı Satış Asistanı",
        slug: "tofy-ai-satis-asistani",
        sku: "AVC-AI-003",
        barcode: "868000100103",
        price: 8900,
        discountedPrice: 6900,
        costPrice: 2000,
        stock: 99,
        criticalStock: 10,
        isFeatured: 1,
        categoryId: 1,
        brandId: 1,
        shortDescription: "7/24 müşterilerle konuşan, ürün öneren ve sipariş yönlendiren yapay zeka asistanı.",
        description: "Gemini API tabanlı, gerçek zamanlı Türkçe ses ve sohbet desteğine sahip yapay zeka botu.",
      },
      {
        name: "Eski Kaşar & Gurme Peynir Paketi",
        slug: "eski-kasar-gurme-peynir-paketi",
        sku: "GUR-KASAR-004",
        barcode: "868000200201",
        price: 850,
        discountedPrice: 750,
        costPrice: 420,
        stock: 14,
        criticalStock: 4,
        isFeatured: 0,
        categoryId: 3,
        brandId: 2,
        shortDescription: "12 ay olgunlaştırılmış Kars eski kaşarı ve tulum peyniri özel seçkisi.",
        description: "Geleneksel yöntemlerle dinlendirilmiş, katkısız doğal şirden mayalı gurme peynir seti.",
      },
      {
        name: "Premium Deri Ev & Ofis Çalışma Matı",
        slug: "premium-deri-calisma-mati",
        sku: "LUN-MAT-005",
        barcode: "868000300301",
        price: 1450,
        discountedPrice: 1190,
        costPrice: 500,
        stock: 2,
        criticalStock: 5,
        isFeatured: 0,
        categoryId: 4,
        brandId: 4,
        shortDescription: "Su geçirmez hakiki deri masaüstü koruyucu ve mouse pad.",
        description: "Lüks çalışma alanları için el yapımı birinci sınıf dikişli deri mat.",
      },
    ];

    for (const p of demoProducts) {
      await db.prepare(`
        INSERT INTO products (
          name, slug, sku, barcode, category_id, brand_id, short_description, description,
          price, discounted_price, cost_price, vat_rate, stock, critical_stock, status, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 20, ?, ?, 'active', ?)
      `).bind(
        p.name, p.slug, p.sku, p.barcode, p.categoryId, p.brandId, p.shortDescription, p.description,
        p.price, p.discountedPrice, p.costPrice, p.stock, p.criticalStock, p.isFeatured
      ).run();
    }
  }
}

async function ensureCampaignsTable(db) {
  if (!await tableExists(db, "campaigns")) {
    await db.prepare(`
      CREATE TABLE campaigns (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        type text DEFAULT 'percentage' NOT NULL,
        discount_value integer DEFAULT 0 NOT NULL,
        min_spend integer DEFAULT 0 NOT NULL,
        target_type text DEFAULT 'all' NOT NULL,
        target_id integer,
        status text DEFAULT 'active' NOT NULL,
        starts_at text DEFAULT '' NOT NULL,
        ends_at text DEFAULT '' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM campaigns").first();
  if (Number(countRow?.total ?? 0) === 0) {
    await db.prepare(`
      INSERT INTO campaigns (name, type, discount_value, min_spend, target_type, status, starts_at, ends_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      "Kurumsal Başlangıç %20 İndirimi", "percentage", 20, 10000, "all", "active", "2026-01-01", "2026-12-31"
    ).run();
    await db.prepare(`
      INSERT INTO campaigns (name, type, discount_value, min_spend, target_type, status, starts_at, ends_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      "500 TL Üzeri Ücretsiz Kargo & Kurulum", "free_shipping", 0, 500, "all", "active", "2026-01-01", "2026-12-31"
    ).run();
  }
}

async function ensureCouponsTable(db) {
  if (!await tableExists(db, "coupons")) {
    await db.prepare(`
      CREATE TABLE coupons (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        code text NOT NULL,
        type text DEFAULT 'percentage' NOT NULL,
        discount_value integer DEFAULT 0 NOT NULL,
        min_spend integer DEFAULT 0 NOT NULL,
        max_discount integer DEFAULT 0 NOT NULL,
        usage_limit integer DEFAULT 100 NOT NULL,
        used_count integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        starts_at text DEFAULT '' NOT NULL,
        ends_at text DEFAULT '' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code)").run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM coupons").first();
  if (Number(countRow?.total ?? 0) === 0) {
    await db.prepare(`
      INSERT INTO coupons (code, type, discount_value, min_spend, max_discount, usage_limit, used_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind("AVCI2026", "percentage", 15, 1000, 5000, 500, 12).run();
    await db.prepare(`
      INSERT INTO coupons (code, type, discount_value, min_spend, max_discount, usage_limit, used_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind("HOSGELDIN250", "fixed", 250, 1500, 250, 1000, 48).run();
  }
}

async function ensureAuditLogsTable(db) {
  if (!await tableExists(db, "audit_logs")) {
    await db.prepare(`
      CREATE TABLE audit_logs (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_email text NOT NULL,
        action text NOT NULL,
        entity text NOT NULL,
        entity_id text DEFAULT '' NOT NULL,
        details text DEFAULT '' NOT NULL,
        ip_address text DEFAULT '' NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
  }
}

async function ensureIntegrationsTable(db) {
  if (!await tableExists(db, "integrations")) {
    await db.prepare(`
      CREATE TABLE integrations (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        provider_key text NOT NULL,
        category text NOT NULL,
        name text NOT NULL,
        status text DEFAULT 'passive' NOT NULL,
        config text DEFAULT '{}' NOT NULL,
        last_sync_at text DEFAULT '' NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_provider_key ON integrations (provider_key)").run();
  }

  const countRow = await db.prepare("SELECT COUNT(*) AS total FROM integrations").first();
  if (Number(countRow?.total ?? 0) === 0) {
    const list = [
      ["paytr", "payment", "PayTR Sanal POS", "active", JSON.stringify({ merchantId: "123456", mode: "test" })],
      ["iyzico", "payment", "iyzico Checkout Form", "active", JSON.stringify({ apiKey: "sandbox-...", mode: "sandbox" })],
      ["yurtici", "shipping", "Yurtiçi Kargo Entegrasyonu", "active", JSON.stringify({ username: "avci_user", autoTracking: true })],
      ["aras", "shipping", "Aras Kargo Entegrasyonu", "passive", JSON.stringify({ username: "", autoTracking: false })],
      ["trendyol", "marketplace", "Trendyol Pazaryeri Senkronizasyonu", "active", JSON.stringify({ supplierId: "987654", syncStock: true })],
      ["hepsiburada", "marketplace", "Hepsiburada API Entegrasyonu", "passive", JSON.stringify({ merchantId: "", syncStock: false })],
      ["parasut", "erp", "Paraşüt E-Fatura & Muhasebe", "active", JSON.stringify({ companyId: "45012", autoInvoice: true })],
      ["netgsm", "sms", "NetGSM Başlıklı SMS", "active", JSON.stringify({ header: "AVCI", otpEnabled: true })],
    ];
    for (const [key, cat, name, status, conf] of list) {
      await db.prepare(`
        INSERT INTO integrations (provider_key, category, name, status, config, last_sync_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(key, cat, name, status, conf, new Date().toISOString()).run();
    }
  }
}

async function ensureCustomerPortalProductTables(db) {
  await addColumnIfMissing(db, "ALTER TABLE support_tickets ADD COLUMN priority text DEFAULT 'normal' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE support_tickets ADD COLUMN first_responded_at text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE support_tickets ADD COLUMN closed_at text DEFAULT '' NOT NULL");
  const statements = [
    `CREATE TABLE IF NOT EXISTS customer_portal_credentials (customer_id integer PRIMARY KEY NOT NULL, password_hash text NOT NULL, password_changed_at text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS customer_portal_login_attempts (attempt_key text PRIMARY KEY NOT NULL, fail_count integer DEFAULT 0 NOT NULL, window_start text NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS customer_portal_profiles (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, company_name text DEFAULT '' NOT NULL, logo_url text DEFAULT '' NOT NULL, monogram text DEFAULT '' NOT NULL, theme text DEFAULT 'avci' NOT NULL, color_mode text DEFAULT 'day' NOT NULL, ssl_warning_days integer DEFAULT 30 NOT NULL, tofy_click_threshold_bps integer DEFAULT 1000 NOT NULL, marketplace_setup_days integer DEFAULT 7 NOT NULL, onboarding_status text DEFAULT 'not_started' NOT NULL, onboarding_progress integer DEFAULT 0 NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_portal_profiles_customer ON customer_portal_profiles (customer_id)`,
    `CREATE TABLE IF NOT EXISTS customer_module_instances (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, module_id integer NOT NULL, status text DEFAULT 'planned' NOT NULL, coverage text DEFAULT '' NOT NULL, enabled_at text DEFAULT '' NOT NULL, expires_at text DEFAULT '' NOT NULL, note text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_module_instances_unique ON customer_module_instances (customer_id, module_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_module_instances_status ON customer_module_instances (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS customer_integration_instances (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, integration_id integer NOT NULL, status text DEFAULT 'planned' NOT NULL, setup_progress integer DEFAULT 0 NOT NULL, health_score integer DEFAULT 0 NOT NULL, last_sync_at text DEFAULT '' NOT NULL, last_error_summary text DEFAULT '' NOT NULL, public_metadata text DEFAULT '{}' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_integration_instances_unique ON customer_integration_instances (customer_id, integration_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_integration_instances_status ON customer_integration_instances (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS customer_metric_snapshots (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, metric_key text NOT NULL, value integer DEFAULT 0 NOT NULL, unit text DEFAULT 'count' NOT NULL, source text DEFAULT 'system' NOT NULL, period_start text DEFAULT '' NOT NULL, period_end text DEFAULT '' NOT NULL, metadata text DEFAULT '{}' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_metric_snapshots_lookup ON customer_metric_snapshots (customer_id, metric_key, period_end)`,
    `CREATE TABLE IF NOT EXISTS portal_notifications (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, type text DEFAULT 'info' NOT NULL, title text NOT NULL, body text DEFAULT '' NOT NULL, priority integer DEFAULT 0 NOT NULL, target_section text DEFAULT 'ozet' NOT NULL, status text DEFAULT 'active' NOT NULL, source text DEFAULT 'admin' NOT NULL, visible_at text DEFAULT '' NOT NULL, expires_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_portal_notifications_visible ON portal_notifications (customer_id, status, visible_at)`,
    `CREATE TABLE IF NOT EXISTS tofy_experiments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, name text NOT NULL, kind text DEFAULT 'copy' NOT NULL, status text DEFAULT 'draft' NOT NULL, control_label text DEFAULT 'Kontrol' NOT NULL, variant_label text DEFAULT 'Varyant' NOT NULL, result_summary text DEFAULT '' NOT NULL, starts_at text DEFAULT '' NOT NULL, ends_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_tofy_experiments_customer_status ON tofy_experiments (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS customer_portal_documents (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, title text NOT NULL, category text DEFAULT 'document' NOT NULL, url text DEFAULT '' NOT NULL, status text DEFAULT 'active' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_portal_documents_customer ON customer_portal_documents (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS commerce_license_installations (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, store_key text NOT NULL, installation_id text NOT NULL, primary_domain text NOT NULL, plan text DEFAULT 'start' NOT NULL, commerce_version text DEFAULT '1.0.0' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, limits_json text DEFAULT '{}' NOT NULL, activation_token_hash text NOT NULL, status text DEFAULT 'active' NOT NULL, valid_until text NOT NULL, last_seen_at text DEFAULT '' NOT NULL, last_seen_version text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_license_installation_identity ON commerce_license_installations (store_key, installation_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_license_installation_token ON commerce_license_installations (activation_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_license_installation_customer ON commerce_license_installations (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS commerce_portal_login_codes (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, installation_id integer NOT NULL, customer_id integer NOT NULL, code_hash text NOT NULL, expires_at text NOT NULL, used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS commerce_install_jobs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, job_id text NOT NULL, license_id integer NOT NULL, customer_id integer NOT NULL, store_key text NOT NULL, installation_id text NOT NULL, target_domain text NOT NULL, environment text DEFAULT 'production' NOT NULL, status text DEFAULT 'queued' NOT NULL, current_step text DEFAULT 'enrollment' NOT NULL, enrollment_token_hash text NOT NULL, enrollment_expires_at text NOT NULL, agent_id text DEFAULT '' NOT NULL, agent_version text DEFAULT '' NOT NULL, safe_summary text DEFAULT '' NOT NULL, artifact_json text DEFAULT '{}' NOT NULL, claimed_at text DEFAULT '' NOT NULL, completed_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_job_id ON commerce_install_jobs (job_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_enrollment_hash ON commerce_install_jobs (enrollment_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_install_jobs_license_status ON commerce_install_jobs (license_id, status)`,
    `CREATE TABLE IF NOT EXISTS commerce_install_job_events (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, job_id text NOT NULL, status text NOT NULL, step text NOT NULL, safe_code text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS control_desk_oauth_codes (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, code_hash text NOT NULL, code_challenge text NOT NULL, redirect_uri text NOT NULL, actor_type text NOT NULL, actor_email text NOT NULL, display_name text NOT NULL, customer_id integer DEFAULT 0 NOT NULL, roles_json text DEFAULT '[]' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, expires_at text NOT NULL, used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_oauth_code_hash ON control_desk_oauth_codes (code_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_control_desk_oauth_code_expiry ON control_desk_oauth_codes (expires_at, used_at)`,
    `CREATE TABLE IF NOT EXISTS control_desk_sessions (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, session_id text NOT NULL, access_token_hash text NOT NULL, refresh_token_hash text NOT NULL, actor_type text NOT NULL, actor_email text NOT NULL, display_name text NOT NULL, customer_id integer DEFAULT 0 NOT NULL, roles_json text DEFAULT '[]' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, device_name text DEFAULT '' NOT NULL, access_expires_at text NOT NULL, refresh_expires_at text NOT NULL, revoked_at text DEFAULT '' NOT NULL, last_used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_session_id ON control_desk_sessions (session_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_access_hash ON control_desk_sessions (access_token_hash)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_refresh_hash ON control_desk_sessions (refresh_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_control_desk_session_actor ON control_desk_sessions (actor_email, revoked_at)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_install_job_events_job ON commerce_install_job_events (job_id, created_at)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_portal_login_code_hash ON commerce_portal_login_codes (code_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_portal_login_code_expiry ON commerce_portal_login_codes (expires_at, used_at)`,
  ];
  for (const statement of statements) await db.prepare(statement).run();
  // Existing local preview databases may predate migration 0030. CREATE TABLE
  // does not evolve an existing table, so align preview DBs before queries run.
  await addColumnIfMissing(db, "ALTER TABLE customer_module_instances ADD COLUMN target_domain text DEFAULT '' NOT NULL");
  await addColumnIfMissing(db, "ALTER TABLE customer_integration_instances ADD COLUMN target_domain text DEFAULT '' NOT NULL");
}

// Commerce lisans uçları canlı D1 veritabanında da güvenli biçimde
// ilk istekte kendi tablolarını hazırlar. Bu, yerel önizleme bayrağına bağlı
// değildir ve CREATE IF NOT EXISTS dışında veri değiştirmez.
export async function ensureCommerceLicenseTables(env) {
  let binding = env?.DB;
  const sqlitePath = String(env?.AVCI_SQLITE_PATH || (typeof process !== "undefined" ? process.env?.AVCI_SQLITE_PATH : "") || "").trim();
  if (!binding && sqlitePath) binding = await (await import("./node-sqlite-d1.mjs")).createNodeD1Database(sqlitePath);
  if (!binding) {
    try { binding = (await import("cloudflare:workers")).env?.DB; } catch { binding = null; }
  }
  if (!binding) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  const statements = [
    `CREATE TABLE IF NOT EXISTS customer_portal_credentials (customer_id integer PRIMARY KEY NOT NULL, password_hash text NOT NULL, password_changed_at text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS customer_portal_login_attempts (attempt_key text PRIMARY KEY NOT NULL, fail_count integer DEFAULT 0 NOT NULL, window_start text NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS commerce_license_installations (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, store_key text NOT NULL, installation_id text NOT NULL, primary_domain text NOT NULL, plan text DEFAULT 'start' NOT NULL, commerce_version text DEFAULT '1.0.0' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, limits_json text DEFAULT '{}' NOT NULL, activation_token_hash text NOT NULL, status text DEFAULT 'active' NOT NULL, valid_until text NOT NULL, last_seen_at text DEFAULT '' NOT NULL, last_seen_version text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_license_installation_identity ON commerce_license_installations (store_key, installation_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_license_installation_token ON commerce_license_installations (activation_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_license_installation_customer ON commerce_license_installations (customer_id, status)`,
    `CREATE TABLE IF NOT EXISTS commerce_license_verification_events (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, license_id integer DEFAULT 0 NOT NULL, customer_id integer DEFAULT 0 NOT NULL, request_hash text NOT NULL, ip_address text DEFAULT '' NOT NULL, outcome text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_license_verification_rate ON commerce_license_verification_events (request_hash, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_license_verification_license ON commerce_license_verification_events (license_id, created_at)`,
    `CREATE TABLE IF NOT EXISTS commerce_portal_login_codes (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, installation_id integer NOT NULL, customer_id integer NOT NULL, code_hash text NOT NULL, expires_at text NOT NULL, used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_portal_login_code_hash ON commerce_portal_login_codes (code_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_portal_login_code_expiry ON commerce_portal_login_codes (expires_at, used_at)`,
    `CREATE TABLE IF NOT EXISTS commerce_install_jobs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, job_id text NOT NULL, license_id integer NOT NULL, customer_id integer NOT NULL, store_key text NOT NULL, installation_id text NOT NULL, target_domain text NOT NULL, environment text DEFAULT 'production' NOT NULL, status text DEFAULT 'queued' NOT NULL, current_step text DEFAULT 'enrollment' NOT NULL, enrollment_token_hash text NOT NULL, enrollment_expires_at text NOT NULL, agent_id text DEFAULT '' NOT NULL, agent_version text DEFAULT '' NOT NULL, safe_summary text DEFAULT '' NOT NULL, artifact_json text DEFAULT '{}' NOT NULL, claimed_at text DEFAULT '' NOT NULL, completed_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_job_id ON commerce_install_jobs (job_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_enrollment_hash ON commerce_install_jobs (enrollment_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_install_jobs_license_status ON commerce_install_jobs (license_id, status)`,
    `CREATE TABLE IF NOT EXISTS commerce_install_job_events (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, job_id text NOT NULL, status text NOT NULL, step text NOT NULL, safe_code text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS commerce_solution_blueprints (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, blueprint_key text NOT NULL UNIQUE, name text NOT NULL, sector text NOT NULL, summary text DEFAULT '' NOT NULL, technology_json text DEFAULT '[]' NOT NULL, theme_key text DEFAULT '' NOT NULL, module_keys_json text DEFAULT '[]' NOT NULL, current_version text DEFAULT '1.0.0' NOT NULL, minimum_commerce_version text DEFAULT '1.0.0' NOT NULL, release_channel text DEFAULT 'stable' NOT NULL, artifact_manifest_url text DEFAULT '' NOT NULL, preview_url text DEFAULT '' NOT NULL, status text DEFAULT 'draft' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS control_desk_app_releases (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, version text NOT NULL, channel text DEFAULT 'pilot' NOT NULL, platform text NOT NULL, architecture text DEFAULT 'x64' NOT NULL, file_url text NOT NULL, sha256 text NOT NULL, size_bytes integer DEFAULT 0 NOT NULL, signature_status text DEFAULT 'pending' NOT NULL, signer_subject text DEFAULT '' NOT NULL, manifest_url text NOT NULL, manifest_signature text NOT NULL, release_notes text DEFAULT '' NOT NULL, status text DEFAULT 'draft' NOT NULL, published_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(version, channel, platform, architecture), CHECK(channel IN ('pilot','stable')), CHECK(platform IN ('windows','macos','linux')), CHECK(signature_status IN ('pending','verified','rejected')), CHECK(status IN ('draft','published','withdrawn')), CHECK(status != 'published' OR (signature_status = 'verified' AND length(sha256) = 64 AND manifest_signature != '')))`,
    `CREATE INDEX IF NOT EXISTS idx_control_desk_app_release_latest ON control_desk_app_releases (status, channel, platform, published_at)`,
    `CREATE TABLE IF NOT EXISTS avci_mobile_apps (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, app_key text NOT NULL, name text NOT NULL, platform text NOT NULL, bundle_id text NOT NULL, current_version text DEFAULT '1.0.0' NOT NULL, build_number text DEFAULT '1' NOT NULL, release_channel text DEFAULT 'production' NOT NULL, store_status text DEFAULT 'draft' NOT NULL, store_url text DEFAULT '' NOT NULL, health_status text DEFAULT 'unknown' NOT NULL, last_heartbeat_at text DEFAULT '' NOT NULL, minimum_os_version text DEFAULT '' NOT NULL, notes text DEFAULT '' NOT NULL, status text DEFAULT 'active' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(app_key, platform))`,
    `CREATE TABLE IF NOT EXISTS customer_mobile_app_assignments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, mobile_app_id integer NOT NULL, license_id integer DEFAULT 0 NOT NULL, branded_name text DEFAULT '' NOT NULL, status text DEFAULT 'assigned' NOT NULL, assigned_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(customer_id, mobile_app_id))`,
    `CREATE TABLE IF NOT EXISTS infrastructure_resources (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, provider text DEFAULT 'hostinger' NOT NULL, provider_resource_id text DEFAULT '' NOT NULL, type text NOT NULL, name text NOT NULL, domain text DEFAULT '' NOT NULL, status text DEFAULT 'unknown' NOT NULL, plan_name text DEFAULT '' NOT NULL, expires_at text DEFAULT '' NOT NULL, auto_renew integer DEFAULT 0 NOT NULL, region text DEFAULT '' NOT NULL, ip_address text DEFAULT '' NOT NULL, last_synced_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(provider,provider_resource_id,customer_id))`,
    `CREATE TABLE IF NOT EXISTS uptime_monitors (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, resource_id integer DEFAULT 0 NOT NULL, domain text NOT NULL, check_url text NOT NULL, status text DEFAULT 'pending' NOT NULL, last_http_status integer DEFAULT 0 NOT NULL, last_response_ms integer DEFAULT 0 NOT NULL, ssl_expires_at text DEFAULT '' NOT NULL, last_checked_at text DEFAULT '' NOT NULL, consecutive_failures integer DEFAULT 0 NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(customer_id,domain))`,
    `CREATE TABLE IF NOT EXISTS infrastructure_incidents (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, monitor_id integer DEFAULT 0 NOT NULL, type text NOT NULL, severity text DEFAULT 'warning' NOT NULL, title text NOT NULL, safe_summary text DEFAULT '' NOT NULL, status text DEFAULT 'open' NOT NULL, opened_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, resolved_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_solution_blueprints_status_sector ON commerce_solution_blueprints (status, sector)`,
    `CREATE TABLE IF NOT EXISTS customer_solution_assignments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, blueprint_id integer NOT NULL, license_id integer NOT NULL, store_key text NOT NULL, installation_id text NOT NULL, assigned_version text NOT NULL, status text DEFAULT 'assigned' NOT NULL, note text DEFAULT '' NOT NULL, assigned_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, activated_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(blueprint_id, installation_id))`,
    `CREATE INDEX IF NOT EXISTS idx_customer_solution_assignment_customer ON customer_solution_assignments (customer_id, status)`,
    `INSERT OR IGNORE INTO commerce_solution_blueprints (blueprint_key, name, sector, summary, technology_json, theme_key, module_keys_json, current_version, minimum_commerce_version, release_channel, preview_url, status) VALUES ('basbitir-print-commerce', 'BasBitir Matbaa Commerce', 'Matbaa ve Baskı', 'BasBitir için geliştirilen ofset tema, baskı yapılandırıcısı, tasarım stüdyosu ve üretim akışını birlikte kurar.', '["PHP 8.2","Avcı Commerce","Vanilla JS"]', 'basbitir-offset', '["print-commerce","design-studio","print-production-tracking"]', '1.0.0', '1.0.0', 'pilot', 'https://basbitir.com', 'active')`,
    `INSERT OR IGNORE INTO commerce_solution_blueprints (blueprint_key, name, sector, summary, technology_json, theme_key, module_keys_json, current_version, minimum_commerce_version, release_channel, preview_url, status) VALUES ('fashion-commerce-starter', 'Giyim Commerce Başlangıç', 'Giyim ve Moda', 'Beden, renk, koleksiyon ve varyant matrisi hazır gelen Avcı Commerce sektör profilidir.', '["PHP 8.2","Avcı Commerce"]', 'fashion-studio', '["catalog","variant-matrix","campaigns"]', '1.0.0', '1.0.0', 'pilot', '', 'draft')`,
    `CREATE INDEX IF NOT EXISTS idx_commerce_install_job_events_job ON commerce_install_job_events (job_id, created_at)`,
    `CREATE TABLE IF NOT EXISTS control_desk_oauth_codes (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, code_hash text NOT NULL, code_challenge text NOT NULL, redirect_uri text NOT NULL, actor_type text NOT NULL, actor_email text NOT NULL, display_name text NOT NULL, customer_id integer DEFAULT 0 NOT NULL, roles_json text DEFAULT '[]' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, expires_at text NOT NULL, used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_oauth_code_hash ON control_desk_oauth_codes (code_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_control_desk_oauth_code_expiry ON control_desk_oauth_codes (expires_at, used_at)`,
    `CREATE TABLE IF NOT EXISTS control_desk_sessions (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, session_id text NOT NULL, access_token_hash text NOT NULL, refresh_token_hash text NOT NULL, actor_type text NOT NULL, actor_email text NOT NULL, display_name text NOT NULL, customer_id integer DEFAULT 0 NOT NULL, roles_json text DEFAULT '[]' NOT NULL, scopes_json text DEFAULT '[]' NOT NULL, device_name text DEFAULT '' NOT NULL, access_expires_at text NOT NULL, refresh_expires_at text NOT NULL, revoked_at text DEFAULT '' NOT NULL, last_used_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_session_id ON control_desk_sessions (session_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_access_hash ON control_desk_sessions (access_token_hash)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_control_desk_refresh_hash ON control_desk_sessions (refresh_token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_control_desk_session_actor ON control_desk_sessions (actor_email, revoked_at)`,
    `CREATE TABLE IF NOT EXISTS mobile_push_devices (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, session_id text NOT NULL, store_key text NOT NULL, device_installation_id text NOT NULL, platform text NOT NULL, provider text DEFAULT 'expo' NOT NULL, token_hash text NOT NULL, token_ciphertext text NOT NULL, token_nonce text NOT NULL, app_version text DEFAULT '' NOT NULL, permission_status text DEFAULT 'granted' NOT NULL, last_seen_at text DEFAULT '' NOT NULL, revoked_at text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(customer_id,device_installation_id), UNIQUE(token_hash))`,
    `CREATE INDEX IF NOT EXISTS idx_mobile_push_customer_store ON mobile_push_devices (customer_id,store_key,revoked_at)`,
    `CREATE INDEX IF NOT EXISTS idx_mobile_push_session ON mobile_push_devices (session_id,revoked_at)`,
    `CREATE TABLE IF NOT EXISTS mobile_push_deliveries (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, customer_id integer NOT NULL, store_key text DEFAULT '' NOT NULL, device_id integer NOT NULL, requested_by text DEFAULT '' NOT NULL, title text NOT NULL, status text DEFAULT 'queued' NOT NULL, provider_ticket_id text DEFAULT '' NOT NULL, error_code text DEFAULT '' NOT NULL, error_message text DEFAULT '' NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_mobile_push_delivery_customer ON mobile_push_deliveries (customer_id,created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_mobile_push_delivery_device ON mobile_push_deliveries (device_id,created_at)`,
  ];
  for (const statement of statements) await binding.prepare(statement).run();
  const columns = new Set(((await binding.prepare("PRAGMA table_info(commerce_license_installations)").all()).results || []).map((item) => item.name));
  for (const [name, statement] of [
    ["product", "ALTER TABLE commerce_license_installations ADD COLUMN product text DEFAULT 'avci-commerce' NOT NULL"],
    ["activation_count", "ALTER TABLE commerce_license_installations ADD COLUMN activation_count integer DEFAULT 0 NOT NULL"],
    ["first_activated_at", "ALTER TABLE commerce_license_installations ADD COLUMN first_activated_at text DEFAULT '' NOT NULL"],
    ["billing_cycle", "ALTER TABLE commerce_license_installations ADD COLUMN billing_cycle text DEFAULT 'annual' NOT NULL"],
    ["billing_amount", "ALTER TABLE commerce_license_installations ADD COLUMN billing_amount text DEFAULT '' NOT NULL"],
    ["payment_status", "ALTER TABLE commerce_license_installations ADD COLUMN payment_status text DEFAULT 'pending' NOT NULL"],
    ["next_payment_at", "ALTER TABLE commerce_license_installations ADD COLUMN next_payment_at text DEFAULT '' NOT NULL"],
    ["penalty_status", "ALTER TABLE commerce_license_installations ADD COLUMN penalty_status text DEFAULT 'none' NOT NULL"],
    ["penalty_note", "ALTER TABLE commerce_license_installations ADD COLUMN penalty_note text DEFAULT '' NOT NULL"],
    ["suspension_reason", "ALTER TABLE commerce_license_installations ADD COLUMN suspension_reason text DEFAULT '' NOT NULL"],
  ]) if (!columns.has(name)) await binding.prepare(statement).run();
  const installJobColumns = new Set(((await binding.prepare("PRAGMA table_info(commerce_install_jobs)").all()).results || []).map((item) => item.name));
  for (const [name, statement] of [
    ["agent_token_hash", "ALTER TABLE commerce_install_jobs ADD COLUMN agent_token_hash text DEFAULT '' NOT NULL"],
    ["agent_token_expires_at", "ALTER TABLE commerce_install_jobs ADD COLUMN agent_token_expires_at text DEFAULT '' NOT NULL"],
  ]) if (!installJobColumns.has(name)) await binding.prepare(statement).run();
  await binding.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_agent_token ON commerce_install_jobs (agent_token_hash) WHERE agent_token_hash <> ''").run();
}

async function seedDemoCustomerPortal(db) {
  if (!(await tableExists(db, "customers"))) return;
  const existing = await db.prepare(
    "SELECT id, domain_expires_at, hosting_expires_at FROM customers WHERE email = ? LIMIT 1",
  ).bind("musteri@ornek.local").first();
  if (existing?.id) {
    if (!existing.domain_expires_at && !existing.hosting_expires_at) {
      await db.prepare(`
        UPDATE customers
        SET domain_expires_at = ?, hosting_expires_at = ?, updated_at = ?
        WHERE id = ?
      `).bind("2027-12-01", "2027-06-15", new Date().toISOString(), existing.id).run();
    }
    return;
  }

  const now = new Date().toISOString();
  const insert = await db.prepare(`
    INSERT INTO customers (
      name, email, phone, phone_normalized, company, city, interest, note,
      domain_name, domain_expires_at, hosting_expires_at, status, created_by_email, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).bind(
    "Murat Bey",
    "musteri@ornek.local",
    "+90 555 000 00 00",
    "905550000000",
    "BasBitir Atölyesi",
    "Adana",
    "E-ticaret altyapısı",
    "Yerel müşteri paneli test kaydı",
    "basbitir.com",
    "2027-12-01",
    "2027-06-15",
    "local-seed@avcieticaret.com",
    now,
    now,
  ).run();
  const customerId = Number(insert.meta?.last_row_id ?? 0);
  if (!customerId) return;

  const scale = await db.prepare("SELECT id FROM packages WHERE slug = 'scale' LIMIT 1").first();
  const trendyol = await db.prepare("SELECT id FROM modules WHERE slug = 'trendyol' LIMIT 1").first();
  if (scale?.id) {
    await db.prepare(`
      INSERT INTO software_orders (customer_id, kind, package_id, status, price_note, note, created_by_email, created_at, updated_at)
      VALUES (?, 'package', ?, 'active', '74.999 TL örnek band', 'Yerel panel test siparişi', 'local-seed@avcieticaret.com', ?, ?)
    `).bind(customerId, scale.id, now, now).run();
  }
  if (trendyol?.id) {
    await db.prepare(`
      INSERT INTO software_orders (customer_id, kind, module_id, status, price_note, note, created_by_email, created_at, updated_at)
      VALUES (?, 'module', ?, 'pending', 'Teklif notu', 'Pazaryeri modülü · yerel test', 'local-seed@avcieticaret.com', ?, ?)
    `).bind(customerId, trendyol.id, now, now).run();
  }
  await db.prepare(`
    INSERT INTO support_tickets (customer_id, topic, subject, message, status, created_by_email, created_at, updated_at)
    VALUES (?, 'teknik', 'Pazaryeri stok eşlemesi', 'Yerel panel test kaydı', 'closed', 'local-seed@avcieticaret.com', ?, ?)
  `).bind(customerId, now, now).run();
  await db.prepare(`
    INSERT INTO software_invoices (customer_id, title, amount_note, status, note, created_by_email, created_at, updated_at)
    VALUES (?, 'Scale lisans çerçevesi', '74.999 TL örnek band', 'paid', 'Yerel panel test faturası', 'local-seed@avcieticaret.com', ?, ?)
  `).bind(customerId, now, now).run();
}

async function seedDemoCustomerPortalProductData(db) {
  const customer = await db.prepare("SELECT id FROM customers WHERE email = ? LIMIT 1").bind("musteri@ornek.local").first();
  if (!customer?.id) return;
  const customerId = Number(customer.id);
  const now = new Date().toISOString();
  await db.prepare(`INSERT OR IGNORE INTO customer_portal_profiles (customer_id, company_name, monogram, theme, color_mode, onboarding_status, onboarding_progress) VALUES (?, 'BasBitir Atölyesi', 'BA', 'avci', 'day', 'in_progress', 3)`).bind(customerId).run();

  for (const slug of ["trendyol", "paytr", "yurtici-kargo"]) {
    const moduleRow = await db.prepare("SELECT id FROM modules WHERE slug = ? LIMIT 1").bind(slug).first();
    if (moduleRow?.id) await db.prepare(`INSERT OR IGNORE INTO customer_module_instances (customer_id, module_id, status, coverage, enabled_at, note) VALUES (?, ?, 'active', 'Scale kapsamı', ?, 'Yerel örnek müşteri kaydı')`).bind(customerId, moduleRow.id, now).run();
  }
  for (const [providerKey, status, progress, score, metadata] of [
    ["trendyol", "setup", 72, 74, JSON.stringify({ setupStartedAt: "2026-08-01", scope: "stok ve sipariş" })],
    ["paytr", "active", 100, 98, JSON.stringify({ scope: "ödeme servis sağlığı" })],
    ["yurtici", "active", 100, 96, JSON.stringify({ scope: "etiket ve takip" })],
  ]) {
    const integration = await db.prepare("SELECT id FROM integrations WHERE provider_key = ? LIMIT 1").bind(providerKey).first();
    if (integration?.id) await db.prepare(`INSERT OR IGNORE INTO customer_integration_instances (customer_id, integration_id, status, setup_progress, health_score, last_sync_at, public_metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(customerId, integration.id, status, progress, score, now, metadata).run();
  }
  const metricCount = await db.prepare("SELECT COUNT(*) AS total FROM customer_metric_snapshots WHERE customer_id = ?").bind(customerId).first();
  if (Number(metricCount?.total ?? 0) === 0) {
    for (const [key, value, unit] of [
      ["tofy_recommendation_views", 18420, "count"], ["tofy_click_rate_bps", 840, "basis_points"],
      ["tofy_cart_additions", 186, "count"], ["tofy_cross_sell", 34, "count"],
      ["tofy_quality_ready", 412, "count"], ["tofy_quality_needs_work", 38, "count"],
      ["tofy_quality_blocked", 7, "count"], ["service_health_score", 94, "score"],
      ["sla_first_response_minutes", 28, "minutes"],
    ]) await db.prepare(`INSERT INTO customer_metric_snapshots (customer_id, metric_key, value, unit, source, period_start, period_end) VALUES (?, ?, ?, ?, 'demo_seed', '2026-08-16', '2026-08-23')`).bind(customerId, key, value, unit).run();
  }
  await db.prepare(`INSERT OR IGNORE INTO tofy_experiments (id, customer_id, name, kind, status, control_label, variant_label, result_summary, starts_at) VALUES (100001, ?, 'Ürün kartı öneri metni', 'copy', 'active', 'Klasik öneri', 'İhtiyaca göre öneri', 'Sonuç oluşması bekleniyor · demo', '2026-08-20')`).bind(customerId).run();
}

async function applyLocalD1Schema(env) {
  if (!isLocalAdminBypassEnabled(env) || !env.DB) return;

  if (await tableExists(env.DB, "leads")) {
    await ensureSiteVisitsTable(env.DB);
    await ensureAdminLoginAttemptsTable(env.DB);
    await ensureCustomersTable(env.DB);
    await ensureCustomerDomainColumns(env.DB);
    await ensurePackagesTable(env.DB);
    await ensureModulesTable(env.DB);
    await ensureSoftwareOrdersTable(env.DB);
    await ensureSupportTicketsTable(env.DB);
    await ensureSoftwareInvoicesTable(env.DB);
    await ensureVitrineSignalsTable(env.DB);
    await ensureVitrineToastsTable(env.DB);
    await ensureSiteSettingsTable(env.DB);
    await ensureSiteAssetsTable(env.DB);
    await ensureCategoriesTable(env.DB);
    await ensureBrandsTable(env.DB);
    await ensureProductsTable(env.DB);
    await ensureCampaignsTable(env.DB);
    await ensureCouponsTable(env.DB);
    await ensureAuditLogsTable(env.DB);
    await ensureIntegrationsTable(env.DB);
    await ensureCustomerPortalProductTables(env.DB);
    await seedDemoLeads(env.DB);
    await seedDemoCustomerPortal(env.DB);
    await seedDemoCustomerPortalProductData(env.DB);
    return;
  }

  const drizzleDir = join(process.cwd(), "drizzle");
  const files = readdirSync(drizzleDir)
    .filter((name) => /^\d+_.*\.sql$/u.test(name))
    .sort();

  for (const file of files) {
    const statements = splitSqlStatements(readFileSync(join(drizzleDir, file), "utf8"));
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith("PRAGMA ")) continue;
      await env.DB.prepare(statement).run();
    }
  }

  await ensureSiteVisitsTable(env.DB);
  await ensureAdminLoginAttemptsTable(env.DB);
  await ensureCustomersTable(env.DB);
  await ensureCustomerDomainColumns(env.DB);
  await ensurePackagesTable(env.DB);
  await ensureModulesTable(env.DB);
  await ensureSoftwareOrdersTable(env.DB);
  await ensureSupportTicketsTable(env.DB);
  await ensureSoftwareInvoicesTable(env.DB);
  await ensureVitrineSignalsTable(env.DB);
  await ensureVitrineToastsTable(env.DB);
  await ensureSiteSettingsTable(env.DB);
  await ensureSiteAssetsTable(env.DB);
  await ensureCategoriesTable(env.DB);
  await ensureBrandsTable(env.DB);
  await ensureProductsTable(env.DB);
  await ensureCampaignsTable(env.DB);
  await ensureCouponsTable(env.DB);
  await ensureAuditLogsTable(env.DB);
  await ensureIntegrationsTable(env.DB);
  await ensureCustomerPortalProductTables(env.DB);
  await seedDemoLeads(env.DB);
  await seedDemoCustomerPortal(env.DB);
  await seedDemoCustomerPortalProductData(env.DB);
}

export function ensureLocalD1Schema(env) {
  if (!isLocalAdminBypassEnabled(env)) return Promise.resolve();
  if (appliedGen >= SCHEMA_GEN && pending) return pending;
  pending = applyLocalD1Schema(env)
    .then(() => {
      appliedGen = SCHEMA_GEN;
    })
    .catch((cause) => {
      pending = null;
      throw cause;
    });
  return pending;
}

let previewPending = null;

async function applyCustomerPortalPreviewData(env) {
  if (!env?.DB) return;
  await ensureCustomersTable(env.DB);
  await ensureCustomerDomainColumns(env.DB);
  await ensurePackagesTable(env.DB);
  await ensureModulesTable(env.DB);
  await ensureSoftwareOrdersTable(env.DB);
  await ensureSupportTicketsTable(env.DB);
  await ensureSoftwareInvoicesTable(env.DB);
  await ensureIntegrationsTable(env.DB);
  await ensureCustomerPortalProductTables(env.DB);
  await seedDemoCustomerPortal(env.DB);
  await seedDemoCustomerPortalProductData(env.DB);
}

export function ensureCustomerPortalPreviewData(env) {
  if (!isCustomerPortalPreviewEnabled(env)) return Promise.resolve();
  if (previewPending) return previewPending;
  previewPending = applyCustomerPortalPreviewData(env).catch((cause) => {
    previewPending = null;
    throw cause;
  });
  return previewPending;
}

