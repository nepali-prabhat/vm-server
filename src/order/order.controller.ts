import {
  Controller,
  Post,
  ParseIntPipe,
  Param,
  ConflictException,
  Put,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  OrderCancelledContract,
  OrderPendingContract,
  OrderSseContracts,
} from './dto/order-sse-contracts.dto';
import { Observable } from 'rxjs';
import { OrderStatus } from '@prisma/client';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.orderService.getEventObservable();
  }

  @Post('/inventory/:inventoryId')
  async createOrder(@Param('inventoryId', ParseIntPipe) inventoryId: number) {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      throw new ConflictException();
    }
    this.emitOrderEvent(new OrderPendingContract());
    return this.orderService.createOrder(inventoryId);
  }

  @Put('/cancel-or-timeout-pending')
  async cancelPendingOrder() {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      await this.orderService.updateStatus(
        pendingOrder.id,
        OrderStatus.CANCELLED,
      );
      this.emitOrderEvent(new OrderCancelledContract());
    }
  }

  private emitOrderEvent(contract: OrderSseContracts) {
    this.orderService.emitEvent(contract);
  }
}
