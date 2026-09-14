import { eq } from "drizzle-orm";
import { customerPortalCredentials, customers } from "../../../../db/schema";
import { consumeCustomerSetupToken } from "../../../customer-setup-tokens.mjs";
import { hashCustomerPassword, validateCustomerPassword } from "../../../customer-password.mjs";
import { createCustomerSessionToken, customerSessionCookie, getCustomerPortalConfig } from "../../../customer-session.mjs";
import { readRuntimeEnv } from "../../../runtime-env.mjs";

const MAX_BODY_BYTES = 4_096;

function json(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") return json({ ok: false, error: "İstek application/json biçiminde olmalıdır." }, 415);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ ok: false, error: "İstek verisi okunamadı." }, 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "İstek verisi çok büyük." }, 413);

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("invalid");
  } catch {
    return json({ ok: false, error: "İstek verisi okunamadı." }, 400);
  }

  const token = typeof payload.token === "string" ? payload.token : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const passwordValidation = validateCustomerPassword(password);
  if (!passwordValidation.ok) return json({ ok: false, error: passwordValidation.error }, 400);

  try {
    const env = await readRuntimeEnv();
    const config = getCustomerPortalConfig(env);
    if (!config.ready) return json({ ok: false, error: "Müşteri paneli şu anda kullanılamıyor." }, 503);

    const { getDb } = await import("../../../../db");
    const db = getDb();

    const consumed = await consumeCustomerSetupToken(db, token, { purpose: "demo_invite" });
    if (!consumed) return json({ ok: false, error: "Bağlantı geçersiz veya süresi dolmuş." }, 400);

    const [customer] = await db.select().from(customers).where(eq(customers.id, consumed.customerId)).limit(1);
    if (!customer || !["active", "trial"].includes(customer.status)) {
      return json({ ok: false, error: "Bu hesap artık erişilebilir değil." }, 403);
    }

    const now = new Date().toISOString();
    const passwordHash = await hashCustomerPassword(password);
    await db.insert(customerPortalCredentials).values({
      customerId: customer.id,
      passwordHash,
      passwordChangedAt: now,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({ target: customerPortalCredentials.customerId, set: { passwordHash, passwordChangedAt: now, updatedAt: now } });

    const sessionToken = await createCustomerSessionToken(config.secret, {
      customerId: customer.id,
      email: customer.email,
      displayName: customer.company || customer.name,
    });
    const secure = new URL(request.url).protocol === "https:";

    return json({ ok: true }, 200, { "Set-Cookie": customerSessionCookie(sessionToken, secure) });
  } catch (cause) {
    console.error("Customer setup password failed", cause);
    return json({ ok: false, error: "Parola kaydedilemedi." }, 503);
  }
}
