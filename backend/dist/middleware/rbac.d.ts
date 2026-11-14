import { Request, Response, NextFunction } from 'express';
export type UserRole = 'superadmin' | 'vendor' | 'employee';
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireSuperAdmin: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireVendor: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireEmployee: (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireAnyRole(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireOwnershipOrRole(getResourceOwnerId: (req: Request) => string | Promise<string>, ...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.d.ts.map