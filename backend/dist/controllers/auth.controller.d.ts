import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare function register(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function login(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function refresh(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function logout(_req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function me(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map