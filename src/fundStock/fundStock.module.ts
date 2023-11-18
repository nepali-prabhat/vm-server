import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { FundStockService } from './fundStock.service';
import { FundStockController } from './fundStock.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FundStockController],
  providers: [PrismaService, FundStockService],
})
export class FundStockModule {}
