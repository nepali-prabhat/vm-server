import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { OrderService } from 'src/order/order.service';
import { ORDER_STATUS } from 'src/constants';
import { FundStockService } from 'src/fundStock/fundStock.service';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly orderService: OrderService,
    private readonly fundStockService: FundStockService,
  ) {}

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const order = await this.orderService.timeoutPendingOrderOrReturn();
    this.handleOrderValidation(order);

    const inventory = order.inventory;
    await this.handleStockValidation(inventory.stock, order.id);

    const inputMoney = createPurchaseDto.cash + createPurchaseDto.coins;
    const inventoryPrice = inventory.price;
    console.log({ inputMoney, inventoryPrice });
    await this.handleInputMoneyValidation(inputMoney, inventoryPrice, order.id);

    const change = this.purchaseService.calculateChange(
      inputMoney,
      inventoryPrice,
    );

    const fundStock = await this.fundStockService.getFundStock();
    await this.handleFundStockValidation(fundStock, change, order.id);

    // TODO: send event to dispense the calculated change
    const purchase = await this.purchaseService.create(
      order.id,
      createPurchaseDto,
    );
    await this.orderService.updateStatus(order.id, ORDER_STATUS.success);
    return { purchase, change };
  }

  private async handleStockValidation(stock, orderId: number) {
    if (stock < 0) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfStock);
      // TODO: send event to dispense entered money
      throw new NotFoundException(`Out of stock`);
    }
  }

  private handleOrderValidation(
    order:
      | undefined
      | Awaited<
          ReturnType<typeof this.orderService.timeoutPendingOrderOrReturn>
        >,
  ) {
    if (!order) {
      // TODO: send event to dispense entered money
      throw new NotFoundException('No pending order');
    }
  }

  private async handleInputMoneyValidation(
    inputMoney: number,
    inventoryPrice: number,
    orderId: number,
  ) {
    if (inputMoney < inventoryPrice) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.cancelled);
      // TODO: send event to dispense entered money
      throw new BadRequestException('Insufficient fund');
    }
  }

  private async handleFundStockValidation(
    fundStock: Record<'coin' | 'cash', number>,
    change: { coin: number; cash: number },
    orderId: number,
  ) {
    if (fundStock.cash < change.cash) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCash);
      // TODO: send event to dispense the entered money
      throw new NotFoundException('Out of cash');
    }

    if (fundStock.coin < change.coin) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCoins);
      // TODO: send event to dispense the entered money
      throw new NotFoundException('Out of coins');
    }
  }
}
