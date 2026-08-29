import { desc, eq, inArray } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs, commerceLicenseInstallations, customers, supportTickets } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic = "force-dynamic";

function healthOf(lastSeenAt: string, status: string) {
  if (!["active", "trial"].includes(status) || !lastSeenAt) return "offline";
  const age = Date.now() - new Date(lastSeenAt).getTime();
  if (!Number.isFinite(age) || age > 24 * 60 * 60 * 1000) return "offline";
  return age > 30 * 60 * 1000 ? "warning" : "healthy";
}

export async function GET(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status);
  if (!hasControlDeskRole(auth, ["platform_owner", "support_operator", "installer", "customer_owner", "customer_viewer"])) return controlDeskJson({ ok:false, error:"Bu işlem için yetkiniz yok." },403,request);
  try {
    await ensureCommerceLicenseTables(auth.env);
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const scopedCustomerId=Number(auth.customerId||0);
    const customerScoped = scopedCustomerId > 0;
    const [customerRows, licenseRows, jobRows, ticketRows] = await Promise.all([
      customerScoped
        ? db.select({ id: customers.id, name: customers.name, company: customers.company, email: customers.email, phone: customers.phone, city: customers.city, domainName: customers.domainName, domainExpiresAt: customers.domainExpiresAt, hostingExpiresAt: customers.hostingExpiresAt, status: customers.status }).from(customers).where(eq(customers.id, scopedCustomerId)).limit(1)
        : db.select({ id: customers.id, name: customers.name, company: customers.company, email: customers.email, phone: customers.phone, city: customers.city, domainName: customers.domainName, domainExpiresAt: customers.domainExpiresAt, hostingExpiresAt: customers.hostingExpiresAt, status: customers.status }).from(customers).where(eq(customers.status, "active")).orderBy(desc(customers.updatedAt)).limit(500),
      customerScoped
        ? db.select().from(commerceLicenseInstallations).where(eq(commerceLicenseInstallations.customerId, scopedCustomerId)).orderBy(desc(commerceLicenseInstallations.updatedAt)).limit(1000)
        : db.select().from(commerceLicenseInstallations).where(inArray(commerceLicenseInstallations.status, ["trial", "active", "suspended", "revoked"])).orderBy(desc(commerceLicenseInstallations.updatedAt)).limit(1000),
      customerScoped
        ? db.select().from(commerceInstallJobs).where(eq(commerceInstallJobs.customerId, scopedCustomerId)).orderBy(desc(commerceInstallJobs.updatedAt)).limit(200)
        : db.select().from(commerceInstallJobs).orderBy(desc(commerceInstallJobs.updatedAt)).limit(200),
      customerScoped
        ? db.select({ id: supportTickets.id, customerId: supportTickets.customerId, subject: supportTickets.subject, topic: supportTickets.topic, status: supportTickets.status, priority: supportTickets.priority, firstRespondedAt: supportTickets.firstRespondedAt, createdAt: supportTickets.createdAt, updatedAt: supportTickets.updatedAt }).from(supportTickets).where(eq(supportTickets.customerId, scopedCustomerId)).orderBy(desc(supportTickets.updatedAt)).limit(100)
        : db.select({ id: supportTickets.id, customerId: supportTickets.customerId, subject: supportTickets.subject, topic: supportTickets.topic, status: supportTickets.status, priority: supportTickets.priority, firstRespondedAt: supportTickets.firstRespondedAt, createdAt: supportTickets.createdAt, updatedAt: supportTickets.updatedAt }).from(supportTickets).orderBy(desc(supportTickets.updatedAt)).limit(500),
    ]);
    const eventRows = jobRows.length
      ? await db.select({ jobId: commerceInstallJobEvents.jobId, status: commerceInstallJobEvents.status, step: commerceInstallJobEvents.step, safeCode: commerceInstallJobEvents.safeCode, createdAt: commerceInstallJobEvents.createdAt }).from(commerceInstallJobEvents).where(inArray(commerceInstallJobEvents.jobId, jobRows.map((job) => job.jobId))).orderBy(desc(commerceInstallJobEvents.createdAt)).limit(2000)
      : [];
    const eventsByJob = new Map<string, typeof eventRows>();
    for (const event of eventRows) eventsByJob.set(event.jobId, [...(eventsByJob.get(event.jobId) || []), event]);
    const customerMap = new Map(customerRows.map((customer) => [customer.id, customer]));
    const licenses = licenseRows.map((license) => ({
      id: license.id,
      customerId: license.customerId,
      company: customerMap.get(license.customerId)?.company || customerMap.get(license.customerId)?.name || "",
      domain: license.primaryDomain,
      storeKey: license.storeKey,
      installationId: license.installationId,
      plan: license.plan,
      status: license.status,
      validUntil: license.validUntil,
      version: license.lastSeenVersion || license.commerceVersion,
      lastSeenAt: license.lastSeenAt,
    }));
    return controlDeskJson({
      ok: true,
      format: "avci-control-desk.snapshot.v1",
      generatedAt: new Date().toISOString(),
      customers: customerRows,
      licenses,
      stores: licenses.filter((license) => Boolean(license.lastSeenAt)).map((license) => ({ ...license, health: healthOf(license.lastSeenAt, license.status) })),
      installJobs: jobRows.map((job) => ({ id: job.id, jobId: job.jobId, customerId: job.customerId, domain: job.targetDomain, storeKey: job.storeKey, environment: job.environment, status: job.status, step: job.currentStep, safeSummary: job.safeSummary, createdAt: job.createdAt, completedAt: job.completedAt, lastSeenAt: job.updatedAt, events: eventsByJob.get(job.jobId) || [] })),
      supportTickets: ticketRows,
      viewer: { email: auth.email, displayName: auth.displayName, roles: auth.roles, customerId: auth.customerId || null },
      capabilities: { licenseCreate: hasControlDeskRole(auth,["platform_owner"]), remoteInstall: hasControlDeskRole(auth,["platform_owner","installer","customer_owner"]), signedReleaseAssignment: hasControlDeskRole(auth,["platform_owner","installer"]), auditRead: hasControlDeskRole(auth,["platform_owner","support_operator"]) },
    });
  } catch (cause) {
    console.error("Control Desk snapshot failed", cause);
    return controlDeskJson({ ok: false, error: "Canlı operasyon verisi şu anda alınamadı." }, 503);
  }
}
