import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CASH_UNIT, FundType } from 'src/constants';
import { Change } from './dto/change.dto';
import { SseService } from 'src/sse/sse.service';
import { PurchaseSseContracts } from './dto/purchase-sse-contracts.dto';

@Injectable()
export class PurchaseService extends SseService<PurchaseSseContracts> {
  private purchaseModel: PrismaClient['purchase'];
  // private eventSubject = new Subject<MessageEvent>();

  constructor(private prisma: PrismaService) {
    super();
    this.purchaseModel = prisma.purchase;
  }

  // getEventObservable() {
  //   return this.eventSubject.asObservable();
  // }
  // emitEvent(data: PurchaseSseContracts) {
  //   this.eventSubject.next({ data });
  // }

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
    fundStock: Record<FundType, number>,
  ) {
    const totalChange = inputMoney - price;
    const cashChange = Math.floor(totalChange / CASH_UNIT);
    const coinChange = totalChange % CASH_UNIT;

    const change = new Change(coinChange, cashChange * CASH_UNIT);

    if (fundStock.cash < change.cash) {
      // check if by giving all the cash, we have enough coins to return the change
      const totalMoneyToReturn = change.getTotalChange();
      const coinsRequired = totalMoneyToReturn - fundStock.cash;
      if (fundStock.coin >= coinsRequired) {
        return new Change(coinsRequired, fundStock.cash);
      }
    }

    return change;
  }
}
