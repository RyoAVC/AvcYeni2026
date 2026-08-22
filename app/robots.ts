import type { MetadataRoute } from "next";
import { APP_BASE_PATH, SITE_BASE_URL, withBasePath } from "./base-path";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: APP_BASE_PATH || "/",
      disallow: [
        "/api/",
        "/yonetim",
        "/yonetim/",
        "/musteri-girisi",
        "/musteri-portali",
        "/musteri-panel",
        "/musteri-panel/",
        "/onizleme/musteri-portali-k7m2x9",
        "/demo-portal",
        "/signin-with-chatgpt",
        "/signout-with-chatgpt",
        "/callback",
      ].map(withBasePath),
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
    host: SITE_BASE_URL,
  };
}
