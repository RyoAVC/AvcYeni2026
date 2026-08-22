import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable(
  "leads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    phoneNormalized: text("phone_normalized").notNull().default(""),
    company: text("company").notNull().default(""),
    interest: text("interest").notNull(),
    message: text("message").notNull().default(""),
    status: text("status").notNull().default("new"),
    source: text("source").notNull().default("direct"),
    utmSource: text("utm_source").notNull().default(""),
    utmMedium: text("utm_medium").notNull().default(""),
    utmCampaign: text("utm_campaign").notNull().default(""),
    referrerHost: text("referrer_host").notNull().default(""),
    landingPath: text("landing_path").notNull().default(""),
    requestKey: text("request_key"),
    consentAt: text("consent_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_leads_email_created_at").on(table.email, table.createdAt),
    index("idx_leads_status_created_at").on(table.status, table.createdAt),
    index("idx_leads_source_created_at").on(table.source, table.createdAt),
    index("idx_leads_interest_created_at").on(table.interest, table.createdAt),
    uniqueIndex("idx_leads_request_key").on(table.requestKey),
    index("idx_leads_phone_normalized_created_at").on(table.phoneNormalized, table.createdAt),
  ],
);

export const leadActivities = sqliteTable(
  "lead_activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    leadId: integer("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    action: text("action").notNull().default("status_changed"),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    actorEmail: text("actor_email").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_lead_activities_lead_created_at").on(table.leadId, table.createdAt)],
);

export const leadNotes = sqliteTable(
  "lead_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    leadId: integer("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    authorEmail: text("author_email").notNull(),
    requestKey: text("request_key"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_lead_notes_lead_created_at").on(table.leadId, table.createdAt),
    uniqueIndex("idx_lead_notes_request_key").on(table.requestKey),
  ],
);

export const siteVisits = sqliteTable(
  "site_visits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    day: text("day").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host").notNull().default(""),
    visitorKey: text("visitor_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_site_visits_day").on(table.day),
    index("idx_site_visits_day_path").on(table.day, table.path),
    index("idx_site_visits_day_visitor").on(table.day, table.visitorKey),
  ],
);

export const adminLoginAttempts = sqliteTable(
  "admin_login_attempts",
  {
    attemptKey: text("attempt_key").primaryKey(),
    failCount: integer("fail_count").notNull().default(0),
    windowStart: text("window_start").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const customers = sqliteTable(
  "customers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    phoneNormalized: text("phone_normalized").notNull().default(""),
    company: text("company").notNull().default(""),
    city: text("city").notNull().default(""),
    interest: text("interest").notNull().default(""),
    note: text("note").notNull().default(""),
    domainName: text("domain_name").notNull().default(""),
    domainExpiresAt: text("domain_expires_at").notNull().default(""),
    hostingExpiresAt: text("hosting_expires_at").notNull().default(""),
    status: text("status").notNull().default("active"),
    createdByEmail: text("created_by_email").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_customers_email").on(table.email),
    index("idx_customers_status_created_at").on(table.status, table.createdAt),
    index("idx_customers_phone_normalized").on(table.phoneNormalized),
  ],
);

export const packages = sqliteTable(
  "packages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    family: text("family").notNull().default("eticaret"),
    summary: text("summary").notNull().default(""),
    features: text("features").notNull().default(""),
    priceNote: text("price_note").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("draft"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_packages_slug").on(table.slug),
    index("idx_packages_status_sort").on(table.status, table.sortOrder),
  ],
);

export const modules = sqliteTable(
  "modules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull().default("pazaryeri"),
    summary: text("summary").notNull().default(""),
    features: text("features").notNull().default(""),
    priceNote: text("price_note").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("draft"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_modules_slug").on(table.slug),
    index("idx_modules_status_sort").on(table.status, table.sortOrder),
  ],
);

export const softwareOrders = sqliteTable(
  "software_orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    kind: text("kind").notNull(),
    packageId: integer("package_id"),
    moduleId: integer("module_id"),
    status: text("status").notNull().default("draft"),
    priceNote: text("price_note").notNull().default(""),
    note: text("note").notNull().default(""),
    createdByEmail: text("created_by_email").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_software_orders_customer").on(table.customerId, table.createdAt),
    index("idx_software_orders_status").on(table.status, table.createdAt),
  ],
);

export const supportTickets = sqliteTable(
  "support_tickets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    topic: text("topic").notNull().default("diger"),
    subject: text("subject").notNull(),
    message: text("message").notNull().default(""),
    note: text("note").notNull().default(""),
    status: text("status").notNull().default("open"),
    createdByEmail: text("created_by_email").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_support_tickets_customer").on(table.customerId, table.createdAt),
    index("idx_support_tickets_status").on(table.status, table.createdAt),
  ],
);

export const softwareInvoices = sqliteTable(
  "software_invoices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    orderId: integer("order_id"),
    title: text("title").notNull(),
    amountNote: text("amount_note").notNull().default(""),
    status: text("status").notNull().default("draft"),
    note: text("note").notNull().default(""),
    createdByEmail: text("created_by_email").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_software_invoices_customer").on(table.customerId, table.createdAt),
    index("idx_software_invoices_status").on(table.status, table.createdAt),
  ],
);

export const vitrineSignals = sqliteTable(
  "vitrine_signals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("live"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_vitrine_signals_slug").on(table.slug),
    index("idx_vitrine_signals_status_sort").on(table.status, table.sortOrder),
  ],
);

export const vitrineToasts = sqliteTable(
  "vitrine_toasts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    text: text("text").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("live"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_vitrine_toasts_slug").on(table.slug),
    index("idx_vitrine_toasts_status_sort").on(table.status, table.sortOrder),
  ],
);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const siteAssets = sqliteTable("site_assets", {
  kind: text("kind").primaryKey(),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: integer("parent_id"),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("active"),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_categories_slug").on(table.slug),
    index("idx_categories_parent").on(table.parentId),
    index("idx_categories_status_sort").on(table.status, table.sortOrder),
  ],
);

export const brands = sqliteTable(
  "brands",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url").notNull().default(""),
    website: text("website").notNull().default(""),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_brands_slug").on(table.slug),
    index("idx_brands_status_sort").on(table.status, table.sortOrder),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull().default(""),
    barcode: text("barcode").notNull().default(""),
    categoryId: integer("category_id"),
    brandId: integer("brand_id"),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    price: integer("price").notNull().default(0),
    discountedPrice: integer("discounted_price"),
    costPrice: integer("cost_price").notNull().default(0),
    vatRate: integer("vat_rate").notNull().default(20),
    stock: integer("stock").notNull().default(0),
    criticalStock: integer("critical_stock").notNull().default(5),
    status: text("status").notNull().default("active"),
    isFeatured: integer("is_featured").notNull().default(0),
    images: text("images").notNull().default("[]"),
    variants: text("variants").notNull().default("[]"),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_products_slug").on(table.slug),
    index("idx_products_sku").on(table.sku),
    index("idx_products_category").on(table.categoryId),
    index("idx_products_brand").on(table.brandId),
    index("idx_products_status_featured").on(table.status, table.isFeatured),
    index("idx_products_stock").on(table.stock),
  ],
);

export const campaigns = sqliteTable(
  "campaigns",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").notNull().default("percentage"),
    discountValue: integer("discount_value").notNull().default(0),
    minSpend: integer("min_spend").notNull().default(0),
    targetType: text("target_type").notNull().default("all"),
    targetId: integer("target_id"),
    status: text("status").notNull().default("active"),
    startsAt: text("starts_at").notNull().default(""),
    endsAt: text("ends_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_campaigns_status").on(table.status),
    index("idx_campaigns_type").on(table.type),
  ],
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    type: text("type").notNull().default("percentage"),
    discountValue: integer("discount_value").notNull().default(0),
    minSpend: integer("min_spend").notNull().default(0),
    maxDiscount: integer("max_discount").notNull().default(0),
    usageLimit: integer("usage_limit").notNull().default(100),
    usedCount: integer("used_count").notNull().default(0),
    status: text("status").notNull().default("active"),
    startsAt: text("starts_at").notNull().default(""),
    endsAt: text("ends_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_coupons_code").on(table.code),
    index("idx_coupons_status").on(table.status),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userEmail: text("user_email").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull().default(""),
    details: text("details").notNull().default(""),
    ipAddress: text("ip_address").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_audit_logs_user").on(table.userEmail, table.createdAt),
    index("idx_audit_logs_entity").on(table.entity, table.entityId),
    index("idx_audit_logs_created_at").on(table.createdAt),
  ],
);

export const integrations = sqliteTable(
  "integrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    providerKey: text("provider_key").notNull(),
    category: text("category").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("passive"),
    config: text("config").notNull().default("{}"),
    lastSyncAt: text("last_sync_at").notNull().default(""),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_integrations_provider_key").on(table.providerKey),
    index("idx_integrations_category_status").on(table.category, table.status),
  ],
);
