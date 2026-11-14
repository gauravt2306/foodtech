import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../config/jwt';
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map