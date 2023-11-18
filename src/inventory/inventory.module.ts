import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { InventoryService } from './inventory.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, InventoryService],
})
export class InventoryModule {}
