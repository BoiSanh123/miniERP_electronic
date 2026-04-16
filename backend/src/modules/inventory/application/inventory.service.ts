import { ReserveInventoryUseCase } from "./use-cases/reserve-inventory.use-case";
import { DeductInventoryUseCase } from "./use-cases/deduct-inventory.use-case";
import { GetAvailableInventoryQuery } from "./queries/get-available-inventory.query";

/* * TẦNG APPLICATION (FACADE)
 * Đã bóc tách Single Responsibility Principle. 
 * Giữ lại làm Controller Wrapper để không gãy hệ thống.
 * Tuyệt đối KHÔNG import @nestjs/common, Prisma, hay OutboxPublisher vào đây.
 */
export class InventoryService {
  constructor(
    private readonly reserveInventoryUseCase: ReserveInventoryUseCase,
    private readonly deductInventoryUseCase: DeductInventoryUseCase,
    private readonly getAvailableInventoryQuery: GetAvailableInventoryQuery
  ) {}

  async reserve(dto: { productId: string; warehouseId: string; quantity: string; referenceId: string }) {
    return this.reserveInventoryUseCase.execute(dto);
  }

  async deduct(dto: { productId: string; warehouseId: string; quantity: string; referenceId: string }) {
    return this.deductInventoryUseCase.execute(dto);
  }

  async getAvailable(productId: string, warehouseId: string) {
    return this.getAvailableInventoryQuery.execute(productId, warehouseId);
  }
}