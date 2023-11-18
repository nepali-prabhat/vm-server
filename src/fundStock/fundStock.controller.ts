import { Controller, Get } from '@nestjs/common';
import { FundStockService } from './fundStock.service';

@Controller('fund-stock')
export class FundStockController {
  constructor(private readonly fundStockService: FundStockService) {}

  @Get()
  getFundStock() {
    return this.fundStockService.findAll();
  }
}
