"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { withBasePath } from "../../../base-path";

export function DemoAccessAction({ leadId, existingCustomerStatus }: { leadId: number; existingCustomerStatus?: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const hasError = Boolean(message) && !message.startsWith("Gönderildi");

  if (existingCustomerStatus && existingCustomerStatus !== "trial") {
    return null;
  }

  async function sendInvite() {
    setSending(true);
    setMessage("Gönderiliyor…");
    try {
      const response = await fetch(withBasePath(`/api/yonetim/basvurular/${leadId}/demo-erisimi`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const result = (await response.json()) as { error?: string; trialExpiresAt?: string };
      if (!response.ok) throw new Error(result.error || "Demo daveti gönderilemedi.");
      const until = result.trialExpiresAt
        ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(new Date(result.trialExpiresAt))
        : "";
      setMessage(until ? `Gönderildi — ${until} tarihine kadar geçerli.` : "Gönderildi");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Demo daveti gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="demo-access-action">
      <button type="button" disabled={sending} onClick={sendInvite}>
        {existingCustomerStatus === "trial" ? "Demo erişimini yenile" : "Demo erişimi gönder"}
      </button>
      {message ? (
        <small role={hasError ? "alert" : "status"} aria-live={hasError ? "assertive" : "polite"} className={hasError ? "error" : ""}>
          {message}
        </small>
      ) : null}
    </div>
  );
}
