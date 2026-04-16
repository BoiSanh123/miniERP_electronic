import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OutboxPublisher {
  constructor(private readonly prisma: PrismaService) {}

  async queue(event: {
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: any;
  }) {
    return this.prisma.outboxEvent.create({
      data: {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        status: "PENDING"
      }
    });
  }

  async queueTx(tx: any, event: {
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: any;
  }) {
    return tx.outboxEvent.create({
      data: {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        status: "PENDING"
      }
    });
  }
}
