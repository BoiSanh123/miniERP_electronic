export const BFF_QUERY_PORT = Symbol("BFF_QUERY_PORT");

export interface DashboardMetricsResult {
  productCount: number;
  orderCount: number;
  totalDebt: string;
}

export interface IBffQueryPort {
  getDashboardMetrics(): Promise<DashboardMetricsResult>;
}