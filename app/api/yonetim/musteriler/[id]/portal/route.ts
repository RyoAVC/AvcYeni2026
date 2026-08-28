import { and, eq } from "drizzle-orm";
import {
  customerIntegrationInstances,
  customerModuleInstances,
  customerPortalDocuments,
  customerPortalProfiles,
  portalNotifications,
  tofyExperiments,
  commerceLicenseInstallations,
  integrations,
  modules,
} from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import {
  readAdminJsonObject,
  validateAdminMutationRequest,
} from "../../../../../admin-request.mjs";
import { logAdminAction } from "../../../../../audit-log.mjs";
import {
  createActivationToken,
  normalizeCommerceDomain,
  parseLimits,
  parseScopes,
  sha256,
  validCommerceIdentifier,
} from "../../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

const STATUSES = new Set(["planned", "setup", "active", "paused", "expired"]);
const THEMES = new Set(["avci", "graphite", "energy"]);
const MODES = new Set(["day", "night"]);
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(min, Math.min(max, Math.round(number)))
    : fallback;
};
const text = (value: unknown, max = 240) =>
  String(value ?? "")
    .trim()
    .slice(0, max);
const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function updateScopeList(raw: string, scope: string, enabled: boolean) {
  let values: string[] = [];
  try {
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) values = parsed.map(String);
  } catch {
    values = [];
  }
  const next = new Set(values);
  if (enabled) next.add(scope);
  else next.delete(scope);
  return JSON.stringify([...next].sort());
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin.user)
    return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized)
    return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);
  const failure = validateAdminMutationRequest(request);
  if (failure) return json({ ok: false, error: failure.error }, failure.status);
  const parsed = await readAdminJsonObject<Record<string, unknown>>(request);
  if (!parsed.ok)
    return json({ ok: false, error: parsed.error }, parsed.status);
  const customerId = Number((await params).id);
  if (!Number.isSafeInteger(customerId) || customerId < 1)
    return json({ ok: false, error: "Geçersiz müşteri." }, 400);
  const data = parsed.value;
  const action = text(data.action, 40);
  const now = new Date().toISOString();

  try {
    await ensureCommerceLicenseTables(await readRuntimeEnv());
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    if (action === "profile" || action === "thresholds") {
      const current = await db
        .select()
        .from(customerPortalProfiles)
        .where(eq(customerPortalProfiles.customerId, customerId))
        .limit(1);
      const profile = current[0];
      const values =
        action === "profile"
          ? {
              companyName: text(data.companyName, 120),
              logoUrl: text(data.logoUrl, 500),
              monogram: text(data.monogram, 3).toUpperCase(),
              theme: THEMES.has(String(data.theme))
                ? String(data.theme)
                : "avci",
              colorMode: MODES.has(String(data.colorMode))
                ? String(data.colorMode)
                : "day",
              onboardingStatus: [
                "not_started",
                "in_progress",
                "complete",
              ].includes(String(data.onboardingStatus))
                ? String(data.onboardingStatus)
                : "not_started",
              onboardingProgress: clamp(data.onboardingProgress, 0, 5, 0),
              updatedAt: now,
            }
          : {
              sslWarningDays: clamp(data.sslWarningDays, 1, 365, 30),
              tofyClickThresholdBps: clamp(
                Number(data.tofyClickThresholdPercent) * 100,
                1,
                10000,
                1000,
              ),
              marketplaceSetupDays: clamp(data.marketplaceSetupDays, 1, 180, 7),
              updatedAt: now,
            };
      if (profile)
        await db
          .update(customerPortalProfiles)
          .set(values)
          .where(eq(customerPortalProfiles.customerId, customerId));
      else
        await db
          .insert(customerPortalProfiles)
          .values({ customerId, ...values, createdAt: now });
    } else if (action === "commerce-license-status") {
      const licenseId = clamp(data.licenseId, 1, 1_000_000_000, 0);
      const status = ["trial", "active", "suspended", "revoked"].includes(
        String(data.status),
      )
        ? String(data.status)
        : "";
      if (!licenseId || !status)
        return json({ ok: false, error: "Lisans ve durum seçin." }, 400);
      const [license] = await db
        .select({ id: commerceLicenseInstallations.id })
        .from(commerceLicenseInstallations)
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        )
        .limit(1);
      if (!license)
        return json({ ok: false, error: "Lisans bulunamadı." }, 404);
      await db
        .update(commerceLicenseInstallations)
        .set({ status, updatedAt: now })
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        );
      await logAdminAction(db, {
        userEmail: admin.user.email,
        action: "commerce_license_status",
        entity: "commerce_license_installation",
        entityId: String(licenseId),
        details: { customerId, status },
      });
      return json({ ok: true });
    } else if (action === "commerce-license-maintenance") {
      const licenseId = clamp(data.licenseId, 1, 1_000_000_000, 0);
      const operation = ["renew", "rotate"].includes(String(data.operation))
        ? String(data.operation)
        : "";
      const [license] = await db
        .select()
        .from(commerceLicenseInstallations)
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        )
        .limit(1);
      if (!license || !operation)
        return json(
          { ok: false, error: "Lisans veya bakım işlemi bulunamadı." },
          404,
        );
      if (operation === "rotate") {
        const activationToken = createActivationToken();
        await db
          .update(commerceLicenseInstallations)
          .set({
            activationTokenHash: await sha256(activationToken),
            activationCount: 0,
            firstActivatedAt: "",
            updatedAt: now,
          })
          .where(eq(commerceLicenseInstallations.id, licenseId));
        await logAdminAction(db, {
          userEmail: admin.user.email,
          action: "commerce_license_key_rotated",
          entity: "commerce_license_installation",
          entityId: String(licenseId),
          details: {
            customerId,
            domain: license.primaryDomain,
            installationId: license.installationId,
          },
        });
        return json({ ok: true, activationToken });
      }
      const validUntil = new Date(text(data.validUntil, 40));
      if (!Number.isFinite(validUntil.getTime()) || validUntil <= new Date())
        return json(
          { ok: false, error: "Yeni geçerlilik tarihi gelecekte olmalı." },
          400,
        );
      await db
        .update(commerceLicenseInstallations)
        .set({
          validUntil: validUntil.toISOString(),
          status: "active",
          updatedAt: now,
        })
        .where(eq(commerceLicenseInstallations.id, licenseId));
      await logAdminAction(db, {
        userEmail: admin.user.email,
        action: "commerce_license_renewed",
        entity: "commerce_license_installation",
        entityId: String(licenseId),
        details: { customerId, validUntil: validUntil.toISOString() },
      });
      return json({ ok: true });
    } else if (action === "commerce-license-delete") {
      const licenseId = clamp(data.licenseId, 1, 1_000_000_000, 0);
      const confirmation = normalizeCommerceDomain(data.confirmation);
      const [license] = await db
        .select()
        .from(commerceLicenseInstallations)
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        )
        .limit(1);
      if (!license)
        return json({ ok: false, error: "Lisans bulunamadı." }, 404);
      if (confirmation !== normalizeCommerceDomain(license.primaryDomain))
        return json(
          {
            ok: false,
            error: "Kalıcı silme için lisans domainini eksiksiz yazın.",
          },
          400,
        );
      if (license.status !== "revoked")
        return json(
          {
            ok: false,
            error:
              "Kalıcı silmeden önce lisans durumunu İptal olarak kaydedin.",
          },
          409,
        );
      if ((license.activationCount || 0) > 0 || license.firstActivatedAt)
        return json(
          {
            ok: false,
            error:
              "Daha önce kullanılmış lisans kalıcı silinemez; denetim geçmişi için İptal durumunda korunur.",
          },
          409,
        );
      await db
        .delete(commerceLicenseInstallations)
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        );
      await logAdminAction(db, {
        userEmail: admin.user.email,
        action: "commerce_license_deleted",
        entity: "commerce_license_installation",
        entityId: String(licenseId),
        details: {
          customerId,
          domain: license.primaryDomain,
          storeKey: license.storeKey,
          installationId: license.installationId,
        },
      });
      return json({ ok: true, deleted: true });
    } else if (action === "commerce-license-commercial") {
      const licenseId = clamp(data.licenseId, 1, 1_000_000_000, 0);
      const billingCycle = ["monthly", "annual", "custom"].includes(
        String(data.billingCycle),
      )
        ? String(data.billingCycle)
        : "annual";
      const paymentStatus = ["paid", "pending", "overdue", "blocked"].includes(
        String(data.paymentStatus),
      )
        ? String(data.paymentStatus)
        : "pending";
      const penaltyStatus = ["none", "warning", "penalty", "legal"].includes(
        String(data.penaltyStatus),
      )
        ? String(data.penaltyStatus)
        : "none";
      const status = ["trial", "active", "suspended", "revoked"].includes(
        String(data.status),
      )
        ? String(data.status)
        : "active";
      const [license] = await db
        .select({ id: commerceLicenseInstallations.id })
        .from(commerceLicenseInstallations)
        .where(
          and(
            eq(commerceLicenseInstallations.id, licenseId),
            eq(commerceLicenseInstallations.customerId, customerId),
          ),
        )
        .limit(1);
      if (!license)
        return json({ ok: false, error: "Lisans bulunamadı." }, 404);
      const nextPaymentRaw = text(data.nextPaymentAt, 40);
      const nextPayment = nextPaymentRaw ? new Date(nextPaymentRaw) : null;
      if (nextPayment && !Number.isFinite(nextPayment.getTime()))
        return json({ ok: false, error: "Ödeme tarihi geçersiz." }, 400);
      await db
        .update(commerceLicenseInstallations)
        .set({
          billingCycle,
          billingAmount: text(data.billingAmount, 40),
          paymentStatus,
          nextPaymentAt: nextPayment?.toISOString() || "",
          penaltyStatus,
          penaltyNote: text(data.penaltyNote, 500),
          suspensionReason: text(data.suspensionReason, 500),
          status,
          updatedAt: now,
        })
        .where(eq(commerceLicenseInstallations.id, licenseId));
      await logAdminAction(db, {
        userEmail: admin.user.email,
        action: "commerce_license_commercial_update",
        entity: "commerce_license_installation",
        entityId: String(licenseId),
        details: {
          customerId,
          billingCycle,
          paymentStatus,
          penaltyStatus,
          status,
        },
      });
      return json({ ok: true });
    } else if (action === "commerce-license") {
      const storeKey = text(data.storeKey, 96);
      const installationId = text(data.installationId, 96);
      const primaryDomain = normalizeCommerceDomain(data.primaryDomain);
      const plan = text(data.plan, 40).toLowerCase();
      const commerceVersion = text(data.commerceVersion, 32);
      const validUntil = new Date(text(data.validUntil, 40));
      const scopes = parseScopes(data.scopes);
      let limits: Record<string, number>;
      try {
        limits = parseLimits(data.limits);
      } catch {
        return json(
          { ok: false, error: "Kullanım limitleri geçerli JSON olmalı." },
          400,
        );
      }
      if (
        !validCommerceIdentifier(storeKey) ||
        !validCommerceIdentifier(installationId) ||
        !primaryDomain ||
        !/^[a-z0-9][a-z0-9._-]{1,39}$/.test(plan) ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(commerceVersion) ||
        !Number.isFinite(validUntil.getTime()) ||
        validUntil <= new Date()
      ) {
        return json(
          {
            ok: false,
            error: "Mağaza kimliği, domain, sürüm veya lisans tarihi geçersiz.",
          },
          400,
        );
      }
      const activationToken = createActivationToken();
      const billingCycle = ["monthly", "annual", "custom"].includes(
        String(data.billingCycle),
      )
        ? String(data.billingCycle)
        : "annual";
      const paymentStatus = ["paid", "pending", "overdue", "blocked"].includes(
        String(data.paymentStatus),
      )
        ? String(data.paymentStatus)
        : "pending";
      const nextPaymentRaw = text(data.nextPaymentAt, 40);
      const nextPayment = nextPaymentRaw ? new Date(nextPaymentRaw) : null;
      const values = {
        customerId,
        primaryDomain,
        product: "avci-commerce",
        plan,
        commerceVersion,
        scopesJson: JSON.stringify(scopes),
        limitsJson: JSON.stringify(limits),
        activationTokenHash: await sha256(activationToken),
        activationCount: 0,
        firstActivatedAt: "",
        billingCycle,
        billingAmount: text(data.billingAmount, 40),
        paymentStatus,
        nextPaymentAt:
          nextPayment && Number.isFinite(nextPayment.getTime())
            ? nextPayment.toISOString()
            : "",
        penaltyStatus: "none",
        penaltyNote: "",
        suspensionReason: "",
        status: "active",
        validUntil: validUntil.toISOString(),
        updatedAt: now,
      };
      await db
        .insert(commerceLicenseInstallations)
        .values({ storeKey, installationId, ...values, createdAt: now })
        .onConflictDoUpdate({
          target: [
            commerceLicenseInstallations.storeKey,
            commerceLicenseInstallations.installationId,
          ],
          set: values,
        });
      await logAdminAction(db, {
        userEmail: admin.user.email,
        action: "commerce_license_provision",
        entity: "commerce_license_installation",
        entityId: customerId,
        details: { storeKey, installationId, primaryDomain, scopes },
      });
      return json({ ok: true, activationToken, publicKeyRequired: true });
    } else if (action === "module") {
      const moduleId = clamp(data.moduleId, 1, 1_000_000, 0);
      const status = STATUSES.has(String(data.status))
        ? String(data.status)
        : "planned";
      const targetDomain = normalizeCommerceDomain(data.targetDomain);
      if (!moduleId || !targetDomain)
        return json(
          { ok: false, error: "Modül ve lisanslı domain seçin." },
          400,
        );
      const [[catalog], [license]] = await Promise.all([
        db
          .select({ slug: modules.slug })
          .from(modules)
          .where(eq(modules.id, moduleId))
          .limit(1),
        db
          .select({
            id: commerceLicenseInstallations.id,
            scopesJson: commerceLicenseInstallations.scopesJson,
          })
          .from(commerceLicenseInstallations)
          .where(
            and(
              eq(commerceLicenseInstallations.customerId, customerId),
              eq(commerceLicenseInstallations.primaryDomain, targetDomain),
            ),
          )
          .limit(1),
      ]);
      if (!catalog || !license)
        return json(
          {
            ok: false,
            error: "Modül veya bu müşteriye ait lisanslı domain bulunamadı.",
          },
          404,
        );
      await db
        .insert(customerModuleInstances)
        .values({
          customerId,
          moduleId,
          targetDomain,
          status,
          coverage: text(data.coverage, 160),
          note: text(data.note, 500),
          enabledAt: status === "active" ? now : "",
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            customerModuleInstances.customerId,
            customerModuleInstances.moduleId,
          ],
          set: {
            targetDomain,
            status,
            coverage: text(data.coverage, 160),
            note: text(data.note, 500),
            updatedAt: now,
          },
        });
      await db
        .update(commerceLicenseInstallations)
        .set({
          scopesJson: updateScopeList(
            license.scopesJson,
            `addon.${catalog.slug}`,
            status === "active",
          ),
          updatedAt: now,
        })
        .where(eq(commerceLicenseInstallations.id, license.id));
    } else if (action === "integration") {
      const integrationId = clamp(data.integrationId, 1, 1_000_000, 0);
      const status = STATUSES.has(String(data.status))
        ? String(data.status)
        : "planned";
      const targetDomain = normalizeCommerceDomain(data.targetDomain);
      if (!integrationId || !targetDomain)
        return json(
          { ok: false, error: "Entegrasyon ve lisanslı domain seçin." },
          400,
        );
      const [[catalog], [license]] = await Promise.all([
        db
          .select({ providerKey: integrations.providerKey })
          .from(integrations)
          .where(eq(integrations.id, integrationId))
          .limit(1),
        db
          .select({
            id: commerceLicenseInstallations.id,
            scopesJson: commerceLicenseInstallations.scopesJson,
          })
          .from(commerceLicenseInstallations)
          .where(
            and(
              eq(commerceLicenseInstallations.customerId, customerId),
              eq(commerceLicenseInstallations.primaryDomain, targetDomain),
            ),
          )
          .limit(1),
      ]);
      if (!catalog || !license)
        return json(
          {
            ok: false,
            error:
              "Entegrasyon veya bu müşteriye ait lisanslı domain bulunamadı.",
          },
          404,
        );
      const values = {
        targetDomain,
        status,
        setupProgress: clamp(data.setupProgress, 0, 100, 0),
        healthScore: clamp(data.healthScore, 0, 100, 0),
        lastErrorSummary: text(data.lastErrorSummary, 500),
        updatedAt: now,
      };
      await db
        .insert(customerIntegrationInstances)
        .values({ customerId, integrationId, ...values })
        .onConflictDoUpdate({
          target: [
            customerIntegrationInstances.customerId,
            customerIntegrationInstances.integrationId,
          ],
          set: values,
        });
      await db
        .update(commerceLicenseInstallations)
        .set({
          scopesJson: updateScopeList(
            license.scopesJson,
            `integration.${catalog.providerKey}`,
            status === "active",
          ),
          updatedAt: now,
        })
        .where(eq(commerceLicenseInstallations.id, license.id));
    } else if (action === "notification") {
      const title = text(data.title, 120);
      if (!title)
        return json({ ok: false, error: "Bildirim başlığı gerekli." }, 400);
      await db
        .insert(portalNotifications)
        .values({
          customerId,
          title,
          body: text(data.body, 600),
          type: ["info", "success", "warning", "critical"].includes(
            String(data.type),
          )
            ? String(data.type)
            : "info",
          priority: clamp(data.priority, 0, 100, 10),
          targetSection: text(data.targetSection, 32) || "ozet",
          source: "admin",
          visibleAt: now,
          createdAt: now,
          updatedAt: now,
        });
    } else if (action === "experiment") {
      const name = text(data.name, 140);
      if (!name) return json({ ok: false, error: "Deney adı gerekli." }, 400);
      await db
        .insert(tofyExperiments)
        .values({
          customerId,
          name,
          kind: text(data.kind, 40) || "copy",
          status: ["draft", "active", "complete", "paused"].includes(
            String(data.status),
          )
            ? String(data.status)
            : "draft",
          controlLabel: text(data.controlLabel, 100) || "Kontrol",
          variantLabel: text(data.variantLabel, 100) || "Varyant",
          startsAt: now,
          createdAt: now,
          updatedAt: now,
        });
    } else if (action === "document") {
      const title = text(data.title, 140);
      const url = text(data.url, 500);
      if (!title || !/^https?:\/\//i.test(url))
        return json(
          { ok: false, error: "Doküman adı ve güvenli bağlantı gerekli." },
          400,
        );
      await db
        .insert(customerPortalDocuments)
        .values({
          customerId,
          title,
          url,
          category: text(data.category, 40) || "document",
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
    } else return json({ ok: false, error: "Bilinmeyen işlem." }, 400);

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "portal_update",
      entity: "customer_portal",
      entityId: customerId,
      details: { action },
    });
    return json({ ok: true });
  } catch (cause) {
    console.error("Customer portal management update failed", cause);
    return json({ ok: false, error: "Portal ayarı kaydedilemedi." }, 503);
  }
}
