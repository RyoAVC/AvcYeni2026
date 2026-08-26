import Link from "next/link";
import { BrandLogoFx } from "./brand-logo-fx";
import { withBasePath } from "./base-path";
import { brandLogoSrc, STATIC_BRAND_LOGO_MASK } from "./site-logo.mjs";
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
  const nightSrc = withBasePath(brandLogoSrc("night", logos.night));
  const daySrc = withBasePath(brandLogoSrc("day", logos.day));
  const maskUrl = withBasePath(STATIC_BRAND_LOGO_MASK);
  const logoStackClass = uploaded ? "brand-logo-stack" : "brand-logo-stack brand-logo-fx";

  const logoImages = (
    <>
      <img
        className="brand-logo-img brand-logo-img--night"
        src={nightSrc}
        alt=""
        width={220}
        height={50}
        decoding="async"
      />
      <img
        className="brand-logo-img brand-logo-img--day"
        src={daySrc}
        alt=""
        width={220}
        height={50}
        decoding="async"
      />
    </>
  );

  const inner = (
    <>
      {showLogo ? (
        uploaded ? (
          <span className={logoStackClass}>{logoImages}</span>
        ) : (
          <BrandLogoFx className={logoStackClass} maskUrl={maskUrl} interactive={false}>
            {logoImages}
          </BrandLogoFx>
        )
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
