import { Controller, Get, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CalculatePriceUseCase } from "../application/use-cases/calculate-price.use-case";
import { CalculatePriceDto } from "./dto/pricing.dto";

@ApiTags("Pricing (Chiến lược giá)")
@Controller("api/v1/pricing")
export class PricingController {
  constructor(private readonly calculatePriceUseCase: CalculatePriceUseCase) {}

  @Get("calculate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tính toán giá bán cuối cùng dựa theo Tier và Volume" })
  calculatePrice(@Query() query: CalculatePriceDto) {
    // Chuyển string từ query params thành number
    query.quantity = Number(query.quantity); 
    return this.calculatePriceUseCase.execute(query);
  }
}