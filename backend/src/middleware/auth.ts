import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../config/jwt';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      throw ApiError.unauthorized('Invalid token type');
    }
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid token');
    }
    throw error;
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type === 'access') {
      (req as AuthenticatedRequest).user = payload;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}