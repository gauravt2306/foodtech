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

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  req.id = reqId;
  res.setHeader('x-request-id', reqId);

  req.log = createChildLogger({ reqId });

  next();
}