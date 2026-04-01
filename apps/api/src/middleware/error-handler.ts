import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ZodError from manual validation
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'VALIDATION_ERROR', 'Gecersiz veri.', 400, details);
    return;
  }

  // Our custom operational errors
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Unknown / programming errors
  if (env.NODE_ENV === 'development') {
    console.error('[Unhandled Error]', err);
  } else {
    console.error('[Unhandled Error]', err instanceof Error ? err.message : String(err));
  }

  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV === 'production' ? 'Beklenmeyen bir hata olustu.' : String(err),
    500,
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found.`, 404);
}
