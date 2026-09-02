import { commerceLicenseInstallations } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { ensureCommerceLicenseTables } from "../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../runtime-env.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// TEMPORARY, one-off admin tool: inserts a single test commerce license
// installation row so bin/module-install.php can be proven end-to-end
// against the real deployed control plane. Not part of the shipped feature —
// created and deleted within this session, never committed.
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user || !admin.authorized) return json({ ok: false, error: "unauthorized" }, 403);

  const env = await readRuntimeEnv();
  await ensureCommerceLicenseTables(env);
  const { getDb } = await import("../../../../db");
  const db = getDb();

  const licenseKey = "avc_live_test_" + crypto.randomUUID().replace(/-/g, "");
  const tokenHash = await sha256Hex(licenseKey);
  const now = new Date();
  const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const [existingCustomer] = await db.select({ id: (await import("../../../../db/schema")).customers.id }).from((await import("../../../../db/schema")).customers).limit(1);
  if (!existingCustomer) return json({ ok: false, error: "no_customer_available" }, 500);

  const inserted = await db.insert(commerceLicenseInstallations).values({
    customerId: existingCustomer.id,
    storeKey: "test-store-merchant-score",
    installationId: "test-install-merchant-score",
    primaryDomain: "127.0.0.1",
    plan: "start",
    commerceVersion: "1.0.0",
    scopesJson: JSON.stringify(["addon.analytics.merchant-score"]),
    activationTokenHash: tokenHash,
    product: "avci-commerce",
    status: "active",
    validUntil,
  }).returning({ id: commerceLicenseInstallations.id });

  return json({ ok: true, id: inserted[0]?.id, license_key: licenseKey, domain: "127.0.0.1" }, 201);
}

export async function DELETE() {
  const admin = await getAdminUser();
  if (!admin.user || !admin.authorized) return json({ ok: false, error: "unauthorized" }, 403);
  const env = await readRuntimeEnv();
  await ensureCommerceLicenseTables(env);
  const { getDb } = await import("../../../../db");
  const { eq } = await import("drizzle-orm");
  const db = getDb();
  await db.delete(commerceLicenseInstallations).where(eq(commerceLicenseInstallations.storeKey, "test-store-merchant-score"));
  return json({ ok: true }, 200);
}
