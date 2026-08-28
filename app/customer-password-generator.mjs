const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateCustomerPortalPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const random = Array.from(bytes, (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join("");
  return `${random.slice(0, 6)}-${random.slice(6, 12)}-${random.slice(12)}-A9a`;
}
