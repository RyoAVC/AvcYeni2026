import { and, eq, gte, lt, or, sql, type SQL } from "drizzle-orm";
import { leads } from "../db/schema";
import { normalizeLeadPhone } from "./lead-contact.mjs";
import { escapeLeadLike } from "./lead-search.mjs";

export type LeadQueryState = {
  search: string;
  status: string;
  source: string;
  interest: string;
  dateRange: {
    error: string;
    startInclusive: string;
    endExclusive: string;
  };
};

function sharedLeadConditions(state: LeadQueryState) {
  const conditions: SQL[] = [];
  if (state.dateRange.error) conditions.push(sql`0 = 1`);
  else {
    if (state.dateRange.startInclusive) conditions.push(gte(leads.createdAt, state.dateRange.startInclusive));
    if (state.dateRange.endExclusive) conditions.push(lt(leads.createdAt, state.dateRange.endExclusive));
  }

  if (state.search) {
    const pattern = `%${escapeLeadLike(state.search)}%`;
    const normalizedPhoneSearch = normalizeLeadPhone(state.search);
    const phoneFilter = normalizedPhoneSearch.length >= 10
      ? eq(leads.phoneNormalized, normalizedPhoneSearch)
      : sql`${leads.phone} LIKE ${pattern} ESCAPE '\\'`;
    const searchCondition = or(
      sql`${leads.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${leads.email} LIKE ${pattern} ESCAPE '\\'`,
      phoneFilter,
      sql`${leads.company} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  return conditions;
}

export function buildLeadWhere(state: LeadQueryState) {
  return and(
    ...sharedLeadConditions(state),
    state.status !== "all" ? eq(leads.status, state.status) : undefined,
    state.source !== "all" ? eq(leads.source, state.source) : undefined,
    state.interest !== "all" ? eq(leads.interest, state.interest) : undefined,
  );
}

export function buildLeadFacetWheres(state: LeadQueryState) {
  const shared = sharedLeadConditions(state);
  const statusFilter = state.status !== "all" ? eq(leads.status, state.status) : undefined;
  const sourceFilter = state.source !== "all" ? eq(leads.source, state.source) : undefined;
  const interestFilter = state.interest !== "all" ? eq(leads.interest, state.interest) : undefined;

  return {
    where: and(...shared, statusFilter, sourceFilter, interestFilter),
    statusSummaryWhere: and(...shared, sourceFilter, interestFilter),
    sourceSummaryWhere: and(...shared, statusFilter, interestFilter),
    interestSummaryWhere: and(...shared, statusFilter, sourceFilter),
  };
}
