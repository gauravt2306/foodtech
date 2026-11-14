import { Router, Request, Response, NextFunction } from 'express';
import * as superadminController from '../controllers/superadmin.controller';
import { validate } from '../middleware/validation';
import {
  vendorQuerySchema,
  vendorIdSchema,
  approveVendorSchema,
} from '../validators/vendor.schemas';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/rbac';

const router = Router();

const wrap = (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res).catch(next);

router.use(authenticate, requireSuperAdmin);

router.get('/vendors', validate(vendorQuerySchema), wrap(superadminController.listVendors));
router.get('/vendors/:id', validate(vendorIdSchema), wrap(superadminController.getVendor));
router.patch('/vendors/:id/approve', validate(approveVendorSchema), wrap(superadminController.approveVendor));

router.get('/users', wrap(superadminController.listUsers));
router.patch('/users/:id/status', wrap(superadminController.updateUserStatus));

router.get('/analytics', wrap(superadminController.getAnalytics));
router.get('/analytics/orders', wrap(superadminController.getOrderAnalytics));
router.get('/analytics/revenue', wrap(superadminController.getRevenueAnalytics));

export default router;