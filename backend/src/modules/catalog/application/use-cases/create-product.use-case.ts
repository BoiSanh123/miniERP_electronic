import { Inject, Injectable, ConflictException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ProductRepositoryPort } from "../ports/product.repository.port";
import { ICatalogEventPublisher, CATALOG_EVENT_PUBLISHER_PORT } from "../ports/event.publisher.port";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductDto } from "../../presentation/dto/create-product.dto";

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject("ProductRepositoryPort")
    private readonly repo: ProductRepositoryPort,
    
    @Inject(CATALOG_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: ICatalogEventPublisher
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductEntity> {
    const existing = await this.repo.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`Mã SKU ${dto.sku} đã tồn tại trong hệ thống.`);
    }
    
    const product = new ProductEntity(
      randomUUID(),
      dto.sku,
      dto.name,
      dto.categoryId ?? null,
      dto.baseUnit,
      dto.displayUnit,
      dto.attributes ?? {},
      dto.isActive ?? true,
      dto.standardCost ?? "0",
      dto.listPrice ?? "0"
    );
    
    const saved = await this.repo.create(product);
    
    // Bắn event qua Port, không dính dáng đến Outbox hay Kafka trực tiếp ở đây
    await this.eventPublisher.publishProductCreated({
      productId: saved.id!,
      sku: saved.sku
    });
    
    return saved;
  }
}