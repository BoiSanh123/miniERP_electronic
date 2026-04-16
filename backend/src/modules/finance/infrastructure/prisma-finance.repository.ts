import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IFinanceRepository } from "../application/ports/finance.repository.port";

@Injectable()
export class PrismaFinanceRepository implements IFinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. NGHIỆP VỤ THANH TOÁN & PHÂN BỔ
  // ==========================================

  async savePayment(data: any): Promise<any> {
    return this.prisma.payment.create({ data });
  }

  async getPaymentById(paymentId: string): Promise<any> {
    return this.prisma.payment.findUnique({ where: { id: paymentId } });
  }

  async getUnpaidDebts(partnerId: string): Promise<any[]> {
    return this.prisma.debtLedger.findMany({
      where: { 
        partnerId, 
        transactionType: "DEBT_INCREASE", 
        balanceAfter: { gt: 0 } 
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async executeAllocationTransaction(
    paymentId: string, allocations: any[], remainingUnallocated: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { unallocatedAmount: remainingUnallocated }
      });

      for (const alloc of allocations) {
        await tx.paymentAllocation.create({
          data: {
            paymentId: alloc.paymentId,
            invoiceId: alloc.invoiceId,
            allocatedAmount: alloc.allocatedAmount
          }
        });

        await tx.debtLedger.update({
          where: { id: alloc.ledgerId },
          data: {
            balanceAfter: { decrement: alloc.allocatedAmount } 
          }
        });
      }
    });
  }

  // ==========================================
  // 2. NGHIỆP VỤ BÁO CÁO (CQRS)
  // ==========================================

  async getDebtAgingReport(partnerId?: string): Promise<any> {
    const sql = `
      SELECT 
        partner_id,
        SUM(CASE WHEN CURRENT_DATE - created_at::date <= 30 THEN balance_after ELSE 0 END) as "0_30_days",
        SUM(CASE WHEN CURRENT_DATE - created_at::date > 30 AND CURRENT_DATE - created_at::date <= 60 THEN balance_after ELSE 0 END) as "31_60_days",
        SUM(CASE WHEN CURRENT_DATE - created_at::date > 60 THEN balance_after ELSE 0 END) as "over_60_days"
      FROM debt_ledger
      WHERE balance_after > 0
      ${partnerId ? `AND partner_id = '${partnerId}'` : ''}
      GROUP BY partner_id;
    `;
    return this.prisma.$queryRawUnsafe(sql);
  }

  // ==========================================
  // 3. NGHIỆP VỤ TÍN DỤNG & GHI NỢ (MỚI BỔ SUNG)
  // ==========================================

  async getPartner(partnerId: string): Promise<any> {
    return this.prisma.businessPartner.findUnique({
      where: { id: partnerId }
    });
  }

  async executeRecordDebtTransaction(dto: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // BƯỚC A: Cập nhật tổng dư nợ của Khách hàng (Atomic Update)
      // Dùng lệnh increment thay vì lấy số cũ cộng số mới trên RAM để chống đụng độ (Race condition)
      const updatedPartner = await tx.businessPartner.update({
        where: { id: dto.partnerId },
        data: {
          currentDebt: { increment: dto.amount } 
        }
      });

      // BƯỚC B: Ghi lịch sử vào Sổ cái công nợ (Immutable Ledger)
      // balanceAfter sẽ lưu lại đúng số tiền nợ ngay tại tích tắc giao dịch diễn ra
      await tx.debtLedger.create({
        data: {
          partnerId: dto.partnerId,
          transactionType: dto.transactionType,
          amount: dto.amount,
          // balanceAfter: updatedPartner.currentDebt, 
          balanceAfter: updatedPartner.currentDebt ?? 0,
          referenceId: dto.referenceId || null,
          periodId: dto.periodId || null
        }
      });
    });
  }
}