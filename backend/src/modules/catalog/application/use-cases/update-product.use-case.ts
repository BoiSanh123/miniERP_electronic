import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepositoryPort } from "../ports/product.repository.port";
import { ICatalogEventPublisher, CATALOG_EVENT_PUBLISHER_PORT } from "../ports/event.publisher.port";
import { ProductEntity } from "../../domain/product.entity";
import { UpdateProductDto } from "../../presentation/dto/update-product.dto";

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject("ProductRepositoryPort")
    private readonly repo: ProductRepositoryPort,
    
    @Inject(CATALOG_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: ICatalogEventPublisher
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new NotFoundException("Không tìm thấy vật tư.");
    }

    // Cập nhật các trường nếu có truyền lên
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.baseUnit !== undefined) product.baseUnit = dto.baseUnit;
    if (dto.displayUnit !== undefined) product.displayUnit = dto.displayUnit;
    if (dto.attributes !== undefined) product.attributes = dto.attributes;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.standardCost !== undefined) product.standardCost = dto.standardCost;
    if (dto.listPrice !== undefined) product.listPrice = dto.listPrice;

    const saved = await this.repo.update(product);

    await this.eventPublisher.publishProductUpdated({
      productId: saved.id!
    });

    return saved;
  }
}