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
