import { Injectable } from '@nestjs/common';
import { FundStockType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FundStockService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.fundStock.findMany({
      orderBy: {
        fundType: 'asc',
      },
    });
  }

  async getFundStock() {
    const response = await this.prisma.fundStock.findMany();
    return response.reduce(
      (agg, fundStock) => ({
        ...agg,
        [fundStock.fundType]: fundStock.stock,
      }),
      {} as Record<FundStockType, number>,
    );
  }

  async getCustomerFundStock() {
    const response = await this.prisma.fundStock.findMany({
      where: {
        OR: [
          {
            fundType: FundStockType.CustomerCash,
          },
          {
            fundType: FundStockType.CustomerCoin,
          },
        ],
      },
    });
    return {
      Cash:
        response.find((r) => r.fundType === FundStockType.CustomerCash)
          ?.stock || 0,
      Coin:
        response.find((r) => r.fundType === FundStockType.CustomerCoin)
          ?.stock || 0,
    };
  }

  async updateStock(fundType: FundStockType, stock: number) {
    return await this.prisma.fundStock.update({
      where: {
        fundType,
      },
      data: {
        stock,
      },
    });
  }

  async updateGivenFundStock(updates: Partial<Record<FundStockType, number>>) {
    const updatePromises = Object.keys(updates).map((fundType) =>
      this.prisma.fundStock.update({
        where: {
          fundType: FundStockType[fundType],
        },
        data: {
          stock: Math.max(updates[fundType], 0),
        },
      }),
    );
    await Promise.all(updatePromises);
  }
}
