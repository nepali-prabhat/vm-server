import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodFilter } from 'src/exceptionFilters/zod-exception.filter';
import { PrismaClientExceptionFilter } from 'src/exceptionFilters/prisma-client-exception.filter';
import { PrismaService } from 'src/prisma/prisma.service';
import { PurchaseService } from '../purchase.service';
import { PrismaClient } from '@prisma/client';
import { Change } from '../dto/change.dto';
import { PurchaseStartContract } from '../dto/purchase-sse-contracts.dto';

describe('PurchaseController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let purchaseService: PurchaseService;
  let inventory: Awaited<ReturnType<PrismaClient['inventory']['findFirst']>>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ZodFilter(httpAdapter));
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
    await app.init();

    prisma = moduleRef.get(PrismaService);
    await prisma.resetDatabase(true);
    purchaseService = moduleRef.get(PurchaseService);

    inventory = await prisma.inventory.findFirst();
  });

  describe('/purchase (POST)', () => {
    it('requires coin and cash to be a number', async () => {
      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          coin: '2a',
          cash: 10,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          coin: 2,
          cash: '20s',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          coin: '2s',
          cash: '20s',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/purchase')
        .send({
          coin: 2,
          cash: '20',
        })
        .expect(400);
    });
    it('emits Contracts', async () => {
      const eventSource = purchaseService.getEventObservable();
      const messages = [];
      eventSource.subscribe((v) => {
        messages.push(v);
      });

      await request(app.getHttpServer())
        .post(`/order/inventory/${inventory.id}`)
        .send()
        .expect(201);

      const change = {
        coin: 10,
        cash: 10,
      };
      await request(app.getHttpServer()).post('/purchase').send(change);

      const inputChange = new Change(change.coin, change.cash);
      const purchaseStartContract = new PurchaseStartContract(inputChange);

      expect(messages.length).toBeGreaterThan(1);
      expect(messages[0].data).toBeDefined();
      expect(messages[0].data).toMatchObject(purchaseStartContract);
      expect(messages[1].data).toBeDefined();
      expect(messages[1].data.type).toEqual('PURCHASE_SUCCESS');
      expect(messages[1].data.change).toBeDefined();
      expect(messages[1].data.inventory).toBeDefined();
    });
  });
});
