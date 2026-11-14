import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
export declare function validate(schema: AnyZodObject): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare function validateBody(schema: AnyZodObject): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare function validateQuery(schema: AnyZodObject): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare function validateParams(schema: AnyZodObject): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.d.ts.map