import { and, asc, eq } from "drizzle-orm";
import { customers, modules, packages, softwareInvoices, softwareOrders } from "../../../db/schema";

export async function loadInvoiceFormOptions() {
  const { getDb } = await import("../../../db");
  const db = getDb();
  const [customerRows, orderRows] = await Promise.all([
    db.select({ id: customers.id, name: customers.name, company: customers.company }).from(customers).orderBy(asc(customers.name)),
    db.select({
      id: softwareOrders.id,
      customerId: softwareOrders.customerId,
      kind: softwareOrders.kind,
      priceNote: softwareOrders.priceNote,
      packageName: packages.name,
      moduleName: modules.name,
    })
      .from(softwareOrders)
      .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
      .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
      .orderBy(asc(softwareOrders.id)),
  ]);

  return {
    customers: customerRows.map((item) => ({ id: item.id, name: item.name, extra: item.company || undefined })),
    orders: orderRows.map((item) => {
      const itemName = item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket");
      return {
        id: item.id,
        customerId: item.customerId,
        label: `#${item.id} · ${itemName}`,
        itemName,
        priceNote: item.priceNote,
      };
    }),
  };
}

export async function findDraftInvoiceForOrder(orderId: number) {
  const id = Number.parseInt(String(orderId ?? ""), 10);
  if (!Number.isSafeInteger(id) || id < 1) return undefined;

  const { getDb } = await import("../../../db");
  const db = getDb();
  const [draftInvoice] = await db.select({ id: softwareInvoices.id, title: softwareInvoices.title })
    .from(softwareInvoices)
    .where(and(eq(softwareInvoices.orderId, id), eq(softwareInvoices.status, "draft")))
    .limit(1);
  return draftInvoice;
}
