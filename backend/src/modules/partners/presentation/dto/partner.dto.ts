import { IsNotEmpty, IsString, IsIn, IsOptional, IsNumberString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePartnerDto {
  @ApiProperty({ description: "Tên doanh nghiệp / Đại lý", example: "Công ty TNHH Thiết bị điện ABC" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "Mã số thuế (Duy nhất)", example: "0101234567" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9-]{10,14}$/, { message: "Mã số thuế không hợp lệ" })
  taxCode!: string;

  @ApiProperty({ description: "Loại đối tác", example: "CUSTOMER" })
  @IsString()
  @IsIn(["CUSTOMER", "SUPPLIER", "BOTH"])
  type!: string;

  @ApiProperty({ description: "Cấp bậc đại lý", example: "SILVER", required: false })
  @IsOptional()
  @IsString()
  @IsIn(["BRONZE", "SILVER", "GOLD", "PLATINUM"])
  tier?: string;

  @ApiProperty({ description: "Hạn mức tín dụng tối đa (VNĐ)", example: "100000000", required: false })
  @IsOptional()
  @IsNumberString({}, { message: "Hạn mức tín dụng phải là chuỗi số nguyên" })
  creditLimit?: string;
}