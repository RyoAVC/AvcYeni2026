function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeLeadAttribution(payload = {}) {
  const utmSource = clean(payload.utmSource, 100);
  const utmMedium = clean(payload.utmMedium, 100);
  const utmCampaign = clean(payload.utmCampaign, 160);
  const requestedReferrerHost = clean(payload.referrerHost, 120).toLocaleLowerCase("en-US");
  const referrerHost = /^[a-z0-9.-]+$/.test(requestedReferrerHost) ? requestedReferrerHost : "";
  const requestedLandingPath = clean(payload.landingPath, 300);
  const landingPath = requestedLandingPath.startsWith("/") ? requestedLandingPath.split(/[?#]/, 1)[0] : "";

  return {
    source: utmSource || referrerHost || "direct",
    utmSource,
    utmMedium,
    utmCampaign,
    referrerHost,
    landingPath,
  };
}
