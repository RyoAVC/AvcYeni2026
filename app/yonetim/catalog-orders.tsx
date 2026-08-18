import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { customers, softwareOrders } from "../../db/schema";
import { softwareOrderKindLabel, softwareOrderStatusLabel } from "../software-order-admin.mjs";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export async function CatalogOrders({
  kind,
  catalogId,
  catalogName,
}: {
  kind: "package" | "module";
  catalogId: number;
  catalogName: string;
}) {
  let orders: Array<{
    id: number;
    customerId: number;
    status: string;
    createdAt: string;
    customerName: string | null;
  }> = [];

  try {
    const { getDb } = await import("../../db");
    const db = getDb();
    orders = await db.select({
      id: softwareOrders.id,
      customerId: softwareOrders.customerId,
      status: softwareOrders.status,
      createdAt: softwareOrders.createdAt,
      customerName: customers.name,
    })
      .from(softwareOrders)
      .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
      .where(kind === "module" ? eq(softwareOrders.moduleId, catalogId) : eq(softwareOrders.packageId, catalogId))
      .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
      .limit(8);
  } catch (cause) {
    console.error("Catalog orders failed", cause);
  }

  const listHref = kind === "module"
    ? `/yonetim/siparisler?modulId=${catalogId}`
    : `/yonetim/siparisler?paketId=${catalogId}`;
  const createHref = kind === "module"
    ? `/yonetim/siparisler/yeni?modulId=${catalogId}`
    : `/yonetim/siparisler/yeni?paketId=${catalogId}`;

  return (
    <div className="admin-related">
      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Bu {kind === "module" ? "modülün" : "paketin"} siparişleri</h2>
          <Link href={listHref}>Tümünü gör</Link>
        </div>
        {orders.length ? (
          <>
            <ul>
              {orders.map((item) => (
                <li key={item.id}>
                  <Link href={`/yonetim/siparisler/${item.id}`}>
                    <strong>{item.customerName || "Müşteri silinmiş"}</strong>
                    <small>{softwareOrderKindLabel(kind)} · {softwareOrderStatusLabel(item.status)}</small>
                  </Link>
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                </li>
              ))}
            </ul>
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>SİPARİŞ</span>
              <Link href={createHref}>Başka işletmeye bağla</Link>
            </div>
          </>
        ) : (
          <>
            <p>{catalogName} henüz bir yazılım siparişine bağlı değil. Mağaza sepeti değildir.</p>
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>SİPARİŞ</span>
              <Link href={createHref}>Bu karttan sipariş aç</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
