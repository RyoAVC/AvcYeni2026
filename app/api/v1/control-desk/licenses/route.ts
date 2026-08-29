import { eq } from "drizzle-orm";
import { commerceLicenseInstallations, customers } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";
import { createActivationToken, normalizeCommerceDomain, sha256, validCommerceIdentifier } from "../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic = "force-dynamic";

const text = (value: unknown, max = 160) => String(value ?? "").trim().slice(0, max);
const slug = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);

export async function POST(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status);
  if (!hasControlDeskRole(auth,["platform_owner"])) return controlDeskJson({ ok:false,error:"Lisans işlemi yalnız Avcı platform yöneticisine açıktır." },403,request);
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return controlDeskJson({ ok: false, error: "JSON gövdesi gerekli." }, 415);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return controlDeskJson({ ok: false, error: "Geçersiz istek." }, 400); }
  if (body.action !== "create") return controlDeskJson({ ok: false, error: "Bu sürüm yalnız yeni lisans üretimini destekliyor." }, 400);
  const customerId = Number(body.customerId);
  const domain = normalizeCommerceDomain(body.domain);
  const plan = ["start", "growth", "pro"].includes(text(body.plan, 20)) ? text(body.plan, 20) : "start";
  const durationDays = Math.max(1, Math.min(1095, Number(body.durationDays) || 365));
  if (!Number.isSafeInteger(customerId) || customerId < 1 || !domain) return controlDeskJson({ ok: false, error: "Müşteri ve geçerli domain gerekli." }, 400);
  try {
    await ensureCommerceLicenseTables(auth.env);
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [customer] = await db.select({ id: customers.id, status: customers.status, company: customers.company, name: customers.name }).from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer || customer.status !== "active") return controlDeskJson({ ok: false, error: "Aktif müşteri bulunamadı." }, 404);
    const token = createActivationToken();
    const storeKey = slug(customer.company || customer.name || domain) || `store-${customerId}`;
    const installationId = `desktop-${crypto.randomUUID().slice(0, 18)}`;
    if (!validCommerceIdentifier(storeKey) || !validCommerceIdentifier(installationId)) return controlDeskJson({ ok: false, error: "Mağaza kimliği üretilemedi." }, 400);
    const now = new Date();
    const validUntil = new Date(now.getTime() + durationDays * 86400000).toISOString();
    const inserted = await db.insert(commerceLicenseInstallations).values({
      customerId, storeKey, installationId, primaryDomain: domain, plan,
      commerceVersion: "1.0.0", scopesJson: "[]", limitsJson: "{}",
      activationTokenHash: await sha256(token), product: "avci-commerce", status: "active",
      validUntil, billingCycle: durationDays >= 365 ? "annual" : "monthly",
      paymentStatus: "pending", createdAt: now.toISOString(), updatedAt: now.toISOString(),
    }).returning({ id: commerceLicenseInstallations.id });
    await logAdminAction(db,{ userEmail:auth.email, action:"control_desk_license_created", entity:"commerce_license", entityId:String(inserted[0]?.id || ""), details:JSON.stringify({ customerId,domain,storeKey,installationId,plan,validUntil }) });
    return controlDeskJson({ ok: true, format: "avci-control-desk.license-created.v1", licenseId: inserted[0]?.id, activationToken: token, domain, storeKey, installationId, validUntil }, 201);
  } catch (cause) {
    console.error("Control Desk license create failed", cause);
    return controlDeskJson({ ok: false, error: "Lisans oluşturulamadı. Domain veya kurulum kimliği kullanımda olabilir." }, 503);
  }
}
