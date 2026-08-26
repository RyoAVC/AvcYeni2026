import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isLocalAdminBypassEnabled } from "./local-admin-identity.mjs";
import { isCustomerPortalPreviewEnabled } from "./customer-portal-preview.mjs";

const SCHEMA_GEN = 27;
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
  ];
  for (const statement of statements) await db.prepare(statement).run();
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

