import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { IFinanceRepository, FINANCE_REPOSITORY_PORT } from "../ports/finance.repository.port";
import { AutoAllocateDto } from "../../presentation/dto/finance.dto";
import { Prisma } from "@prisma/client"; // Chỉ dùng để ép kiểu Decimal

@Injectable()
export class AutoAllocateUseCase {
  constructor(
    @Inject(FINANCE_REPOSITORY_PORT) private readonly repo: IFinanceRepository
  ) { }

  async execute(dto: AutoAllocateDto) {
    const payment = await this.repo.getPaymentById(dto.paymentId);
    if (!payment || payment.partnerId !== dto.partnerId) {
      throw new BadRequestException("Khoản thanh toán không hợp lệ.");
    }

    let unallocated = new Prisma.Decimal(payment.unallocatedAmount);
    if (unallocated.lte(0)) {
      throw new BadRequestException("Khoản thanh toán này đã được phân bổ hết.");
    }

    // Lấy các khoản nợ cũ nhất (FIFO - Đã sắp xếp ASC theo ngày)
    const unpaidDebts = await this.repo.getUnpaidDebts(dto.partnerId);

    const allocations: {
      paymentId: string;
      invoiceId: string;
      ledgerId: string;
      allocatedAmount: string;
    }[] = [];
    /* const allocations = []; */

    for (const debt of unpaidDebts) {
      if (unallocated.lte(0)) break; // Hết tiền để đập

      const debtBalance = new Prisma.Decimal(debt.balanceAfter); // Cột nợ còn lại

      // Số tiền sẽ đập vào hóa đơn này là Min(Số tiền đang dư, Số nợ của hóa đơn)
      const allocatedToThisDebt = unallocated.lt(debtBalance) ? unallocated : debtBalance;

      allocations.push({
        paymentId: payment.id,
        invoiceId: debt.referenceId, // Tham chiếu về Order/Shipment
        ledgerId: debt.id,
        allocatedAmount: allocatedToThisDebt.toString()
      });

      // Trừ dần số tiền chưa phân bổ
      unallocated = unallocated.minus(allocatedToThisDebt);
    }

    if (allocations.length === 0) {
      return { message: "Không có khoản nợ nào cần phân bổ." };
    }

    // Gọi Transaction DB để lưu 1 loạt
    await this.repo.executeAllocationTransaction(
      payment.id,
      allocations,
      unallocated.toString()
    );

    return {
      success: true,
      allocatedCount: allocations.length,
      remainingUnallocated: unallocated.toString()
    };
  }
}