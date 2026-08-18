import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("async forms expose busy state and associated live feedback", async () => {
  const [offerForm, statusControl, noteForm] = await Promise.all([
    readSource("app/offer-form.tsx"),
    readSource("app/yonetim/basvurular/status-control.tsx"),
    readSource("app/yonetim/basvurular/[id]/note-form.tsx"),
  ]);

  assert.match(offerForm, /aria-busy=\{status\.type === "loading"\}/);
  assert.match(offerForm, /aria-describedby="offer-form-status"/);
  assert.match(offerForm, /id="offer-form-status"/);
  assert.match(offerForm, /role=\{status\.type === "error" \? "alert" : "status"\}/);
  assert.match(offerForm, /aria-live=\{status\.type === "error" \? "assertive" : "polite"\}/);
  assert.match(offerForm, /aria-atomic="true"/);

  assert.match(statusControl, /aria-busy=\{saving\}/);
  assert.match(statusControl, /aria-label=\{label\}/);
  assert.match(statusControl, /aria-describedby=\{`lead-status-message-\$\{id\}`\}/);
  assert.match(statusControl, /aria-invalid=\{hasError\}/);
  assert.match(statusControl, /id=\{`lead-status-message-\$\{id\}`\}/);
  assert.match(statusControl, /role=\{hasError \? "alert" : "status"\}/);
  assert.match(statusControl, /aria-live=\{hasError \? "assertive" : "polite"\}/);

  assert.match(noteForm, /aria-busy=\{saving\}/);
  assert.match(noteForm, /aria-describedby="lead-note-status"/);
  assert.match(noteForm, /aria-invalid=\{hasError\}/);
  assert.match(noteForm, /id="lead-note-status"/);
  assert.match(noteForm, /role=\{hasError \? "alert" : "status"\}/);
  assert.match(noteForm, /aria-live=\{hasError \? "assertive" : "polite"\}/);
});
