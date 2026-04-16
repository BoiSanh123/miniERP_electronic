import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import {
  INVENTORY_REPOSITORY_PORT,
  InventoryRepository
} from "../ports/inventory.repository.port";

@Injectable()
export class GetAvailableInventoryQuery {
  constructor(
    @Inject(INVENTORY_REPOSITORY_PORT)
    private readonly repo: InventoryRepository
  ) {}

  async execute(productId: string, warehouseId: string) {
    const stock = await this.repo.getInventory(productId, warehouseId);

    if (!stock) {
      throw new NotFoundException(
        "Không tìm thấy thông tin tồn kho cho vật tư này tại kho yêu cầu."
      );
    }

    return {
      productId: stock.productId,
      warehouseId: stock.warehouseId,
      availableQuantity: String(stock.availableQuantity),
      reservedQuantity: String(stock.reservedQuantity)
    };
  }
}