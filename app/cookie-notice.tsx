"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  COOKIE_NOTICE_ACCEPTED,
  COOKIE_NOTICE_DECLINED,
  COOKIE_NOTICE_KEY,
  readCookieNoticeChoice,
  shouldHideCookieNotice,
} from "./cookie-notice-choice.mjs";

function persistChoice(value: string) {
  try {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, value);
  } catch {
    return;
  }
  window.dispatchEvent(new Event("avci-cookie-choice"));
}

export function CookieNotice() {
  const pathname = usePathname() || "/";
  const [choice, setChoice] = useState("");
  const [ready, setReady] = useState(false);
  const english = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    try {
      setChoice(readCookieNoticeChoice(window.localStorage.getItem(COOKIE_NOTICE_KEY)));
    } catch {
      setChoice("");
    }
    setReady(true);
  }, []);

  if (!ready || shouldHideCookieNotice(pathname, choice)) return null;

  return (
    <div className="cookie-notice" role="dialog" aria-labelledby="cookie-notice-title" aria-describedby="cookie-notice-copy">
      <div>
        <strong id="cookie-notice-title">{english ? "First-party visit cookie" : "İlk taraf ziyaret çerezi"}</strong>
        <p id="cookie-notice-copy">
          {english
            ? "We can store a random visit cookie (no IP) to count public pages. Admin pages are not counted. You can decline."
            : "Tanıtım sayfalarını saymak için rastgele bir ziyaret çerezi (IP yok) bırakabiliriz. Yönetim sayılmaz. İsterseniz reddedebilirsiniz."}
        </p>
      </div>
      <div className="cookie-notice-actions">
        <Link href={english ? "/en/privacy" : "/gizlilik"}>{english ? "Privacy" : "Gizlilik"}</Link>
        <button type="button" className="cookie-notice-ghost" onClick={() => { persistChoice(COOKIE_NOTICE_DECLINED); setChoice("declined"); }}>
          {english ? "Decline" : "Reddet"}
        </button>
        <button type="button" className="cookie-notice-accept" onClick={() => { persistChoice(COOKIE_NOTICE_ACCEPTED); setChoice("accepted"); }}>
          {english ? "Accept" : "Anladım"}
        </button>
      </div>
    </div>
  );
}
