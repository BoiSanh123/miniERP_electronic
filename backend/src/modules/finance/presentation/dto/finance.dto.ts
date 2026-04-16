import { IsNotEmpty, IsString, IsUUID, IsNumberString, IsOptional, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReceivePaymentDto {
  @ApiProperty({ description: "ID Khách hàng/Đại lý", example: "uuid-partner-1" })
  @IsUUID(4)
  @IsNotEmpty()
  partnerId!: string;

  @ApiProperty({ description: "Số tiền nhận (Dùng string chống sai số)", example: "50000000" })
  @IsNumberString({}, { message: "amount phải là chuỗi số nguyên hoặc thập phân chuẩn" })
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ description: "Phương thức thanh toán", example: "BANK_TRANSFER" })
  @IsString()
  @IsIn(["CASH", "BANK_TRANSFER", "CREDIT"])
  paymentMethod!: string;
}

export class AutoAllocateDto {
  @ApiProperty({ description: "ID Khoản thanh toán vừa nhận", example: "uuid-payment-1" })
  @IsUUID(4)
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({ description: "ID Khách hàng", example: "uuid-partner-1" })
  @IsUUID(4)
  @IsNotEmpty()
  partnerId!: string;
}