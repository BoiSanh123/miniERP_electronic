import { Inject, Injectable, ConflictException } from "@nestjs/common";
import { IPartnersRepository, PARTNERS_REPOSITORY_PORT } from "../ports/partners.repository.port";
import { CreatePartnerDto } from "../../presentation/dto/partner.dto";

@Injectable()
export class CreatePartnerUseCase {
  constructor(
    @Inject(PARTNERS_REPOSITORY_PORT) private readonly repo: IPartnersRepository
  ) {}

  async execute(dto: CreatePartnerDto, userId: string) {
    // 1. Kiểm tra chống trùng lặp Mã số thuế
    const existing = await this.repo.findByTaxCode(dto.taxCode);
    if (existing) {
      throw new ConflictException(`Doanh nghiệp với Mã số thuế ${dto.taxCode} đã tồn tại trong hệ thống.`);
    }

    // 2. Áp dụng Business Rules (Quy tắc kinh doanh) mặc định
    // - Khách hàng mới mặc định là Hạng Đồng (BRONZE)
    // - Hạn mức tín dụng mặc định là 0đ (Phải mua tiền mặt) cho đến khi Giám đốc duyệt cấp hạn mức
    const newPartner = {
      name: dto.name,
      taxCode: dto.taxCode,
      type: dto.type,
      tier: dto.tier || "BRONZE", 
      creditLimit: dto.creditLimit || "0",
      currentDebt: "0", // Dư nợ khởi tạo luôn là 0
      createdBy: userId,
      isActive: true
    };

    // 3. Giao cho Adapter lưu vào Database
    return this.repo.createPartner(newPartner);
  }
}