export const PRICING_REPOSITORY_PORT = Symbol("PRICING_REPOSITORY_PORT");

export interface IPricingRepository {
  getProductBasePrice(productId: string): Promise<any>;
  getPartnerTier(partnerId: string): Promise<any>;
}