import { ValidationError } from "@shared/domain/errors";

export class ProductEntity {
  constructor(
    public readonly id: string | null,
    public sku: string,
    public name: string,
    public categoryId: string | null,
    public baseUnit: string,
    public displayUnit: string,
    public attributes: Record<string, any>,
    public isActive: boolean,
    public standardCost: string,
    public listPrice: string
  ) {
    if (!sku?.trim()) throw new ValidationError("SKU is required");
    if (!name?.trim()) throw new ValidationError("Product name is required");
  }
}
