import { Module } from "@nestjs/common";
import { BffController } from "./presentation/bff.controller";
import { BffService } from "./application/bff.service";
import { BFF_QUERY_PORT } from "./application/ports/bff.query.port";
import { PrismaBffQuery } from "./infrastructure/prisma-bff.query";

@Module({
  controllers: [BffController],
  providers: [
    BffService,
    // Map Interface với Prisma Adapter
    {
      provide: BFF_QUERY_PORT,
      useClass: PrismaBffQuery,
    }
  ]
})
export class BffModule {}