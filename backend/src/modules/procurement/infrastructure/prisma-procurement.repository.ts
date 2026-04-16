import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IProcurementRepository } from "../application/ports/procurement.repository.port";

@Injectable()
export class PrismaProcurementRepository implements IProcurementRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // CREATE PURCHASE REQUEST
  // =========================
  async createPurchaseRequest(
    prNumber: string,
    requestedBy: string,
    items: any[]
  ): Promise<any> {
    return this.prisma.purchaseRequest.create({
      data: {
        prNumber,
        status: "DRAFT",
        requestedBy
      }
    });
  }

  // =========================
  // CREATE PURCHASE ORDER
  // =========================
  async createPurchaseOrder(
    poNumber: string,
    dto: any,
    createdBy: string
  ): Promise<any> {
    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        prId: dto.prId,
        supplierId: dto.supplierId,
        status: "APPROVED",
        createdBy,

        // ✅ FIX: dùng đúng relation name theo Prisma schema
        items: {
          create: dto.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost || 0
          }))
        }
      },
      include: {
        items: true
      }
    });
  }

  // =========================
  // GET PURCHASE ORDER
  // =========================
  async getPurchaseOrderById(poId: string): Promise<any> {
    return this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: true
      }
    });
  }

  // =========================
  // RECEIVE GOODS (GRN FLOW)
  // =========================
  async executeReceiveGoodsTransaction(
    grnNumber: string,
    dto: any,
    createdBy: string
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create GRN
      const grn = await tx.goodsReceiptNote.create({
        data: {
          grnNumber,
          poId: dto.poId,
          warehouseId: dto.warehouseId,
          status: "COMPLETED",
          createdBy
        }
      });

      // 2. Update PO items
      let allItemsFullyReceived = true;

      for (const item of dto.items) {
        const poItem = await tx.purchaseOrderItem.findFirst({
          where: {
            purchaseOrderId: dto.poId,
            productId: item.productId
          }
        });

        if (poItem) {
          const newReceivedTotal =
            Number(poItem.receivedQuantity) + Number(item.receivedQuantity);

          await tx.purchaseOrderItem.update({
            where: { id: poItem.id },
            data: {
              receivedQuantity: newReceivedTotal
            }
          });

          if (newReceivedTotal < Number(poItem.quantity)) {
            allItemsFullyReceived = false;
          }
        }
      }

      // 3. Update PO status
      await tx.purchaseOrder.update({
        where: { id: dto.poId },
        data: {
          status: allItemsFullyReceived ? "COMPLETED" : "PARTIAL"
        }
      });

      // 4. Outbox event
      await tx.outboxEvent.create({
        data: {
          aggregateType: "Procurement",
          aggregateId: grn.id,
          eventType: "procurement.goods.received",
          payload: {
            grnId: grn.id,
            warehouseId: dto.warehouseId,
            items: dto.items
          }
        }
      });

      return grn;
    });
  }
}