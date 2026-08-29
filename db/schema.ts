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
    runtime: text("runtime").notNull().default("node"),
    version: text("version").notNull().default("1.0.0"),
    packageUrl: text("package_url").notNull().default(""),
    packageChecksum: text("package_checksum").notNull().default(""),
    entrypoint: text("entrypoint").notNull().default(""),
    manifestJson: text("manifest_json").notNull().default("{}"),
    installStatus: text("install_status").notNull().default("not_installed"),
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
    priority: text("priority").notNull().default("normal"),
    firstRespondedAt: text("first_responded_at").notNull().default(""),
    closedAt: text("closed_at").notNull().default(""),
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

export const customerPortalCredentials = sqliteTable(
  "customer_portal_credentials",
  {
    customerId: integer("customer_id").primaryKey().references(() => customers.id, { onDelete: "cascade" }),
    passwordHash: text("password_hash").notNull(),
    passwordChangedAt: text("password_changed_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const customerPortalLoginAttempts = sqliteTable(
  "customer_portal_login_attempts",
  {
    attemptKey: text("attempt_key").primaryKey(),
    failCount: integer("fail_count").notNull().default(0),
    windowStart: text("window_start").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const customerPortalProfiles = sqliteTable(
  "customer_portal_profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    companyName: text("company_name").notNull().default(""),
    logoUrl: text("logo_url").notNull().default(""),
    monogram: text("monogram").notNull().default(""),
    theme: text("theme").notNull().default("avci"),
    colorMode: text("color_mode").notNull().default("day"),
    sslWarningDays: integer("ssl_warning_days").notNull().default(30),
    tofyClickThresholdBps: integer("tofy_click_threshold_bps").notNull().default(1000),
    marketplaceSetupDays: integer("marketplace_setup_days").notNull().default(7),
    onboardingStatus: text("onboarding_status").notNull().default("not_started"),
    onboardingProgress: integer("onboarding_progress").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_customer_portal_profiles_customer").on(table.customerId)],
);

export const customerModuleInstances = sqliteTable(
  "customer_module_instances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    moduleId: integer("module_id").notNull(),
    targetDomain: text("target_domain").notNull().default(""),
    status: text("status").notNull().default("planned"),
    coverage: text("coverage").notNull().default(""),
    enabledAt: text("enabled_at").notNull().default(""),
    expiresAt: text("expires_at").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_customer_module_instances_unique").on(table.customerId, table.moduleId),
    index("idx_customer_module_instances_status").on(table.customerId, table.status),
  ],
);

export const customerIntegrationInstances = sqliteTable(
  "customer_integration_instances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    integrationId: integer("integration_id").notNull(),
    targetDomain: text("target_domain").notNull().default(""),
    status: text("status").notNull().default("planned"),
    setupProgress: integer("setup_progress").notNull().default(0),
    healthScore: integer("health_score").notNull().default(0),
    lastSyncAt: text("last_sync_at").notNull().default(""),
    lastErrorSummary: text("last_error_summary").notNull().default(""),
    publicMetadata: text("public_metadata").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_customer_integration_instances_unique").on(table.customerId, table.integrationId),
    index("idx_customer_integration_instances_status").on(table.customerId, table.status),
  ],
);

export const customerMetricSnapshots = sqliteTable(
  "customer_metric_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    metricKey: text("metric_key").notNull(),
    value: integer("value").notNull().default(0),
    unit: text("unit").notNull().default("count"),
    source: text("source").notNull().default("system"),
    periodStart: text("period_start").notNull().default(""),
    periodEnd: text("period_end").notNull().default(""),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_customer_metric_snapshots_lookup").on(table.customerId, table.metricKey, table.periodEnd)],
);

export const portalNotifications = sqliteTable(
  "portal_notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    type: text("type").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    priority: integer("priority").notNull().default(0),
    targetSection: text("target_section").notNull().default("ozet"),
    status: text("status").notNull().default("active"),
    source: text("source").notNull().default("admin"),
    visibleAt: text("visible_at").notNull().default(""),
    expiresAt: text("expires_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_portal_notifications_visible").on(table.customerId, table.status, table.visibleAt)],
);

export const tofyExperiments = sqliteTable(
  "tofy_experiments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull().default("copy"),
    status: text("status").notNull().default("draft"),
    controlLabel: text("control_label").notNull().default("Kontrol"),
    variantLabel: text("variant_label").notNull().default("Varyant"),
    resultSummary: text("result_summary").notNull().default(""),
    startsAt: text("starts_at").notNull().default(""),
    endsAt: text("ends_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_tofy_experiments_customer_status").on(table.customerId, table.status)],
);

export const customerPortalDocuments = sqliteTable(
  "customer_portal_documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull().default("document"),
    url: text("url").notNull().default(""),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_customer_portal_documents_customer").on(table.customerId, table.status)],
);

export const commerceLicenseInstallations = sqliteTable(
  "commerce_license_installations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customerId: integer("customer_id").notNull(),
    storeKey: text("store_key").notNull(),
    installationId: text("installation_id").notNull(),
    primaryDomain: text("primary_domain").notNull(),
    plan: text("plan").notNull().default("start"),
    commerceVersion: text("commerce_version").notNull().default("1.0.0"),
    scopesJson: text("scopes_json").notNull().default("[]"),
    limitsJson: text("limits_json").notNull().default("{}"),
    activationTokenHash: text("activation_token_hash").notNull(),
    product: text("product").notNull().default("avci-commerce"),
    status: text("status").notNull().default("active"),
    validUntil: text("valid_until").notNull(),
    activationCount: integer("activation_count").notNull().default(0),
    firstActivatedAt: text("first_activated_at").notNull().default(""),
    billingCycle: text("billing_cycle").notNull().default("annual"),
    billingAmount: text("billing_amount").notNull().default(""),
    paymentStatus: text("payment_status").notNull().default("pending"),
    nextPaymentAt: text("next_payment_at").notNull().default(""),
    penaltyStatus: text("penalty_status").notNull().default("none"),
    penaltyNote: text("penalty_note").notNull().default(""),
    suspensionReason: text("suspension_reason").notNull().default(""),
    lastSeenAt: text("last_seen_at").notNull().default(""),
    lastSeenVersion: text("last_seen_version").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_commerce_license_installation_identity").on(table.storeKey, table.installationId),
    uniqueIndex("idx_commerce_license_installation_token").on(table.activationTokenHash),
    index("idx_commerce_license_installation_customer").on(table.customerId, table.status),
  ],
);

export const commerceLicenseVerificationEvents = sqliteTable(
  "commerce_license_verification_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    licenseId: integer("license_id").notNull().default(0),
    customerId: integer("customer_id").notNull().default(0),
    requestHash: text("request_hash").notNull(),
    ipAddress: text("ip_address").notNull().default(""),
    outcome: text("outcome").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_commerce_license_verification_rate").on(table.requestHash, table.createdAt),
    index("idx_commerce_license_verification_license").on(table.licenseId, table.createdAt),
  ],
);

export const commercePortalLoginCodes = sqliteTable(
  "commerce_portal_login_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    installationId: integer("installation_id").notNull(),
    customerId: integer("customer_id").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    usedAt: text("used_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_commerce_portal_login_code_hash").on(table.codeHash),
    index("idx_commerce_portal_login_code_expiry").on(table.expiresAt, table.usedAt),
  ],
);

export const commerceInstallJobs = sqliteTable(
  "commerce_install_jobs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    jobId: text("job_id").notNull(),
    licenseId: integer("license_id").notNull(),
    customerId: integer("customer_id").notNull(),
    storeKey: text("store_key").notNull(),
    installationId: text("installation_id").notNull(),
    targetDomain: text("target_domain").notNull(),
    environment: text("environment").notNull().default("production"),
    status: text("status").notNull().default("queued"),
    currentStep: text("current_step").notNull().default("enrollment"),
    enrollmentTokenHash: text("enrollment_token_hash").notNull(),
    enrollmentExpiresAt: text("enrollment_expires_at").notNull(),
    agentId: text("agent_id").notNull().default(""),
    agentVersion: text("agent_version").notNull().default(""),
    agentTokenHash: text("agent_token_hash").notNull().default(""),
    agentTokenExpiresAt: text("agent_token_expires_at").notNull().default(""),
    safeSummary: text("safe_summary").notNull().default(""),
    artifactJson: text("artifact_json").notNull().default("{}"),
    claimedAt: text("claimed_at").notNull().default(""),
    completedAt: text("completed_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_commerce_install_jobs_job_id").on(table.jobId),
    uniqueIndex("idx_commerce_install_jobs_enrollment_hash").on(table.enrollmentTokenHash),
    index("idx_commerce_install_jobs_license_status").on(table.licenseId, table.status),
  ],
);

export const commerceInstallJobEvents = sqliteTable(
  "commerce_install_job_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    jobId: text("job_id").notNull(),
    status: text("status").notNull(),
    step: text("step").notNull(),
    safeCode: text("safe_code").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_commerce_install_job_events_job").on(table.jobId, table.createdAt)],
);

export const controlDeskOAuthCodes = sqliteTable(
  "control_desk_oauth_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    codeHash: text("code_hash").notNull(),
    codeChallenge: text("code_challenge").notNull(),
    redirectUri: text("redirect_uri").notNull(),
    actorType: text("actor_type").notNull(),
    actorEmail: text("actor_email").notNull(),
    displayName: text("display_name").notNull(),
    customerId: integer("customer_id").notNull().default(0),
    rolesJson: text("roles_json").notNull().default("[]"),
    scopesJson: text("scopes_json").notNull().default("[]"),
    expiresAt: text("expires_at").notNull(),
    usedAt: text("used_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_control_desk_oauth_code_hash").on(table.codeHash), index("idx_control_desk_oauth_code_expiry").on(table.expiresAt, table.usedAt)],
);

export const controlDeskSessions = sqliteTable(
  "control_desk_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    actorType: text("actor_type").notNull(),
    actorEmail: text("actor_email").notNull(),
    displayName: text("display_name").notNull(),
    customerId: integer("customer_id").notNull().default(0),
    rolesJson: text("roles_json").notNull().default("[]"),
    scopesJson: text("scopes_json").notNull().default("[]"),
    deviceName: text("device_name").notNull().default(""),
    accessExpiresAt: text("access_expires_at").notNull(),
    refreshExpiresAt: text("refresh_expires_at").notNull(),
    revokedAt: text("revoked_at").notNull().default(""),
    lastUsedAt: text("last_used_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_control_desk_session_id").on(table.sessionId),
    uniqueIndex("idx_control_desk_access_hash").on(table.accessTokenHash),
    uniqueIndex("idx_control_desk_refresh_hash").on(table.refreshTokenHash),
    index("idx_control_desk_session_actor").on(table.actorEmail, table.revokedAt),
  ],
);
