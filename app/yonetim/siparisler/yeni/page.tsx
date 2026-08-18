import type { Metadata } from "next";
import Link from "next/link";
import { asc, and, eq, ne } from "drizzle-orm";
import { customers, modules, packages, softwareOrders } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { parseAdminCustomerId, parseAdminModuleId, parseAdminPackageId } from "../../../admin-customer-query.mjs";
import {
  findAdminPackageByCatalogId,
  getPackageName,
  guessCatalogPackageId,
  parseCatalogPackageId,
} from "../../../package-options";
import { orderPriceNoteFromCatalog } from "../../../package-scope-details";
import { OrderForm } from "../order-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Yazılım Siparişi | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewSoftwareOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/siparisler/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Sipariş ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/siparisler/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let customerOptions: Array<{ id: number; name: string; extra?: string; interest: string }> = [];
  let packageOptions: Array<{ id: number; name: string; slug: string; priceNote: string }> = [];
  let moduleOptions: Array<{ id: number; name: string; priceNote: string }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customerRows, packageRows, moduleRows] = await Promise.all([
      db.select({ id: customers.id, name: customers.name, company: customers.company, interest: customers.interest }).from(customers).orderBy(asc(customers.name)),
      db.select({ id: packages.id, name: packages.name, slug: packages.slug, priceNote: packages.priceNote }).from(packages).orderBy(asc(packages.sortOrder), asc(packages.id)),
      db.select({ id: modules.id, name: modules.name, priceNote: modules.priceNote }).from(modules).orderBy(asc(modules.sortOrder), asc(modules.id)),
    ]);
    customerOptions = customerRows.map((item) => ({ id: item.id, name: item.name, extra: item.company || undefined, interest: item.interest }));
    packageOptions = packageRows;
    moduleOptions = moduleRows;
  } catch (cause) {
    console.error("New software order page failed", cause);
    databaseFailed = true;
  }

  const params = await searchParams;
  const requestedCustomerId = parseAdminCustomerId(params.musteri);
  const selectedCustomer = customerOptions.find((item) => item.id === requestedCustomerId);
  const selectedCustomerId = selectedCustomer?.id ?? 0;
  const adminPackageId = parseAdminPackageId(params.paketId);
  const adminModuleId = parseAdminModuleId(params.modulId);
  const selectedAdminPackage = packageOptions.find((item) => item.id === adminPackageId);
  const selectedAdminModule = moduleOptions.find((item) => item.id === adminModuleId);
  const missingAdminPackage = Boolean(adminPackageId && !selectedAdminPackage);
  const missingAdminModule = Boolean(adminModuleId && !selectedAdminModule);
  const requestedCatalogId = parseCatalogPackageId(params.paket);
  const catalogId = selectedAdminPackage || selectedAdminModule ? "" : (requestedCatalogId || guessCatalogPackageId(selectedCustomer?.interest));
  const matchedPackage = selectedAdminPackage || findAdminPackageByCatalogId(packageOptions, catalogId);
  const missingCatalogPackage = Boolean(requestedCatalogId && !selectedAdminPackage && !selectedAdminModule && !matchedPackage);

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Sipariş formu açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/siparisler">Listeye dön</Link>
        </section>
      </main>
    );
  }

  const formCustomers = customerOptions.map(({ id, name, extra }) => ({ id, name, extra }));
  const formPackages = packageOptions.map(({ id, name }) => ({ id, name }));
  const formModules = moduleOptions.map(({ id, name }) => ({ id, name }));

  let existingOrderId = 0;
  const explicitPackageId = selectedAdminPackage?.id || (requestedCatalogId ? (matchedPackage?.id ?? 0) : 0);
  if (!databaseFailed && selectedCustomerId && (selectedAdminModule || explicitPackageId)) {
    try {
      const { getDb } = await import("../../../../db");
      const db = getDb();
      const duplicateWhere = selectedAdminModule
        ? and(
          eq(softwareOrders.customerId, selectedCustomerId),
          eq(softwareOrders.kind, "module"),
          eq(softwareOrders.moduleId, selectedAdminModule.id),
          ne(softwareOrders.status, "cancelled"),
        )
        : and(
          eq(softwareOrders.customerId, selectedCustomerId),
          eq(softwareOrders.kind, "package"),
          eq(softwareOrders.packageId, explicitPackageId),
          ne(softwareOrders.status, "cancelled"),
        );
      const [duplicate] = await db.select({ id: softwareOrders.id }).from(softwareOrders).where(duplicateWhere).limit(1);
      existingOrderId = duplicate?.id ?? 0;
    } catch (cause) {
      console.error("Existing software order lookup failed", cause);
    }
  }
  const backHref = selectedCustomerId
    ? `/yonetim/musteriler/${selectedCustomerId}`
    : selectedAdminPackage
      ? `/yonetim/paketler/${selectedAdminPackage.id}`
      : selectedAdminModule
        ? `/yonetim/moduller/${selectedAdminModule.id}`
        : "/yonetim/siparisler";
  const backLabel = selectedCustomerId ? "Müşteriye dön" : selectedAdminPackage ? "Pakete dön" : selectedAdminModule ? "Modüle dön" : "Listeye dön";
  const hint = selectedAdminModule
    ? `${selectedAdminModule.name} eklentisi. Mağaza stoğu değil; kart çekimi yok.`
    : selectedAdminPackage
      ? `${selectedAdminPackage.name} lisans kaydı. Kart çekimi yok.`
      : requestedCatalogId
        ? `${getPackageName(requestedCatalogId)} çerçevesi sitedeki paket sayfasıyla aynı kaynaktır. Kart çekimi yok; bu bir lisans kaydıdır.`
        : "Müşteri ve paket/modül zorunlu. Kart çekimi veya kasa yok; bu bir lisans kaydıdır.";
  const draft = selectedAdminModule
    ? {
        customerId: selectedCustomerId,
        kind: "module" as const,
        packageId: null,
        moduleId: selectedAdminModule.id,
        status: "draft",
        priceNote: selectedAdminModule.priceNote || "",
        note: `${selectedAdminModule.name} eklentisi. Tutar teklifte netleşir; bu kasa fişi değildir.`,
      }
    : selectedAdminPackage || selectedCustomerId || matchedPackage
      ? {
          customerId: selectedCustomerId,
          kind: "package" as const,
          packageId: (selectedAdminPackage || matchedPackage)?.id ?? null,
          moduleId: null,
          status: "draft",
          priceNote: selectedAdminPackage?.priceNote || orderPriceNoteFromCatalog(catalogId) || "",
          note: selectedAdminPackage
            ? `${selectedAdminPackage.name} çerçevesi. Tutar teklifte netleşir; bu kasa fişi değildir.`
            : catalogId
              ? `${getPackageName(catalogId)} çerçevesi. Tutar teklifte netleşir; bu kasa fişi değildir.`
              : "",
        }
      : undefined;

  return (
    <AdminShell current="siparisler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yeni yazılım siparişi</h1>
            <Link className="admin-back-link" href={backHref}>{backLabel}</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{hint} Kaydedince fatura taslağı açılır.</p>
            {selectedCustomerId ? <Link href={`/yonetim/musteriler/${selectedCustomerId}`}>Müşteri kartı</Link> : null}
          </div>
        </header>
        {customerOptions.length === 0 ? (
          <div className="admin-empty">
            <h2>Önce yazılım müşterisi ekleyin.</h2>
            <p>Sipariş, altyapı alan bir işletmeye bağlanır. Mağaza alışveriş müşterisi değil.</p>
            <Link className="button button-primary" href="/yonetim/musteriler/yeni">Müşteri ekle</Link>
          </div>
        ) : missingAdminPackage ? (
          <div className="admin-empty">
            <h2>Bu paket kartı bulunamadı.</h2>
            <p>Sipariş ancak kayıtlı bir yazılım paketine bağlanır.</p>
            <Link className="button button-primary" href="/yonetim/paketler">Paketlere dön</Link>
          </div>
        ) : missingAdminModule ? (
          <div className="admin-empty">
            <h2>Bu modül kartı bulunamadı.</h2>
            <p>Sipariş ancak kayıtlı bir yazılım modülüne bağlanır.</p>
            <Link className="button button-primary" href="/yonetim/moduller">Modüllere dön</Link>
          </div>
        ) : missingCatalogPackage ? (
          <div className="admin-empty">
            <h2>{getPackageName(requestedCatalogId)} kartı henüz katalogda yok.</h2>
            <p>Sipariş bağlamak için önce yönetim paket kartını ekleyin. Kamu /paketler sayfası değişmez; tutar yine teklifte netleşir.</p>
            <Link className="button button-primary" href={`/yonetim/paketler/yeni?cerceve=${requestedCatalogId}`}>
              {getPackageName(requestedCatalogId)} kartını ekle
            </Link>
          </div>
        ) : existingOrderId ? (
          <div className="admin-empty">
            <h2>Bu işletmede aynı paket veya modül için açık sipariş var.</h2>
            <p>İkinci kayıt açılmaz. İptal edilmeden aynı lisans iki kez bağlanmaz. Kasa fişi değildir.</p>
            <Link className="button button-primary" href={`/yonetim/siparisler/${existingOrderId}`}>Siparişi aç</Link>
          </div>
        ) : (
          <OrderForm
            mode="create"
            customers={formCustomers}
            packages={formPackages}
            modules={formModules}
            initial={draft}
          />
        )}
      </section>
    </AdminShell>
  );
}
