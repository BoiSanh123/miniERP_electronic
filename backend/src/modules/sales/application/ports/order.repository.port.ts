export const ORDER_REPOSITORY_PORT = Symbol("ORDER_REPOSITORY_PORT");

export interface IOrderRepository {
  createOrder(orderNumber: string, data: any, createdBy: string): Promise<any>;
  getOrderById(orderId: string): Promise<any>;
  updateOrderStatusAndOutbox(orderId: string, status: string, eventPayload: any): Promise<void>;
  
  // Dành riêng cho luồng Giao hàng
  saveShipmentAndOutbox(shipmentData: any, eventPayload: any): Promise<any>;
}