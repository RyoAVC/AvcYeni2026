import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only primitive. No live-mode override is supported in this implementation.
export function paytrConfig(env = process.env) {
  const names = ["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"];
  if (names.some((key) => typeof env[key] !== "string" || !env[key].trim())) throw new Error("PayTR yapılandırması eksik.");
  if (env.PAYTR_TEST_MODE !== "1") throw new Error("PayTR yalnız test modunda kullanılabilir.");
  return { id: env.PAYTR_MERCHANT_ID, key: env.PAYTR_MERCHANT_KEY, salt: env.PAYTR_MERCHANT_SALT };
}

export function paymentTokenFields(order, config) {
  if (!Number.isSafeInteger(order.amountKurus) || order.amountKurus <= 0 || order.amountKurus > 1000000000) throw new Error("Geçersiz ödeme tutarı.");
  if (!/^[A-Za-z0-9]{1,64}$/.test(order.id)) throw new Error("Geçersiz sipariş numarası.");
  const fields = {
    merchant_id: config.id, user_ip: order.ip, merchant_oid: order.id,
    email: order.email, payment_amount: String(order.amountKurus),
    user_basket: Buffer.from(JSON.stringify([[order.packageName, (order.amountKurus / 100).toFixed(2), 1]])).toString("base64"),
    no_installment: "1", max_installment: "0", currency: "TL", test_mode: "1",
    user_name: order.name, user_address: order.address, user_phone: order.phone,
    merchant_ok_url: order.okUrl, merchant_fail_url: order.failUrl,
    timeout_limit: "30", debug_on: "0", lang: "tr",
  };
  const signed = ["merchant_id", "user_ip", "merchant_oid", "email", "payment_amount", "user_basket", "no_installment", "max_installment", "currency", "test_mode"].map((key) => fields[key]).join("");
  return { ...fields, paytr_token: createHmac("sha256", config.key).update(signed + config.salt).digest("base64") };
}

export async function requestPaytrTestToken(order, { env = process.env, fetchImpl = fetch } = {}) {
  const fields = paymentTokenFields(order, paytrConfig(env));
  const response = await fetchImpl("https://www.paytr.com/odeme/api/get-token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields), signal: AbortSignal.timeout(15000), redirect: "error",
  });
  if (!response.ok) throw new Error("PayTR test isteği tamamlanamadı.");
  const result = await response.json();
  // Never reflect provider errors: they can contain payment/customer data.
  if (result.status !== "success" || !/^[a-zA-Z0-9]{16,256}$/.test(result.token ?? "")) throw new Error("PayTR test tokenı alınamadı.");
  return result.token;
}

export function verifyPaytrCallback(body, config) {
  if (!/^[A-Za-z0-9]{1,64}$/.test(body.merchant_oid ?? "") || !["success", "failed"].includes(body.status) || !/^\d{1,10}$/.test(body.total_amount ?? "")) return false;
  if (typeof body.hash !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(body.hash)) return false;
  const expected = createHmac("sha256", config.key).update(body.merchant_oid + config.salt + body.status + body.total_amount).digest();
  const supplied = Buffer.from(body.hash, "base64");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
