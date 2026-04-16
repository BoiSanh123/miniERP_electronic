import { ApiProperty } from "@nestjs/swagger";

export class DashboardResponseDto {
  @ApiProperty({ description: "Tổng số lượng thiết bị điện trong Catalog", example: 1250 })
  productCount!: number;

  @ApiProperty({ description: "Tổng số đơn hàng đã tạo", example: 450 })
  orderCount!: number;

  @ApiProperty({ description: "Tổng công nợ hiện tại của hệ thống", example: 1500000000 })
  totalDebt!: string; // Trả về string để tránh sai số thập phân ở frontend
}