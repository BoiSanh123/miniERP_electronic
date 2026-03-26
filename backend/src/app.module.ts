// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import các Module tương lai (hiện tại có thể tạo file trống để setup)
// import { CatalogModule } from './modules/catalog/catalog.module';
// import { InventoryModule } from './modules/inventory/inventory.module';
// import { SalesModule } from './modules/sales/sales.module';
// import { FinanceModule } from './modules/finance/finance.module';

@Module({
  imports: [
    // Load biến môi trường (Ví dụ: thông tin kết nối Database)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Đăng ký các Bounded Contexts [cite: 19]
    // CatalogModule,
    // InventoryModule,
    // SalesModule,
    // FinanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
