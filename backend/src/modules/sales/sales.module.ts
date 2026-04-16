import { Module } from "@nestjs/common";
import { SalesController } from "./presentation/sales.controller";
import { ORDER_REPOSITORY_PORT } from "./application/ports/order.repository.port";
import { PrismaOrderRepository } from "./infrastructure/prisma-order.repository";

import { CreateOrderUseCase } from "./application/use-cases/create-order.use-case";
import { ConfirmOrderUseCase } from "./application/use-cases/confirm-order.use-case";
import { CreateShipmentUseCase } from "./application/use-cases/create-shipment.use-case";

// Import để gọi hàm tính giá và kiểm tra hạn mức chéo module
import { PricingModule } from "../pricing/pricing.module";
import { FinanceModule } from "../finance/finance.module";

@Module({
  imports: [PricingModule, FinanceModule],
  controllers: [SalesController],
  providers: [
    CreateOrderUseCase,
    ConfirmOrderUseCase,
    CreateShipmentUseCase,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: PrismaOrderRepository,
    }
  ],
})
export class SalesModule {}