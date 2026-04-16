import { IsNotEmpty, IsString, IsUUID, IsNumberString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InventoryTransactionDto {
  @ApiProperty({ description: "ID của vật tư", example: "uuid-product-1" })
  @IsUUID(4, { message: "productId phải là UUID hợp lệ" })
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: "ID của kho xuất/nhập", example: "uuid-warehouse-1" })
  @IsUUID(4, { message: "warehouseId phải là UUID hợp lệ" })
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ description: "Số lượng (Dùng string để tránh sai số thập phân)", example: "100.5" })
  @IsNumberString({}, { message: "quantity phải là chuỗi số" })
  @IsNotEmpty()
  quantity!: string;

  @ApiProperty({ description: "ID của Đơn hàng/Phiếu xuất làm tham chiếu", example: "uuid-order-1" })
  @IsUUID(4)
  @IsNotEmpty()
  referenceId!: string;
}

export class GetInventoryQueryDto {
  @ApiProperty({ example: "uuid-product-1" })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: "uuid-warehouse-1" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;
}