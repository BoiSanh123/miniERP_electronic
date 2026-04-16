import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { InventoryRepository } from "../application/ports/inventory.repository.port";
import { StockLedgerEntity } from "../domain/stock-ledger.entity";

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getInventory(productId: string, warehouseId: string) {
    return this.prisma.inventory.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } }
    });
  }

  async executeReserveTransaction(
    productId: string,
    warehouseId: string,
    quantity: number,
    ledger: StockLedgerEntity,
    eventPayload: any
  ): Promise<void> {

    await this.prisma.$transaction(async (tx) => {
      // 1. Lõi sức mạnh (Atomic Check & Update): 
      // Chỉ update NẾU số lượng khả dụng >= số lượng yêu cầu
      const updatedStock = await tx.inventory.updateMany({
        where: {
          productId,
          warehouseId,
          availableQuantity: { gte: quantity } // Điều kiện tiên quyết chống Race Condition
        },
        data: {
          availableQuantity: { decrement: quantity },
          reservedQuantity: { increment: quantity }
        }
      });

      // Nếu không có dòng nào được update -> Tồn kho không đủ hoặc sản phẩm không có ở kho
      if (updatedStock.count === 0) {
        throw new BadRequestException("Giao dịch thất bại: Tồn kho không đủ hoặc đã bị xử lý bởi luồng khác.");
      }

      // 2. Ghi Log vào Sổ cái (Ledger)
      await this.appendLedgerTx(tx, ledger);

      // 3. Ghi Event vào bảng Outbox
      await this.createOutboxEventTx(tx, eventPayload);
    });
  }

  /* async executeDeductTransaction(
    productId: string, warehouseId: string, deltaAvailable: string, 
    deltaReserved: string, ledger: StockLedgerEntity, eventPayload: any
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Khi deduct (xuất kho thật), bản ghi inventory chắn chắn đã tồn tại (do đã giữ chỗ)
      await tx.inventory.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: {
          availableQuantity: { increment: deltaAvailable },
          reservedQuantity: { increment: deltaReserved }
        }
      });

      await this.appendLedgerTx(tx, ledger);
      await this.createOutboxEventTx(tx, eventPayload);
    });
  } */

  async executeDeductTransaction(
    productId: string,
    warehouseId: string,
    quantity: number,
    ledger: StockLedgerEntity,
    eventPayload: any
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: {
          reservedQuantity: { decrement: quantity }, // bỏ giữ chỗ
          // available không đổi vì đã trừ từ lúc reserve
        }
      });

      await this.appendLedgerTx(tx, ledger);
      await this.createOutboxEventTx(tx, eventPayload);
    });
  }
  // --- Các hàm Helper nội bộ (Chỉ dùng trong Transaction) ---

  private async appendLedgerTx(tx: any, entry: StockLedgerEntity) {
    await tx.stockLedger.create({
      data: {
        id: entry.id ?? undefined,
        productId: entry.productId,
        warehouseId: entry.warehouseId,
        transactionType: entry.transactionType,
        quantity: entry.quantity,
        movingAverageCost: entry.movingAverageCost ?? null,
        referenceId: entry.referenceId ?? null,
        createdBy: entry.createdBy ?? null
      }
    });
  }

  private async createOutboxEventTx(tx: any, payload: any) {
    if (!payload) return;
    await tx.outboxEvent.create({
      data: {
        aggregateType: payload.aggregateType,
        aggregateId: payload.aggregateId,
        eventType: payload.eventType,
        payload: payload.payload,
        status: "PENDING"
      }
    });
  }
}