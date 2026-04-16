import { Module } from "@nestjs/common";
import { PricingController } from "./presentation/pricing.controller";
import { CalculatePriceUseCase } from "./application/use-cases/calculate-price.use-case";
import { PRICING_REPOSITORY_PORT } from "./application/ports/pricing.repository.port";
import { PrismaPricingRepository } from "./infrastructure/prisma-pricing.repository";

@Module({
  controllers: [PricingController],
  providers: [
    CalculatePriceUseCase,
    {
      provide: PRICING_REPOSITORY_PORT,
      useClass: PrismaPricingRepository
    }
  ],
  exports: [CalculatePriceUseCase] // Xuất UseCase này ra để Module Sales dùng khi tính tổng tiền Đơn hàng
})
export class PricingModule {}