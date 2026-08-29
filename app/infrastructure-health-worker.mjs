import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import tls from "node:tls";

const PRIVATE_V4 = /^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

export function isPrivateAddress(address) {
  if (!address) return true;
  if (isIP(address) === 4) return PRIVATE_V4.test(address) || address === "0.0.0.0";
  const value = address.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}

export function validateMonitorTarget(monitor) {
  const url = new URL(String(monitor?.checkUrl || ""));
  const domain = String(monitor?.domain || "").trim().toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hostname.toLowerCase() !== domain) {
    throw new Error("Monitör hedefi lisanslı HTTPS domainiyle eşleşmiyor.");
  }
  return url;
}

export function nextMonitorState(previous, probe, now = new Date()) {
  const previousFailures = Number(previous?.consecutiveFailures || 0);
  const failed = !probe.ok;
  const consecutiveFailures = failed ? previousFailures + 1 : 0;
  const sslDays = probe.sslExpiresAt ? Math.floor((new Date(probe.sslExpiresAt).getTime() - now.getTime()) / 86_400_000) : null;
  const status = failed ? (consecutiveFailures >= 3 ? "offline" : "warning") : sslDays !== null && sslDays <= 30 ? "warning" : "healthy";
  return {
    status,
    consecutiveFailures,
    shouldOpenIncident: failed && consecutiveFailures === 3,
    shouldResolveIncident: !failed && ["offline", "warning"].includes(String(previous?.status || "")),
    incidentType: failed ? "site_unreachable" : sslDays !== null && sslDays <= 30 ? "ssl_expiring" : "",
  };
}

async function assertPublicHost(hostname) {
  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateAddress(record.address))) throw new Error("Hedef genel internette güvenli bir IP'ye çözümlenmiyor.");
}

function tlsExpiry(hostname, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: hostname, port: 443, servername: hostname, rejectUnauthorized: true });
    const timer = setTimeout(() => socket.destroy(new Error("TLS zaman aşımı")), timeoutMs);
    socket.once("secureConnect", () => {
      clearTimeout(timer);
      const certificate = socket.getPeerCertificate();
      socket.end();
      if (!certificate?.valid_to) return reject(new Error("TLS sertifika tarihi alınamadı."));
      resolve(new Date(certificate.valid_to).toISOString());
    });
    socket.once("error", (error) => { clearTimeout(timer); reject(error); });
  });
}

export async function probeMonitor(monitor, { fetchImpl = fetch, timeoutMs = 10_000 } = {}) {
  const url = validateMonitorTarget(monitor);
  const started = Date.now();
  try {
    await assertPublicHost(url.hostname);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try { response = await fetchImpl(url, { method: "HEAD", redirect: "manual", signal: controller.signal, headers: { "user-agent": "Avci-Uptime-Monitor/1.0" } }); }
    finally { clearTimeout(timer); }
    const sslExpiresAt = await tlsExpiry(url.hostname, timeoutMs);
    const ok = response.status >= 200 && response.status < 400;
    return { ok, httpStatus: response.status, responseMs: Date.now() - started, sslExpiresAt, safeCode: ok ? "ok" : `http_${response.status}` };
  } catch (error) {
    return { ok: false, httpStatus: 0, responseMs: Date.now() - started, sslExpiresAt: "", safeCode: error?.name === "AbortError" ? "timeout" : "connection_failed" };
  }
}
