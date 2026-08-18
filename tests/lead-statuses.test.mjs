import assert from "node:assert/strict";
import test from "node:test";
import { isLeadStatus, leadStatusLabel, LEAD_STATUS_OPTIONS } from "../app/lead-statuses.ts";

test("lead status values and labels share one ordered contract", () => {
  assert.deepEqual(
    LEAD_STATUS_OPTIONS,
    [
      { value: "new", label: "Yeni" },
      { value: "contacted", label: "İletişim kuruldu" },
      { value: "qualified", label: "Fırsat" },
      { value: "closed", label: "Tamamlandı" },
    ],
  );
  assert.equal(new Set(LEAD_STATUS_OPTIONS.map((option) => option.value)).size, LEAD_STATUS_OPTIONS.length);
  assert.equal(isLeadStatus("qualified"), true);
  assert.equal(isLeadStatus("unknown"), false);
  assert.equal(leadStatusLabel("contacted"), "İletişim kuruldu");
  assert.equal(leadStatusLabel("legacy"), "legacy");
});
