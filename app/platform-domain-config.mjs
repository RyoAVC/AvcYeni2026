const TEMPORARY_CONTROL_PLANE = "https://yeni.avcieticaret.com/v2";
const CANONICAL_ORIGIN = "https://avcieticaret.com";

function normalizedHttps(value, fallback) {
  try {
    const url = new URL(String(value || fallback));
    if (url.protocol !== "https:") return fallback;
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return fallback;
  }
}
export function getPlatformDomainConfig(env = {}) {
  const stage = String(env.AVCI_DOMAIN_STAGE || "temporary").trim() === "canonical"
    ? "canonical"
    : "temporary";
  const temporaryControlPlane = normalizedHttps(
    env.AVCI_TEMPORARY_CONTROL_PLANE_ORIGIN,
    TEMPORARY_CONTROL_PLANE,
  );
  const canonicalOrigin = normalizedHttps(env.AVCI_CANONICAL_ORIGIN, CANONICAL_ORIGIN);
  return {
    stage,
    activeControlPlane: stage === "canonical" ? canonicalOrigin : temporaryControlPlane,
    temporaryControlPlane,
    canonicalOrigin,
    canonicalStatus: stage === "canonical" ? "active" : "maintenance",
    automaticCutover: false,
  };
}
