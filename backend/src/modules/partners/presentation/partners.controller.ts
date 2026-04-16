import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreatePartnerUseCase } from "../application/use-cases/create-partner.use-case";
import { CreatePartnerDto } from "./dto/partner.dto";

@ApiTags("Partners (Khách hàng & Nhà cung cấp)")
@Controller("api/v1/partners")
export class PartnersController {
  constructor(private readonly createPartnerUseCase: CreatePartnerUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo mới một Đối tác (Khách hàng B2B / Supplier)" })
  @ApiResponse({ status: 201, description: "Tạo thành công" })
  @ApiResponse({ status: 409, description: "Trùng mã số thuế" })
  create(@Body() dto: CreatePartnerDto) {
    // Trong thực tế, lấy userId từ JWT Token (req.user.id)
    const mockUserId = "00000000-0000-0000-0000-000000000000"; 
    return this.createPartnerUseCase.execute(dto, mockUserId);
  }
}