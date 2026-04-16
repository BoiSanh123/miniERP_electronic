import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IPricingRepository, PRICING_REPOSITORY_PORT } from "../ports/pricing.repository.port";
import { CalculatePriceDto } from "../../presentation/dto/pricing.dto";
import { PricingPipeline, TierDiscountStrategy, VolumeDiscountStrategy } from "../../domain/discount.strategy";

@Injectable()
export class CalculatePriceUseCase {
  private pricingPipeline: PricingPipeline;

  constructor(
    @Inject(PRICING_REPOSITORY_PORT) private readonly repo: IPricingRepository
  ) {
    // Khởi tạo Pipeline và thiết lập thứ tự ưu tiên các loại giảm giá
    this.pricingPipeline = new PricingPipeline()
      .addStrategy(new TierDiscountStrategy())
      .addStrategy(new VolumeDiscountStrategy());
  }

  async execute(dto: CalculatePriceDto) {
    const product = await this.repo.getProductBasePrice(dto.productId);
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm");

    const partner = await this.repo.getPartnerTier(dto.partnerId);
    if (!partner) throw new NotFoundException("Không tìm thấy thông tin khách hàng");

    const basePrice = new Prisma.Decimal(product.listPrice);
    
    // 2. Đưa vào Pipeline để tính giá cuối (Layered calculation)
    let finalUnitPrice = this.pricingPipeline.execute(partner.tier, dto.quantity, basePrice);

    // 3. Quy tắc bảo vệ (Guard): Đảm bảo tổng mức giảm không vượt quá 30% giá gốc
    const minAllowedPrice = basePrice.mul(new Prisma.Decimal(0.70));
    if (finalUnitPrice.lt(minAllowedPrice)) {
      finalUnitPrice = minAllowedPrice; // Chặn đáy giá
    }

    const totalDiscountPerUnit = basePrice.minus(finalUnitPrice);

    return {
      productId: dto.productId,
      partnerId: dto.partnerId,
      quantity: dto.quantity,
      baseUnitPrice: basePrice.toFixed(2),
      totalDiscountPerUnit: totalDiscountPerUnit.toFixed(2),
      finalUnitPrice: finalUnitPrice.toFixed(2),
      totalLineAmount: finalUnitPrice.mul(dto.quantity).toFixed(2)
    };
  }
}