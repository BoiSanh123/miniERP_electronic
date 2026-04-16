import { ProductEntity } from "../../domain/product.entity";

export interface ProductRepositoryPort {
  create(input: ProductEntity): Promise<ProductEntity>;
  update(input: ProductEntity): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySku(sku: string): Promise<ProductEntity | null>;
  search(filters: Record<string, any>): Promise<ProductEntity[]>;
}
