"use client";

import { withBasePath } from "./base-path";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { COOKIE_NOTICE_KEY, readCookieNoticeChoice, shouldRecordSiteVisit } from "./cookie-notice-choice.mjs";

export function SiteVisitBeacon() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    function send() {
      let choice = "";
      try {
        choice = readCookieNoticeChoice(window.localStorage.getItem(COOKIE_NOTICE_KEY));
      } catch {
        choice = "";
      }
      if (!shouldRecordSiteVisit(pathname, choice)) return;

      let referrerHost = "";
      try {
        if (document.referrer) {
          const referrer = new URL(document.referrer);
          if (referrer.origin !== window.location.origin) referrerHost = referrer.hostname;
        }
      } catch {
        referrerHost = "";
      }

      fetch(withBasePath("/api/istatistik/ziyaret"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: pathname, referrerHost }),
        keepalive: true,
      }).catch(() => undefined);
    }

    send();
    window.addEventListener("avci-cookie-choice", send);
    return () => window.removeEventListener("avci-cookie-choice", send);
  }, [pathname]);

  return null;
}
