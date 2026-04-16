import { Module } from "@nestjs/common";
import { ProcurementController } from "./presentation/procurement.controller";
import { PROCUREMENT_REPOSITORY_PORT } from "./application/ports/procurement.repository.port";
import { PrismaProcurementRepository } from "./infrastructure/prisma-procurement.repository";

import { CreatePurchaseRequestUseCase } from "./application/use-cases/create-pr.use-case";
import { CreatePurchaseOrderUseCase } from "./application/use-cases/create-po.use-case";
import { ReceiveGoodsUseCase } from "./application/use-cases/receive-goods.use-case";

@Module({
  controllers: [ProcurementController],
  providers: [
    CreatePurchaseRequestUseCase,
    CreatePurchaseOrderUseCase,
    ReceiveGoodsUseCase,
    {
      provide: PROCUREMENT_REPOSITORY_PORT,
      useClass: PrismaProcurementRepository
    }
  ]
})
export class ProcurementModule {}