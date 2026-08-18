import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";
import { normalizeEmailAddress } from "./email-normalization.mjs";
import {
  ADMIN_SESSION_COOKIE,
  adminLoginPath,
  getAdminLoginConfig,
  readAdminSessionToken,
  readNamedCookie,
} from "./admin-session.mjs";

export type AdminUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

async function readSessionCookieValue() {
  try {
    const jar = await cookies();
    const value = jar.get(ADMIN_SESSION_COOKIE)?.value;
    if (value) return value;
  } catch {
    // Vinext bazı isteklerde cookies() vermeyebilir; header yedek.
  }
  return readNamedCookie((await headers()).get("cookie") ?? "", ADMIN_SESSION_COOKIE);
}

export async function getAdminUser() {
  let env: Record<string, unknown> = {};
  try {
    ({ env } = await import("cloudflare:workers") as unknown as { env: Record<string, unknown> });
  } catch {
    env = typeof process !== "undefined" ? process.env : {};
  }
  const config = getAdminLoginConfig(env as Record<string, unknown>);
  const session = config.ready
    ? await readAdminSessionToken(config.secret, await readSessionCookieValue())
    : null;

  if (session) {
    return {
      user: {
        displayName: session.displayName,
        email: session.email,
        fullName: null,
      } satisfies AdminUser,
      authorized: true,
      via: "password" as const,
    };
  }

  const user = await getChatGPTUser();
  if (!user) return { user: null, authorized: false, via: null } as const;

  const adminEmailsValue = (env as unknown as Record<string, unknown>).ADMIN_EMAILS;
  const adminEmails = typeof adminEmailsValue === "string"
    ? adminEmailsValue.split(",").map((email) => normalizeEmailAddress(email)).filter(Boolean)
    : [];

  return {
    user,
    authorized: adminEmails.includes(normalizeEmailAddress(user.email)),
    via: "chatgpt" as const,
  };
}

export async function requireAdminUser(returnTo: string) {
  const admin = await getAdminUser();
  if (admin.user) return admin;
  redirect(adminLoginPath(returnTo));
}
