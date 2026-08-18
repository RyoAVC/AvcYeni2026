import assert from "node:assert/strict";
import test from "node:test";
import { canExportLeadRows, LEAD_EXPORT_HEADERS, MAX_LEAD_EXPORT_ROWS, toLeadExportRow } from "../app/lead-export.mjs";

test("CSV export never silently truncates lead rows", () => {
  assert.equal(MAX_LEAD_EXPORT_ROWS, 5_000);
  assert.equal(canExportLeadRows(0), true);
  assert.equal(canExportLeadRows(5_000), true);
  assert.equal(canExportLeadRows(5_001), false);
  assert.equal(canExportLeadRows(-1), false);
  assert.equal(canExportLeadRows(1.5), false);

  assert.deepEqual(LEAD_EXPORT_HEADERS.slice(0, 4), ["Başvuru No", "Başvuru Tarihi", "Son Güncelleme", "İletişim İzni Tarihi"]);
  const row = toLeadExportRow({
    id: 7,
    createdAt: "2026-08-11T10:00:00.000Z",
    updatedAt: "2026-08-11T10:15:00.000Z",
    consentAt: "2026-08-11T10:00:00.000Z",
    name: "Test Kullanıcı",
    company: "AVC",
    email: "test@example.com",
    phone: "+90 555 000 00 00",
    interest: "SEO ve görünürlük",
    source: "google",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "yaz",
    referrerHost: "google.com",
    landingPath: "/teklif",
    message: "Bilgi istiyorum.",
    requestKey: "must-not-export",
    phoneNormalized: "must-not-export-either",
  }, "Yeni");
  assert.equal(row.length, LEAD_EXPORT_HEADERS.length);
  assert.deepEqual(row.slice(0, 4), [7, "2026-08-11T10:00:00.000Z", "2026-08-11T10:15:00.000Z", "2026-08-11T10:00:00.000Z"]);
  assert.equal(row.includes("must-not-export"), false);
  assert.equal(row.includes("must-not-export-either"), false);
});
