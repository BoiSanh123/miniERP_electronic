import { Inject, Injectable } from "@nestjs/common";
import { IProcurementRepository, PROCUREMENT_REPOSITORY_PORT } from "../ports/procurement.repository.port";
import { CreatePrDto } from "../../presentation/dto/procurement.dto";

@Injectable()
export class CreatePurchaseRequestUseCase {
  constructor(@Inject(PROCUREMENT_REPOSITORY_PORT) private readonly repo: IProcurementRepository) {}

  async execute(dto: CreatePrDto, userId: string) {
    const prNumber = `PR-${Date.now()}`;
    return this.repo.createPurchaseRequest(prNumber, userId, dto.items);
  }
}