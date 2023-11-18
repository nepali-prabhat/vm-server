import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { OrderService } from 'src/order/order.service';
import { FundStockService } from 'src/fundStock/fundStock.service';

@Module({
  imports: [ConfigModule],
  controllers: [PurchaseController],
  providers: [PrismaService, PurchaseService, OrderService, FundStockService],
})
export class PurchaseModule {}
