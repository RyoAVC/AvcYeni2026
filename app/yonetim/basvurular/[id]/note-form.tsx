"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { withBasePath } from "../../../base-path";

export function NoteForm({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const submittingRef = useRef(false);
  const requestKeyRef = useRef("");

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    if (!requestKeyRef.current) requestKeyRef.current = crypto.randomUUID();
    setSaving(true);
    setMessage("Kaydediliyor…");

    try {
      const response = await fetch(withBasePath(`/api/yonetim/basvurular/${leadId}/notlar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, requestKey: requestKeyRef.current }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Not kaydedilemedi.");
      requestKeyRef.current = "";
      setContent("");
      setMessage("Not kaydedildi.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Not kaydedilemedi.");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  const hasError = Boolean(message) && message !== "Kaydediliyor…" && message !== "Not kaydedildi.";

  return (
    <form className="note-form" onSubmit={submitNote} aria-busy={saving}>
      <label htmlFor="lead-note">Yeni ekip notu</label>
      <textarea
        id="lead-note"
        aria-describedby="lead-note-status"
        aria-invalid={hasError}
        name="content"
        value={content}
        minLength={2}
        maxLength={2000}
        required
        disabled={saving}
        placeholder="Görüşme özeti, takip adımı veya ekip için önemli bilgiyi yazın…"
        onChange={(event) => {
          requestKeyRef.current = "";
          setContent(event.target.value);
        }}
      />
      <div>
        <small
          id="lead-note-status"
          className={hasError ? "error" : ""}
          role={hasError ? "alert" : "status"}
          aria-live={hasError ? "assertive" : "polite"}
          aria-atomic="true"
        >
          {message}
        </small>
        <button type="submit" disabled={saving || content.trim().length < 2}>{saving ? "Kaydediliyor…" : "Notu kaydet"}</button>
      </div>
    </form>
  );
}
