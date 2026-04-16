import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { IOrderRepository } from "../application/ports/order.repository.port";

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(orderNumber: string, data: any, createdBy: string): Promise<any> {
    return this.prisma.order.create({
      data: {
        orderNumber,
        customerId: data.partnerId,
        status: data.status,
        totalAmount: data.totalAmount,
        createdBy,

        items: { 
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            finalPrice: item.finalPrice,
            lineTotal: item.lineTotal
          }))
        }
      }
    });
  }

  async getOrderById(orderId: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });
  }

  async updateOrderStatusAndOutbox(orderId: string, status: string, eventPayload: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      await tx.outboxEvent.create({
        data: eventPayload
      });
    });
  }

  async saveShipmentAndOutbox(shipmentData: any, eventPayload: any): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId: shipmentData.orderId,
          shipmentNumber: shipmentData.shipmentNumber,
          status: shipmentData.status,
          deliveryDate: shipmentData.deliveryDate,
          partnerId: shipmentData.partnerId
        }
      });

      await tx.order.update({
        where: { id: shipmentData.orderId },
        data: { status: "SHIPPED" }
      });

      await tx.outboxEvent.create({
        data: eventPayload
      });

      return shipment;
    });
  }
}