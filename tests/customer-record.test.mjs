import assert from "node:assert/strict";
import test from "node:test";
import { parseCustomerRecord, customerDraftFromLead, customerIdByNormalizedEmail, matchLeadToCustomerId, parseCustomerLeadId, shouldQualifyLeadOnCustomerCreate } from "../app/customer-record.mjs";

test("customer record keeps phone email and rejects thin input", () => {
  const parsed = parseCustomerRecord({
    name: "Ayşe Demir",
    email: "Ayse@Firma.example",
    phone: "0555 111 22 33",
    company: "Demir Gıda",
    city: "Hatay",
    interest: "E-Ticaret altyapısı",
    note: "Deneme notu",
    status: "trial",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.email, "ayse@firma.example");
  assert.equal(parsed.value.phoneNormalized, "905551112233");
  assert.equal(parsed.value.status, "trial");
  assert.equal(parseCustomerRecord({ name: "A", email: "x", phone: "1" }).ok, false);
  assert.equal(parseCustomerRecord({ name: "Ayşe Demir", email: "yok", phone: "05551112233" }).ok, false);
});

test("customer draft from lead copies contact and keeps a trial status", () => {
  const draft = customerDraftFromLead({
    name: "Ayşe Demir",
    email: "ayse@firma.example",
    phone: "0555 111 22 33",
    company: "Demir Gıda",
    interest: "E-Ticaret altyapısı",
    message: "Scale paketi konuşmak istiyorum.",
  }, 42);
  assert.equal(draft.name, "Ayşe Demir");
  assert.equal(draft.company, "Demir Gıda");
  assert.equal(draft.interest, "E-Ticaret altyapısı");
  assert.equal(draft.status, "trial");
  assert.match(draft.note, /Teklif başvurusu #42/);
  assert.match(draft.note, /Scale paketi konuşmak istiyorum/);
});

test("lead email matches existing software customer", () => {
  const byEmail = customerIdByNormalizedEmail([
    { id: 7, email: "Ayse@Firma.example" },
    { id: 9, email: "ayse@firma.example" },
  ]);
  assert.equal(byEmail.get("ayse@firma.example"), 7);
  assert.equal(matchLeadToCustomerId({ email: "AYSE@firma.example" }, byEmail), 7);
  assert.equal(matchLeadToCustomerId({ email: "yok@firma.example" }, byEmail), 0);
});

test("customer create from lead only qualifies new or contacted applications", () => {
  assert.equal(parseCustomerLeadId({ leadId: "42" }), 42);
  assert.equal(parseCustomerLeadId({ leadId: "0" }), 0);
  assert.equal(shouldQualifyLeadOnCustomerCreate("new"), true);
  assert.equal(shouldQualifyLeadOnCustomerCreate("contacted"), true);
  assert.equal(shouldQualifyLeadOnCustomerCreate("qualified"), false);
  assert.equal(shouldQualifyLeadOnCustomerCreate("closed"), false);
});
