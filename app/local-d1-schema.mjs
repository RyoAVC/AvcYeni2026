import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isLocalAdminBypassEnabled } from "./local-admin-identity.mjs";

const SCHEMA_GEN = 25;
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
    await seedDemoLeads(env.DB);
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
  await seedDemoLeads(env.DB);
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
