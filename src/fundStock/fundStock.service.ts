import { Injectable } from '@nestjs/common';
import { FundType } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FundStockService {
  constructor(private prisma: PrismaService) {}

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
}
