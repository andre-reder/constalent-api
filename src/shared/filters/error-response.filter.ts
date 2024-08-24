import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class ErrorResponseFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    if (typeof errorResponse === 'string') {
      response.status(status).json({
        success: false,
        message: errorResponse,
      });
    } else {
      response.status(status).json({
        success: false,
        ...errorResponse,
      });
    }
  }
}
