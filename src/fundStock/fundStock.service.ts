import { Injectable } from '@nestjs/common';
import { FUND_TYPE, FundType } from 'src/constants';
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
      {} as Record<FundType, number>,
    );
  }

  async getCustomerFundStock() {
    const response = await this.prisma.fundStock.findMany({
      where: {
        OR: [
          {
            fundType: FUND_TYPE.CustomerCash,
          },
          {
            fundType: FUND_TYPE.CustomerCoin,
          },
        ],
      },
    });
    return {
      Cash:
        response.find((r) => r.fundType === FUND_TYPE.CustomerCash)?.stock || 0,
      Coin:
        response.find((r) => r.fundType === FUND_TYPE.CustomerCoin)?.stock || 0,
    };
  }

  async updateStock(fundType: FundType, stock: number) {
    return await this.prisma.fundStock.update({
      where: {
        fundType,
      },
      data: {
        stock,
      },
    });
  }

  async updateGivenFundStock(updates: Partial<Record<FundType, number>>) {
    const updatePromises = Object.keys(updates).map((fundType) =>
      this.prisma.fundStock.update({
        where: {
          fundType,
        },
        data: {
          stock: Math.max(updates[fundType], 0),
        },
      }),
    );
    await Promise.all(updatePromises);
  }
}
