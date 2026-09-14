import { and, eq, inArray } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs } from "../db/schema";
import { sha256 } from "./commerce-license-control-plane.mjs";

function randomToken(prefix, bytes = 30) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  const encoded = btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `${prefix}${encoded}`;
}

/**
 * Shared by the Control Desk install-jobs API (real customers, via the
 * desktop app) and the admin "Mağaza demosu oluştur" action (demo licenses).
 * Both mutate the same commerce_install_jobs table directly rather than one
 * calling the other's HTTP endpoint, since they're already part of the same
 * app and the Control Desk endpoint requires OAuth bearer auth the admin
 * panel's cookie session doesn't carry.
 *
 * @param {{id:number,customerId:number,storeKey:string,installationId:string,primaryDomain:string}} license
 * @returns {Promise<{jobId:string,enrollmentToken:string,expiresAt:string}>}
 */
export async function createInstallJob(db, license, environment = "production") {
  const now = new Date();
  const activeRows = await db
    .select({
      id: commerceInstallJobs.id,
      jobId: commerceInstallJobs.jobId,
      status: commerceInstallJobs.status,
      currentStep: commerceInstallJobs.currentStep,
      enrollmentExpiresAt: commerceInstallJobs.enrollmentExpiresAt,
    })
    .from(commerceInstallJobs)
    .where(and(eq(commerceInstallJobs.licenseId, license.id), inArray(commerceInstallJobs.status, ["queued", "running", "ready"])))
    .limit(20);

  for (const job of activeRows) {
    const expiredEnrollment = job.status === "queued" && job.currentStep === "enrollment" && Date.parse(job.enrollmentExpiresAt) <= now.getTime();
    if (!expiredEnrollment) continue;
    await db.update(commerceInstallJobs).set({ status: "failed", currentStep: "enrollment_expired", updatedAt: now.toISOString() }).where(eq(commerceInstallJobs.id, job.id));
    await db.insert(commerceInstallJobEvents).values({ jobId: job.jobId, status: "failed", step: "enrollment_expired", safeCode: "enrollment_expired", createdAt: now.toISOString() });
  }
  const blocking = activeRows.some((job) => !(job.status === "queued" && job.currentStep === "enrollment" && Date.parse(job.enrollmentExpiresAt) <= now.getTime()));
  if (blocking) {
    throw new Error("Bu kurulum için zaten açık bir iş var.");
  }

  const enrollmentToken = randomToken("aci_enroll_");
  const jobId = `install-${crypto.randomUUID()}`;
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  await db.insert(commerceInstallJobs).values({
    jobId,
    licenseId: license.id,
    customerId: license.customerId,
    storeKey: license.storeKey,
    installationId: license.installationId,
    targetDomain: license.primaryDomain,
    environment,
    status: "queued",
    currentStep: "enrollment",
    enrollmentTokenHash: await sha256(enrollmentToken),
    enrollmentExpiresAt: expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  await db.insert(commerceInstallJobEvents).values({ jobId, status: "queued", step: "enrollment", safeCode: "job_created", createdAt: now.toISOString() });

  return { jobId, enrollmentToken, expiresAt };
}
