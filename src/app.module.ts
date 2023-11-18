import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { PurchaseModule } from './purchase/purchase.module';
import { InventoryModule } from './inventory/inventory.module';
import { FundStockModule } from './fundStock/fundStock.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InventoryModule,
    OrderModule,
    PurchaseModule,
    FundStockModule,
  ],
})
export class AppModule {}
