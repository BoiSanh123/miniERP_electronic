import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IPartnersRepository } from "../application/ports/partners.repository.port";

@Injectable()
export class PrismaPartnersRepository implements IPartnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTaxCode(taxCode: string): Promise<any> {
    return this.prisma.businessPartner.findFirst({
      where: { taxCode } // Giả định bảng của bạn tên là businessPartner
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.businessPartner.findUnique({
      where: { id }
    });
  }

  async createPartner(data: any): Promise<any> {
    return this.prisma.businessPartner.create({
      data: {
        name: data.name,
        code: data.code,
        taxCode: data.taxCode,
        type: data.type,
        tier: data.tier,
        creditLimit: data.creditLimit,
        currentDebt: data.currentDebt,
        /* createdBy: data.createdBy,
        isActive: data.isActive */
      }
    });
  }
}