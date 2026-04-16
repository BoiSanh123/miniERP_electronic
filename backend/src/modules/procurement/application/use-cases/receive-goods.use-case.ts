import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { IProcurementRepository, PROCUREMENT_REPOSITORY_PORT } from "../ports/procurement.repository.port";
import { ReceiveGoodsDto } from "../../presentation/dto/procurement.dto";

@Injectable()
export class ReceiveGoodsUseCase {
  constructor(@Inject(PROCUREMENT_REPOSITORY_PORT) private readonly repo: IProcurementRepository) {}

  async execute(dto: ReceiveGoodsDto, userId: string) {
    const po = await this.repo.getPurchaseOrderById(dto.poId);
    if (!po) throw new BadRequestException("Không tìm thấy Purchase Order");
    if (po.status !== "APPROVED" && po.status !== "PARTIAL") {
      throw new BadRequestException(`Không thể nhận hàng cho PO ở trạng thái: ${po.status}`);
    }

    const grnNumber = `GRN-${Date.now()}`;
    // Luồng này sẽ gọi DB Transaction để vừa tạo GRN, vừa cập nhật PO, vừa bắn Outbox Event
    return this.repo.executeReceiveGoodsTransaction(grnNumber, dto, userId);
  }
}