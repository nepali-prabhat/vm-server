import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { FundStockService } from 'src/fundStock/fundStock.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ConfigModule, OrderModule],
  controllers: [PurchaseController],
  providers: [
    PrismaService,
    PurchaseService,
    FundStockService,
    InventoryService,
  ],
})
export class PurchaseModule {}
