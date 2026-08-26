import { eq } from "drizzle-orm";
import {
  customerIntegrationInstances, customerModuleInstances, customerPortalDocuments, customerPortalProfiles, portalNotifications, tofyExperiments,
} from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../../admin-request.mjs";
import { logAdminAction } from "../../../../../audit-log.mjs";

const STATUSES = new Set(["planned", "setup", "active", "paused", "expired"]);
const THEMES = new Set(["avci", "graphite", "energy"]);
const MODES = new Set(["day", "night"]);
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
};
const text = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);
const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);
  const failure = validateAdminMutationRequest(request);
  if (failure) return json({ ok: false, error: failure.error }, failure.status);
  const parsed = await readAdminJsonObject<Record<string, unknown>>(request);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  const customerId = Number((await params).id);
  if (!Number.isSafeInteger(customerId) || customerId < 1) return json({ ok: false, error: "Geçersiz müşteri." }, 400);
  const data = parsed.value;
  const action = text(data.action, 40);
  const now = new Date().toISOString();

  try {
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    if (action === "profile" || action === "thresholds") {
      const current = await db.select().from(customerPortalProfiles).where(eq(customerPortalProfiles.customerId, customerId)).limit(1);
      const profile = current[0];
      const values = action === "profile" ? {
        companyName: text(data.companyName, 120), logoUrl: text(data.logoUrl, 500), monogram: text(data.monogram, 3).toUpperCase(),
        theme: THEMES.has(String(data.theme)) ? String(data.theme) : "avci", colorMode: MODES.has(String(data.colorMode)) ? String(data.colorMode) : "day",
        onboardingStatus: ["not_started", "in_progress", "complete"].includes(String(data.onboardingStatus)) ? String(data.onboardingStatus) : "not_started",
        onboardingProgress: clamp(data.onboardingProgress, 0, 5, 0), updatedAt: now,
      } : {
        sslWarningDays: clamp(data.sslWarningDays, 1, 365, 30), tofyClickThresholdBps: clamp(Number(data.tofyClickThresholdPercent) * 100, 1, 10000, 1000),
        marketplaceSetupDays: clamp(data.marketplaceSetupDays, 1, 180, 7), updatedAt: now,
      };
      if (profile) await db.update(customerPortalProfiles).set(values).where(eq(customerPortalProfiles.customerId, customerId));
      else await db.insert(customerPortalProfiles).values({ customerId, ...values, createdAt: now });
    } else if (action === "module") {
      const moduleId = clamp(data.moduleId, 1, 1_000_000, 0);
      const status = STATUSES.has(String(data.status)) ? String(data.status) : "planned";
      if (!moduleId) return json({ ok: false, error: "Modül seçin." }, 400);
      await db.insert(customerModuleInstances).values({ customerId, moduleId, status, coverage: text(data.coverage, 160), note: text(data.note, 500), enabledAt: status === "active" ? now : "", updatedAt: now })
        .onConflictDoUpdate({ target: [customerModuleInstances.customerId, customerModuleInstances.moduleId], set: { status, coverage: text(data.coverage, 160), note: text(data.note, 500), updatedAt: now } });
    } else if (action === "integration") {
      const integrationId = clamp(data.integrationId, 1, 1_000_000, 0);
      const status = STATUSES.has(String(data.status)) ? String(data.status) : "planned";
      if (!integrationId) return json({ ok: false, error: "Entegrasyon seçin." }, 400);
      const values = { status, setupProgress: clamp(data.setupProgress, 0, 100, 0), healthScore: clamp(data.healthScore, 0, 100, 0), lastErrorSummary: text(data.lastErrorSummary, 500), updatedAt: now };
      await db.insert(customerIntegrationInstances).values({ customerId, integrationId, ...values }).onConflictDoUpdate({ target: [customerIntegrationInstances.customerId, customerIntegrationInstances.integrationId], set: values });
    } else if (action === "notification") {
      const title = text(data.title, 120);
      if (!title) return json({ ok: false, error: "Bildirim başlığı gerekli." }, 400);
      await db.insert(portalNotifications).values({ customerId, title, body: text(data.body, 600), type: ["info", "success", "warning", "critical"].includes(String(data.type)) ? String(data.type) : "info", priority: clamp(data.priority, 0, 100, 10), targetSection: text(data.targetSection, 32) || "ozet", source: "admin", visibleAt: now, createdAt: now, updatedAt: now });
    } else if (action === "experiment") {
      const name = text(data.name, 140);
      if (!name) return json({ ok: false, error: "Deney adı gerekli." }, 400);
      await db.insert(tofyExperiments).values({ customerId, name, kind: text(data.kind, 40) || "copy", status: ["draft", "active", "complete", "paused"].includes(String(data.status)) ? String(data.status) : "draft", controlLabel: text(data.controlLabel, 100) || "Kontrol", variantLabel: text(data.variantLabel, 100) || "Varyant", startsAt: now, createdAt: now, updatedAt: now });
    } else if (action === "document") {
      const title = text(data.title, 140);
      const url = text(data.url, 500);
      if (!title || !/^https?:\/\//i.test(url)) return json({ ok: false, error: "Doküman adı ve güvenli bağlantı gerekli." }, 400);
      await db.insert(customerPortalDocuments).values({ customerId, title, url, category: text(data.category, 40) || "document", status: "active", createdAt: now, updatedAt: now });
    } else return json({ ok: false, error: "Bilinmeyen işlem." }, 400);

    await logAdminAction(db, { userEmail: admin.user.email, action: "portal_update", entity: "customer_portal", entityId: customerId, details: { action } });
    return json({ ok: true });
  } catch (cause) {
    console.error("Customer portal management update failed", cause);
    return json({ ok: false, error: "Portal ayarı kaydedilemedi." }, 503);
  }
}
