import { Injectable } from "@nestjs/common";
import { OutboxPublisher } from "@shared/infrastructure/outbox/outbox.publisher";
import { ICatalogEventPublisher } from "../application/ports/event.publisher.port";

@Injectable()
export class OutboxEventPublisherAdapter implements ICatalogEventPublisher {
  constructor(private readonly outbox: OutboxPublisher) {}

  async publishProductCreated(payload: { productId: string; sku: string }): Promise<void> {
    await this.outbox.queue({
      aggregateType: "Product",
      aggregateId: payload.productId,
      eventType: "catalog.product.created",
      payload: payload
    });
  }

  async publishProductUpdated(payload: { productId: string }): Promise<void> {
    await this.outbox.queue({
      aggregateType: "Product",
      aggregateId: payload.productId,
      eventType: "catalog.product.updated",
      payload: payload
    });
  }
}