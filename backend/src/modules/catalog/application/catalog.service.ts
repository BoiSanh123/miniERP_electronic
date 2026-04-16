import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ProductRepositoryPort } from "./ports/product.repository.port";
import { ProductEntity } from "../domain/product.entity";
import { OutboxPublisher } from "@shared/infrastructure/outbox/outbox.publisher";


@Injectable()
export class CatalogService {
constructor(
  @Inject("ProductRepositoryPort")
  private readonly repo: ProductRepositoryPort,
  private readonly prisma: PrismaService,
  private readonly outbox: OutboxPublisher
) {}

  async createProduct(dto: any) {
    const existing = await this.repo.findBySku(dto.sku);
    if (existing) throw new Error("SKU already exists");
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
    await this.outbox.queue({
      aggregateType: "Product",
      aggregateId: saved.id!,
      eventType: "catalog.product.created",
      payload: { productId: saved.id, sku: saved.sku }
    });
    return saved;
  }

  async updateProduct(id: string, dto: any) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error("Product not found");
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
    await this.outbox.queue({
      aggregateType: "Product",
      aggregateId: saved.id!,
      eventType: "catalog.product.updated",
      payload: { productId: saved.id }
    });
    return saved;
  }

  search(filters: Record<string, any>) {
    return this.repo.search(filters);
  }
}
