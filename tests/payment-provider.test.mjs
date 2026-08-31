import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { getPaymentProvider, activePaymentProvider } from "../app/payment-provider.mjs";
import * as paytrAdapter from "../app/payment-provider-paytr.mjs";
import * as iyzicoAdapter from "../app/payment-provider-iyzico.mjs";

const env = { PAYTR_MERCHANT_ID: "123", PAYTR_MERCHANT_KEY: "fixture-key", PAYTR_MERCHANT_SALT: "fixture-salt", PAYTR_TEST_MODE: "1" };
const order = { id: "TEST001", ip: "203.0.113.1", email: "test@example.com", name: "Test", address: "Test address", phone: "5550000000", packageName: "Start", amountKurus: 12345, okUrl: "https://example.com/ok", failUrl: "https://example.com/fail" };

test("registry resolves known adapters and rejects unknown names", () => {
  assert.equal(getPaymentProvider("paytr"), paytrAdapter);
  assert.equal(getPaymentProvider("iyzico"), iyzicoAdapter);
  assert.throws(() => getPaymentProvider("stripe"), /Bilinmeyen ödeme sağlayıcısı/);
});

test("active provider defaults to paytr and honors PAYMENT_PROVIDER", () => {
  assert.equal(activePaymentProvider({}), paytrAdapter);
  assert.equal(activePaymentProvider({ PAYMENT_PROVIDER: "iyzico" }), iyzicoAdapter);
});

test("paytr adapter reports configuration state without making requests", () => {
  assert.equal(paytrAdapter.isConfigured({}), false);
  assert.equal(paytrAdapter.isConfigured(env), true);
});

test("paytr adapter builds a session token and iframe URL", async () => {
  const fetchImpl = async () => Response.json({ status: "success", token: "fixturetoken000000000" });
  const session = await paytrAdapter.createPaymentSession(order, { env, fetchImpl });
  assert.equal(session.provider, "paytr");
  assert.equal(session.token, "fixturetoken000000000");
  assert.equal(session.iframeUrl, "https://www.paytr.com/odeme/guvenli/fixturetoken000000000");
});

test("paytr adapter verifyCallback delegates to signature verification", () => {
  const body = { merchant_oid: "TEST001", status: "success", total_amount: "12345" };
  body.hash = createHmac("sha256", "fixture-key").update("TEST001fixture-saltsuccess12345").digest("base64");
  assert.equal(paytrAdapter.verifyCallback(body, env), true);
  assert.equal(paytrAdapter.verifyCallback({ ...body, total_amount: "1" }, env), false);
});

test("iyzico adapter is never configured and never touches the network", async () => {
  assert.equal(iyzicoAdapter.isConfigured(), false);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network should not be called"); };
  try {
    await assert.rejects(iyzicoAdapter.createPaymentSession(order, { env }), /henüz uygulanmadı/);
    assert.throws(() => iyzicoAdapter.verifyCallback({}, env), /henüz uygulanmadı/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
