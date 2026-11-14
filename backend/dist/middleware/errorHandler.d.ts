import { Request, Response, NextFunction } from 'express';
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
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(_req: Request, res: Response): void;
//# sourceMappingURL=errorHandler.d.ts.map