import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventories() {
    return this.inventoryService.findAll();
  }

  @Get('/:id')
  async getInventory(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.find(id);
  }
}
