import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IPricingRepository } from "../application/ports/pricing.repository.port";

@Injectable()
export class PrismaPricingRepository implements IPricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProductBasePrice(productId: string): Promise<any> {
    return this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, list_price: true }
    });
  }

  async getPartnerTier(partnerId: string): Promise<any> {
    return this.prisma.businessPartner.findUnique({
      where: { id: partnerId },
      select: { id: true, tier: true }
    });
  }
}