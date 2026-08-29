import { and, asc, desc, eq } from "drizzle-orm";
import { commerceLicenseInstallations, commerceSolutionBlueprints, customerSolutionAssignments, customers } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic = "force-dynamic";

const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);
const keyOf = (value: unknown) => clean(value, 72).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
const listOf = (value: unknown) => Array.isArray(value) ? value.map((item) => clean(item, 80)).filter(Boolean).slice(0, 30) : [];
const parseList = (value: string) => { try { const result = JSON.parse(value); return Array.isArray(result) ? result : []; } catch { return []; } };

export async function GET(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status, request);
  if (!hasControlDeskRole(auth, ["platform_owner", "support_operator", "installer", "customer_owner", "customer_viewer"])) return controlDeskJson({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403, request);
  try {
    await ensureCommerceLicenseTables(auth.env);
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const blueprints = await db.select().from(commerceSolutionBlueprints).orderBy(asc(commerceSolutionBlueprints.sector), asc(commerceSolutionBlueprints.name));
    const assignments = auth.customerId
      ? await db.select().from(customerSolutionAssignments).where(eq(customerSolutionAssignments.customerId, auth.customerId)).orderBy(desc(customerSolutionAssignments.updatedAt))
      : await db.select().from(customerSolutionAssignments).orderBy(desc(customerSolutionAssignments.updatedAt)).limit(1000);
    return controlDeskJson({
      ok: true,
      format: "avci-control-desk.solution-catalog.v1",
      blueprints: blueprints.filter((item) => !auth.customerId || item.status === "active").map((item) => ({ ...item, technologies: parseList(item.technologyJson), moduleKeys: parseList(item.moduleKeysJson), artifactManifestUrl: undefined })),
      assignments,
      capabilities: { blueprintWrite: hasControlDeskRole(auth, ["platform_owner"]), blueprintAssign: hasControlDeskRole(auth, ["platform_owner", "installer"]) },
    }, 200, request);
  } catch (cause) {
    console.error("Control Desk blueprint list failed", cause);
    return controlDeskJson({ ok: false, error: "Çözüm kataloğu şu anda alınamadı." }, 503, request);
  }
}

export async function POST(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status, request);
  if (!(request.headers.get("content-type") || "").includes("application/json")) return controlDeskJson({ ok: false, error: "JSON gövdesi gerekli." }, 415, request);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return controlDeskJson({ ok: false, error: "Geçersiz istek." }, 400, request); }
  const action = clean(body.action, 20);
  const allowed = action === "create" ? ["platform_owner"] : ["platform_owner", "installer"];
  if (!hasControlDeskRole(auth, allowed)) return controlDeskJson({ ok: false, error: "Bu çözüm işlemi için yetkiniz yok." }, 403, request);
  try {
    await ensureCommerceLicenseTables(auth.env);
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const now = new Date().toISOString();
    if (action === "create") {
      const blueprintKey = keyOf(body.blueprintKey || body.name);
      const name = clean(body.name, 120);
      const sector = clean(body.sector, 80);
      const version = clean(body.currentVersion, 24) || "1.0.0";
      const manifest = clean(body.artifactManifestUrl, 500);
      if (!blueprintKey || !name || !sector || (manifest && !/^https:\/\//i.test(manifest))) return controlDeskJson({ ok: false, error: "Ad, sektör ve güvenli manifest bilgisi gerekli." }, 400, request);
      const inserted = await db.insert(commerceSolutionBlueprints).values({ blueprintKey, name, sector, summary: clean(body.summary, 600), technologyJson: JSON.stringify(listOf(body.technologies)), themeKey: keyOf(body.themeKey), moduleKeysJson: JSON.stringify(listOf(body.moduleKeys).map(keyOf)), currentVersion: version, minimumCommerceVersion: clean(body.minimumCommerceVersion, 24) || "1.0.0", releaseChannel: ["pilot", "stable"].includes(clean(body.releaseChannel, 20)) ? clean(body.releaseChannel, 20) : "pilot", artifactManifestUrl: manifest, previewUrl: /^https:\/\//i.test(clean(body.previewUrl, 500)) ? clean(body.previewUrl, 500) : "", status: manifest ? "active" : "draft", createdAt: now, updatedAt: now }).returning({ id: commerceSolutionBlueprints.id });
      await logAdminAction(db, { userEmail: auth.email, action: "solution_blueprint_created", entity: "commerce_solution_blueprint", entityId: String(inserted[0]?.id || ""), details: JSON.stringify({ blueprintKey, version }) });
      return controlDeskJson({ ok: true, blueprintId: inserted[0]?.id }, 201, request);
    }
    if (action === "assign") {
      const blueprintId = Number(body.blueprintId);
      const licenseId = Number(body.licenseId);
      if (!Number.isSafeInteger(blueprintId) || !Number.isSafeInteger(licenseId)) return controlDeskJson({ ok: false, error: "Çözüm ve lisans seçimi gerekli." }, 400, request);
      const [[blueprint], [license]] = await Promise.all([
        db.select().from(commerceSolutionBlueprints).where(and(eq(commerceSolutionBlueprints.id, blueprintId), eq(commerceSolutionBlueprints.status, "active"))).limit(1),
        db.select().from(commerceLicenseInstallations).where(eq(commerceLicenseInstallations.id, licenseId)).limit(1),
      ]);
      if (!blueprint) return controlDeskJson({ ok: false, error: "Aktif ve imzalı çözüm bulunamadı." }, 404, request);
      if (!license || !["active", "trial"].includes(license.status)) return controlDeskJson({ ok: false, error: "Aktif lisans bulunamadı." }, 404, request);
      const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, license.customerId)).limit(1);
      if (!customer) return controlDeskJson({ ok: false, error: "Lisans müşterisi bulunamadı." }, 404, request);
      const inserted = await db.insert(customerSolutionAssignments).values({ customerId: license.customerId, blueprintId, licenseId, storeKey: license.storeKey, installationId: license.installationId, assignedVersion: blueprint.currentVersion, status: "assigned", note: clean(body.note, 500), assignedAt: now, createdAt: now, updatedAt: now }).returning({ id: customerSolutionAssignments.id });
      await logAdminAction(db, { userEmail: auth.email, action: "solution_blueprint_assigned", entity: "customer_solution_assignment", entityId: String(inserted[0]?.id || ""), details: JSON.stringify({ blueprintId, licenseId, customerId: license.customerId, storeKey: license.storeKey }) });
      return controlDeskJson({ ok: true, assignmentId: inserted[0]?.id, status: "assigned", next: "Uzak kurulum ekranından bu lisans için güvenli kurulum işi başlatın." }, 201, request);
    }
    return controlDeskJson({ ok: false, error: "Desteklenmeyen çözüm işlemi." }, 400, request);
  } catch (cause) {
    console.error("Control Desk blueprint mutation failed", cause);
    return controlDeskJson({ ok: false, error: "Çözüm işlemi tamamlanamadı; aynı kurulum için daha önce atama yapılmış olabilir." }, 503, request);
  }
}
