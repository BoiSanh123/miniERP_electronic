import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ProductRepositoryPort } from "../application/ports/product.repository.port";
import { ProductEntity } from "../domain/product.entity";

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: ProductEntity): Promise<ProductEntity> {
    const row = await this.prisma.product.create({
      data: {
        id: input.id ?? undefined,
        sku: input.sku,
        name: input.name,
        categoryId: input.categoryId,
        baseUnit: input.baseUnit,
        displayUnit: input.displayUnit,
        attributes: input.attributes,
        isActive: input.isActive,
        standard_cost: input.standardCost,
        list_price: input.listPrice
      }
    });
    return this.map(row);
  }

  async update(input: ProductEntity): Promise<ProductEntity> {
    const row = await this.prisma.product.update({
      where: { id: input.id! },
      data: {
        sku: input.sku,
        name: input.name,
        categoryId: input.categoryId,
        baseUnit: input.baseUnit,
        displayUnit: input.displayUnit,
        attributes: input.attributes,
        isActive: input.isActive,
        standard_cost: input.standardCost,
        list_price: input.listPrice
      }
    });
    return this.map(row);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const row = await this.prisma.product.findUnique({ where: { sku } });
    return row ? this.map(row) : null;
  }

  async search(filters: Record<string, any>): Promise<ProductEntity[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        AND: Object.entries(filters).map(([key, value]) => ({
          attributes: { path: [key], equals: value }
        }))
      }
    });
    return rows.map((r) => this.map(r));
  }

  private map(row: any): ProductEntity {
    return new ProductEntity(
      row.id,
      row.sku,
      row.name,
      row.categoryId,
      row.baseUnit,
      row.displayUnit,
      row.attributes ?? {},
      row.isActive,
      String(row.standard_cost),
      String(row.list_price)
    );
  }
}
