import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { controlDeskAppReleases } from "../../db/schema";
import { ensureCommerceLicenseTables } from "../local-d1-schema.mjs";
import { readRuntimeEnv } from "../runtime-env.mjs";
import "./control-desk.css";

const targets = [
  { key: "windows", platform: "Windows", detail: "Windows 10/11 · x64", label: "EXE indir" },
  { key: "macos", platform: "macOS", detail: "Apple Silicon ve Intel", label: "DMG indir" },
  { key: "linux", platform: "Linux", detail: "Ubuntu LTS · AppImage", label: "AppImage indir" },
];

async function getPublishedReleases() {
  const env = await readRuntimeEnv();
  await ensureCommerceLicenseTables(env);
  const rows = await getDb().select().from(controlDeskAppReleases).where(and(eq(controlDeskAppReleases.channel, "stable"), eq(controlDeskAppReleases.status, "published"), eq(controlDeskAppReleases.signatureStatus, "verified"))).orderBy(desc(controlDeskAppReleases.publishedAt)).limit(30);
  const latest = new Map<string, typeof rows[number]>();
  for (const row of rows) if (!latest.has(row.platform)) latest.set(row.platform, row);
  return [...latest.values()];
}

export default async function ControlDeskPage() {
  let published: Awaited<ReturnType<typeof getPublishedReleases>> = [];
  try { published = await getPublishedReleases(); } catch (cause) { console.error("Control Desk landing release list failed", cause); }
  const byPlatform = new Map(published.map((item) => [item.platform, item]));
  const downloads = targets.map((target) => ({ ...target, release: byPlatform.get(target.key) }));
  return <main className="desk-landing"><nav><Link href="/"><img src="/brand/avci-logo-dark-transparent.png" alt="Avcı E-Ticaret" /></Link><span>CONTROL DESK</span><Link href="/musteri-panel">Müşteri Merkezi →</Link></nav><section className="desk-hero"><div><p>AVCI COMMERCE OPERASYON UYGULAMASI</p><h1>Mağazanızı kurun.<br/>Sağlığını tek yerden izleyin.</h1><span>Lisans, çözüm paketi, uzaktan kurulum, sürüm ve destek bilgileri Avcı Control Desk’te güvenli biçimde birleşir.</span><div><a href="#indir">Uygulamayı indir</a><Link href="/musteri-panel">Web paneline gir</Link></div></div><div className="desk-app-preview"><img src="/brand/avci-logo-dark-transparent.png" alt=""/><strong>Avcı Control Desk</strong><small>Merkeze bağlı · güvenli oturum</small><div><i></i><span><b>Mağaza sağlığı</b>Son sinyal ve sürüm durumu</span></div><div><i></i><span><b>Çözümlerim</b>Atanmış tema ve sektör paketleri</span></div><div><i></i><span><b>Kurulumlar</b>Aşamalı uzak kurulum takibi</span></div></div></section><section className="desk-features"><article><b>01</b><h2>Rol bazlı erişim</h2><p>Müşteri yalnız kendi mağazasını görür; Avcı ekibi yetkisi kadar operasyon yürütür.</p></article><article><b>02</b><h2>Güvenli kurulum</h2><p>Hosting parolası uygulamaya alınmaz. Tek kullanımlık ajan ve imzalı sürüm kullanılır.</p></article><article><b>03</b><h2>Çözüm kataloğu</h2><p>BasBitir matbaa veya giyim profili, lisanslı tema ve modüllerle mağazaya atanır.</p></article></section><section className="desk-download" id="indir"><header><p>RESMİ İNDİRME MERKEZİ</p><h2>Cihazınız için Control Desk</h2><span>Yalnız Avcı tarafından imzası doğrulanmış paketleri indirin.</span></header><div>{downloads.map((item) => <article key={item.platform}><span>{item.platform.slice(0,2).toUpperCase()}</span><div><h3>{item.platform}</h3><p>{item.detail}</p>{item.release ? <small>v{item.release.version} · {item.release.architecture} · doğrulandı</small> : null}</div>{item.release ? <a href={item.release.fileUrl} rel="noreferrer">{item.label} ↓</a> : <button disabled>Henüz yayınlanmadı</button>}{item.release ? <code title={item.release.sha256}>SHA-256 · {item.release.sha256.slice(0,12)}…</code> : null}</article>)}</div><small>Bağlantılar merkezi sürüm kataloğundan gelir. İmza, manifest veya SHA-256 doğrulaması eksik paketler burada gösterilmez.</small></section><footer><img src="/brand/avci-logo-dark-transparent.png" alt="Avcı E-Ticaret"/><span>© 2026 Avcı E-Ticaret · Control Desk</span><Link href="/">avcieticaret.com</Link></footer></main>;
}
