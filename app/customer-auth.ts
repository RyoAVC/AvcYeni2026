import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { customers } from "../db/schema";
import { normalizeEmailAddress } from "./email-normalization.mjs";
import {
  CUSTOMER_SESSION_COOKIE,
  customerLoginPath,
  getCustomerPortalConfig,
  readCustomerSessionToken,
  readNamedCookie,
} from "./customer-session.mjs";

async function readSessionCookieValue() {
  try {
    const jar = await cookies();
    const value = jar.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (value) return value;
  } catch {
    // Vinext bazı isteklerde cookies() vermeyebilir; header yedek.
  }
  return readNamedCookie((await headers()).get("cookie") ?? "", CUSTOMER_SESSION_COOKIE);
}

async function readRuntimeEnv() {
  try {
    const { env } = await import("cloudflare:workers") as unknown as { env: Record<string, unknown> };
    return env;
  } catch {
    return typeof process !== "undefined" ? process.env : {};
  }
}

export async function getCustomerUser() {
  const env = await readRuntimeEnv();
  const config = getCustomerPortalConfig(env);
  const session = config.ready
    ? await readCustomerSessionToken(config.secret, await readSessionCookieValue())
    : null;

  if (!session) {
    return { customer: null, authorized: false as const };
  }

  try {
    const { getDb } = await import("../db");
    const db = getDb();
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.customerId))
      .limit(1);

    if (!customer || customer.status !== "active") {
      return { customer: null, authorized: false as const };
    }
    if (normalizeEmailAddress(customer.email) !== session.email) {
      return { customer: null, authorized: false as const };
    }

    return { customer, authorized: true as const, session };
  } catch (cause) {
    console.error("Customer session lookup failed", cause);
    return { customer: null, authorized: false as const };
  }
}

export async function requireCustomerUser(returnTo: string) {
  const result = await getCustomerUser();
  if (result.authorized && result.customer) return result;
  redirect(customerLoginPath(returnTo));
}
