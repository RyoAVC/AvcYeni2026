/** Vinext: cloudflare:workers env + process.env (systemd Environment satirlari). */
export async function readRuntimeEnv() {
  const processEnv = typeof process !== "undefined" ? process.env : {};
  try {
    const { env } = await import("cloudflare:workers");
    return { ...processEnv, ...env };
  } catch {
    return processEnv;
  }
}

export function mergeRuntimeEnv(env) {
  const processEnv = typeof process !== "undefined" ? process.env : {};
  if (!env) return processEnv;
  return { ...processEnv, ...env };
}

export function runtimeEnvValue(env, name) {
  const binding = typeof env?.[name] === "string" ? env[name].trim() : "";
  if (binding) return binding;
  if (typeof process !== "undefined" && typeof process.env?.[name] === "string") {
    return process.env[name].trim();
  }
  return "";
}

export function runtimeEnvFlag(env, name) {
  return runtimeEnvValue(env, name) === "1";
}

/** Canli test slotu: yeni.avcieticaret.com/v2 — gizli onizleme burada acilir. */
export function isLiveV2PreviewSlot(env) {
  const nodeEnv = runtimeEnvValue(env, "NODE_ENV");
  const basePath = runtimeEnvValue(env, "NEXT_PUBLIC_BASE_PATH").replace(/\/$/, "");
  return nodeEnv === "production" && basePath === "/v2";
}

export function isCustomerPortalPreviewRuntimeEnabled(env) {
  return runtimeEnvFlag(env, "CUSTOMER_PORTAL_PREVIEW") || isLiveV2PreviewSlot(env);
}
