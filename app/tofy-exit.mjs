export const TOFY_IDLE_MS = 12000;
export const TOFY_EXIT_Y = 12;
export const TOFY_IDLE_LINE = "Tık tık, buradayım.";
export const TOFY_EXIT_SEEN_KEY = "tofy_exit_seen";

export const DEFAULT_TOFY_POPUP = {
  enabled: "on",
  title: "Hey, bir dakika",
  text: "Gitmeden bakın: demo, teklif veya güncel kampanya için Tofy ve ekip yardımcı olur.",
  button: "Daha fazla bilgi",
  href: "/teklif",
};

export function isMouseIdle(lastMoveAt, now = Date.now()) {
  const stamp = Number(lastMoveAt);
  if (!Number.isFinite(stamp)) return false;
  return now - stamp >= TOFY_IDLE_MS;
}

export function isExitIntent(clientY, relatedTarget) {
  if (relatedTarget) return false;
  return typeof clientY === "number" && clientY <= TOFY_EXIT_Y;
}

export function sanitizePopupHref(value) {
  const raw = String(value ?? "").trim();
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\\:]/.test(raw.slice(1))) {
    return DEFAULT_TOFY_POPUP.href;
  }
  return raw.slice(0, 80);
}
