export type PortalTone = "healthy" | "watch" | "critical" | "neutral";
export type PortalInstanceStatus = "planned" | "setup" | "active" | "paused" | "expired";

export interface PortalBranding {
  companyName: string;
  logoUrl: string;
  monogram: string;
  theme: "avci" | "graphite" | "energy";
  colorMode: "day" | "night";
  providerLabel: "Avcı altyapısı";
}

export interface PortalModuleInstance {
  id: number;
  key: string;
  name: string;
  status: PortalInstanceStatus;
  coverage: string;
  enabledAt: string;
  expiresAt: string;
  note: string;
}

export interface PortalIntegrationInstance {
  id: number;
  providerKey: string;
  name: string;
  category: string;
  status: PortalInstanceStatus;
  setupProgress: number;
  healthScore: number;
  lastSyncAt: string;
  lastErrorSummary: string;
  publicMetadata: Record<string, string | number | boolean>;
}

export interface PortalMetric {
  key: string;
  value: number;
  unit: string;
  source: string;
  periodStart: string;
  periodEnd: string;
  label: string;
}

export interface PortalMetricComparison extends PortalMetric {
  previousValue: number | null;
  deltaPercent: number | null;
  direction: "up" | "down" | "neutral";
}

export interface PortalNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: number;
  targetSection: string;
  tone: PortalTone;
  source: "admin" | "rule" | "system";
  createdAt: string;
}

export interface PortalTofySnapshot {
  metrics: PortalMetric[];
  comparisons: PortalMetricComparison[];
  quality: {
    ready: number;
    needsWork: number;
    blocked: number;
    total: number;
    score: number | null;
    hasData: boolean;
  };
  experiments: Array<{
    id: number;
    name: string;
    kind: string;
    status: string;
    controlLabel: string;
    variantLabel: string;
    resultSummary: string;
    startsAt: string;
    endsAt: string;
  }>;
}

export interface PortalServiceHealth {
  tone: PortalTone;
  score: number | null;
  openTickets: number;
  criticalTickets: number;
  firstResponseMinutes: number | null;
  label: string;
}

export interface PortalThresholds {
  sslWarningDays: number;
  tofyClickThresholdBps: number;
  marketplaceSetupDays: number;
}
