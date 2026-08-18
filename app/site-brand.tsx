import Link from "next/link";
import { withBasePath } from "./base-path";
import { brandLogoSrc } from "./site-logo.mjs";
import { loadSiteLogoMetas, loadSiteSettings } from "./site-settings.mjs";

type SiteBrandProps = {
  href?: string;
  className?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  anchor?: boolean;
};

export async function SiteBrand({
  href = "/",
  className = "brand",
  label = "Avcı E-Ticaret ana sayfa",
  title,
  subtitle,
  anchor = false,
}: SiteBrandProps) {
  const settings = await loadSiteSettings();
  const logos = await loadSiteLogoMetas();
  const uploaded = Boolean(logos.night.exists || logos.day.exists);
  const showLogo = settings.logoEnabled;
  const showMark = !showLogo;
  const showCopy = settings.showWordmark && (uploaded || Boolean(title || subtitle));
  const classes = [className, `brand--scale-${settings.logoScale}`].filter(Boolean).join(" ");
  const inner = (
    <>
      {showLogo ? (
        <span className="brand-logo-stack">
          <img
            className="brand-logo-img brand-logo-img--night"
            src={withBasePath(brandLogoSrc("night", logos.night))}
            alt=""
            width={220}
            height={50}
            decoding="async"
          />
          <img
            className="brand-logo-img brand-logo-img--day"
            src={withBasePath(brandLogoSrc("day", logos.day))}
            alt=""
            width={220}
            height={50}
            decoding="async"
          />
        </span>
      ) : null}
      {showMark ? <span className="brand-mark">A</span> : null}
      {showCopy ? (
        <span className="brand-copy">
          <strong>{title ?? settings.brandTitle}</strong>
          <small>{subtitle ?? settings.brandSubtitle}</small>
        </span>
      ) : null}
    </>
  );

  if (anchor) {
    return (
      <a className={classes} href={href} aria-label={label}>
        {inner}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} aria-label={label}>
      {inner}
    </Link>
  );
}
