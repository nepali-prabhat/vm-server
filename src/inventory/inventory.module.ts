import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [ConfigModule],
  controllers: [InventoryController],
  providers: [PrismaService, InventoryService],
})
export class InventoryModule {}
