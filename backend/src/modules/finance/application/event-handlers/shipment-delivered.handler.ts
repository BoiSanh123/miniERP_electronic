import { Injectable, Logger } from "@nestjs/common";
import { RecordDebtUseCase } from "../use-cases/record-debt.use-case";
// import { OnEvent } from "@nestjs/event-emitter"; // Bỏ comment khi cài event-emitter

@Injectable()
export class ShipmentDeliveredEventHandler {
  private readonly logger = new Logger(ShipmentDeliveredEventHandler.name);

  constructor(private readonly recordDebtUseCase: RecordDebtUseCase) {}

  // @OnEvent('logistics.shipment.delivered')
  async handle(eventPayload: any) {
    this.logger.log(`Finance module received shipment delivered event: ${eventPayload.shipmentId}`);
    
    try {
      // Tự động Ghi Nợ (Record Debt) dựa trên giá trị lô hàng thực giao
      await this.recordDebtUseCase.execute({
        partnerId: eventPayload.partnerId,
        transactionType: "DEBT_INCREASE", // Loại giao dịch Tăng nợ
        amount: eventPayload.totalValue,  // Tổng tiền hàng hóa
        referenceId: eventPayload.orderId // Chiếu theo Đơn hàng nào
      });
      this.logger.log(`Successfully recorded debt for Partner: ${eventPayload.partnerId}`);
    } catch (error: any) {
      this.logger.error(`Failed to record debt. Reason: ${error.message}`);
      // Nâng cao: Đẩy vào Dead Letter Queue (DLQ) để xử lý lại
    }
  }
}