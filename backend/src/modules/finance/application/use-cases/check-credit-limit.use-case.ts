import { Inject, Injectable } from "@nestjs/common";
import { ConflictError } from "@shared/domain/errors";
import { Prisma } from "@prisma/client";
import { IFinanceRepository, FINANCE_REPOSITORY_PORT } from "../ports/finance.repository.port";

@Injectable()
export class CheckCreditLimitUseCase {
  constructor(
    @Inject(FINANCE_REPOSITORY_PORT) private readonly repo: IFinanceRepository
  ) {}

  async execute(partnerId: string, orderValue: string) {
    const partner = await this.repo.getPartner(partnerId); // Cần bổ sung hàm này vào Port/Adapter
    if (!partner) throw new Error("Không tìm thấy thông tin Khách hàng/Đại lý");

    // BẮT BUỘC dùng Decimal của Prisma (hoặc decimal.js) để tính tiền, không dùng float
    const currentDebt = new Prisma.Decimal(partner.currentDebt || 0);
    const creditLimit = new Prisma.Decimal(partner.creditLimit || 0);
    const orderAmount = new Prisma.Decimal(orderValue);
    
    // Nếu Nợ hiện tại + Đơn mới > Hạn mức tín dụng -> Chặn ngay
    if (currentDebt.plus(orderAmount).gt(creditLimit)) {
      throw new ConflictError("Khách hàng đã vượt quá hạn mức tín dụng cho phép.");
    }

    return { 
      approved: true, 
      remainingCredit: creditLimit.minus(currentDebt).minus(orderAmount).toString()
    };
  }
}