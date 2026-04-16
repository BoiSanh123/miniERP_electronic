import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IOrderRepository, ORDER_REPOSITORY_PORT } from "../ports/order.repository.port";
import { CreateOrderDto } from "../../presentation/dto/sales.dto";

import { CalculatePriceUseCase } from "../../../pricing/application/use-cases/calculate-price.use-case";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly repo: IOrderRepository,
    private readonly calculatePrice: CalculatePriceUseCase
  ) { }

  async execute(dto: CreateOrderDto, userId: string) {
    const orderNumber = `SO-${Date.now()}`;
    const orderItems = [];
    let totalAmount = new Prisma.Decimal(0);

    // 1. Chạy vòng lặp gọi Pricing để tính giá TỪNG MÓN một (theo Volume/Tier)
    for (const item of dto.items) {
      const priceResult = await this.calculatePrice.execute({
        partnerId: dto.partnerId,
        productId: item.productId,
        quantity: item.quantity
      });

      type OrderItem = {
        productId: string;
        quantity: number;
        unitPrice: string;
        discountAmount: string;
        finalPrice: string;
        lineTotal: string;
      };

      const orderItems: OrderItem[] = [];

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: priceResult.baseUnitPrice,
        discountAmount: priceResult.totalDiscountPerUnit,
        finalPrice: priceResult.finalUnitPrice,
        lineTotal: priceResult.totalLineAmount
      });

      totalAmount = totalAmount.plus(new Prisma.Decimal(priceResult.totalLineAmount));
    }

    // 2. Lưu đơn hàng ở trạng thái DRAFT (Nháp)
    const orderData = {
      partnerId: dto.partnerId,
      status: "DRAFT",
      totalAmount: totalAmount.toString(),
      items: orderItems
    };

    return this.repo.createOrder(orderNumber, orderData, userId);
  }
}