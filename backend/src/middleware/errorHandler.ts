import { Request, Response, NextFunction } from 'express';
import { ApiError, errorCodes } from '../utils/ApiError';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    path: string;
  };
}

function sendErrorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): void {
  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req?.path || '',
    },
  };
  res.status(statusCode).json(response);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const log = req.log || logger;
  log.error(
    {
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  if (err instanceof ApiError) {
    sendErrorResponse(res, err.statusCode, errorCodes.INTERNAL_ERROR, err.message, err.errors);
    return;
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    sendErrorResponse(res, 400, errorCodes.VALIDATION_ERROR, 'Validation failed', errors);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [field, error] of Object.entries(err.errors)) {
      errors[field] = [error.message];
    }
    sendErrorResponse(res, 400, errorCodes.VALIDATION_ERROR, 'Database validation failed', errors);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendErrorResponse(res, 400, errorCodes.VALIDATION_ERROR, 'Invalid ID format');
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    sendErrorResponse(res, 409, errorCodes.CONFLICT, `${field} already exists`);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendErrorResponse(res, 401, errorCodes.TOKEN_INVALID, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendErrorResponse(res, 401, errorCodes.TOKEN_EXPIRED, 'Token expired');
    return;
  }

  const statusCode = 500;
  const message = env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  sendErrorResponse(res, statusCode, errorCodes.INTERNAL_ERROR, message);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendErrorResponse(res, 404, errorCodes.NOT_FOUND, 'Route not found');
}