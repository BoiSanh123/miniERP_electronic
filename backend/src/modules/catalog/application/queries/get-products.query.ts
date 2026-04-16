import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "@shared/infrastructure/redis/redis.service";
import { ProductRepositoryPort } from "../ports/product.repository.port";

@Injectable()
export class GetProductsQuery {
  constructor(
    @Inject("ProductRepositoryPort") private readonly repo: ProductRepositoryPort,
    private readonly redis: RedisService
  ) {}

  async execute(filters: Record<string, any>) {
    // 1. Tạo Cache Key dựa trên bộ lọc
    const cacheKey = `catalog:products:search:${JSON.stringify(filters)}`;

    // 2. Tìm trong Redis trước
    const cachedData = await this.redis.client.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData); // Trả về siêu tốc dưới 50ms
    }

    // 3. Nếu Cache Miss, xuống Database (PostgreSQL) lấy data
    const products = await this.repo.search(filters);

    // 4. Lưu ngược lại vào Redis, set TTL (Time-To-Live) ví dụ 1 tiếng
    await this.redis.client.set(cacheKey, JSON.stringify(products), "EX", 3600);

    return products;
  }
}