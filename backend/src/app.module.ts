import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
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

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // erp_admin
      password: 'Sanh123202',
      database: 'mini_erp_b2b',
      autoLoadEntities: true,
      synchronize: false,
    }),

    // Đăng ký các Bounded Contexts [cite: 19]
    // CatalogModule,
    // InventoryModule,
    // SalesModule,
    // FinanceModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
