import { Inject, Injectable } from "@nestjs/common";
import { IProcurementRepository, PROCUREMENT_REPOSITORY_PORT } from "../ports/procurement.repository.port";
import { CreatePoDto } from "../../presentation/dto/procurement.dto";

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject(PROCUREMENT_REPOSITORY_PORT) 
    private readonly repo: IProcurementRepository
  ) {}

  async execute(dto: CreatePoDto, userId: string) {
    // Tạo mã PO dựa trên thời gian thực tế
    const poNumber = `PO-${Date.now()}`;
    return this.repo.createPurchaseOrder(poNumber, dto, userId);
  }
}