import { Inject, Injectable } from "@nestjs/common";
import { IFinanceRepository, FINANCE_REPOSITORY_PORT } from "../ports/finance.repository.port";

@Injectable()
export class RecordDebtUseCase {
  constructor(
    @Inject(FINANCE_REPOSITORY_PORT) private readonly repo: IFinanceRepository
  ) {}

  async execute(dto: { partnerId: string; transactionType: string; amount: string; referenceId?: string; periodId?: string }) {
    // Để chống Race Condition khi có 2 luồng cùng ghi nợ (ví dụ 2 đơn hàng giao thành công cùng lúc), 
    // logic tính toán số dư cuối (last balance) + cộng tiền 
    // phải nằm trọn trong Database Transaction của Prisma.
    return this.repo.executeRecordDebtTransaction(dto);
  }
}