import { Request, Response, NextFunction } from 'express';
import { createChildLogger } from '../utils/logger';
declare global {
    namespace Express {
        interface Request {
            id: string;
            log: ReturnType<typeof createChildLogger>;
        }
    }
}
export declare function requestId(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requestId.d.ts.map