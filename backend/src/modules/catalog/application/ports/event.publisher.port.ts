export const CATALOG_EVENT_PUBLISHER_PORT = Symbol("CATALOG_EVENT_PUBLISHER_PORT");

export interface ICatalogEventPublisher {
  publishProductCreated(payload: { productId: string; sku: string }): Promise<void>;
  publishProductUpdated(payload: { productId: string }): Promise<void>;
}