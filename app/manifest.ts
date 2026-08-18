import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avcı E-Ticaret",
    short_name: "AVCI",
    description: "Mağaza, katalog, sipariş, ödeme ve operasyon için modüler e-ticaret altyapısı.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#14151a",
    theme_color: "#14151a",
    lang: "tr",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
