import { Controller, Get, ImATeapotException } from '@nestjs/common';
import { InventoryService } from './inventory/inventory.service';

@Controller()
export class AppController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  teapot() {
    throw new ImATeapotException();
  }

  @Get('/inventories')
  getInventories() {
    return this.inventoryService.findAll();
  }
}
