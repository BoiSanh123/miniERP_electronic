import { Inject, Injectable } from "@nestjs/common";
import { IFinanceRepository, FINANCE_REPOSITORY_PORT } from "../ports/finance.repository.port";
import { ReceivePaymentDto } from "../../presentation/dto/finance.dto";

@Injectable()
export class ReceivePaymentUseCase {
  constructor(
    @Inject(FINANCE_REPOSITORY_PORT) private readonly repo: IFinanceRepository
  ) {}

  async execute(dto: ReceivePaymentDto, userId: string) {
    // 1. Tạo mã phiếu thu tự động
    const paymentNumber = `PAY-${Date.now()}`;
    
    // 2. Giao cho Port gọi xuống Database Adapter để lưu
    const payment = await this.repo.savePayment({
      paymentNumber,
      partnerId: dto.partnerId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      unallocatedAmount: dto.amount, // Ban đầu, toàn bộ số tiền vừa nhận chưa được phân bổ cho hóa đơn nào
      createdBy: userId
    });
    
    return payment;
  }
}