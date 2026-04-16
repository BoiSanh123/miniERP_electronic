import { IsNotEmpty, IsString, IsUUID, IsArray, ValidateNested, IsNumberString, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

class PurchaseItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsNumberString()
  @IsNotEmpty()
  quantity!: string;

  @IsOptional()
  @IsNumberString()
  unitCost?: string;
}

export class CreatePrDto {
  @ApiProperty({ type: [PurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items!: PurchaseItemDto[];
}

export class CreatePoDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  prId?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ type: [PurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items!: PurchaseItemDto[];
}

export class ReceiveGoodsItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsNumberString()
  @IsNotEmpty()
  receivedQuantity!: string;
}

export class ReceiveGoodsDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  poId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ type: [ReceiveGoodsItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveGoodsItemDto)
  items!: ReceiveGoodsItemDto[];
}