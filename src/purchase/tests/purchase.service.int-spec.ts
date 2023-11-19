import { Test } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from 'src/purchase/dto/create-purchase.dto';
import { PurchaseModule } from 'src/purchase/purchase.module';
import { PurchaseService } from 'src/purchase/purchase.service';

describe('Purchase service', () => {
  let prisma: PrismaService;
  let purchaseService: PurchaseService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PurchaseModule],
    }).compile();
    prisma = moduleRef.get(PrismaService);
    purchaseService = moduleRef.get(PurchaseService);
    await prisma.resetDatabase();
  });
  async function createOrder(name: string) {
    const inventory = await prisma.inventory.create({
      data: {
        name,
        price: 20,
        stock: 10,
      },
    });
    const order = await prisma.order.create({
      data: {
        inventory: { connect: { id: inventory.id } },
        status: OrderStatus.PENDING,
      },
    });
    return { orderId: order.id, inventoryId: inventory.id };
  }
  describe('create()', () => {
    it('should create purchase and include order and order.inventory models', async () => {
      const { orderId } = await createOrder('Test drink 1');
      const createPurchaseDto: CreatePurchaseDto = {
        coin: 10,
        cash: 10,
      };
      const purchase = await purchaseService.create(orderId, createPurchaseDto);
      expect(purchase).toBeDefined();
      expect(purchase.coins).toEqual(createPurchaseDto.coin);
      expect(purchase.cash).toEqual(createPurchaseDto.cash);
    });
    it('should return order and order.inventory models', async () => {
      const { orderId, inventoryId } = await createOrder('Test drink 2');
      const createPurchaseDto: CreatePurchaseDto = {
        coin: 10,
        cash: 10,
      };
      const purchase = await purchaseService.create(orderId, createPurchaseDto);
      expect(purchase.order).toBeDefined();
      expect(purchase.order.id).toEqual(orderId);
      expect(purchase.order.inventory).toBeDefined();
      expect(purchase.order.inventory.id).toEqual(inventoryId);
    });
    it('should throw for invalid order id', async () => {
      const createPurchaseDto: CreatePurchaseDto = {
        coin: 10,
        cash: 10,
      };
      await purchaseService
        .create(1000, createPurchaseDto)
        .then((data) => {
          expect(data).toBeUndefined();
        })
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error instanceof PrismaClientKnownRequestError).toBe(true);
          if (error instanceof PrismaClientKnownRequestError) {
            expect(error.code).toBe('P2003');
          }
        });
    });
  });
});
