import { Inject, Injectable } from "@nestjs/common";
import { IBffQueryPort, BFF_QUERY_PORT } from "./ports/bff.query.port";

@Injectable()
export class BffService {
  constructor(
    // Inject interface thay vì PrismaService
    @Inject(BFF_QUERY_PORT) 
    private readonly bffQuery: IBffQueryPort
  ) {}

  async getDashboardMetrics() {
    // Service này có thể chứa thêm logic format data nếu cần thiết
    // trước khi trả về cho Frontend
    return this.bffQuery.getDashboardMetrics();
  }
}