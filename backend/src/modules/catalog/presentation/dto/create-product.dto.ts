import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({ example: "CAB-CADIVI-4.0" })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: "Cáp điện Cadivi 4.0mm2" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "uuid-category", required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: "Cuộn" })
  @IsString()
  @IsNotEmpty()
  baseUnit!: string;

  @ApiProperty({ example: "Mét" })
  @IsString()
  @IsNotEmpty()
  displayUnit!: string;

  @ApiProperty({ example: { "tiết_diện": "4.0mm2", "màu": "đỏ" } })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: "15000" })
  @IsOptional()
  @IsString()
  standardCost?: string;

  @ApiProperty({ example: "18000" })
  @IsOptional()
  @IsString()
  listPrice?: string;
}