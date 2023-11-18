import { Injectable } from '@nestjs/common';
import { FundType } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FundStockService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.fundStock.findMany();
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

  async updateGivenFundStock(updates: Record<FundType, number>) {
    for (const fundType of Object.keys(updates)) {
      await this.prisma.fundStock.update({
        where: {
          fundType,
        },
        data: {
          stock: updates[fundType],
        },
      });
    }
  }
}
