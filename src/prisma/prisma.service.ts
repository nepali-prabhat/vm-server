import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { seed } from '../../prisma/seedFn';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Be cautious: This is only to be used by tests.
  async resetDatabase(shouldSeed = false) {
    if (process.env.NODE_ENV === 'production') return;
    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key[0] !== '$',
    );
    await Promise.all(
      models.map((modelKey) => {
        return this[modelKey]?.deleteMany && this[modelKey]?.deleteMany();
      }),
    );
    if (shouldSeed) {
      await seed(this);
    }
  }
}
