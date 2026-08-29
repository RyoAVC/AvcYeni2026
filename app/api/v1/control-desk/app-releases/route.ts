import { desc } from "drizzle-orm";
import { controlDeskAppReleases } from "../../../../../db/schema";
import { logAdminAction } from "../../../../audit-log.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);

export async function GET(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status, request);
  if (!hasControlDeskRole(auth, ["platform_owner", "support_operator"])) return controlDeskJson({ ok: false, error: "Sürüm kataloğu yetkiniz yok." }, 403, request);
  await ensureCommerceLicenseTables(auth.env);
  const { getDb } = await import("../../../../../db");
  const releases = await getDb().select().from(controlDeskAppReleases).orderBy(desc(controlDeskAppReleases.createdAt)).limit(200);
  return controlDeskJson({ ok: true, format: "avci-control-desk.app-releases.v1", releases }, 200, request);
}

export async function POST(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status, request);
  if (!hasControlDeskRole(auth, ["platform_owner"])) return controlDeskJson({ ok: false, error: "Uygulama sürümü yayınlama yetkiniz yok." }, 403, request);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return controlDeskJson({ ok: false, error: "Geçersiz JSON gövdesi." }, 400, request);
  const version = clean(body.version, 32), channel = clean(body.channel, 12), platform = clean(body.platform, 12);
  const architecture = clean(body.architecture, 20) || "x64", fileUrl = clean(body.fileUrl), manifestUrl = clean(body.manifestUrl);
  const sha256 = clean(body.sha256, 64).toLowerCase(), manifestSignature = clean(body.manifestSignature, 1000);
  const signatureStatus = clean(body.signatureStatus, 20), status = clean(body.status, 20) || "draft";
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version) || !["pilot", "stable"].includes(channel) || !["windows", "macos", "linux"].includes(platform)) return controlDeskJson({ ok: false, error: "Sürüm, kanal veya platform geçersiz." }, 400, request);
  if (!/^https:\/\//i.test(fileUrl) || !/^https:\/\//i.test(manifestUrl) || !/^[a-f0-9]{64}$/.test(sha256)) return controlDeskJson({ ok: false, error: "HTTPS paket/manifest adresi ve SHA-256 zorunludur." }, 400, request);
  if (status === "published" && (signatureStatus !== "verified" || manifestSignature.length < 40)) return controlDeskJson({ ok: false, error: "İmzası doğrulanmamış paket yayınlanamaz." }, 409, request);
  if (channel === "stable" && status === "published" && !clean(body.signerSubject, 240)) return controlDeskJson({ ok: false, error: "Stable Windows/macOS paketi için doğrulanmış imzalayan kimliği zorunludur." }, 409, request);
  await ensureCommerceLicenseTables(auth.env);
  const { getDb } = await import("../../../../../db"); const db = getDb(); const now = new Date().toISOString();
  try {
    const inserted = await db.insert(controlDeskAppReleases).values({
      version, channel, platform, architecture, fileUrl, manifestUrl, sha256,
      sizeBytes: Math.max(0, Number(body.sizeBytes) || 0), signatureStatus,
      signerSubject: clean(body.signerSubject, 240), manifestSignature,
      releaseNotes: clean(body.releaseNotes, 2000), status,
      publishedAt: status === "published" ? now : "", createdAt: now, updatedAt: now,
    }).returning({ id: controlDeskAppReleases.id });
    await logAdminAction(db, { userEmail: auth.email, action: status === "published" ? "control_desk_app_release_published" : "control_desk_app_release_registered", entity: "control_desk_app_release", entityId: String(inserted[0]?.id || ""), details: JSON.stringify({ version, channel, platform, architecture, sha256 }) });
    return controlDeskJson({ ok: true, releaseId: inserted[0]?.id, status }, 201, request);
  } catch (cause) {
    console.error("Control Desk app release registration failed", cause);
    return controlDeskJson({ ok: false, error: "Bu hedef için sürüm zaten kayıtlı veya yayın kaydı geçersiz." }, 409, request);
  }
}
