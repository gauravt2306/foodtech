import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from './auth';

export type UserRole = 'superadmin' | 'vendor' | 'employee';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}

export const requireSuperAdmin = requireRole('superadmin');
export const requireVendor = requireRole('vendor');
export const requireEmployee = requireRole('employee');

export function requireAnyRole(...allowedRoles: UserRole[]) {
  return requireRole(...allowedRoles);
}

export function requireOwnershipOrRole(
  getResourceOwnerId: (req: Request) => string | Promise<string>,
  ...allowedRoles: UserRole[]
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (allowedRoles.includes(authReq.user.role)) {
      return next();
    }

    const ownerId = await getResourceOwnerId(req);
    if (authReq.user.sub === ownerId) {
      return next();
    }

    throw ApiError.forbidden('Access denied: not resource owner');
  };
}