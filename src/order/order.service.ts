import { Injectable } from '@nestjs/common';
import {
  ORDER_STATUS,
  ORDER_TIMEOUT_IN_SECONDS,
  OrderStatus,
} from './../constants';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { SseService } from 'src/sse/sse.service';
import { OrderSseContracts } from './dto/order-sse-contracts.dto';
import { differenceInSeconds, format } from 'date-fns';

@Injectable()
export class OrderService extends SseService<OrderSseContracts> {
  private orderModel: PrismaClient['order'];

  constructor(prisma: PrismaService) {
    super();
    this.orderModel = prisma.order;
  }

  async findAll() {
    const orders = await this.orderModel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return orders;
  }

  async getPendingOrder() {
    const orders = await this.orderModel.findMany({
      where: {
        status: OrderStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        inventory: true,
      },
    });
    return orders[0];
  }

  async timeoutOrGetPendingOrder() {
    const pendingOrder = await this.getPendingOrder();
    if (pendingOrder) {
      const hasTimedout = this.hasOrderTimedout(pendingOrder.createdAt);
      console.log('has timeout: ', hasTimedout);
      if (hasTimedout) {
        await this.updateStatus(pendingOrder.id, OrderStatus.TIMEOUT);
      } else {
        return pendingOrder;
      }
    }
  }

  async getOrder(id: number) {
    return this.orderModel.findUnique({
      where: {
        id,
      },
    });
  }

  async createOrder(inventoryId: number) {
    return this.orderModel.create({
      data: {
        inventory: { connect: { id: inventoryId } },
        status: OrderStatus.PENDING,
      },
    });
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    return this.orderModel.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });
  }

  private hasOrderTimedout(createdAt: Date) {
    const secondsDiff = differenceInSeconds(new Date(), createdAt);
    return secondsDiff > ORDER_TIMEOUT_IN_SECONDS;
  }
}
