import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly statusMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    return this.catchClientKnownRequestError(exception, host);
  }
  private catchClientKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const statusCode = this.getStatusCode(exception);

    const message = this.getExceptionMessage(exception);

    if (statusCode === undefined) {
      return super.catch(exception, host);
    }
    return super.catch(
      new HttpException({ statusCode, message }, statusCode, {
        cause: exception,
      }),
      host,
    );
  }

  private getStatusCode(
    exception: Prisma.PrismaClientKnownRequestError,
  ): number | undefined {
    return this.statusMapping[exception.code];
  }

  private getExceptionMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const shortMessage = exception.message.substring(
      exception.message.indexOf('→'),
    );
    return (
      `[${exception.code}]: ` +
      shortMessage
        .substring(shortMessage.indexOf('\n'))
        .replace(/\n/g, '')
        .trim()
    );
  }
}
