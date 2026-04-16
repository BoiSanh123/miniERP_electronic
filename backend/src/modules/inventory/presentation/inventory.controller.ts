import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ReserveInventoryUseCase } from "../application/use-cases/reserve-inventory.use-case";
import { DeductInventoryUseCase } from "../application/use-cases/deduct-inventory.use-case";
import { GetAvailableInventoryQuery } from "../application/queries/get-available-inventory.query";
import { InventoryTransactionDto, GetInventoryQueryDto } from "./dto/inventory.dto";

@ApiTags("Inventory (Quản lý tồn kho)")
@Controller("api/v1/inventory")
export class InventoryController {
  constructor(
    private readonly reserveUseCase: ReserveInventoryUseCase,
    private readonly deductUseCase: DeductInventoryUseCase,
    private readonly getAvailableQuery: GetAvailableInventoryQuery
  ) {}

  @Get("available")
  @ApiOperation({ summary: "Xem tồn kho thực tế của một vật tư" })
  getAvailable(@Query() query: GetInventoryQueryDto) {
    return this.getAvailableQuery.execute(query.productId, query.warehouseId);
  }

  @Post("reserve")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Giữ chỗ tồn kho (Soft Allocation) khi chốt đơn" })
  reserve(@Body() dto: InventoryTransactionDto) {
    return this.reserveUseCase.execute(dto);
  }

  @Post("deduct")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Trừ kho vật lý (Hard Deduction) khi giao hàng" })
  deduct(@Body() dto: InventoryTransactionDto) {
    return this.deductUseCase.execute(dto);
  }
}