import { desc, eq } from "drizzle-orm";
import { modules, packages, softwareInvoices, softwareOrders, supportTickets } from "../db/schema";
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

  const [orderRows, ticketRows, invoiceRows] = await Promise.all([
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
  ]);

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
  };
}
