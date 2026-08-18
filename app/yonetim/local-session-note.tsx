import { isLocalAdminBypassEnabled } from "../local-admin-identity.mjs";

export async function LocalSessionNote() {
  const { env } = await import("cloudflare:workers");
  if (!isLocalAdminBypassEnabled(env as Record<string, unknown>)) return null;

  return (
    <p className="admin-local-note" role="status">
      Yerel test oturumu. Canlı sitede ChatGPT girişi gerekir.
    </p>
  );
}
