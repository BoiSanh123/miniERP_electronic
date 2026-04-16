import { StockLedgerEntity } from "../../domain/stock-ledger.entity";

export const INVENTORY_REPOSITORY_PORT = Symbol("INVENTORY_REPOSITORY_PORT");

export interface InventoryRepository {
  getInventory(productId: string, warehouseId: string): Promise<any>;

  executeReserveTransaction(
    productId: string,
    warehouseId: string,
    quantity: number,
    ledger: StockLedgerEntity,
    eventPayload: any
  ): Promise<void>;

  executeDeductTransaction(
    productId: string,
    warehouseId: string,
    quantity: number,
    ledger: StockLedgerEntity,
    eventPayload: any
  ): Promise<void>;
}