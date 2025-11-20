import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception.code === 'ENOENT') {
      httpAdapter.reply(
        ctx.getResponse(),
        { statusCode: 404, message: 'Not Found' },
        HttpStatus.NOT_FOUND,
      );
      return;
    }
  }
}
