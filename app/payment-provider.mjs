import * as paytr from "./payment-provider-paytr.mjs";
import * as iyzico from "./payment-provider-iyzico.mjs";

// Every adapter exports: name, isConfigured(env), createPaymentSession(order, { env, fetchImpl }), verifyCallback(body, env).
const PROVIDERS = { paytr, iyzico };

export function getPaymentProvider(providerName, env = process.env) {
  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Bilinmeyen ödeme sağlayıcısı: ${providerName}`);
  return provider;
}

export function activePaymentProvider(env = process.env) {
  return getPaymentProvider(env.PAYMENT_PROVIDER || "paytr", env);
}
