// iyzico adapter skeleton: no merchant account exists yet, so this must never reach the network.
// Fill in createPaymentSession/verifyCallback once real credentials are available.
export const name = "iyzico";

export function isConfigured() {
  return false;
}

export async function createPaymentSession() {
  throw new Error("iyzico entegrasyonu henüz uygulanmadı.");
}

export function verifyCallback() {
  throw new Error("iyzico entegrasyonu henüz uygulanmadı.");
}
