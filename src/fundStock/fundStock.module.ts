import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { FundStockService } from './fundStock.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, FundStockService],
})
export class FundStockModule {}
