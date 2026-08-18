type BrandLogoProps = {
  variant?: "light" | "dark";
  animated?: boolean;
  className?: string;
  title?: string;
};

/**
 * Gerçek logo PNG + yumuşak giriş / shine.
 * light = koyu zemin, dark = açık zemin.
 */
export function BrandLogo({
  variant = "light",
  animated = true,
  className = "",
  title = "avci e-ticaret.com",
}: BrandLogoProps) {
  const src =
    variant === "light"
      ? "/brand/avci-logo-light-transparent.png"
      : "/brand/avci-logo-dark-transparent.png";

  const classes = [
    "avci-logo-wrap",
    animated ? "avci-logo-wrap--animated" : "",
    variant === "dark" ? "avci-logo-wrap--on-light" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-label={title}>
      <span className="avci-logo-glow" aria-hidden="true" />
      <span className="avci-logo-shine" aria-hidden="true" />
      <img
        className="avci-logo-img"
        src={src}
        alt=""
        width={420}
        height={95}
        decoding="async"
      />
      <span className="avci-logo-spark" aria-hidden="true" />
    </span>
  );
}
