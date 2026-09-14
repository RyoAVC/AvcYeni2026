import { smtpConfig } from "./checkout-smtp.mjs";

const emailPattern = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;

/**
 * Real (non-test) outbound mail: sends a one-time demo access link to the
 * actual applicant. Unlike checkout-smtp's mock sender, the recipient is not
 * restricted to a fixed test mailbox — only origin-locking on the link stays.
 */
export async function sendDemoInviteMail({ to, contactName, companyName, setupUrl, trialDays, expectedOrigin }, { env = process.env, createTransport } = {}) {
  const config = smtpConfig(env);
  if (!emailPattern.test(to ?? "")) throw new Error("Geçersiz alıcı e-postası.");

  const url = new URL(setupUrl);
  if (url.origin !== expectedOrigin || url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Geçersiz demo erişim bağlantısı.");
  }

  const factory = createTransport ?? (await import("nodemailer")).default.createTransport;
  const transport = factory(config.transport);
  try {
    const name = String(contactName || "").trim() || "Merhaba";
    const firma = String(companyName || "").trim();
    const text = [
      `${name},`,
      "",
      `Avcı E-Ticaret demo erişiminiz hazır${firma ? ` — ${firma} adına` : ""}.`,
      `Aşağıdaki tek kullanımlık bağlantıdan bir parola belirleyip panele giriş yapabilirsiniz.`,
      `Bağlantı ve içindeki anahtar ${trialDays} gün geçerlidir; kimseyle paylaşmayın.`,
      "",
      url.href,
      "",
      "Bu erişim demo amaçlıdır: gerçek ödeme, kargo ve müşteri bildirimleri kapalıdır.",
      "Bu talebi siz oluşturmadıysanız bağlantıyı kullanmayın.",
    ].join("\n");
    const result = await transport.sendMail({
      from: config.from,
      to,
      subject: "Avcı E-Ticaret — demo erişiminiz hazır",
      text,
    });
    if (!result.accepted?.includes(to)) throw new Error("SMTP demo davetini kabul etmedi.");
    return { accepted: true };
  } catch {
    // SMTP errors can contain credentials, addresses or bearer links.
    throw new Error("Demo daveti gönderilemedi.");
  } finally {
    transport.close?.();
  }
}
