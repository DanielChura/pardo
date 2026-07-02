import { Catch, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { Prisma } from 'src/generated/prisma/client.js';
import { ExceptionResponse } from './all-exceptions.filter.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  constructor(applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();
    const path = request.url;

    let statuscode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2000':
        statuscode = HttpStatus.BAD_REQUEST;
        message =
          'El valor proporcionado supera el límite de longitud para esta columna.';
        break;

      case 'P2002':
        statuscode = HttpStatus.CONFLICT;
        const fields =
          (exception.meta?.target as string[])?.join(', ') || 'campo único';
        message = `Ya existe un registro con el valor del campo: [${fields}].`;
        break;

      case 'P2003':
        statuscode = HttpStatus.BAD_REQUEST;
        message =
          'Violación de clave foránea. No se pudo establecer la relación debido a un registro inexistente.';
        break;

      case 'P2025':
        statuscode = HttpStatus.NOT_FOUND;
        message =
          (exception.meta?.cause as string) ||
          'El registro solicitado no fue encontrado.';
        break;

      default:
        return super.catch(exception, host);
    }

    const res: ExceptionResponse = { statuscode, timestamp, path, message };

    response.status(statuscode).json(res);
  }
}
