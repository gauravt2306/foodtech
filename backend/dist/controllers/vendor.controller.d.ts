import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare function getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function createMenuItem(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function listMenuItems(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getMenuItem(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateMenuItem(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteMenuItem(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function toggleAvailability(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function listOrders(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getKanbanOrders(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function handoffOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=vendor.controller.d.ts.map