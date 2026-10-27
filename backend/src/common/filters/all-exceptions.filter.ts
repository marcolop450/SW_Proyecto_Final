import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as crypto from 'crypto';

export interface StandardErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  errorReference: string;
  timestamp: string;
  path: string;
}

const ERROR_CODE_MAP: Record<number, { code: string; message: string }> = {
  [HttpStatus.BAD_REQUEST]: {
    code: 'ERR_VALIDATION_FAILED',
    message: 'Los datos enviados no tienen el formato esperado. Por favor revisa los campos requeridos.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    code: 'ERR_INVALID_CREDENTIALS',
    message: 'Credenciales inválidas o sesión expirada. Por favor inicia sesión nuevamente.',
  },
  [HttpStatus.FORBIDDEN]: {
    code: 'ERR_ACCESS_DENIED',
    message: 'No posees permisos suficientes para realizar esta acción o pertenecer a este recurso.',
  },
  [HttpStatus.NOT_FOUND]: {
    code: 'ERR_RESOURCE_NOT_FOUND',
    message: 'El recurso solicitado no fue encontrado o no está disponible.',
  },
  [HttpStatus.CONFLICT]: {
    code: 'ERR_DUPLICATE_ENTRY',
    message: 'El registro ya existe o entra en conflicto con un dato existente.',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    code: 'ERR_UNPROCESSABLE_ENTITY',
    message: 'La solicitud no puede ser procesada debido a reglas de negocio no satisfechas.',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    code: 'ERR_RATE_LIMIT_EXCEEDED',
    message: 'Límite de solicitudes excedido. Por favor intenta más tarde.',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    code: 'ERR_INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error inesperado en el servidor. El incidente ha sido registrado para auditoría.',
  },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorReference = `ERR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'ERR_INTERNAL_SERVER_ERROR';
    let userMessage = 'Ocurrió un error inesperado en el servidor.';
    let technicalDetails: unknown = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionRes = exception.getResponse();

      const defaultMeta = ERROR_CODE_MAP[statusCode] || {
        code: `ERR_HTTP_${statusCode}`,
        message: 'Error en la solicitud HTTP.',
      };
      errorCode = defaultMeta.code;
      userMessage = defaultMeta.message;

      if (typeof exceptionRes === 'string') {
        userMessage = exceptionRes;
      } else if (typeof exceptionRes === 'object' && exceptionRes !== null) {
        const resObj = exceptionRes as Record<string, any>;
        if (resObj.errorCode) errorCode = resObj.errorCode;
        if (resObj.message) {
          userMessage = Array.isArray(resObj.message)
            ? resObj.message.join('. ')
            : resObj.message;
        }
        technicalDetails = resObj;
      }
    } else if (exception instanceof Error) {
      technicalDetails = {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    // Registro forense en servidor vinculando errorReference
    this.logger.error(
      `[${errorReference}] HTTP ${statusCode} ${request.method} ${request.url} - ErrorCode: ${errorCode}`,
      exception instanceof Error ? exception.stack : JSON.stringify(technicalDetails),
    );

    const payload: StandardErrorResponse = {
      statusCode,
      errorCode,
      message: userMessage,
      errorReference,
      timestamp,
      path: request.url,
    };

    response.status(statusCode).json(payload);
  }
}
