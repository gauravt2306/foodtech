import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare function listVendors(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function approveVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function listUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getOrderAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getRevenueAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getVendorPerformance(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=superadmin.controller.d.ts.map