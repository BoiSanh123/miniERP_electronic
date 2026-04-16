import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const prisma = new PrismaClient();
const kafka = new Kafka({
  clientId: "mini-erp-outbox-worker",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",")
});
const producer = kafka.producer();

async function main() {
  await producer.connect();
  
  setInterval(async () => {
    try {
      // 1. ATOMIC CLAIMING qua PostgreSQL Raw Query
      const rows = await prisma.$queryRaw<any[]>`
        UPDATE "OutboxEvent"
        SET status = 'PROCESSING'
        WHERE id IN (
          SELECT id FROM "OutboxEvent"
          WHERE status = 'PENDING'
          ORDER BY "createdAt" ASC
          LIMIT 50
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `;

      // Thoát nhanh nếu không có việc để làm
      if (!rows || rows.length === 0) return;

      // 2. Gửi Kafka và cập nhật trạng thái cuối (SENT)
      for (const row of rows) {
        try {
          // Parse string an toàn nếu payload bị trả về dạng JSON object từ QueryRaw
          const messageValue = typeof row.payload === 'string' 
            ? row.payload 
            : JSON.stringify(row.payload);

          await producer.send({
            topic: row.eventType,
            messages: [{ key: row.aggregateId, value: messageValue }]
          });

          await prisma.outboxEvent.update({
            where: { id: row.id },
            data: { status: "SENT", processedAt: new Date() }
          });
        } catch (e: any) {
          console.error(`Lỗi publish Kafka Event ${row.id}:`, e);
          await prisma.outboxEvent.update({
            where: { id: row.id },
            data: { status: "FAILED" }
          });
        }
      }
    } catch (error) {
      console.error("Lỗi cấp hệ thống tại Outbox Kafka Worker:", error);
    }
  }, 1000);
}

main().catch((e) => {
  console.error("Không thể khởi động Kafka Worker", e);
  process.exit(1);
});