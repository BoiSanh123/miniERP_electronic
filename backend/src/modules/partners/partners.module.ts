import { Module } from "@nestjs/common";
import { PartnersController } from "./presentation/partners.controller";
import { CreatePartnerUseCase } from "./application/use-cases/create-partner.use-case";
import { PARTNERS_REPOSITORY_PORT } from "./application/ports/partners.repository.port";
import { PrismaPartnersRepository } from "./infrastructure/prisma-partners.repository";

@Module({
  controllers: [PartnersController],
  providers: [
    CreatePartnerUseCase,
    {
      provide: PARTNERS_REPOSITORY_PORT,
      useClass: PrismaPartnersRepository
    }
  ],
  exports: [PARTNERS_REPOSITORY_PORT] // Bắt buộc export Port này ra
})
export class PartnersModule {}