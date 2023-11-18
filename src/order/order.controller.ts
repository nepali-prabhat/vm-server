import {
  Controller,
  Post,
  ParseIntPipe,
  Param,
  ConflictException,
  Put,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ORDER_STATUS } from 'src/constants';
import {
  OrderCancelledContract,
  OrderPendingContract,
  OrderSseContracts,
} from './dto/order-sse-contracts.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/debug/pending')
  async getPendingOrder() {
    const pending = await this.orderService.getPendingOrder();
    if (!pending) {
      throw new NotFoundException();
    }
    return pending;
  }

  @Get('/debug/:orderId')
  async getOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderService.getOrder(orderId);
  }

  @Post('/inventory/:inventoryId')
  async createOrder(@Param('inventoryId', ParseIntPipe) inventoryId: number) {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      throw new ConflictException();
    }
    this.emitOrderEvent(new OrderPendingContract());
    // TODO: Good to have feature is to set cron job to send timeout error
    return this.orderService.createOrder(inventoryId);
  }

  @Put('/cancel-or-timeput-pending')
  async cancelPendingOrder() {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      await this.orderService.updateStatus(
        pendingOrder.id,
        ORDER_STATUS.cancelled,
      );
      this.emitOrderEvent(new OrderCancelledContract());
    }
  }

  private emitOrderEvent(contract: OrderSseContracts) {
    this.orderService.emitEvent(contract);
  }
}
