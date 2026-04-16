import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

class OrderItemDto {
  @ApiProperty({ description: "ID của Sản phẩm", example: "uuid-product-1" })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: "Số lượng mua", example: 10 })
  @IsInt()
  @Min(1, { message: "Số lượng phải lớn hơn 0" })
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: "ID của Khách hàng", example: "uuid-partner-1" })
  @IsUUID()
  @IsNotEmpty()
  partnerId!: string;

  @ApiProperty({ type: [OrderItemDto], description: "Danh sách mặt hàng" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}