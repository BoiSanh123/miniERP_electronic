import { Prisma } from "@prisma/client";

// 1. Interface nhận currentPrice và trả về price sau khi giảm
export interface IDiscountStrategy {
  applyDiscount(partnerTier: string, quantity: number, currentPrice: Prisma.Decimal): Prisma.Decimal;
}

// 2. Chiến lược 1: Giảm giá theo Tier (thường ưu tiên tính trước)
export class TierDiscountStrategy implements IDiscountStrategy {
  applyDiscount(partnerTier: string, quantity: number, currentPrice: Prisma.Decimal): Prisma.Decimal {
    let discountRate = new Prisma.Decimal(0);
    switch (partnerTier) {
      case "PLATINUM": discountRate = new Prisma.Decimal(0.20); break;
      case "GOLD": discountRate = new Prisma.Decimal(0.15); break;
      case "SILVER": discountRate = new Prisma.Decimal(0.05); break;
    }
    // Trả về giá đã trừ chiết khấu
    return currentPrice.mul(new Prisma.Decimal(1).minus(discountRate));
  }
}

// 3. Chiến lược 2: Giảm giá theo Volume (tính trên giá đã giảm của Tier)
export class VolumeDiscountStrategy implements IDiscountStrategy {
  applyDiscount(partnerTier: string, quantity: number, currentPrice: Prisma.Decimal): Prisma.Decimal {
    let discountRate = new Prisma.Decimal(0);
    if (quantity >= 5000) discountRate = new Prisma.Decimal(0.10);      
    else if (quantity >= 1000) discountRate = new Prisma.Decimal(0.05); 
    
    return currentPrice.mul(new Prisma.Decimal(1).minus(discountRate));
  }
}

// 4. BỔ SUNG: Khởi tạo Pipeline (Chain of Responsibility)
export class PricingPipeline {
  private strategies: IDiscountStrategy[] = [];

  addStrategy(strategy: IDiscountStrategy): this {
    this.strategies.push(strategy);
    return this; // Cho phép chain method (builder pattern)
  }

  execute(partnerTier: string, quantity: number, basePrice: Prisma.Decimal): Prisma.Decimal {
    let currentPrice = basePrice;
    
    // Giá trị chạy qua từng màng lọc, tính chồng lên nhau (Layered)
    for (const strategy of this.strategies) {
      currentPrice = strategy.applyDiscount(partnerTier, quantity, currentPrice);
    }
    
    return currentPrice;
  }
}