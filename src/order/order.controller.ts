import {
  Controller,
  Post,
  ParseIntPipe,
  Param,
  ConflictException,
  Body,
  Put,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdatePendingOrderDto } from './dto/update-pending-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/pending')
  async getPendingOrder() {
    const pending = await this.orderService.getPendingOrder();
    if (!pending) {
      throw new NotFoundException();
    }
    return pending;
  }

  @Post('/inventory/:inventoryId')
  async createOrder(@Param('inventoryId', ParseIntPipe) inventoryId: number) {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      throw new ConflictException();
    }
    // TODO: add code to send timeout event after 60 seconds
    return this.orderService.createOrder(inventoryId);
  }

  @Put('/updatePending')
  async updatePendingOrder(@Body() dto: UpdatePendingOrderDto) {
    const pendingOrder = await this.orderService.timeoutOrGetPendingOrder();
    if (pendingOrder) {
      const response = await this.orderService.updateStatus(
        pendingOrder.id,
        dto.status,
      );
      return response;
    }
  }
}
