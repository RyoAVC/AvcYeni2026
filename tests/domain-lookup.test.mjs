import assert from "node:assert/strict";
import test from "node:test";
import {
  daysUntilDate,
  lookupMatchesCustomer,
  normalizeDomainName,
  parseDomainLookupRequest,
  parseExpiryDate,
  presentDomainLookup,
} from "../app/domain-lookup.mjs";
import { parseCustomerRecord } from "../app/customer-record.mjs";

test("domain lookup only matches registered customer email and domain", () => {
  assert.equal(normalizeDomainName("https://WWW.Ornek.com/magaza"), "ornek.com");
  assert.equal(parseExpiryDate("2026-13-40"), "");
  assert.equal(parseExpiryDate("2026-08-20"), "2026-08-20");
  assert.equal(daysUntilDate("2026-08-20", Date.parse("2026-08-10T12:00:00+03:00")), 10);

  const parsed = parseDomainLookupRequest({ email: "Ayse@Firma.example", domain: "ornek.com" });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.email, "ayse@firma.example");

  const customer = {
    email: "ayse@firma.example",
    domainName: "ornek.com",
    domainExpiresAt: "2026-08-20",
    hostingExpiresAt: "2026-09-01",
    company: "Demir Gıda",
    status: "active",
  };
  assert.equal(lookupMatchesCustomer(customer, "ayse@firma.example", "ornek.com"), true);
  assert.equal(lookupMatchesCustomer(customer, "baska@firma.example", "ornek.com"), false);
  assert.equal(lookupMatchesCustomer({ ...customer, status: "closed" }, "ayse@firma.example", "ornek.com"), false);

  const shown = presentDomainLookup(customer, Date.parse("2026-08-10T12:00:00+03:00"));
  assert.equal(shown.ok, true);
  assert.equal(shown.domainDaysLeft, 10);
  assert.equal(shown.urgency, "soon");
});

test("customer record can keep a domain and expiry without WHOIS", () => {
  const parsed = parseCustomerRecord({
    name: "Ayşe Demir",
    email: "ayse@firma.example",
    phone: "0555 111 22 33",
    domainName: "https://ornek.com",
    domainExpiresAt: "2026-12-01",
    hostingExpiresAt: "2026-11-15",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.domainName, "ornek.com");
  assert.equal(parsed.value.domainExpiresAt, "2026-12-01");
  assert.equal(parseCustomerRecord({
    name: "Ayşe Demir",
    email: "ayse@firma.example",
    phone: "0555 111 22 33",
    domainName: "not a domain",
  }).ok, false);
});
