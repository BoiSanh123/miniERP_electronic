import { Module } from '@nestjs/common';
import { CatalogController } from './presentation/catalog.controller';
import { CatalogService } from './application/catalog.service';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository';
import { OutboxEventPublisherAdapter } from './infrastructure/outbox-event.publisher.adapter';
import { CATALOG_EVENT_PUBLISHER_PORT } from './application/ports/event.publisher.port';
import { SharedInfrastructureModule } from '../../shared/shared-infrastructure.module';

// Import các Use Case và Query
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductsQuery } from './application/queries/get-products.query';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [CatalogController],
  providers: [
    // 1. Facade
    CatalogService,
    
    // 2. Use Cases & Queries
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductsQuery,
    
    // 3. Đăng ký Database Adapter
    {
      provide: 'ProductRepositoryPort',
      useClass: PrismaProductRepository,
    },
    
    // 4. Đăng ký Event Publisher Adapter
    {
      provide: CATALOG_EVENT_PUBLISHER_PORT,
      useClass: OutboxEventPublisherAdapter,
    },
  ],
})
export class CatalogModule {}