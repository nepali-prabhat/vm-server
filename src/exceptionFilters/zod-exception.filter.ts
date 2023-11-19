import {
  ArgumentsHost,
  Catch,
  HttpException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodError } from 'zod';

//NOTE: We are only using zod for validating request body
@Catch(ZodError)
export class ZodFilter<T extends ZodError> extends BaseExceptionFilter {
  private zodErrorStatus = 400;

  catch(exception: T, host: ArgumentsHost) {
    const status = this.zodErrorStatus;

    return super.catch(
      new HttpException(
        {
          statusCode: status,
          errors: exception.errors,
        },
        status,
        {
          cause: exception,
        },
      ),
      host,
    );
  }
}

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: any) {
    this.schema.parse(value);
    return value;
  }
}
