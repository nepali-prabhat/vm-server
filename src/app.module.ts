import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { PurchaseModule } from './purchase/purchase.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InventoryModule,
    OrderModule,
    PurchaseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
