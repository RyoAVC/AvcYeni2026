const MAX_ADMIN_BODY_BYTES = 8_192;

function failure(status, error) {
  return { ok: false, status, error };
}

export function validateAdminOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) {
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

