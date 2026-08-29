import Link from "next/link";
import { asc, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { commerceSolutionBlueprints, customerSolutionAssignments } from "../../../db/schema";
import { requireAdminUser } from "../../admin-auth";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";
import { AdminShell } from "../admin-shell";
import "./solutions-admin.css";

const list = (value: string) => { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } };

export default async function SolutionsPage() {
  const admin = await requireAdminUser("/yonetim/cozumler");
  if (!admin.authorized || !admin.user) return null;
  const env = await readRuntimeEnv();
  await ensureCommerceLicenseTables(env);
  const db = getDb();
  const [blueprints, counts] = await Promise.all([
    db.select().from(commerceSolutionBlueprints).orderBy(asc(commerceSolutionBlueprints.sector), asc(commerceSolutionBlueprints.name)),
    db.select({ blueprintId: customerSolutionAssignments.blueprintId, total: sql<number>`count(*)` }).from(customerSolutionAssignments).groupBy(customerSolutionAssignments.blueprintId).orderBy(desc(sql`count(*)`)),
  ]);
  const totals = new Map(counts.map((item) => [item.blueprintId, Number(item.total)]));
  return <AdminShell current="cozumler" displayName={admin.user.displayName}><section className="admin-main solution-admin-page">
    <header className="admin-heading"><div><span className="kicker">AVCI COMMERCE ÜRÜNLEŞTİRME</span><h1>Çözüm & Sektör Kataloğu</h1><p>BasBitir gibi doğrulanmış sektör çözümlerini tema, modül ve sürüm sözleşmesiyle yönetin.</p></div><div className="solution-admin-actions"><Link className="button button-primary" href="/control-desk">Uygulama tanıtımı</Link><span>{blueprints.length} çözüm</span></div></header>
    <div className="solution-admin-note"><strong>Kaynak kod deposu değildir.</strong><span>Node.js, React, PHP veya Laravel çözümleri burada yalnız imzalı sürüm manifesti ve kurulum profili olarak kayıt edilir. Müşteriye kod kopyası değil lisanslı çözüm ataması yapılır.</span></div>
    <div className="solution-admin-grid">{blueprints.map((item) => <article key={item.id} className="solution-admin-card"><div><small>{item.sector}</small><span className={`solution-status is-${item.status}`}>{item.status === "active" ? "Yayında" : "Taslak"}</span></div><h2>{item.name}</h2><p>{item.summary}</p><dl><div><dt>Sürüm</dt><dd>{item.currentVersion}</dd></div><div><dt>Kanal</dt><dd>{item.releaseChannel}</dd></div><div><dt>Müşteri ataması</dt><dd>{totals.get(item.id) || 0}</dd></div></dl><div className="solution-admin-tags">{list(item.technologyJson).map((tag) => <span key={tag}>{tag}</span>)}{item.themeKey ? <span>Tema · {item.themeKey}</span> : null}</div><footer><code>{item.blueprintKey}</code>{item.previewUrl ? <a href={item.previewUrl} rel="noreferrer" target="_blank">Önizle ↗</a> : <span>Önizleme yok</span>}</footer></article>)}</div>
    <div className="solution-admin-footer"><div><strong>Atama ve kurulum Control Desk’te</strong><p>Aktif müşteri lisansını seçin, çözümü atayın ve ardından tek kullanımlık ajanla güvenli kurulumu başlatın.</p></div><Link className="button" href="/control-desk">Control Desk’i indir</Link></div>
  </section></AdminShell>;
}
