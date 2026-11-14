import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.schemas';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const wrap = (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res).catch(next);

router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req as AuthenticatedRequest, res).catch(next)
);
router.post('/login', validate(loginSchema), (req, res, next) =>
  authController.login(req as AuthenticatedRequest, res).catch(next)
);
router.post('/refresh', validate(refreshTokenSchema), (req, res, next) =>
  authController.refresh(req as AuthenticatedRequest, res).catch(next)
);
router.post('/logout', authenticate, wrap(authController.logout));
router.get('/me', authenticate, wrap(authController.me));

export default router;