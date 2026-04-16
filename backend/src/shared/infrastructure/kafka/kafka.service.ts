import { Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit {
  private producer!: Producer;
  private readonly kafka = new Kafka({
    clientId: "mini-erp",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",")
  });

  async onModuleInit() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async publish(topic: string, payload: unknown) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }]
    });
  }
}
