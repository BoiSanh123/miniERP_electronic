import { Body, Controller, Param, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { CreateOrderUseCase } from "../application/use-cases/create-order.use-case";
import { ConfirmOrderUseCase } from "../application/use-cases/confirm-order.use-case";
import { CreateShipmentUseCase } from "../application/use-cases/create-shipment.use-case";

@Controller("api/v1/sales")
export class SalesController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly confirmOrder: ConfirmOrderUseCase,
    private readonly createShipment: CreateShipmentUseCase
  ) {}

  @Post("orders")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: any) {
    const userId = "00000000-0000-0000-0000-000000000000";
    return this.createOrder.execute(body, userId);
  }

  @Post("orders/:id/confirm")
  @HttpCode(HttpStatus.OK)
  confirm(@Param("id") id: string) {
    return this.confirmOrder.execute(id);
  }

  @Post("shipments")
  @HttpCode(HttpStatus.CREATED)
  ship(@Body() body: { orderId: string, trackingCode: string }) {
    const userId = "00000000-0000-0000-0000-000000000000";
    return this.createShipment.execute(body, userId);
  }
}