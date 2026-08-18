import { ThemeToggle } from "./theme-toggle";

export function HeaderCtaCluster({ children }: { children: React.ReactNode }) {
  return (
    <div className="header-cta-cluster">
      <ThemeToggle />
      {children}
    </div>
  );
}
