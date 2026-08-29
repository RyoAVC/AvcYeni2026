import { and, desc, eq } from "drizzle-orm";
import { infrastructureIncidents, uptimeMonitors } from "../../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../../control-desk-auth.mjs";
import { probeMonitor, nextMonitorState } from "../../../../../infrastructure-health-worker.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

function safeSecretEqual(left: string, right: string) {
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length > 31 && a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const env = await readRuntimeEnv();
  const workerSecret = String(env.INFRASTRUCTURE_WORKER_SECRET || "");
  const suppliedSecret = String(request.headers.get("x-avci-infrastructure-worker") || "");
  const workerAuthorized = safeSecretEqual(workerSecret, suppliedSecret);
  if (!workerAuthorized) {
    const auth = await authorizeControlDesk(request);
    if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status, request);
    if (!hasControlDeskRole(auth, ["platform_owner", "support_operator"])) return controlDeskJson({ ok: false, error: "Sağlık kontrolü yetkiniz yok." }, 403, request);
  }
  await ensureCommerceLicenseTables(env);
  const { getDb } = await import("../../../../../../db");
  const db = getDb();
  const monitors = await db.select().from(uptimeMonitors).orderBy(desc(uptimeMonitors.updatedAt)).limit(200);
  const checkedAt = new Date();
  const results = [];
  for (const monitor of monitors) {
    const probe = await probeMonitor(monitor);
    const state = nextMonitorState(monitor, probe, checkedAt);
    const now = checkedAt.toISOString();
    await db.update(uptimeMonitors).set({ status: state.status, consecutiveFailures: state.consecutiveFailures, lastHttpStatus: probe.httpStatus, lastResponseMs: probe.responseMs, sslExpiresAt: probe.sslExpiresAt, lastCheckedAt: now, updatedAt: now }).where(and(eq(uptimeMonitors.id, monitor.id), eq(uptimeMonitors.customerId, monitor.customerId)));
    if (state.shouldOpenIncident) {
      const open = await db.select({ id: infrastructureIncidents.id }).from(infrastructureIncidents).where(and(eq(infrastructureIncidents.customerId, monitor.customerId), eq(infrastructureIncidents.monitorId, monitor.id), eq(infrastructureIncidents.type, state.incidentType), eq(infrastructureIncidents.status, "open"))).limit(1);
      if (!open.length) await db.insert(infrastructureIncidents).values({ customerId: monitor.customerId, monitorId: monitor.id, type: state.incidentType, severity: "critical", title: `${monitor.domain} erişilemiyor`, safeSummary: `Sağlık kontrolü kodu: ${probe.safeCode}`, status: "open", openedAt: now, createdAt: now, updatedAt: now });
    }
    if (state.shouldResolveIncident) await db.update(infrastructureIncidents).set({ status: "resolved", resolvedAt: now, updatedAt: now }).where(and(eq(infrastructureIncidents.customerId, monitor.customerId), eq(infrastructureIncidents.monitorId, monitor.id), eq(infrastructureIncidents.status, "open")));
    results.push({ monitorId: monitor.id, customerId: monitor.customerId, domain: monitor.domain, status: state.status, httpStatus: probe.httpStatus, responseMs: probe.responseMs, sslExpiresAt: probe.sslExpiresAt, safeCode: probe.safeCode });
  }
  return controlDeskJson({ ok: true, format: "avci-control-desk.infrastructure-check.v1", checked: results.length, results, checkedAt: checkedAt.toISOString() }, 200, request);
}
