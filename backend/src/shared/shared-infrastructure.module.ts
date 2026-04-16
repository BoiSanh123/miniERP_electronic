import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { OutboxPublisher } from './infrastructure/outbox/outbox.publisher';
import { RedisService } from './infrastructure/redis/redis.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  providers: [
    PrismaService,
    OutboxPublisher,
    RedisService
  ],
  exports: [
    PrismaService,
    OutboxPublisher,
    RedisService
  ]
})
export class SharedInfrastructureModule {}