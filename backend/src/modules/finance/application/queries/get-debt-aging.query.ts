import { Inject, Injectable } from "@nestjs/common";
import { IFinanceRepository, FINANCE_REPOSITORY_PORT } from "../ports/finance.repository.port";

@Injectable()
export class GetDebtAgingQuery {
  constructor(
    @Inject(FINANCE_REPOSITORY_PORT) private readonly repo: IFinanceRepository
  ) {}

  async execute(partnerId?: string) {
    // Luồng Query tách biệt hoàn toàn, không đụng chạm đến logic tính toán của Command
    return this.repo.getDebtAgingReport(partnerId);
  }
}