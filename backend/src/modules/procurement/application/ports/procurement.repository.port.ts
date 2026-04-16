export const PROCUREMENT_REPOSITORY_PORT = Symbol("PROCUREMENT_REPOSITORY_PORT");

export interface IProcurementRepository {
  createPurchaseRequest(prNumber: string, requestedBy: string, items: any[]): Promise<any>;
  createPurchaseOrder(poNumber: string, dto: any, createdBy: string): Promise<any>;
  getPurchaseOrderById(poId: string): Promise<any>;
  executeReceiveGoodsTransaction(grnNumber: string, dto: any, createdBy: string): Promise<any>;
}