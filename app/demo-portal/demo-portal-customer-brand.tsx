import type { DemoPortalBrand } from "./demo-portal-brand";
import styles from "./demo-portal-customer-brand.module.css";

export function DemoPortalCustomerBrand({
  brand,
  placement = "topbar",
}: {
  brand: DemoPortalBrand;
  placement?: "topbar" | "sidebar";
}) {
  return (
    <div className={`${styles.identity} ${styles[placement]}`} aria-label={`${brand.companyName} firma kimliği`}>
      <span className={styles.logo} aria-hidden="true">
        {brand.logoUrl ? <img alt="" src={brand.logoUrl} /> : brand.monogram}
      </span>
      <span className={styles.copy}>
        <small>{brand.workspaceLabel}</small>
        <strong>{brand.companyName}</strong>
        {placement === "sidebar" ? <em>{brand.domain}</em> : null}
      </span>
      {placement === "sidebar" ? <span className={styles.provider}>Avcı altyapısı</span> : null}
    </div>
  );
}
