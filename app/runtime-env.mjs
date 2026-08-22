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
