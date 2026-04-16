import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";

@Controller("bff")
export class BffController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard")
  async dashboard() {
    const [productCount, orderCount, debtAgg] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.debtLedger.aggregate({ _sum: { amount: true } })
    ]);

    return {
      productCount,
      orderCount,
      totalDebt: debtAgg._sum.amount ?? "0"
    };
  }
}
