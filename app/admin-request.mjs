const MAX_ADMIN_BODY_BYTES = 8_192;

function failure(status, error) {
  return { ok: false, status, error };
}

export function validateAdminOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",").at(-1)?.trim();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",").at(-1)?.trim();
    const host = forwardedHost || request.headers.get("host")?.trim();
    const expected = host && (forwardedProto === "https" || forwardedProto === "http")
      ? `${forwardedProto}://${host}`
      : new URL(request.url).origin;
    const incomingUrl = new URL(origin);
    const expectedUrl = new URL(expected);
    const webProtocol = (value) => value === "http:" || value === "https:";
    const sameOrigin = incomingUrl.origin === expectedUrl.origin;
    const sameWebHost = incomingUrl.hostname === expectedUrl.hostname
      && webProtocol(incomingUrl.protocol)
      && webProtocol(expectedUrl.protocol);
    if (!sameOrigin && !sameWebHost) {
      return failure(403, "İstek kaynağı doğrulanamadı.");
    }
  } catch {
    return failure(403, "İstek kaynağı doğrulanamadı.");
  }
  return null;
}

export function validateAdminMutationRequest(request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return failure(415, "İstek application/json biçiminde olmalıdır.");
  }

  const originFailure = validateAdminOrigin(request);
  if (originFailure) return originFailure;

  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_ADMIN_BODY_BYTES) {
    return failure(413, "İstek verisi çok büyük.");
  }

  return null;
}

export function validateAdminMultipartRequest(request, maxBytes = 280_000) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "multipart/form-data") {
    return failure(415, "İstek multipart/form-data biçiminde olmalıdır.");
  }

  const originFailure = validateAdminOrigin(request);
  if (originFailure) return originFailure;

  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return failure(413, "İstek verisi çok büyük.");
  }

  return null;
}

export async function readAdminJsonObject(request) {
  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return failure(400, "İstek verisi okunamadı.");
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_ADMIN_BODY_BYTES) {
    return failure(413, "İstek verisi çok büyük.");
  }

  try {
    const value = JSON.parse(rawBody);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return failure(400, "İstek verisi geçerli bir nesne olmalıdır.");
    }
    return { ok: true, value };
  } catch {
    return failure(400, "İstek verisi okunamadı.");
  }
}
