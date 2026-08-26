import { and, eq, gt } from "drizzle-orm";
import { commercePortalLoginCodes, customers } from "../../../../../../db/schema";
import { withBasePath } from "../../../../../base-path";
import { sha256 } from "../../../../../commerce-license-control-plane.mjs";
import { createCustomerSessionToken, customerSessionCookie, getCustomerPortalConfig } from "../../../../../customer-session.mjs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const failure = () => new Response(null, { status: 303, headers: { Location: new URL(withBasePath("/musteri-panel/giris?durum=hata"), request.url).toString(), "Cache-Control": "no-store" } });
  if (!code.startsWith("avc_portal_") || code.length > 128) return failure();
  try {
    const [{ env }, { getDb }] = await Promise.all([import("cloudflare:workers"), import("../../../../../../db")]);
    const config = getCustomerPortalConfig(env as Record<string, unknown>, { liveHost: true });
    if (!config.ready) return failure();
    const db = getDb();
    const now = new Date().toISOString();
    const [record] = await db.select().from(commercePortalLoginCodes).where(and(eq(commercePortalLoginCodes.codeHash, await sha256(code)), eq(commercePortalLoginCodes.usedAt, ""), gt(commercePortalLoginCodes.expiresAt, now))).limit(1);
    if (!record) return failure();
    const [customer] = await db.select().from(customers).where(eq(customers.id, record.customerId)).limit(1);
    if (!customer || customer.status !== "active") return failure();
    const result = await db.update(commercePortalLoginCodes).set({ usedAt: now }).where(and(eq(commercePortalLoginCodes.id, record.id), eq(commercePortalLoginCodes.usedAt, "")));
    if (!result.meta?.changes) return failure();
    const token = await createCustomerSessionToken(config.secret, { customerId: customer.id, email: customer.email, displayName: customer.company || customer.name });
    const headers = new Headers({ Location: new URL(withBasePath("/musteri-panel"), request.url).toString(), "Cache-Control": "no-store" });
    headers.append("Set-Cookie", customerSessionCookie(token, new URL(request.url).protocol === "https:"));
    return new Response(null, { status: 303, headers });
  } catch (cause) {
    console.error("Commerce portal session consume failed", cause);
    return failure();
  }
}
