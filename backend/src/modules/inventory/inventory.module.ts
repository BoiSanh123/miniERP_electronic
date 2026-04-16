import { Module } from "@nestjs/common";
import { InventoryController } from "./presentation/inventory.controller";
import { PrismaInventoryRepository } from "./infrastructure/prisma-inventory.repository";
import { INVENTORY_REPOSITORY_PORT } from "./application/ports/inventory.repository.port";

import { ReserveInventoryUseCase } from "./application/use-cases/reserve-inventory.use-case";
import { DeductInventoryUseCase } from "./application/use-cases/deduct-inventory.use-case";
import { GetAvailableInventoryQuery } from "./application/queries/get-available-inventory.query";
import { OrderConfirmedEventHandler } from "./application/event-handlers/order-confirmed.handler";

@Module({
  controllers: [InventoryController],
  providers: [
    ReserveInventoryUseCase,
    DeductInventoryUseCase,
    GetAvailableInventoryQuery,
    OrderConfirmedEventHandler,
    {
      provide: INVENTORY_REPOSITORY_PORT, // Token dùng để Inject
      useClass: PrismaInventoryRepository // Lớp thực thi thực tế
    }
  ],
  exports: [INVENTORY_REPOSITORY_PORT]
})
export class InventoryModule {}