import { ValidationError } from "@shared/domain/errors";

export type TransactionType = "IN" | "OUT" | "RESERVE" | "DEDUCT" | "ADJUST";

export class StockLedgerEntity {
  constructor(
    public readonly id: string | null,
    public productId: string,
    public warehouseId: string,
    public transactionType: TransactionType, // Bắt buộc dùng Type chuẩn
    public quantity: string,
    public movingAverageCost: string | null,
    public referenceId: string | null,
    public createdBy: string | null
  ) {
    if (!productId) throw new ValidationError("Mã vật tư (productId) không được để trống.");
    if (!warehouseId) throw new ValidationError("Mã kho (warehouseId) không được để trống.");
    // quantity có thể là số âm (VD: -10) hoặc dương (VD: 10), được lưu dưới dạng chuỗi để tránh sai số thập phân
  }
}