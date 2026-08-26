export type DemoPortalBrand = {
  companyName: string;
  shortName: string;
  monogram: string;
  workspaceLabel: string;
  accountLabel: string;
  domain: string;
  logoUrl?: string;
};

export const demoPortalBrand: DemoPortalBrand = {
  companyName: "BasBitir Atölyesi",
  shortName: "BasBitir",
  monogram: "BB",
  workspaceLabel: "Müşteri çalışma alanı",
  accountLabel: "Murat Bey · örnek hesap",
  domain: "basbitir.com",
};
