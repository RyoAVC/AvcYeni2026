import { eq } from "drizzle-orm";
import { customers } from "../../../db/schema";
import { withBasePath } from "../../base-path";
import {
  CUSTOMER_PORTAL_PREVIEW_EMAIL,
  canUseCustomerPortalPreview,
  isLiveCustomerPortalPreviewHost,
} from "../../customer-portal-preview.mjs";
import {
  createCustomerSessionToken,
  customerSessionCookie,
  getCustomerPortalConfig,
} from "../../customer-session.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";

const ROBOTS_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

function previewNotFound() {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Önizleme kapalı</title></head><body><main><h1>Önizleme kapalı</h1><p>Bu gizli önizleme yolu şu an etkin değil.</p></main></body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      ...ROBOTS_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function redirectToPanel(request: Request, cookie: string) {
  const headers = new Headers({
    Location: new URL(withBasePath("/musteri-panel"), request.url).toString(),
    ...ROBOTS_HEADERS,
  });
  headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function GET(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const env = await readRuntimeEnv();
  let liveHost = false;
  try {
    liveHost = isLiveCustomerPortalPreviewHost(new URL(request.url).hostname);
  } catch {
    liveHost = false;
  }

  if (!canUseCustomerPortalPreview(request, env)) {
    return previewNotFound();
  }

  const config = getCustomerPortalConfig(env, { liveHost });
  if (!config.ready) return previewNotFound();

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, CUSTOMER_PORTAL_PREVIEW_EMAIL))
      .limit(1);

    if (!customer || customer.status !== "active") {
      return previewNotFound();
    }

    const token = await createCustomerSessionToken(config.secret, {
      customerId: customer.id,
      email: customer.email,
      displayName: customer.company || customer.name,
    });
    const secure = new URL(request.url).protocol === "https:";
    if (request.method === "HEAD") {
      return redirectToPanel(request, customerSessionCookie(token, secure));
    }
    return redirectToPanel(request, customerSessionCookie(token, secure));
  } catch (cause) {
    console.error("Customer portal preview entry failed", cause);
    return previewNotFound();
  }
}

export async function HEAD(request: Request) {
  return GET(request);
}
