import { withBasePath } from "./base-path";

type BrandLogoProps = {
  variant?: "light" | "dark";
  animated?: boolean;
  className?: string;
  title?: string;
};

/**
 * Avcı marka logosu.
 * light = koyu zemin (gece), dark = açık zemin (gündüz).
 */
export function BrandLogo({
  variant = "light",
  animated = true,
  className = "",
  title = "avci e-ticaret.com",
}: BrandLogoProps) {
  const src = withBasePath(
    variant === "light" ? "/brand/avci-logo-fx.webp" : "/brand/avci-logo-dark-transparent.png",
  );

  const classes = [
    "avci-logo-wrap",
    animated ? "brand-logo-fx" : "",
    variant === "dark" ? "avci-logo-wrap--on-light" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      aria-label={title}
      style={{ ["--logo-mask" as string]: `url("${withBasePath("/brand/avci-logo-fx.webp")}")` }}
    >
      <img
        className={`avci-logo-img brand-logo-img ${variant === "light" ? "brand-logo-img--night" : "brand-logo-img--day"}`}
        src={src}
        alt=""
        width={420}
        height={95}
        decoding="async"
        style={{ position: "relative", opacity: 1, visibility: "visible" }}
      />
    </span>
  );
}
