import { Module } from "@nestjs/common";
import { FinanceController } from "./presentation/finance.controller"; // [cite: 129]

// Port và Adapter hạ tầng
import { FINANCE_REPOSITORY_PORT } from "./application/ports/finance.repository.port"; // [cite: 139]
import { PrismaFinanceRepository } from "./infrastructure/prisma-finance.repository"; // [cite: 135]

// Các Use Case (Command) và Query
import { ReceivePaymentUseCase } from "./application/use-cases/receive-payment.use-case";
import { AutoAllocateUseCase } from "./application/use-cases/auto-allocate.use-case"; // [cite: 136]
import { GetDebtAgingQuery } from "./application/queries/get-debt-aging.query"; // [cite: 138]
import { CheckCreditLimitUseCase } from "./application/use-cases/check-credit-limit.use-case"; 
import { RecordDebtUseCase } from "./application/use-cases/record-debt.use-case";

// Event Handlers
import { ShipmentDeliveredEventHandler } from "./application/event-handlers/shipment-delivered.handler"; // 

@Module({
  controllers: [FinanceController],
  providers: [
    // 1. Đăng ký các Use Case xử lý nghiệp vụ ghi dữ liệu (Command)
    ReceivePaymentUseCase,
    AutoAllocateUseCase,
    CheckCreditLimitUseCase,
    RecordDebtUseCase,

    // 2. Đăng ký Query xử lý nghiệp vụ đọc/báo cáo (Query)
    GetDebtAgingQuery,
    
    // 3. Đăng ký Event Handler để lắng nghe sự kiện từ các module khác
    ShipmentDeliveredEventHandler,

    // 4. Kết nối Port (Giao diện) với Adapter (Thực thi Prisma)
    {
      provide: FINANCE_REPOSITORY_PORT,
      useClass: PrismaFinanceRepository,
    },
  ],
  // Xuất CheckCreditLimitUseCase để module Sales có thể sử dụng khi kiểm tra đơn hàng
  exports: [CheckCreditLimitUseCase], 
})
export class FinanceModule {}