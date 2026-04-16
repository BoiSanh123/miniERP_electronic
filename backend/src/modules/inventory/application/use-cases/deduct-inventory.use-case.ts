import { Injectable, Inject } from "@nestjs/common";
import { randomUUID } from "crypto";
import { 
  INVENTORY_REPOSITORY_PORT, 
  InventoryRepository 
} from "../ports/inventory.repository.port";
import { StockLedgerEntity } from "../../domain/stock-ledger.entity";
import { InventoryTransactionDto } from "../../presentation/dto/inventory.dto";

@Injectable()
export class DeductInventoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly repo: InventoryRepository
  ) {}

  async execute(dto: InventoryTransactionDto) {
    const ledger = new StockLedgerEntity(
      randomUUID(),
      dto.productId,
      dto.warehouseId,
      "DEDUCT",
      dto.quantity,
      null,
      dto.referenceId,
      null
    );

    const eventPayload = {
      aggregateType: "Inventory",
      aggregateId: `${dto.productId}-${dto.warehouseId}`,
      eventType: "inventory.stock.deducted",
      payload: { ...dto }
    };

    await this.repo.executeDeductTransaction(
      dto.productId,
      dto.warehouseId,
      /* "0",                 // available không đổi
      `-${dto.quantity}`,  // giảm reserved */
      parseFloat(dto.quantity), // hoặc Number(dto.quantity)
      ledger,
      eventPayload
    );

    return { success: true, message: "Xuất kho vật lý thành công" };
  }
}