import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { customerSetupTokens } from "../db/schema";

const TOKEN_PATTERN = /^[\w-]{43}$/;

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function createRawSetupToken() {
  return randomBytes(32).toString("base64url");
}

export async function issueCustomerSetupToken(db, { customerId, purpose = "demo_invite", ttlMs, now = Date.now() }) {
  const token = createRawSetupToken();
  await db.insert(customerSetupTokens).values({
    tokenHash: digest(token),
    customerId,
    purpose,
    expiresAt: new Date(now + ttlMs).toISOString(),
    createdAt: new Date(now).toISOString(),
  });
  return token;
}

/** Validates and consumes a one-time setup token; returns { customerId } or null. Never throws on bad input. */
export async function consumeCustomerSetupToken(db, token, { purpose = "demo_invite", now = Date.now() } = {}) {
  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) return null;
  const tokenHash = digest(token);
  const [row] = await db
    .select()
    .from(customerSetupTokens)
    .where(and(eq(customerSetupTokens.tokenHash, tokenHash), eq(customerSetupTokens.purpose, purpose), isNull(customerSetupTokens.usedAt)))
    .limit(1);
  if (!row || Date.parse(row.expiresAt) <= now) return null;

  const nowIso = new Date(now).toISOString();
  const updated = await db
    .update(customerSetupTokens)
    .set({ usedAt: nowIso })
    .where(and(eq(customerSetupTokens.tokenHash, tokenHash), isNull(customerSetupTokens.usedAt)))
    .returning({ customerId: customerSetupTokens.customerId });
  if (!updated[0]) return null;

  return { customerId: updated[0].customerId };
}
