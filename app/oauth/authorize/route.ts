import { getAdminUser } from "../../admin-auth";
import { getCustomerUser } from "../../customer-auth";
import { adminLoginPath } from "../../admin-session.mjs";
import { customerLoginPath } from "../../customer-session.mjs";
import { controlDeskOAuthCodes } from "../../../db/schema";
import { sha256Hex } from "../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";
import { withBasePath } from "../../base-path";

export const dynamic = "force-dynamic";

function validRedirect(value: string) { return value === "avcicontrol://auth/callback"; }
function validChallenge(value: string) { return /^[A-Za-z0-9_-]{43,128}$/.test(value); }
function token(prefix: string) {
  const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
  return prefix + btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get("redirect_uri") || "";
  const challenge = url.searchParams.get("code_challenge") || "";
  const state = url.searchParams.get("state") || "";
  const actor = url.searchParams.get("actor") === "customer" ? "customer" : "staff";
  if (!validRedirect(redirectUri) || !validChallenge(challenge) || !/^[A-Za-z0-9_-]{24,160}$/.test(state) || url.searchParams.get("code_challenge_method") !== "S256") {
    return Response.json({ ok: false, code: "invalid_authorization_request" }, { status: 400 });
  }
  // Keep the post-login target app-relative. The live application is mounted
  // below /v2, while the shared login helpers intentionally validate routes
  // without a deployment prefix.
  const returnTo = `/oauth/authorize${url.search}`;
  let email = "", displayName = "", customerId = 0, roles: string[] = [], scopes: string[] = [];
  if (actor === "staff") {
    const admin = await getAdminUser();
    if (!admin.authorized || !admin.user) return Response.redirect(new URL(withBasePath(adminLoginPath(returnTo)), url.origin));
    email = admin.user.email; displayName = admin.user.displayName; roles = ["platform_owner"]; scopes = ["*"];
  } else {
    const customer = await getCustomerUser();
    if (!customer.authorized || !customer.customer) return Response.redirect(new URL(withBasePath(customerLoginPath(returnTo)), url.origin));
    email = customer.customer.email; displayName = customer.customer.company || customer.customer.name; customerId = customer.customer.id;
    roles = ["customer_owner"]; scopes = ["snapshot:read", "install:read", "license:read"];
  }
  const env = await readRuntimeEnv(); await ensureCommerceLicenseTables(env);
  const { getDb } = await import("../../../db"); const db = getDb();
  const code = token("acd_code_"); const now = new Date();
  await db.insert(controlDeskOAuthCodes).values({ codeHash: await sha256Hex(code), codeChallenge: challenge, redirectUri, actorType: actor, actorEmail: email, displayName, customerId, rolesJson: JSON.stringify(roles), scopesJson: JSON.stringify(scopes), expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(), createdAt: now.toISOString() });
  const callback = new URL(redirectUri); callback.searchParams.set("code", code); callback.searchParams.set("state", state);
  return Response.redirect(callback);
}
