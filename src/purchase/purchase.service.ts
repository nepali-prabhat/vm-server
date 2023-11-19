import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundStockType, PrismaClient } from '@prisma/client';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CASH_UNIT } from 'src/constants';
import { Change } from './dto/change.dto';
import { SseService } from 'src/sse/sse.service';
import { PurchaseSseContracts } from './dto/purchase-sse-contracts.dto';

@Injectable()
export class PurchaseService extends SseService<PurchaseSseContracts> {
  private purchaseModel: PrismaClient['purchase'];

  constructor(prisma: PrismaService) {
    super();
    this.purchaseModel = prisma.purchase;
  }

  async create(orderId: number, dto: CreatePurchaseDto) {
    return this.purchaseModel.create({
      data: {
        coins: dto.coin,
        cash: dto.cash,
        orderId,
      },
      include: {
        order: {
          include: {
            inventory: true,
          },
        },
      },
    });
  }
  calculateChange(
    inputMoney: number,
    price: number,
    fundStock: Record<FundStockType, number>,
  ) {
    const changeToReturn = inputMoney - price;
    return this.calculateChangeToReturn(changeToReturn, fundStock);
  }

  calculateRefund(
    price: number,
    fundStock: {
      Cash: number;
      Coin: number;
    },
  ) {
    return this.calculateChangeToReturn(price, fundStock);
  }

  calculateChangeToReturn(
    changeToReturn: number,
    fundStock: { Cash: number; Coin: number },
  ) {
    const cashChange = Math.floor(changeToReturn / CASH_UNIT);
    const coinChange = changeToReturn % CASH_UNIT;

    const change = new Change(coinChange, cashChange * CASH_UNIT);

    // fallback
    if (fundStock.Cash < change.cash) {
      // check if by giving all the cash, we have enough coins to return the change
      const totalMoneyToReturn = change.getTotalChange();
      const coinsRequired = totalMoneyToReturn - fundStock.Cash;
      if (fundStock.Coin >= coinsRequired) {
        return new Change(coinsRequired, fundStock.Cash);
      }
    }

    return change;
  }
}
