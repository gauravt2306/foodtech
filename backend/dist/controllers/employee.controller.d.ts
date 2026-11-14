import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare function listVendors(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getVendorMenu(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function createOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function listOrders(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function dummyUpiPayment(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getOrderQR(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=employee.controller.d.ts.map