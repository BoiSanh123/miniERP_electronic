import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { IOrderRepository, ORDER_REPOSITORY_PORT } from "../ports/order.repository.port";

@Injectable()
export class CreateShipmentUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly repo: IOrderRepository
  ) {}

  async execute(dto: { orderId: string; trackingCode: string }, userId: string) {
    const order = await this.repo.getOrderById(dto.orderId);
    if (!order) throw new BadRequestException("Không tìm thấy đơn hàng");
    if (order.status !== "CONFIRMED") throw new BadRequestException("Chỉ có thể giao hàng cho đơn đã Chốt (CONFIRMED)");

    const shipmentNumber = `SHP-${Date.now()}`;

    // Tạo Event quan trọng nhất cho module Finance: Hàng đã giao, tới lúc đòi tiền!
    const eventPayload = {
      aggregateType: "Shipment",
      aggregateId: shipmentNumber,
      eventType: "logistics.shipment.delivered", // Event này sẽ được ShipmentDeliveredEventHandler bên Finance hứng
      payload: {
        shipmentId: shipmentNumber,
        orderId: order.id,
        partnerId: order.partnerId,
        totalValue: order.totalAmount
      },
      status: "PENDING"
    };

    return this.repo.saveShipmentAndOutbox({
      shipmentNumber,
      orderId: order.id,
      trackingCode: dto.trackingCode,
      status: "DELIVERED",
      createdBy: userId
    }, eventPayload);
  }
}