import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ReceivePaymentUseCase } from "../application/use-cases/receive-payment.use-case";
import { AutoAllocateUseCase } from "../application/use-cases/auto-allocate.use-case";
import { GetDebtAgingQuery } from "../application/queries/get-debt-aging.query";
import { ReceivePaymentDto, AutoAllocateDto } from "./dto/finance.dto";

@ApiTags("Finance (Tài chính - Công nợ)")
@Controller("api/v1/finance")
export class FinanceController {
  constructor(
    private readonly receivePayment: ReceivePaymentUseCase,
    private readonly autoAllocate: AutoAllocateUseCase,
    private readonly debtAging: GetDebtAgingQuery
  ) {}

  @Post("payments")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Ghi nhận khoản thanh toán từ khách hàng" })
  receive(@Body() dto: ReceivePaymentDto) {
    const userId = "00000000-0000-0000-0000-000000000000"; // Fake User ID
    return this.receivePayment.execute(dto, userId);
  }

  @Post("payments/auto-allocate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tự động phân bổ thanh toán vào các công nợ cũ nhất (FIFO)" })
  allocate(@Body() dto: AutoAllocateDto) {
    return this.autoAllocate.execute(dto);
  }

  @Get("reports/debt-aging")
  @ApiOperation({ summary: "Xem báo cáo tuổi nợ (CQRS)" })
  getReport(@Query("partnerId") partnerId?: string) {
    return this.debtAging.execute(partnerId);
  }
}