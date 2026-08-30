export const CONTROL_DESK_REDIRECT_URIS = Object.freeze([
  "avcicontrol://auth/callback",
  "avcicommerce://auth/callback",
]);

export function validControlDeskRedirect(value) {
  return CONTROL_DESK_REDIRECT_URIS.includes(String(value || ""));
}

export function validPkceChallenge(value) {
  return /^[A-Za-z0-9_-]{43,128}$/.test(String(value || ""));
}
