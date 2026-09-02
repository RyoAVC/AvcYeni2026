import { commerceModulePackages } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { validateAdminOrigin } from "../../../admin-request.mjs";
import { ensureCommerceLicenseTables } from "../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../runtime-env.mjs";

const MAX_PACKAGE_BYTES = 25 * 1024 * 1024;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Admin-only module package upload. Takes the raw zip body (produced locally by
// bin/module-package.php) rather than going through the small generic JSON admin
// mutation helper, since a real module package can exceed that 8KB limit.
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);
  const originFailure = validateAdminOrigin(request);
  if (originFailure) return json({ ok: false, error: originFailure.error }, originFailure.status);

  const url = new URL(request.url);
  const moduleKey = String(url.searchParams.get("key") || "").trim();
  const licenseScope = String(url.searchParams.get("license_scope") || "").trim();
  const version = String(url.searchParams.get("version") || "").trim();
  if (!/^[a-z][a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(moduleKey)) return json({ ok: false, error: "Geçersiz modül anahtarı." }, 400);
  if (!/^[a-z][a-z0-9.]*(?:[._-][a-z0-9]+)*$/.test(licenseScope)) return json({ ok: false, error: "Geçersiz lisans kapsamı." }, 400);
  if (!/^\d+\.\d+\.\d+$/.test(version)) return json({ ok: false, error: "Sürüm semver biçiminde olmalıdır." }, 400);
  if ((request.headers.get("content-type") ?? "") !== "application/zip") return json({ ok: false, error: "İstek application/zip biçiminde olmalıdır." }, 415);
  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (!Number.isFinite(declaredLength) || declaredLength <= 0 || declaredLength > MAX_PACKAGE_BYTES) return json({ ok: false, error: "Paket boyutu geçersiz." }, 413);

  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength !== declaredLength) return json({ ok: false, error: "Paket boyutu tutarsız." }, 400);
    const sha256 = await sha256Hex(bytes);
    const contentBase64 = Buffer.from(bytes).toString("base64");

    const env = await readRuntimeEnv();
    await ensureCommerceLicenseTables(env);
    const { getDb } = await import("../../../../db");
    const db = getDb();
    await db.insert(commerceModulePackages).values({
      moduleKey,
      licenseScope,
      version,
      sha256,
      sizeBytes: bytes.byteLength,
      contentBase64,
    });

    return json({ ok: true, key: moduleKey, version, sha256, sizeBytes: bytes.byteLength }, 201);
  } catch (cause) {
    console.error("Module package upload failed", cause);
    return json({ ok: false, error: "Paket yüklenemedi." }, 503);
  }
}
