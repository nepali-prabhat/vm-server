import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { OrderService } from 'src/order/order.service';
import { ORDER_STATUS } from 'src/constants';
import { FundStockService } from 'src/fundStock/fundStock.service';
import { Observable } from 'rxjs';
import { Change } from './dto/change.dto';
import {
  InsufficientFundContract,
  NoPendingOrderContract,
  OutOfCashContract,
  OutOfCoinsContract,
  OutOfStockContract,
  PurchaseFailedContract,
  PurchaseSseContracts,
  PurchaseStartContract,
  PurchaseSuccessContract,
} from './dto/purchase-sse-contracts.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly orderService: OrderService,
    private readonly fundStockService: FundStockService,
  ) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.purchaseService.getEventObservable();
  }

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const inputChange = new Change(
      createPurchaseDto.coins,
      createPurchaseDto.cash,
    );
    try {
      this.emitPurchaseEvent(new PurchaseStartContract(inputChange));

      const order = await this.orderService.timeoutOrGetPendingOrder();
      this.handleOrderValidation(order, inputChange);

      const inventory = order.inventory;
      await this.handleStockValidation(inventory.stock, order.id, inputChange);

      const inputMoney = createPurchaseDto.cash + createPurchaseDto.coins;
      const inventoryPrice = inventory.price;
      await this.handleInputMoneyValidation(
        inputMoney,
        inventoryPrice,
        order.id,
        inputChange,
      );

      const change = this.purchaseService.calculateChange(
        inputMoney,
        inventoryPrice,
      );

      const fundStock = await this.fundStockService.getFundStock();
      await this.handleFundStockValidation(
        fundStock,
        change,
        order.id,
        inputChange,
      );

      const purchase = await this.purchaseService.create(
        order.id,
        createPurchaseDto,
      );
      await this.orderService.updateStatus(order.id, ORDER_STATUS.success);
      this.emitPurchaseEvent(new PurchaseSuccessContract(change));
      return { purchase, change };
    } catch (e) {
      this.emitPurchaseEvent(new PurchaseFailedContract(inputChange));
      throw e;
    }
  }

  private emitPurchaseEvent(contract: PurchaseSseContracts) {
    this.purchaseService.emitEvent(contract);
  }

  private handleOrderValidation(
    order:
      | undefined
      | Awaited<ReturnType<typeof this.orderService.timeoutOrGetPendingOrder>>,
    inputChange: Change,
  ) {
    if (!order) {
      this.emitPurchaseEvent(new NoPendingOrderContract(inputChange));
      throw new NotFoundException('No pending order');
    }
  }

  private async handleStockValidation(
    stock,
    orderId: number,
    inputChange: Change,
  ) {
    if (stock < 0) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfStock);
      this.emitPurchaseEvent(new OutOfStockContract(inputChange));
      throw new NotFoundException(`Out of stock`);
    }
  }

  private async handleInputMoneyValidation(
    inputMoney: number,
    inventoryPrice: number,
    orderId: number,
    inputChange: Change,
  ) {
    if (inputMoney < inventoryPrice) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.cancelled);
      this.emitPurchaseEvent(new InsufficientFundContract(inputChange));
      throw new BadRequestException('Insufficient fund');
    }
  }

  private async handleFundStockValidation(
    fundStock: Record<'coin' | 'cash', number>,
    change: Change,
    orderId: number,
    inputChange: Change,
  ) {
    if (fundStock.cash < change.cash) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCash);
      this.emitPurchaseEvent(new OutOfCashContract(inputChange));
      throw new NotFoundException('Out of cash');
    }

    if (fundStock.coin < change.coins) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCoins);
      this.emitPurchaseEvent(new OutOfCoinsContract(inputChange));
      throw new NotFoundException('Out of coins');
    }
  }
}
