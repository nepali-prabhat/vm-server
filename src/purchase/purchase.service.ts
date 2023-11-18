import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CASH_UNIT } from 'src/constants';

@Injectable()
export class PurchaseService {
  private purchaseModel: PrismaClient['purchase'];

  constructor(private prisma: PrismaService) {
    this.purchaseModel = prisma.purchase;
  }

  async create(orderId: number, dto: CreatePurchaseDto) {
    return this.purchaseModel.create({
      data: {
        coins: dto.coins,
        cash: dto.cash,
        orderId,
      },
    });
  }

  calculateChange(inputMoney: number, price: number) {
    const totalChange = inputMoney - price;
    const cashChange = Math.floor(totalChange / CASH_UNIT);
    const coinChange = totalChange % CASH_UNIT;
    return {
      coin: coinChange,
      cash: cashChange * CASH_UNIT,
    };
  }
}
