import { and, desc, eq, notExists } from "drizzle-orm";
import { getAdminUser } from "../../../../admin-auth";
import { serializeCsv } from "../../../../csv-utils.mjs";
import { customers, leads } from "../../../../../db/schema";
import { OFFER_INTERESTS } from "../../../../offer-options";
import { LEAD_EXPORT_HEADERS, MAX_LEAD_EXPORT_ROWS, toLeadExportRow } from "../../../../lead-export.mjs";
import { normalizeLeadSearch } from "../../../../lead-search.mjs";
import { parseLeadDateRange } from "../../../../lead-date-filter.mjs";
import { isLeadStatus, leadStatusLabel } from "../../../../lead-statuses";
import { buildLeadWhere } from "../../../../lead-query";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const url = new URL(request.url);
  const search = normalizeLeadSearch(url.searchParams.get("q"));
  const requestedStatus = url.searchParams.get("status") ?? "all";
  const status = isLeadStatus(requestedStatus) ? requestedStatus : "all";
  const requestedSource = (url.searchParams.get("source") ?? "all").trim().slice(0, 100);
  const source = requestedSource && requestedSource !== "all" ? requestedSource : "all";
  const requestedInterest = (url.searchParams.get("interest") ?? "all").trim();
  const interest = OFFER_INTERESTS.includes(requestedInterest as (typeof OFFER_INTERESTS)[number])
    ? requestedInterest
    : "all";
  const dateRange = parseLeadDateRange(url.searchParams.get("from"), url.searchParams.get("to"));
  if (dateRange.error) return json({ ok: false, error: dateRange.error }, 400);
  const missingCustomer = url.searchParams.get("eksik") === "musteri";
  const baseWhere = buildLeadWhere({ search, status, source, interest, dateRange });

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const where = missingCustomer
      ? and(
        baseWhere,
        notExists(db.select({ id: customers.id }).from(customers).where(eq(customers.email, leads.email))),
      )
      : baseWhere;
    const rows = await db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(MAX_LEAD_EXPORT_ROWS + 1);

    if (rows.length > MAX_LEAD_EXPORT_ROWS) {
      return json({
        ok: false,
        error: `Eksik CSV oluşturulmadı. Dışa aktarım en fazla ${MAX_LEAD_EXPORT_ROWS.toLocaleString("tr-TR")} kayıt içerir; filtreleri daraltın.`,
      }, 422);
    }

    const csv = serializeCsv(
      LEAD_EXPORT_HEADERS,
      rows.map((lead) => toLeadExportRow(lead, leadStatusLabel(lead.status))),
    );
    const date = new Date().toISOString().slice(0, 10);
    return new Response(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="avci-basvurular-${date}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (cause) {
    console.error("Lead export failed", cause);
    return json({ ok: false, error: "Başvurular şu anda dışa aktarılamadı." }, 503);
  }
}
