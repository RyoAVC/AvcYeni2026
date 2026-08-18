import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { packageDraftFromCatalog } from "../../../package-scope-details";
import { getPackageName, parseCatalogPackageId } from "../../../package-options";
import { PackageForm } from "../package-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Yazılım Paketi | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/paketler/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Paket ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/paketler/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const catalogId = parseCatalogPackageId((await searchParams).cerceve);
  const draft = packageDraftFromCatalog(catalogId);

  return (
    <AdminShell current="paketler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{draft ? `${getPackageName(catalogId)} kartı` : "Yeni paket"}</h1>
            <Link className="admin-back-link" href="/yonetim/paketler">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>
              {draft
                ? "Kapsam sitedeki paket sayfasından dolduruldu. Kaydetmeden kontrol edin. Kamu /paketler sayfası otomatik değişmez."
                : "Ad zorunlu. Fiyat kutusu yok; tutar teklifte yazılır. Bu kayıt kamu /paketler sayfasını otomatik değiştirmez."}
            </p>
          </div>
        </header>
        <PackageForm mode="create" initial={draft} />
      </section>
    </AdminShell>
  );
}
