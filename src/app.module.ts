import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { InventoryService } from './inventory/inventory.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { OrderModule } from './order/order.module';
import { PurchaseModule } from './purchase/purchase.module';

@Module({
  imports: [ConfigModule.forRoot(), OrderModule, PurchaseModule],
  controllers: [AppController],
  providers: [PrismaService, InventoryService],
})
export class AppModule {}
