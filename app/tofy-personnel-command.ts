import { siteSettings } from "../db/schema.ts";
import { getAdminUser } from "./admin-auth.ts";
import { parseTofyPersonnelCommand } from "./tofy-personnel.mjs";

export type TofyPersonnelCommand = "maintenance-on" | "maintenance-off";

export async function executeTofyPersonnelCommand(value: unknown) {
  const command = parseTofyPersonnelCommand(value) as TofyPersonnelCommand | null;
  if (!command) return { handled: false as const };

  const admin = await getAdminUser();
  if (!admin.user) {
    return {
      handled: true as const,
      ok: false as const,
      status: 401,
      reply: "Bu personel komutu için önce yönetim oturumunu açmalısın.",
    };
  }
  if (!admin.authorized) {
    return {
      handled: true as const,
      ok: false as const,
      status: 403,
      reply: "Seni tanıdım ama bu işlem için yönetici yetkin bulunmuyor.",
    };
  }

  try {
    const { getDb } = await import("../db/index.ts");
    const db = getDb();
    const maintenanceMode = command === "maintenance-on" ? "on" : "off";
    await db
      .insert(siteSettings)
      .values({ key: "maintenanceMode", value: maintenanceMode, updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: maintenanceMode, updatedAt: new Date().toISOString() },
      });
    return {
      handled: true as const,
      ok: true as const,
      status: 200,
      maintenanceMode,
      reply: command === "maintenance-on"
        ? "Tamam. Siteyi bakıma aldım; yönetim alanı açık kalıyor."
        : "Afiyet olsun. Bakım modunu kapattım, site yeniden yayında.",
    };
  } catch {
    return {
      handled: true as const,
      ok: false as const,
      status: 503,
      reply: "Bakım durumu şu anda değiştirilemedi. Yönetim ayarlarından tekrar deneyebilirsin.",
    };
  }
}
