import { IsNotEmpty, IsUUID, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CalculatePriceDto {
  @ApiProperty({ description: "ID của Khách hàng/Đại lý", example: "uuid-partner-1" })
  @IsUUID()
  @IsNotEmpty()
  partnerId!: string;

  @ApiProperty({ description: "ID của Vật tư/Sản phẩm", example: "uuid-product-1" })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: "Số lượng dự kiến mua", example: 1500 })
  @IsInt()
  @Min(1, { message: "Số lượng phải lớn hơn 0" })
  quantity!: number;
}