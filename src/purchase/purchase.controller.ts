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
import { FundType, ORDER_STATUS, FUND_TYPE } from 'src/constants';
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
import { InventoryService } from 'src/inventory/inventory.service';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly orderService: OrderService,
    private readonly fundStockService: FundStockService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.purchaseService.getEventObservable();
  }

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const inputChange = new Change(
      createPurchaseDto.coin,
      createPurchaseDto.cash,
    );
    try {
      this.emitPurchaseEvent(new PurchaseStartContract(inputChange));

      const order = await this.orderService.timeoutOrGetPendingOrder();
      this.handleOrderValidation(order, inputChange);

      const inventory = order.inventory;
      await this.handleStockValidation(inventory.stock, order.id, inputChange);

      const inputMoney = createPurchaseDto.cash + createPurchaseDto.coin;
      const inventoryPrice = inventory.price;
      await this.handleInputMoneyValidation(
        inputMoney,
        inventoryPrice,
        order.id,
        inputChange,
      );

      const fundStock = await this.fundStockService.getFundStock();
      // console.log('fund stock: ', fundStock);

      const change = this.purchaseService.calculateChange(
        inputMoney,
        inventoryPrice,
        fundStock,
      );
      // console.log('change: ', change);

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
      await this.inventoryService.updateStock(
        order.inventoryId,
        inventory.stock - 1,
      );
      await this.fundStockService.updateGivenFundStock({
        [FUND_TYPE.cash]: fundStock.cash - change.cash,
        [FUND_TYPE.coin]: fundStock.coin - change.coin,
        [FUND_TYPE.customerCash]:
          fundStock.customerCash + createPurchaseDto.cash,
        [FUND_TYPE.customerCoin]:
          fundStock.customerCoin + createPurchaseDto.coin,
      });
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
    fundStock: Record<FundType, number>,
    change: Change,
    orderId: number,
    inputChange: Change,
  ) {
    if (fundStock.cash < change.cash) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCash);
      this.emitPurchaseEvent(new OutOfCashContract(inputChange));
      throw new NotFoundException('Out of cash');
    }

    if (fundStock.coin < change.coin) {
      await this.orderService.updateStatus(orderId, ORDER_STATUS.outOfCoins);
      this.emitPurchaseEvent(new OutOfCoinsContract(inputChange));
      throw new NotFoundException('Out of coins');
    }
  }
}
