import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { IOrderRepository, ORDER_REPOSITORY_PORT } from "../ports/order.repository.port";
import { RedisService } from "../../../../shared/infrastructure/redis/redis.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ConfirmOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly repo: IOrderRepository,
    private readonly redisService: RedisService // Thay thế Finance UseCase bằng RedisService
  ) {}

  async execute(orderId: string) {
    // 1. Fetch đơn hàng
    const order = await this.repo.getOrderById(orderId);
    if (!order || order.status !== "DRAFT") {
      throw new BadRequestException("Chỉ có thể chốt các đơn hàng ở trạng thái Nháp (DRAFT).");
    }

    // 2. Kiểm tra hạn mức tín dụng qua Redis (Decoupled & Fast)
    // Dữ liệu này do module Finance lắng nghe event và cập nhật liên tục lên Redis
    const limitStr = await this.redisService.client.get(`finance:credit_limit:${order.partnerId}`);
    const debtStr = await this.redisService.client.get(`finance:current_debt:${order.partnerId}`);

    const creditLimit = new Prisma.Decimal(limitStr || "0");
    const currentDebt = new Prisma.Decimal(debtStr || "0");
    const orderAmount = new Prisma.Decimal(order.totalAmount);

    const projectedDebt = currentDebt.plus(orderAmount);

    // Kiểm tra nếu nợ dự kiến vượt quá hạn mức cho phép
    if (projectedDebt.gt(creditLimit) && creditLimit.gt(0)) {
      throw new BadRequestException(
        `Từ chối chốt đơn: Dư nợ dự kiến (${projectedDebt}) vượt hạn mức tín dụng (${creditLimit}).`
      );
    }

    // 3. Chuẩn bị sự kiện Outbox (Giữ nguyên logic cũ)
    const eventPayload = {
      aggregateType: "Order",
      aggregateId: order.id,
      eventType: "sales.order.confirmed", 
      payload: {
        orderId: order.id,
        partnerId: order.partnerId,
        items: order.items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          warehouseId: "MAIN_WAREHOUSE"
        }))
      },
      status: "PENDING"
    };

    // 4. Đổi trạng thái sang CONFIRMED và lưu Event (Cùng một DB Transaction)
    await this.repo.updateOrderStatusAndOutbox(order.id, "CONFIRMED", eventPayload);

    return { success: true, message: "Chốt đơn thành công! Kho đã nhận được lệnh chuẩn bị hàng." };
  }
}