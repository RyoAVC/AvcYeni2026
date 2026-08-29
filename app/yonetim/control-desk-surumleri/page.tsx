import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { controlDeskAppReleases } from "../../../db/schema";
import { requireAdminUser } from "../../admin-auth";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";
import { AdminShell } from "../admin-shell";
import "./releases.css";

export default async function ControlDeskReleasesPage() {
  const admin = await requireAdminUser("/yonetim/control-desk-surumleri");
  if (!admin.authorized || !admin.user) return null;
  await ensureCommerceLicenseTables(await readRuntimeEnv());
  const releases = await getDb().select().from(controlDeskAppReleases).orderBy(desc(controlDeskAppReleases.createdAt)).limit(100);
  return <AdminShell current="uygulama-surumleri" displayName={admin.user.displayName}><section className="release-admin"><header><div><span>CONTROL DESK DAĞITIM MERKEZİ</span><h1>Uygulama sürümleri</h1><p>İmzalı masaüstü paketlerinin kanal, platform ve yayın durumunu tek yerden izleyin.</p></div><Link href="/control-desk">İndirme sayfasını aç ↗</Link></header><aside><strong>Yayın güvenliği etkin</strong><p>İmza, SHA-256 ve imzalı manifesti bulunmayan paket stable veya pilot kanalında indirilmeye açılmaz. Yeni kayıtlar sürümlü Control Desk API’si üzerinden oluşturulur.</p></aside><div className="release-table"><div className="release-row release-head"><span>Sürüm</span><span>Hedef</span><span>Kanal</span><span>İmza</span><span>Yayın</span></div>{releases.length ? releases.map((item) => <div className="release-row" key={item.id}><strong>v{item.version}</strong><span>{item.platform} · {item.architecture}</span><span>{item.channel}</span><span className={`pill is-${item.signatureStatus}`}>{item.signatureStatus === "verified" ? "Doğrulandı" : item.signatureStatus}</span><span className={`pill is-${item.status}`}>{item.status === "published" ? "Yayında" : item.status === "withdrawn" ? "Geri çekildi" : "Taslak"}</span><code title={item.sha256}>{item.sha256.slice(0,16)}…</code></div>) : <div className="release-empty"><strong>Henüz yayın kaydı yok</strong><p>Mevcut imzasız geliştirme paketi güvenlik kapısından reddedildi; bu nedenle müşteriye gösterilmiyor.</p></div>}</div></section></AdminShell>;
}
