import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { OrderController } from './order.controller';

@Module({
  imports: [ConfigModule],
  controllers: [OrderController],
  providers: [PrismaService, OrderService],
})
export class OrderModule {}
