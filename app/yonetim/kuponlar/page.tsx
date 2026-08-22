import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { coupons } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { CouponClient } from "./coupon-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kupon Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default async function CouponsPage() {
  const admin = await requireAdminUser("/yonetim/kuponlar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap kuponları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/kuponlar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const couponRows = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      type: coupons.type,
      discountValue: coupons.discountValue,
      minSpend: coupons.minSpend,
      maxDiscount: coupons.maxDiscount,
      usageLimit: coupons.usageLimit,
      usedCount: coupons.usedCount,
      status: coupons.status,
      startsAt: coupons.startsAt,
      endsAt: coupons.endsAt,
    })
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  return (
    <AdminShell current="kuponlar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">İNDİRİM VE KUPONLAR</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              İndirim Kuponları
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Sepette anında uygulanabilen promosyon ve hediye kupon kodlarını yönetin.
            </p>
          </div>
        </header>

        <CouponClient initialCoupons={couponRows} />
      </section>
    </AdminShell>
  );
}
