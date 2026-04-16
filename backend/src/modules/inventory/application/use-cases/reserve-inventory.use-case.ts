import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  INVENTORY_REPOSITORY_PORT,
  InventoryRepository
} from "../ports/inventory.repository.port";
import { StockLedgerEntity } from "../../domain/stock-ledger.entity";
import { InventoryTransactionDto } from "../../presentation/dto/inventory.dto";

@Injectable()
export class ReserveInventoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly repo: InventoryRepository
  ) {}

  async execute(dto: InventoryTransactionDto) {
    // 0. Validate input
    const requestedQty = parseFloat(dto.quantity);

    if (isNaN(requestedQty) || requestedQty <= 0) {
      throw new BadRequestException("Số lượng không hợp lệ");
    }

    // 1. Tạo Ledger (ghi lại lịch sử)
    const ledger = new StockLedgerEntity(
      randomUUID(),
      dto.productId,
      dto.warehouseId,
      "RESERVE",
      dto.quantity,
      null,
      dto.referenceId,
      null
    );

    // 2. Event payload (dùng cho outbox / event-driven)
    const eventPayload = {
      aggregateType: "Inventory",
      aggregateId: `${dto.productId}-${dto.warehouseId}`,
      eventType: "inventory.stock.reserved",
      payload: { ...dto }
    };

    // 3. Thực thi transaction (atomic trong DB)
    await this.repo.executeReserveTransaction(
      dto.productId,
      dto.warehouseId,
      /* -requestedQty, // giảm available
      +requestedQty, // tăng reserved */
      requestedQty,   // chỉ truyền quantity
      ledger,
      eventPayload
    );

    return {
      success: true,
      message: "Giữ chỗ tồn kho thành công"
    };
  }
}