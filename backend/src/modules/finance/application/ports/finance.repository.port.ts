export const FINANCE_REPOSITORY_PORT = Symbol("FINANCE_REPOSITORY_PORT");

export interface IFinanceRepository {
  // ==========================================
  // CÁC LỆNH COMMAND (GHI/CẬP NHẬT DỮ LIỆU)
  // ==========================================
  
  savePayment(data: any): Promise<any>;
  
  getPaymentById(paymentId: string): Promise<any>;
  
  getUnpaidDebts(partnerId: string): Promise<any[]>;
  
  executeAllocationTransaction(
    paymentId: string, 
    allocations: any[], 
    remainingUnallocated: string
  ): Promise<void>;

  // Bổ sung cho RecordDebtUseCase (Tự động ghi nợ khi giao hàng)
  executeRecordDebtTransaction(dto: any): Promise<void>;

  // ==========================================
  // CÁC LỆNH QUERY (ĐỌC DỮ LIỆU)
  // ==========================================
  
  getDebtAgingReport(partnerId?: string): Promise<any>;

  // Bổ sung cho CheckCreditLimitUseCase (Kiểm tra hạn mức tín dụng)
  getPartner(partnerId: string): Promise<any>;
}