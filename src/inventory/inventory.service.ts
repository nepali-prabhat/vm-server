import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany();
  }

  async find(id: number) {
    return this.prisma.inventory.findUnique({
      where: {
        id,
      },
    });
  }

  async updateStock(id: number, stock: number) {
    await this.prisma.inventory.update({
      where: {
        id,
      },
      data: {
        stock,
      },
    });
  }
}
