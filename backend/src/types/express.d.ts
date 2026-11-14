import { JwtPayload } from '../config/jwt';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export type AuthRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;