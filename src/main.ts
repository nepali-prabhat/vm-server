import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './exceptionFilters/prisma-client-exception.filter';
import { join } from 'path';
import { ZodFilter } from './exceptionFilters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', '..', 'public'), {
    extensions: ['png'],
    prefix: '/public',
  });

  // Global exception filter for prisma exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ZodFilter(httpAdapter));
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
