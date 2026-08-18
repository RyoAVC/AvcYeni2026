function lastForwardedValue(value: string | null) {
  return value?.split(",").at(-1)?.trim() || "";
}

export function publicRequestOrigin(request: Request) {
  const forwardedProto = lastForwardedValue(request.headers.get("x-forwarded-proto"));
  const host = request.headers.get("host")?.trim() || "";
  if ((forwardedProto === "https" || forwardedProto === "http") && host && !/[\s/\\]/.test(host)) {
    return `${forwardedProto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function isSameRequestOrigin(request: Request, origin: string) {
  try {
    return new URL(origin).origin === publicRequestOrigin(request);
  } catch {
    return false;
  }
}
