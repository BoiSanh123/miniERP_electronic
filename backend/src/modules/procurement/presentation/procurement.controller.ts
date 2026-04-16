import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CreatePurchaseRequestUseCase } from "../application/use-cases/create-pr.use-case";
import { CreatePurchaseOrderUseCase } from "../application/use-cases/create-po.use-case";
import { ReceiveGoodsUseCase } from "../application/use-cases/receive-goods.use-case";
import { CreatePrDto, CreatePoDto, ReceiveGoodsDto } from "./dto/procurement.dto";

@ApiTags("Procurement (Mua hàng & Nhập kho)")
@Controller("api/v1/procurement")
export class ProcurementController {
  constructor(
    private readonly createPrUseCase: CreatePurchaseRequestUseCase,
    private readonly createPoUseCase: CreatePurchaseOrderUseCase,
    private readonly receiveGoodsUseCase: ReceiveGoodsUseCase
  ) {}

  @Post("purchase-requests")
  @ApiOperation({ summary: "Tạo Yêu cầu mua hàng (PR)" })
  createPR(@Body() dto: CreatePrDto) {
    return this.createPrUseCase.execute(dto, "admin-user-id");
  }

  @Post("purchase-orders")
  @ApiOperation({ summary: "Tạo Đơn đặt hàng (PO)" })
  createPO(@Body() dto: CreatePoDto) {
    return this.createPoUseCase.execute(dto, "admin-user-id");
  }

  @Post("receive-goods")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Nhận hàng (GRN) từ Supplier" })
  receiveGoods(@Body() dto: ReceiveGoodsDto) {
    return this.receiveGoodsUseCase.execute(dto, "admin-user-id");
  }
}