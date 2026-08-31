import { paytrConfig, requestPaytrTestToken, verifyPaytrCallback } from "./paytr-provider.mjs";

export const name = "paytr";

export function isConfigured(env = process.env) {
  try { paytrConfig(env); return true; } catch { return false; }
}

export async function createPaymentSession(order, { env = process.env, fetchImpl = fetch } = {}) {
  const token = await requestPaytrTestToken(order, { env, fetchImpl });
  return { provider: name, token, iframeUrl: `https://www.paytr.com/odeme/guvenli/${token}` };
}

export function verifyCallback(body, env = process.env) {
  return verifyPaytrCallback(body, paytrConfig(env));
}
