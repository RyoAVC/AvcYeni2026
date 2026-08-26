import { desc, eq } from "drizzle-orm";
import {
  customerIntegrationInstances, customerMetricSnapshots, customerModuleInstances, customerPortalDocuments,
  customerPortalProfiles, integrations, modules, packages, portalNotifications, softwareInvoices,
  softwareOrders, supportTickets, tofyExperiments,
} from "../db/schema";
import { runPortalRules } from "./customer-portal-rules.mjs";
import { buildTofySnapshot, portalMetricLabel } from "./customer-portal-tofy.mjs";
import { invoiceStatusLabel } from "./software-invoice-admin.mjs";
import { softwareOrderKindLabel, softwareOrderStatusLabel } from "./software-order-admin.mjs";
import { ticketStatusLabel, ticketTopicLabel } from "./support-ticket-admin.mjs";

function formatDate(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function formatExpirySnapshot(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return { label: "Kayıt yok", note: "yönetimde güncellenir", tone: "watch" };
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return { label: raw, note: "yönetim kaydı", tone: "ok" };
  }
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  const tone = days <= 90 ? "watch" : "ok";
  const note = days < 0
    ? "yenileme penceresi geçmiş · salt okunur"
    : days <= 90
      ? `${days} gün · salt okunur`
      : "yönetim kaydı";
  return { label: formatDate(raw), note, tone };
}

export function buildInfrastructureSnapshot(customer) {
  const domainExpiry = formatExpirySnapshot(customer.domainExpiresAt);
  const hostingExpiry = formatExpirySnapshot(customer.hostingExpiresAt);
  const domainName = typeof customer.domainName === "string" ? customer.domainName.trim() : "";

  return {
    domainName: domainName || "—",
    items: [
      {
        label: "Alan adı",
        status: domainName || "Kayıt yok",
        tone: domainName ? "ok" : "watch",
        note: domainName ? "yönetim kaydı" : "henüz yazılmadı",
      },
      {
        label: "Alan adı yenileme",
        status: domainExpiry.label,
        tone: domainExpiry.tone,
        note: domainExpiry.note,
      },
      {
        label: "Hosting yenileme",
        status: hostingExpiry.label,
        tone: hostingExpiry.tone,
        note: hostingExpiry.note,
      },
    ],
  };
}

export function buildFinanceSummary(orderRows, invoiceRows) {
  const activePackage = orderRows.find((item) => item.kind === "package" && item.status === "active");
  const latestInvoice = invoiceRows[0];
  const openCount = invoiceRows.filter((item) => item.status === "draft" || item.status === "sent").length;

  return {
    highlights: [
      {
        label: "Aktif paket",
        value: activePackage?.packageName || "Kayıt yok",
        note: activePackage ? softwareOrderStatusLabel(activePackage.status) : "sipariş bekleniyor",
      },
      {
        label: "Son tutar notu",
        value: latestInvoice?.amountNote || "—",
        note: latestInvoice ? formatDate(latestInvoice.createdAt) : "fatura yok",
      },
      {
        label: "Açık kayıt",
        value: openCount ? `${openCount} fatura` : "Yok",
        note: "salt okunur · tahsilat yok",
      },
      {
        label: "Son durum",
        value: latestInvoice ? invoiceStatusLabel(latestInvoice.status) : "—",
        note: "e-Fatura / indirme yok",
      },
    ],
  };
}

export async function loadCustomerPortalSnapshot(customer) {
  const customerId = customer.id;
  const { getDb } = await import("../db");
  const db = getDb();

  const [orderRows, ticketRows, invoiceRows, profileRows, moduleRows, integrationRows, metricRows, notificationRows, experimentRows, documentRows, moduleCatalogRows] = await Promise.all([
    db
      .select({
        id: softwareOrders.id,
        kind: softwareOrders.kind,
        status: softwareOrders.status,
        createdAt: softwareOrders.createdAt,
        priceNote: softwareOrders.priceNote,
        packageName: packages.name,
        moduleName: modules.name,
      })
      .from(softwareOrders)
      .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
      .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
      .where(eq(softwareOrders.customerId, customerId))
      .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
      .limit(8),
    db
      .select({
        id: supportTickets.id,
        subject: supportTickets.subject,
        topic: supportTickets.topic,
        status: supportTickets.status,
        priority: supportTickets.priority,
        createdAt: supportTickets.createdAt,
      })
      .from(supportTickets)
      .where(eq(supportTickets.customerId, customerId))
      .orderBy(desc(supportTickets.createdAt), desc(supportTickets.id))
      .limit(8),
    db
      .select({
        id: softwareInvoices.id,
        title: softwareInvoices.title,
        amountNote: softwareInvoices.amountNote,
        status: softwareInvoices.status,
        createdAt: softwareInvoices.createdAt,
      })
      .from(softwareInvoices)
      .where(eq(softwareInvoices.customerId, customerId))
      .orderBy(desc(softwareInvoices.createdAt), desc(softwareInvoices.id))
      .limit(8),
    db.select().from(customerPortalProfiles).where(eq(customerPortalProfiles.customerId, customerId)).limit(1),
    db.select({ id: customerModuleInstances.id, key: modules.slug, name: modules.name, targetDomain: customerModuleInstances.targetDomain, status: customerModuleInstances.status, coverage: customerModuleInstances.coverage, enabledAt: customerModuleInstances.enabledAt, expiresAt: customerModuleInstances.expiresAt, note: customerModuleInstances.note })
      .from(customerModuleInstances).innerJoin(modules, eq(customerModuleInstances.moduleId, modules.id))
      .where(eq(customerModuleInstances.customerId, customerId)).orderBy(desc(customerModuleInstances.updatedAt)),
    db.select({ id: customerIntegrationInstances.id, providerKey: integrations.providerKey, name: integrations.name, targetDomain: customerIntegrationInstances.targetDomain, category: integrations.category, status: customerIntegrationInstances.status, setupProgress: customerIntegrationInstances.setupProgress, healthScore: customerIntegrationInstances.healthScore, lastSyncAt: customerIntegrationInstances.lastSyncAt, lastErrorSummary: customerIntegrationInstances.lastErrorSummary, publicMetadata: customerIntegrationInstances.publicMetadata })
      .from(customerIntegrationInstances).innerJoin(integrations, eq(customerIntegrationInstances.integrationId, integrations.id))
      .where(eq(customerIntegrationInstances.customerId, customerId)).orderBy(desc(customerIntegrationInstances.updatedAt)),
    db.select().from(customerMetricSnapshots).where(eq(customerMetricSnapshots.customerId, customerId)).orderBy(desc(customerMetricSnapshots.periodEnd), desc(customerMetricSnapshots.id)).limit(100),
    db.select().from(portalNotifications).where(eq(portalNotifications.customerId, customerId)).orderBy(desc(portalNotifications.priority), desc(portalNotifications.createdAt)).limit(30),
    db.select().from(tofyExperiments).where(eq(tofyExperiments.customerId, customerId)).orderBy(desc(tofyExperiments.updatedAt)).limit(20),
    db.select().from(customerPortalDocuments).where(eq(customerPortalDocuments.customerId, customerId)).orderBy(desc(customerPortalDocuments.updatedAt)).limit(20),
    db.select({ id: modules.id, key: modules.slug, name: modules.name, category: modules.category, summary: modules.summary }).from(modules).orderBy(desc(modules.sortOrder)).limit(50),
  ]);

  const profile = profileRows[0];
  const safeJson = (value) => { try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; } };
  const latestMetrics = [];
  const seenMetricKeys = new Set();
  for (const item of metricRows) {
    if (seenMetricKeys.has(item.metricKey)) continue;
    seenMetricKeys.add(item.metricKey);
    latestMetrics.push({ key: item.metricKey, value: item.value, unit: item.unit, source: item.source, periodStart: item.periodStart, periodEnd: item.periodEnd, label: portalMetricLabel(item.metricKey) });
  }
  const publicIntegrations = integrationRows.map((item) => ({ ...item, setupProgress: Math.max(0, Math.min(100, item.setupProgress)), healthScore: Math.max(0, Math.min(100, item.healthScore)), publicMetadata: safeJson(item.publicMetadata) }));
  const openTickets = ticketRows.filter((item) => item.status !== "closed").length;
  const criticalTickets = ticketRows.filter((item) => item.status !== "closed" && item.priority === "critical").length;
  const thresholds = { sslWarningDays: profile?.sslWarningDays ?? 30, tofyClickThresholdBps: profile?.tofyClickThresholdBps ?? 1000, marketplaceSetupDays: profile?.marketplaceSetupDays ?? 7 };
  const ruleNotifications = runPortalRules({ customer, thresholds, metrics: latestMetrics, integrations: publicIntegrations, openTickets, criticalTickets, now: new Date() });
  const now = Date.now();
  const storedNotifications = notificationRows.filter((item) => item.status === "active" && (!item.visibleAt || new Date(item.visibleAt).getTime() <= now) && (!item.expiresAt || new Date(item.expiresAt).getTime() > now)).map((item) => ({ id: `notification-${item.id}`, type: item.type, title: item.title, body: item.body, priority: item.priority, targetSection: item.targetSection, tone: item.type === "critical" ? "critical" : item.type === "success" ? "healthy" : "watch", source: item.source === "system" ? "system" : "admin", createdAt: item.createdAt }));
  const tofy = buildTofySnapshot(metricRows, experimentRows);
  const assignedModuleKeys = new Set(moduleRows.map((item) => item.key));

  return {
    orders: orderRows.map((item) => ({
      id: item.id,
      label: item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket"),
      meta: `${softwareOrderKindLabel(item.kind)} · ${softwareOrderStatusLabel(item.status)}`,
      note: item.priceNote || "Tutar notu yok",
      createdAt: formatDate(item.createdAt),
    })),
    tickets: ticketRows.map((item) => ({
      id: item.id,
      label: item.subject,
      meta: `${ticketTopicLabel(item.topic)} · ${ticketStatusLabel(item.status)}`,
      createdAt: formatDate(item.createdAt),
    })),
    invoices: invoiceRows.map((item) => ({
      id: item.id,
      label: item.title,
      meta: `${item.amountNote || "Tutar yazılmadı"} · ${invoiceStatusLabel(item.status)}`,
      createdAt: formatDate(item.createdAt),
    })),
    stats: {
      orders: orderRows.length,
      tickets: ticketRows.filter((item) => item.status !== "closed").length,
      invoices: invoiceRows.length,
    },
    infrastructure: buildInfrastructureSnapshot(customer),
    finance: buildFinanceSummary(orderRows, invoiceRows),
    branding: {
      companyName: profile?.companyName || customer.company || customer.name,
      logoUrl: profile?.logoUrl || "",
      monogram: profile?.monogram || (customer.company || customer.name || "A").trim().slice(0, 2).toUpperCase(),
      theme: ["avci", "graphite", "energy"].includes(profile?.theme) ? profile.theme : "avci",
      colorMode: profile?.colorMode === "night" ? "night" : "day",
      providerLabel: "Avcı altyapısı",
    },
    thresholds,
    moduleInstances: moduleRows,
    integrationInstances: publicIntegrations,
    metrics: latestMetrics,
    notifications: [...ruleNotifications.map((item) => ({ ...item, createdAt: "" })), ...storedNotifications].sort((a, b) => b.priority - a.priority),
    tofy,
    serviceHealth: { tone: criticalTickets ? "critical" : openTickets ? "watch" : "healthy", score: latestMetrics.find((item) => item.key === "service_health_score")?.value ?? null, openTickets, criticalTickets, firstResponseMinutes: latestMetrics.find((item) => item.key === "sla_first_response_minutes")?.value ?? null, label: criticalTickets ? "Kritik talep var" : openTickets ? "Takipte" : "Sağlıklı" },
    onboarding: { status: profile?.onboardingStatus || "not_started", progress: Math.max(0, Math.min(5, profile?.onboardingProgress ?? 0)), total: 5 },
    documents: documentRows.filter((item) => item.status === "active" && item.url),
    weeklyReport: latestMetrics.length ? {
      periodEnd: latestMetrics[0]?.periodEnd || "",
      highlights: latestMetrics.filter((item) => ["service_health_score", "tofy_click_rate_bps", "tofy_cart_additions", "sla_first_response_minutes"].includes(item.key)),
      source: "metric_snapshots",
    } : null,
    upgradeOpportunities: moduleCatalogRows.filter((item) => !assignedModuleKeys.has(item.key)).map((item) => ({ ...item, label: "Kapsam dışında" })),
  };
}
