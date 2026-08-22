import { auditLogs } from "../db/schema";

export async function logAdminAction(db, { userEmail, action, entity, entityId = "", details = "", ipAddress = "" }) {
  try {
    await db.insert(auditLogs).values({
      userEmail: userEmail || "sistem",
      action,
      entity,
      entityId: String(entityId || ""),
      details: typeof details === "object" ? JSON.stringify(details) : String(details || ""),
      ipAddress: String(ipAddress || ""),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Audit log recording failed:", err);
  }
}
