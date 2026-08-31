const emailPattern = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;

export function smtpConfig(env = process.env) {
  const port = Number(env.SMTP_PORT);
  const from = env.SMTP_FROM || env.SMTP_USER;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || ![465, 587].includes(port) || !emailPattern.test(from ?? "")) throw new Error("SMTP yapılandırması eksik veya hatalı.");
  return {
    from,
    transport: {
      host: env.SMTP_HOST, port, secure: port === 465, requireTLS: true,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
      logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
    },
  };
}

export async function sendTestPasswordSetupMail({ to, setupUrl, existingAccount = false }, { env = process.env, createTransport } = {}) {
  const config = smtpConfig(env);
  // Until approval, outgoing mail can only target a configured test mailbox.
  if (env.PAYTR_TEST_MODE !== "1" || !emailPattern.test(to) || to !== env.CHECKOUT_TEST_EMAIL) throw new Error("Yalnız yapılandırılmış test alıcısına e-posta gönderilebilir.");
  const base = new URL(env.CHECKOUT_PUBLIC_URL);
  const url = new URL(existingAccount ? `${base.href.replace(/\/$/, "")}/musteri-panel/giris` : setupUrl);
  const localMock = env.CHECKOUT_MOCK_MODE === "1" && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname);
  if (url.origin !== base.origin || (url.protocol !== "https:" && !localMock) || url.username || url.password) throw new Error("Geçersiz parola bağlantısı.");
  const factory = createTransport ?? (await import("nodemailer")).default.createTransport;
  const transport = factory(config.transport);
  try {
    const text = existingAccount
      ? `Mock paket satın alma testi tamamlandı. Mevcut hesabınızın parolası değiştirilmedi.\n${url.href}`
      : `Bu bir test işlemidir. Parolanızı aşağıdaki tek kullanımlık bağlantıdan belirleyin. Bağlantı 30 dakika geçerlidir. Yerel test bağlantısı yalnız test sunucusunun çalıştığı bilgisayarda açılır.\n\n${url.href}\n\nBu işlemi siz başlatmadıysanız bağlantıyı kullanmayın.`;
    const result = await transport.sendMail({ from: config.from, to, subject: "Avcı E-Ticaret — mock satın alma testi", text });
    if (!result.accepted?.includes(to)) throw new Error("SMTP test iletisini kabul etmedi.");
    return { accepted: true };
  } catch {
    // SMTP errors can contain credentials, addresses or bearer links.
    throw new Error("SMTP test iletisi gönderilemedi.");
  } finally {
    transport.close?.();
  }
}
