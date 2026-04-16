import { Injectable, Logger } from "@nestjs/common";
import { ReserveInventoryUseCase } from "../use-cases/reserve-inventory.use-case";

@Injectable()
export class OrderConfirmedEventHandler {
  private readonly logger = new Logger(OrderConfirmedEventHandler.name);

  constructor(private readonly reserveUseCase: ReserveInventoryUseCase) {}

  // Mở comment dòng dưới nếu bạn đã cài @nestjs/event-emitter
  // @OnEvent('sales.order.confirmed') 
  async handle(eventPayload: any) {
    this.logger.log(`Received Order Confirmed Event for Order: ${eventPayload.orderId}`);
    
    try {
      // Tách từng item trong đơn hàng để chạy logic giữ chỗ (Soft Allocation)
      for (const item of eventPayload.items) {
        await this.reserveUseCase.execute({
          productId: item.productId,
          warehouseId: item.warehouseId, // Thường được truyền từ đơn hàng
          quantity: String(item.quantity),
          referenceId: eventPayload.orderId
        });
      }
      this.logger.log(`Successfully reserved inventory for Order: ${eventPayload.orderId}`);
    } catch (error: any) {
      this.logger.error(`Failed to reserve inventory for Order: ${eventPayload.orderId}. Reason: ${error.message}`);
      // Tại đây Senior sẽ implement Compensating Transaction (Ngày 35)
      // Ví dụ: Bắn 1 event ngược lại 'inventory.reservation.failed' để Module Sales chuyển trạng thái đơn hàng về Canceled.
    }
  }
}