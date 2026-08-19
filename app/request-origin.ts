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
    const incoming = new URL(origin);
    const expected = new URL(publicRequestOrigin(request));
    if (incoming.origin === expected.origin) return true;
    const web = (protocol: string) => protocol === "http:" || protocol === "https:";
    return incoming.hostname === expected.hostname && web(incoming.protocol) && web(expected.protocol);
  } catch {
    return false;
  }
}
