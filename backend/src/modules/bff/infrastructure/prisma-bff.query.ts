import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IBffQueryPort, DashboardMetricsResult } from "../application/ports/bff.query.port";

@Injectable()
export class PrismaBffQuery implements IBffQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<DashboardMetricsResult> {
    // Chạy song song (Promise.all) để tối ưu hiệu năng Đọc
    const [productCount, orderCount, debtAgg] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }), // Chỉ đếm SP đang active
      this.prisma.order.count(),
      this.prisma.debtLedger.aggregate({ _sum: { amount: true } })
    ]);

    return {
      productCount,
      orderCount,
      // Ép kiểu an toàn, xử lý logic mặc định nếu null
      totalDebt: debtAgg._sum.amount ? debtAgg._sum.amount.toString() : "0"
    };
  }
}