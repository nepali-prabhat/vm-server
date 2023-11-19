import { InventoryDto } from './../inventory/dto/inventory.dto';
import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
  Sse,
  MessageEvent,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  CreatePurchaseDto,
  createPurchaseDtoSchema,
} from './dto/create-purchase.dto';
import { OrderService } from 'src/order/order.service';
import { FundType } from 'src/constants';
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
import { ZodPipe } from 'src/exceptionFilters/zod-exception.filter';
import {
  OrderCancelledContract,
  OrderFulfilledContract,
} from 'src/order/dto/order-sse-contracts.dto';
import { OrderStatus } from '@prisma/client';

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
  async create(
    @Body(new ZodPipe(createPurchaseDtoSchema))
    createPurchaseDto: CreatePurchaseDto,
  ) {
    const inputChange = new Change(
      createPurchaseDto.coin,
      createPurchaseDto.cash,
    );
    try {
      this.emitPurchaseEvent(new PurchaseStartContract(inputChange));

      const order = await this.orderService.timeoutOrGetPendingOrder();
      this.handleOrderValidation(order, inputChange);

      const inventory = order.inventory;
      const inventoryDto = new InventoryDto(
        order.inventory.id,
        order.inventory.name,
        order.inventory.price,
        order.inventory.stock,
        order.inventory.imageName,
      );
      await this.handleStockValidation(inventory.stock, order.id, inputChange);

      const inputMoney = createPurchaseDto.cash + createPurchaseDto.coin;
      const inventoryPrice = inventory.price;
      await this.handleInputMoneyValidation(
        inputMoney,
        inventoryPrice,
        inputChange,
      );

      const fundStock = await this.fundStockService.getFundStock();

      const change = this.purchaseService.calculateChange(
        inputMoney,
        inventoryPrice,
        fundStock,
      );

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
        Cash: fundStock.Cash - change.cash,
        Coin: fundStock.Coin - change.coin,
        CustomerCash: fundStock.CustomerCash + createPurchaseDto.cash,
        CustomerCoin: fundStock.CustomerCoin + createPurchaseDto.coin,
      });
      await this.orderService.updateStatus(order.id, OrderStatus.SUCCESS);

      this.orderService.emitEvent(new OrderFulfilledContract());
      this.emitPurchaseEvent(new PurchaseSuccessContract(change, inventoryDto));

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
    if (stock <= 0) {
      await this.orderService.updateStatus(orderId, OrderStatus.OUT_OF_STOCK);
      this.emitPurchaseEvent(new OutOfStockContract(inputChange));
      this.orderService.emitEvent(new OrderCancelledContract());
      throw new NotFoundException(`Out of stock`);
    }
  }

  private async handleInputMoneyValidation(
    inputMoney: number,
    inventoryPrice: number,
    inputChange: Change,
  ) {
    if (inputMoney < inventoryPrice) {
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
    if (fundStock.Cash < change.cash) {
      await this.orderService.updateStatus(orderId, OrderStatus.OUT_OF_CASH);
      this.orderService.emitEvent(new OrderCancelledContract());
      this.emitPurchaseEvent(new OutOfCashContract(inputChange));
      throw new NotFoundException('Out of cash');
    }

    if (fundStock.Coin < change.coin) {
      await this.orderService.updateStatus(orderId, OrderStatus.OUT_OF_COINS);
      this.orderService.emitEvent(new OrderCancelledContract());
      this.emitPurchaseEvent(new OutOfCoinsContract(inputChange));
      throw new NotFoundException('Out of coins');
    }
  }
}
