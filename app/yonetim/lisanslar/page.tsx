import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { commerceLicenseInstallations, customerIntegrationInstances, customerModuleInstances, customers, softwareInvoices } from "../../../db/schema";
import { requireAdminUser } from "../../admin-auth";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";
import { AdminShell } from "../admin-shell";
import { LicenseCenter } from "./license-center";
import "./licenses.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lisans Yönetimi | Avcı E-Ticaret", robots: { index: false, follow: false } };

export default async function LicensesPage() {
  const admin = await requireAdminUser("/yonetim/lisanslar");
  if (!admin.authorized || !admin.user) return null;
  await ensureCommerceLicenseTables(await readRuntimeEnv());
  const { getDb } = await import("../../../db");
  const db = getDb();
  const [customerRows, licenses, modules, integrations, invoices] = await Promise.all([
    db.select({ id: customers.id, name: customers.name, company: customers.company, email: customers.email }).from(customers).orderBy(asc(customers.company), asc(customers.name)),
    db.select().from(commerceLicenseInstallations).orderBy(asc(commerceLicenseInstallations.validUntil)),
    db.select({ customerId: customerModuleInstances.customerId, targetDomain: customerModuleInstances.targetDomain, status: customerModuleInstances.status }).from(customerModuleInstances),
    db.select({ customerId: customerIntegrationInstances.customerId, targetDomain: customerIntegrationInstances.targetDomain, status: customerIntegrationInstances.status }).from(customerIntegrationInstances),
    db.select({ customerId: softwareInvoices.customerId, status: softwareInvoices.status }).from(softwareInvoices),
  ]);
  const enriched = licenses.map((license) => ({
    ...license,
    activeModules: modules.filter((item) => item.customerId === license.customerId && item.status === "active" && (!item.targetDomain || item.targetDomain === license.primaryDomain)).length,
    activeIntegrations: integrations.filter((item) => item.customerId === license.customerId && item.status === "active" && (!item.targetDomain || item.targetDomain === license.primaryDomain)).length,
    openInvoices: invoices.filter((item) => item.customerId === license.customerId && ["draft", "sent", "overdue"].includes(item.status)).length,
  }));
  return <AdminShell current="lisanslar" displayName={admin.user.displayName}><LicenseCenter customers={customerRows} licenses={enriched} /></AdminShell>;
}
