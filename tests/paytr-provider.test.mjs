import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { paytrConfig, requestPaytrTestToken, verifyPaytrCallback } from "../app/paytr-provider.mjs";
import { smtpConfig, sendTestPasswordSetupMail } from "../app/checkout-smtp.mjs";

// Fixed, non-secret test fixtures; never provider credentials.
const env = { PAYTR_MERCHANT_ID: "123", PAYTR_MERCHANT_KEY: "fixture-key", PAYTR_MERCHANT_SALT: "fixture-salt", PAYTR_TEST_MODE: "1" };
test("PayTR missing configuration and live mode fail closed", () => {
  assert.throws(() => paytrConfig({}), /yapılandırması eksik/);
  assert.throws(() => paytrConfig({ ...env, PAYTR_TEST_MODE: "0" }), /yalnız test/);
});
test("token request uses numeric snapshot, signed basket, test mode and no installments", async () => {
  const token = await requestPaytrTestToken({ id: "TEST001", ip: "203.0.113.1", email: "test@example.com", name: "Test", address: "Test address", phone: "5550000000", packageName: "Start", amountKurus: 12345, okUrl: "https://example.com/ok", failUrl: "https://example.com/fail" }, { env, fetchImpl: async (url, options) => {
    assert.equal(url, "https://www.paytr.com/odeme/api/get-token");
    const body = Object.fromEntries(options.body);
    assert.equal(body.test_mode, "1");
    assert.equal(body.payment_amount, "12345");
    assert.equal(body.no_installment, "1");
    assert.equal(body.merchant_key, undefined);
    assert.deepEqual(JSON.parse(Buffer.from(body.user_basket, "base64")), [["Start", "123.45", 1]]);
    const preimage = `123203.0.113.1TEST001test@example.com12345${body.user_basket}10TL1fixture-salt`;
    assert.equal(body.paytr_token, createHmac("sha256", "fixture-key").update(preimage).digest("base64"));
    return Response.json({ status: "success", token: "fixturetoken000000000" });
  }});
  assert.equal(token, "fixturetoken000000000");
});
test("callback detects tampering and malformed signatures", () => {
  const body = { merchant_oid: "TEST001", status: "success", total_amount: "12345" };
  body.hash = createHmac("sha256", "fixture-key").update("TEST001fixture-saltsuccess12345").digest("base64");
  assert.equal(verifyPaytrCallback(body, paytrConfig(env)), true);
  assert.equal(verifyPaytrCallback({ ...body, total_amount: "1" }, paytrConfig(env)), false);
  assert.equal(verifyPaytrCallback({ ...body, hash: "invalid" }, paytrConfig(env)), false);
});
test("SMTP requires TLS and restricts mail to test recipient; transport mocked", async () => {
  assert.throws(() => smtpConfig({}), /SMTP/);
  const config = { ...env, SMTP_HOST: "smtp.example.com", SMTP_PORT: "587", SMTP_USER: "mail@example.com", SMTP_PASS: "fixture-password", CHECKOUT_TEST_EMAIL: "test@example.com", CHECKOUT_PUBLIC_URL: "https://example.com" };
  assert.equal(smtpConfig(config).transport.requireTLS, true);
  await assert.rejects(sendTestPasswordSetupMail({ to: "other@example.com", setupUrl: "https://example.com/setup" }, { env: config }));
  const result = await sendTestPasswordSetupMail({ to: "test@example.com", setupUrl: "https://example.com/setup#fixture-token" }, { env: config, createTransport: () => ({ sendMail: async (mail) => { assert.equal(mail.to, "test@example.com"); return { accepted: [mail.to] }; } }) });
  assert.equal(result.accepted, true);
});
